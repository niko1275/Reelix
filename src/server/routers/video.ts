import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { videos } from '@/lib/db/schema';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';
import db from '@/lib/db/db';
import { TRPCError } from '@trpc/server';
import { mux } from '@/lib/mux/mux';
import { get } from 'http';

export const videoRouter = router({
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
      const userId = ctx.auth.userId;

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
    
        console.log("🧪 data.length:", data.length);
    
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
        const userId = ctx.auth.userId;

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
        console.log("✅ Upload creado en Mux:", upload.id);
        
        console.log("💾 Creando registro en la base de datos...");
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
        console.log("✅ Registro creado en la base de datos:", video.id);

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


    getById: publicProcedure.input(z.object({
      id: z.string(),
    })).query(async({ input})=>{
      const {id} = input;
  
      
      if(!id ){
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Faltan datos",
        });
      }

      try{
        const video = await
         db.select().from(videos).where(and(eq(videos.muxUploadId, id)));

        return video;

      }catch(error){
        console.error("🔥 Error en getById:", error);
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const userId = ctx.auth.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No autorizado",
          });
        }

        try {
          const [video] = await db
            .update(videos)
            .set({
              ...data,
              updatedAt: new Date(),
            })
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
}); 