// app/api/mux/asset-status/[assetId]/route.ts
import Mux from '@mux/mux-node';
import { NextRequest, NextResponse } from 'next/server';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface AssetStatusResponse {
  id: string;
  status: 'preparing' | 'processing' | 'ready' | 'errored';
  playbackIds: Array<{
    id: string;
    policy: string;
  }>;
  errors?: any; // Cambiado para ser más flexible con el tipo de Mux
  duration?: number;
  aspectRatio?: string;
  maxStoredResolution?: string;
  maxStoredFrameRate?: number;
  createdAt: string;
  passthrough?: string;
  tracks?: Array<{
    type: string;
    duration?: number;
    maxWidth?: number;
    maxHeight?: number;
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface RouteParams {
  params: {
    assetId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AssetStatusResponse | ErrorResponse>> {
  try {
    const { assetId } = params;
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId es requerido' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Verificando estado del asset:', assetId);
    
    // Obtener información del asset
    const asset = await mux.video.assets.retrieve(assetId);
    
    console.log('📊 Estado actual del asset:', {
      id: asset.id,
      status: asset.status,
      playbackIds: asset.playback_ids?.length || 0
    });
    
    return NextResponse.json({
      id: asset.id,
      status: asset.status as 'preparing' | 'processing' | 'ready' | 'errored',
      playbackIds: asset.playback_ids || [],
      errors: asset.errors || [],
      
      // Información adicional útil
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      maxStoredResolution: asset.max_stored_resolution,
      maxStoredFrameRate: asset.max_stored_frame_rate,
      
      // Metadata
      createdAt: asset.created_at,
      passthrough: asset.passthrough,
      
      // Para debugging
      tracks: asset.tracks?.map(track => ({
        type: track.type || 'unknown',
        duration: track.duration,
        maxWidth: track.max_width,
        maxHeight: track.max_height
      }))
    } as AssetStatusResponse);
    
  } catch (error: any) {
    console.error('❌ Error obteniendo estado del asset:', error);
    
    if (error.type === 'not_found_error') {
      return NextResponse.json(
        { 
          error: 'Asset no encontrado',
          details: `No se encontró el asset con ID: ${params.assetId}`
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