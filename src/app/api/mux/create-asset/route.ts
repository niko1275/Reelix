import Mux from '@mux/mux-node';
import { NextRequest, NextResponse } from 'next/server';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface CreateAssetRequest {
  uploadId: string;
}

interface CreateAssetResponse {
  success: boolean;
  assetId: string;
  status: string;
  uploadId: string;
  duration?: number;
  aspectRatio?: string;
  createdAt: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateAssetResponse | ErrorResponse>> {
  try {
    const body: CreateAssetRequest = await request.json();
    const { uploadId } = body;
    console.log("Upload Id es "+uploadId)
    if (!uploadId) {
      return NextResponse.json(
        { error: 'uploadId es requerido' },
        { status: 400 }
      );
    }
    
    console.log('🎬 Creando asset desde upload:', uploadId);
    
    // Crear asset desde el upload
    const asset = await mux.video.assets.create({
      inputs: [{ url: `mux://uploads/${uploadId}` }],
      playback_policy: ['public'],
      encoding_tier: 'baseline', // 'baseline' o 'smart'
      
      // Opciones adicionales (opcional)
      mp4_support: 'standard', // Para generar MP4 también
      normalize_audio: true,    // Normalizar audio
      
      // Metadata personalizada (opcional)
      passthrough: JSON.stringify({
        userId: 'user-123', // ID del usuario
        uploadedAt: new Date().toISOString(),
        source: 'web-upload'
      })
    } as any);
    
    console.log('✅ Asset creado exitosamente:', {
      assetId: asset.id,
      status: asset.status,
      uploadId: uploadId
    });
    
    return NextResponse.json({
      success: true,
      assetId: asset.id,
      status: asset.status,
      uploadId: uploadId,
      // Información adicional útil
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      createdAt: asset.created_at
    });
    
  } catch (error: any) {
    console.error('❌ Error creando asset:', error);
    
    // Manejo de errores específicos de Mux
    if (error.type === 'invalid_request_error') {
      return NextResponse.json(
        { 
          error: 'Upload inválido o no encontrado',
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    if (error.type === 'authentication_error') {
      return NextResponse.json(
        { 
          error: 'Error de autenticación con Mux',
          details: 'Verifica tus credenciales MUX_TOKEN_ID y MUX_TOKEN_SECRET'
        },
        { status: 401 }
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