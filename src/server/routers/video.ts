import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, optionalAuthProcedure, baseProcedure } from '../trpc';
import { users, videos, videoViews, videoReactions, subscriptions } from '@/lib/db/schema';
import { and, desc, eq, getTableColumns, lt, not, or, sql, gt } from 'drizzle-orm';
import db from '@/lib/db/db';
import { TRPCError } from '@trpc/server';
import { mux } from '@/lib/mux/mux';
import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

const generatePresignedUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return null;
    }
};

export const videoRouter = router({

  restoreThumbnail: protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Faltan datos",
      });
    }

    const [videoexist] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, parseInt(id)));

    if (!videoexist ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Video no encontrado",
      });
    }
    if(!videoexist.thumbnailUrl){
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No hay thumbnail para restaurar",
      });
    }
   const thumbnailUrl = `https://image.mux.com/${videoexist.thumbnailUrl}/thumbnail.jpg`;
    
    const [updated] = await db
      .update(videos)
      .set({
        thumbnailUrl: thumbnailUrl,
      })
      .where(eq(videos.id, parseInt(id))).returning();

    return { success: true };
  }),



  getMany: protectedProcedure
    .input(z.object({
      cursor: z.object({
        id: z.number(),
        createdAt: z.date(),
      }).nullish(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const userId = ctx.auth?.userId;

      if (!userId) {
        return {
          items: [],
          nextCursor: undefined
        };
      }

      try {
        const data = await db
          .select()
          .from(videos)
          .where(
            and(
              eq(videos.userId, userId), 
              cursor
                ? or(
                    lt(videos.createdAt, cursor.createdAt),
                    and(
                      eq(videos.createdAt, cursor.createdAt),
                      lt(videos.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .orderBy(desc(videos.createdAt), desc(videos.id))
          .limit(limit + 1);
    
       
    
        const tienemas = data.length > limit;
        const items = tienemas ? data.slice(0, -1) : data;
        const lastItem = items[items.length - 1];
        const nextCursor = tienemas
          ? {
              id: lastItem.id,
              createdAt: new Date(lastItem.createdAt),
            }
          : undefined;
    
        return { items, nextCursor };
      } catch (err) {
        console.error("🔥 Error en getMany:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Algo falló al cargar los videos",
        });
      }
    }),


    create: protectedProcedure.mutation(async({ctx})=>{  
      try {
        console.log("🚀 Iniciando creación de video...");
        const userId = ctx.auth?.userId;

        if(!userId){
          console.error("❌ No hay userId en el contexto");
          throw new TRPCError({
            code: "UNAUTHORIZED",
          })
        }

        console.log("👤 userId:", userId);

        console.log("📤 Creando upload en Mux...");
        const upload = await mux.video.uploads.create({
          new_asset_settings: {
            passthrough: userId,
            playback_policy: ["public"],
          }, 
          cors_origin: "*"
        });
 
        const [video] = await db.insert(videos).values({
          userId,
          title: "Utitled Video",
          videoUrl: "",
          thumbnailUrl: "",
          duration: 120,
          views: 0,
          isPublished: false,
          categoryId: 1,
          muxAssetId: "",
          muxStatus: "",
          muxUploadId:upload.id,
          playbackId: "",
          visibility: "private",
        }).returning();
       
        return {
          video,
          uploadUrl: upload.url,
          uploadId: upload.id,
        }
      } catch (error) {
        console.error("🔥 Error en create:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear el video",
          cause: error,
        });
      }
    }),


    getById: optionalAuthProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.userId;
  
      try {
        // Buscar por muxUploadId (UUID string)
        let [video] = await db
          .select()
          .from(videos)
          .where(eq(videos.muxUploadId, id));
  
        
  
  
   
  
        return video;
      } catch (error) {
        console.error("Error en getById:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el video",
        });
      }
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        categoryId: z.number().nullable().optional(),
        isPublished: z.boolean().optional(),
        thumbnailUrl: z.string().nullable().optional(),
        visibility: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const userId = ctx.auth?.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No autorizado",
          });
        }

        try {
          // Aseguramos que thumbnailUrl sea string o undefined, no null
          const updateData = {
            ...data,
            thumbnailUrl: data.thumbnailUrl ?? undefined,
            updatedAt: new Date(),
          };

          const [video] = await db
            .update(videos)
            .set(updateData)
            .where(
              and(
                eq(videos.id, id),
                eq(videos.userId, userId)
              )
            )
            .returning();

          if (!video) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Video no encontrado",
            });
          }

          return video;
        } catch (error) {
          console.error("🔥 Error en update:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al actualizar el video",
          });
        }
      }),


      getone: publicProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { id } = input;
        const userId = ctx.auth?.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED", 
            message: "User must be authenticated",
          });
        }
    

        try {
          const [video] = await db
            .select({
              ...getTableColumns(videos),
              user: {
                ...getTableColumns(users),
                subscribersCount: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscribedToId} = ${users.clerkId}
                )`,
                isSubscribed: userId ? sql<boolean>`EXISTS (
                  SELECT 1
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscriberId} = ${userId}
                  AND ${subscriptions.subscribedToId} = ${users.clerkId}
                )` : sql<boolean>`false`,
              },
              stats: {
                likes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.type} = 'like'
                )`,
                dislikes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.type} = 'dislike'
                )`,
                userReaction: userId ? sql<'like' | 'dislike' | null>`(
                  SELECT type
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.userId} = ${userId}
                )` : sql<null>`null`,
              }
            })
            .from(videos)
            .leftJoin(users, eq(users.clerkId, videos.userId))
            .where(eq(videos.muxUploadId, id));

          if (!video) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Video no encontrado",
            });
          }

          return video;
        } catch (error) {
          console.error("Error al obtener el video:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener el video",
          });
        }
      }),

      getVideoSuggestions: publicProcedure
      .input(z.object({
        id: z.string(),
        limit: z.number().default(10),
        cursor: z.string().nullish(), // para paginación
      }))
      .query(async ({ input }) => {
        const { id, limit, cursor } = input;
    
        const suggestions = await db
          .select({
            ...getTableColumns(videos),
            user: {
              ...getTableColumns(users),
              subscribersCount: sql<number>`(
                SELECT COUNT(*)::int
                FROM ${subscriptions}
                WHERE ${subscriptions.subscribedToId} = ${users.clerkId}
              )`,
            },
          })
          .from(videos)
          .leftJoin(users, eq(videos.userId, users.clerkId))
          .where(and(
            eq(videos.visibility, "public"),
            eq(videos.isPublished, true),
            not(eq(videos.muxUploadId, id)),
            cursor ? lt(videos.createdAt, new Date(cursor)) : undefined
          ))
          .orderBy(desc(videos.createdAt))
          .limit(limit + 1);
    
        const hasMore = suggestions.length > limit;
        const items = hasMore ? suggestions.slice(0, -1) : suggestions;
      
        
        return {
          items,
          nextCursor: hasMore ? items[items.length - 1].createdAt.toISOString() : null,
        };
      }),

      getVideoSuggestionsHome: baseProcedure
      .input(z.object({
      
        limit: z.number().default(10),
        cursor: z.string().nullish(), 
      }))
      .query(async ({ input }) => {
        const {  limit } = input;
    
        const suggestions = await db
          .select({
            ...getTableColumns(videos),
            user: {
              ...getTableColumns(users),
              subscribersCount: sql<number>`(
                SELECT COUNT(*)::int
                FROM ${subscriptions}
                WHERE ${subscriptions.subscribedToId} = ${users.clerkId}
              )`,
            },
          })
          .from(videos)
          .leftJoin(users, eq(videos.userId, users.clerkId))
          .where(and(
            eq(videos.visibility, "public"),
            eq(videos.isPublished, true),
           
            
          ))
          .orderBy(desc(videos.createdAt))
          .limit(limit + 1);
    
        const hasMore = suggestions.length > limit;
        const items = hasMore ? suggestions.slice(0, -1) : suggestions;
       
        
        return {
          items,
          nextCursor: hasMore ? items[items.length - 1].createdAt.toISOString() : null,
        };
      }),

      getHomeVideos: baseProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { limit, cursor, search, category } = input;
        const userId = ctx.auth?.userId;
        console.log("🚀 ~ getHomeVideos ~ userId:", userId)
        try {
          const result = await db
            .select({
              ...getTableColumns(videos),
              user: {
                ...getTableColumns(users),
                subscribersCount: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscribedToId} = ${users.clerkId}
                )`,
                isSubscribed: userId ? sql<boolean>`EXISTS (
                  SELECT 1
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscriberId} = ${userId}
                  AND ${subscriptions.subscribedToId} = ${users.clerkId}
                )` : sql<boolean>`false`,
              },
              stats: {
                views: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoViews}
                  WHERE ${videoViews.videoId} = ${videos.id}
                )`,
                likes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.type} = 'like'
                )`,
                dislikes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.type} = 'dislike'
                )`,
                userReaction: userId ? sql<string>`(
                  SELECT type
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${videos.id}
                  AND ${videoReactions.userId} = ${userId}
                  LIMIT 1
                )` : sql<string>`null`,
              },
            })
            .from(videos)
            .leftJoin(users, eq(videos.userId, users.clerkId))
            .where(and(
              eq(videos.visibility, "public"),
              eq(videos.isPublished, true),
              cursor ? lt(videos.createdAt, new Date(cursor)) : undefined,
              search ? or(
                sql`LOWER(${videos.title}) LIKE LOWER(${`%${search}%`})`,
                sql`LOWER(${videos.description}) LIKE LOWER(${`%${search}%`})`
              ) : undefined,
              category ? eq(videos.categoryId, parseInt(category)) : undefined
            ))
            .orderBy(desc(videos.createdAt))
            .limit(limit + 1)
            .execute();

          const hasMore = result.length > limit;
          const items = hasMore ? result.slice(0, -1) : result;

      

          return {
            items: items,
            nextCursor: hasMore ? items[items.length - 1].createdAt.toISOString() : null,
          };
        } catch (error) {
          console.error("Error in getHomeVideos:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener los videos",
          });
        }
      }),

  getSearchSuggestions: publicProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const { query } = input;

      try {
        const suggestions = await db
          .select({
            id: videos.id,
            title: videos.title,
            views: videos.views,
            createdAt: videos.createdAt,
            thumbnailUrl: videos.thumbnailUrl,
          })
          .from(videos)
          .where(
            and(
              eq(videos.isPublished, true),
              sql`LOWER(${videos.title}) LIKE LOWER(${`%${query}%`})`
            )
          )
          .orderBy(desc(videos.views))
          .limit(5);

        return suggestions;
      } catch (error) {
        console.error("Error en getSearchSuggestions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener sugerencias de búsqueda",
        });
      }
    }),

  addView: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const userId = ctx.auth?.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No autorizado"
        });
      }

      try {
        // First check if the video exists
        const video = await ctx.db.query.videos.findFirst({
          where: eq(videos.muxUploadId, videoId),
        });

        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video no encontrado"
          });
        }

        // Try to insert the view, ignoring if it already exists
        await ctx.db
          .insert(videoViews)
          .values({
            videoId: video.id,
            userId: userId,
          })
          .onConflictDoNothing({
            target: [videoViews.userId, videoViews.videoId],
          });

        // Update the video's view count
        await ctx.db
          .update(videos)
          .set({
            views: sql`${videos.views} + 1`
          })
          .where(eq(videos.id, video.id));

        return { success: true };
      } catch (error) {
        console.error("Error en addView:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al registrar la vista",
          cause: error
        });
      }
    }),
}); 