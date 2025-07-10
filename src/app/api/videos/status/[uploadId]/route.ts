import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '@/lib/db/db';
import { videos } from '@/lib/db/schema';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params;
    console.log('🔍 Buscando video con uploadId:', uploadId);

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
    }

    // Buscar el video en la base de datos
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.muxUploadId, uploadId))
      .limit(1);

    console.log('📋 Video encontrado:', video ? 'Sí' : 'No');
    if (video) {
      console.log('📋 Estado del video:', video.muxStatus);
      console.log('📋 PlaybackId:', video.playbackId);
    }

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Retornar el estado actual del video
    return NextResponse.json({
      status: video.muxStatus,
      playbackId: video.playbackId,
      isPublished: video.isPublished,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    });

  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 