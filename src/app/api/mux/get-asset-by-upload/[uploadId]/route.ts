import { NextRequest, NextResponse } from 'next/server';
import { mux } from "@/lib/mux/mux";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params;
    console.log('🔍 Buscando asset para uploadId:', uploadId);

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
    }

    // Primero, obtener información del upload
    const upload = await mux.video.uploads.retrieve(uploadId);
    console.log('📋 Upload info:', {
      id: upload.id,
      status: upload.status,
      assetId: upload.asset_id
    });

    if (!upload.asset_id) {
      return NextResponse.json({ 
        status: 'uploading',
        message: 'Asset aún no creado'
      });
    }

    // Obtener información del asset
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    console.log('🎬 Asset info:', {
      id: asset.id,
      status: asset.status,
      playbackIds: asset.playback_ids?.length || 0
    });

    const playbackId = asset.playback_ids?.[0]?.id;
    const thumbnailUrl = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : null;

    return NextResponse.json({
      uploadId: uploadId,
      assetId: asset.id,
      status: asset.status,
      playbackId: playbackId,
      videoUrl: playbackId ? `https://stream.mux.com/${playbackId}` : null,
      thumbnailUrl: thumbnailUrl,
      duration: asset.duration,
      errors: asset.errors,
      createdAt: asset.created_at
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo asset:', error);
    
    if (error.type === 'not_found_error') {
      return NextResponse.json(
        { 
          error: 'Upload o Asset no encontrado',
          details: `No se encontró el upload con ID: ${params}`
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 