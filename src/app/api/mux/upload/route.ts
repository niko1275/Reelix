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

    console.log('🎬 Upload creado con ID:', directUpload.id);

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

    console.log('📝 Video guardado en DB con muxUploadId:', directUpload.id);

    return NextResponse.json({ 
      url: directUpload.url,
      uploadId: directUpload.id,
      videoId: video.id,
      id: directUpload.id // Agregar también como 'id' para compatibilidad
    });
  } catch (error) {
    console.error('Error creating Mux upload:', error);
    return NextResponse.json(
      { error: 'Error creating upload URL' },
      { status: 500 }
    );
  }
} 


export async function POST(request: Request) {
  try {
    const { uploadId } = await request.json();
    
    // Crear asset desde el upload
    const asset = await client.video.assets.create({
      inputs: [{ url: `mux://uploads/${uploadId}` }],
      playback_policy: ['public'],
      encoding_tier: 'baseline', // o 'smart' para mejor calidad
    });
    
    console.log('👉 Asset creado:', asset.id);
    
    return NextResponse.json({ 
      assetId: asset.id,
      status: asset.status 
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// app/api/mux/asset-status/[assetId]/route.js
export async function GET(
  request: Request, 
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    console.log('AssetId es '+assetId)
    const asset = await client.video.assets.retrieve(assetId);
    
    return NextResponse.json({
      status: asset.status,
      playbackIds: asset.playback_ids,
      errors: asset.errors,
      duration: asset.duration
    });
  } catch (error) {
    console.error('Error getting asset status:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}