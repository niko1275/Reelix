import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '@/lib/db/db';
import { videos } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { uploadId, assetData } = await req.json();
    
    console.log('🔄 Actualizando video en DB:', { uploadId, assetData });

    if (!uploadId || !assetData) {
      return NextResponse.json({ error: 'uploadId and assetData are required' }, { status: 400 });
    }

    // Actualizar el video en la base de datos
    const [updatedVideo] = await db
      .update(videos)
      .set({
        muxAssetId: assetData.assetId,
        muxStatus: assetData.status,
        videoUrl: assetData.videoUrl,
        thumbnailUrl: assetData.thumbnailUrl,
        duration: Math.round(Number(assetData.duration)) || 0,
        playbackId: assetData.playbackId,
        isPublished: assetData.status === 'ready',
        updatedAt: new Date(),
      })
      .where(eq(videos.muxUploadId, uploadId))
      .returning();

    if (!updatedVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log('✅ Video actualizado exitosamente:', {
      id: updatedVideo.id,
      status: updatedVideo.muxStatus,
      playbackId: updatedVideo.playbackId
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo
    });

  } catch (error) {
    console.error('Error updating video from Mux:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 