import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db/db";
import { videos } from "@/lib/db/schema";

const client = new Mux({
  tokenId: process.env['MUX_TOKEN_ID'],
  tokenSecret: process.env['MUX_TOKEN_SECRET'],
});

export async function PUT() {
  try {
    const user = auth();
    
    if (!(await user).userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const directUpload = await client.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    });

    // Crear el registro del video en la base de datos
    const [video] = await db.insert(videos).values({
      userId: (await user).userId,
      title: "Untitled Video",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      views: 0,
      isPublished: false,
      categoryId: 1,
      muxAssetId: "",
      muxStatus: "uploading",
      muxUploadId: directUpload.id,
      playbackId: "",
      visibility: "private",
    }).returning();

    return NextResponse.json({ 
      url: directUpload.url,
      uploadId: directUpload.id,
      videoId: video.id
    });
  } catch (error) {
    console.error('Error creating Mux upload:', error);
    return NextResponse.json(
      { error: 'Error creating upload URL' },
      { status: 500 }
    );
  }
} 