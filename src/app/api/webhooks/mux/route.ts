import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import db from "@/lib/db/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VideoAssetReadyWebhookEvent, VideoAssetErroredWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";

interface MuxUploadCreatedData {
  id: string;
  status: string;
}

type MuxWebhookEvent =
  | { type: "video.upload.created"; data: MuxUploadCreatedData }
  | { type: "video.asset.ready"; data: VideoAssetReadyWebhookEvent["data"] }
  | { type: "video.asset.errored"; data: VideoAssetErroredWebhookEvent["data"] }
  | { type: "video.upload.asset_created"; data: { id: string; asset_id: string } }
  | { type: string; data: unknown };


// Verificar la firma del webhook de Mux
function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    
    console.log('📨 Webhook received - Headers:', Object.fromEntries(headersList.entries()));
    
    // Obtener headers necesarios para verificación
    const signature = headersList.get('mux-signature');
    const timestamp = headersList.get('mux-timestamp');
    
    // Modo desarrollo: permitir webhooks sin firma
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!signature || !timestamp) {
      if (isDevelopment) {
        console.log('⚠️ Development mode: Skipping signature verification');
      } else {
        console.error('❌ Missing Mux signature headers');
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
      }
    }

    // Verificar la firma del webhook solo en producción
    if (!isDevelopment && signature && timestamp) {
      const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('❌ MUX_WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
      }

      const isValidSignature = verifyWebhookSignature(
        body,
        signature,
        timestamp,
        webhookSecret
      );

      if (!isValidSignature) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parsear el body del webhook
    const webhookData = JSON.parse(body) as MuxWebhookEvent;
    console.log('📨 Webhook data:', webhookData.type, webhookData);

    // Manejar diferentes tipos de eventos
    switch (webhookData.type) {
      case 'video.upload.created':
        await handleUploadCreated(webhookData as { type: 'video.upload.created'; data: MuxUploadCreatedData });
        break;
        
      case 'video.asset.ready':
        await handleAssetReady(webhookData as { type: 'video.asset.ready'; data: VideoAssetReadyWebhookEvent["data"] });
        break;
      
      case 'video.asset.errored':
        await handleAssetErrored(webhookData as { type: 'video.asset.errored'; data: VideoAssetErroredWebhookEvent["data"] });
        break;
      
      case 'video.upload.asset_created':
        await handleUploadAssetCreated(webhookData as { type: 'video.upload.asset_created'; data: { id: string; asset_id: string } });
        break;
      
      default:
        console.log('ℹ️ Unhandled webhook type:', webhookData.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleUploadCreated(webhookData: { type: 'video.upload.created'; data: MuxUploadCreatedData }) {
  try {
    const { data } = webhookData;
    const uploadId = data.id;
    

    console.log('📤 Upload created:', uploadId);

    // Buscar si ya existe un video con este uploadId
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(eq(videos.muxUploadId, uploadId));

    if (existingVideo) {
      console.log('ℹ️ Video already exists for upload:', uploadId);
      return;
    }

    // Crear el video en la base de datos
    const [video] = await db.insert(videos).values({
      userId: "temp_user_id", // Placeholder, will be updated later
      title: "Untitled Video",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      views: 0,
      isPublished: false,
      categoryId: 1,
      muxAssetId: "",
      muxStatus: "uploading",
      muxUploadId: uploadId,
      playbackId: "",
      visibility: "private",
    }).returning();

    console.log('✅ Video created for upload:', video.id);
  } catch (error) {
    console.error('❌ Error handling upload created:', error);
  }
}

async function handleAssetReady(webhookData: { type: 'video.asset.ready'; data: VideoAssetReadyWebhookEvent["data"] }) {
  try {
    const { data } = webhookData;
    const assetId = data.id;
    const playbackIds = data.playback_ids;
    const duration = data.duration;


    console.log('✅ Asset ready:', assetId);

    // Buscar el video por muxAssetId
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.muxAssetId, assetId));

    if (!video) {
      console.log('⚠️ Video not found for asset:', assetId);
      return;
    }

    // Construir la URL del thumbnail usando el playbackId
    const playbackId = playbackIds?.[0]?.id;
    const thumbnailUrl = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : '';

    // Actualizar el video con la información del asset
    await db
      .update(videos)
      .set({
        muxStatus: 'ready',
        playbackId: playbackId || '',
        thumbnailUrl: thumbnailUrl,
        duration: Math.round(duration || 0),
        isPublished: true,
      })
      .where(eq(videos.id, video.id));

    console.log('✅ Video updated:', video.id, 'Thumbnail:', thumbnailUrl);
  } catch (error) {
    console.error('❌ Error handling asset ready:', error);
  }
}

async function handleAssetErrored(webhookData: { type: 'video.asset.errored'; data: VideoAssetErroredWebhookEvent["data"] }) {
  try {
    const { data } = webhookData;
    const assetId = data.id;
    const errors = data.errors;

    console.log('❌ Asset errored:', assetId, errors);

    // Buscar el video por muxAssetId
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.muxAssetId, assetId));

    if (!video) {
      console.log('⚠️ Video not found for asset:', assetId);
      return;
    }

    // Actualizar el video con estado de error
    await db
      .update(videos)
      .set({
        muxStatus: 'errored',
        isPublished: false,
      })
      .where(eq(videos.id, video.id));

    console.log('❌ Video marked as errored:', video.id);
  } catch (error) {
    console.error('❌ Error handling asset errored:', error);
  }
}

async function handleUploadAssetCreated(webhookData: { type: 'video.upload.asset_created'; data: { id: string; asset_id: string } }) {
  try {
    const { data } = webhookData;
    const uploadId = data.id; // Cambiar de data.upload_id a data.id
    const assetId = data.asset_id;

    console.log('📤 Upload asset created:', uploadId, '->', assetId);

    // Buscar el video por muxUploadId
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.muxUploadId, uploadId));

    if (!video) {
      console.log('⚠️ Video not found for upload:', uploadId);
      return;
    }

    // Actualizar el video con el assetId
    await db
      .update(videos)
      .set({
        muxAssetId: assetId,
        muxStatus: 'processing',
      })
      .where(eq(videos.id, video.id));

    console.log('✅ Video updated with asset ID:', video.id);
  } catch (error) {
    console.error('❌ Error handling upload asset created:', error);
  }
}
