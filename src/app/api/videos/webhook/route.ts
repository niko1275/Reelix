import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { mux } from "@/lib/mux/mux";
import db from "@/lib/db/db";
import { videos } from "@/lib/db/schema";
import {VideoUploadAssetCreatedWebhookEvent, VideoAssetCreatedWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetDeletedWebhookEvent, VideoAssetTrackReadyWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";

const SIGNING_SECRET = process.env.MUX_SECRET_WEBHOOK;

interface MuxTrack {
    id: string;
    type: "video" | "audio" | "text";
    max_width?: number;
}

interface MuxAsset {
    id: string;
}

interface MuxTrackReadyData {
    track: MuxTrack;
    asset: MuxAsset;
}

type MuxWebhookEvent = {
    type: "video.upload.created" | "video.asset.created" | "video.asset.ready" | "video.asset.errored" | "video.asset.deleted" | "video.asset.track.ready";
    data: any;
};

export async function POST(req: NextRequest) {
    if(!SIGNING_SECRET){
        throw new Error("MUX_SECRET_WEBHOOK is not set");
    }

    const headerspayload = await headers();
    const signature = headerspayload.get("mux-signature");

    if(!signature){
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    try {
        mux.webhooks.verifySignature(body, {
            "mux-signature": signature,
        }, SIGNING_SECRET); 

        const event = payload as MuxWebhookEvent;

        console.log("👉 Event type:", event.type);
        console.log("👉 Full payload:", JSON.stringify(payload, null, 2));
        switch(event.type) {


          
            case "video.upload.created":
                const createdData2 = payload.data as any;
                console.log('👉 Upload created data:', JSON.stringify(createdData2, null, 2));
                
                // Actualizar el estado del video cuando se crea el upload
                if (createdData2.upload?.id) {
                    await db.update(videos)
                        .set({
                            muxStatus: "uploading",
                        })
                        .where(eq(videos.muxUploadId, createdData2.upload.id));
                    console.log('👉 Video status updated to uploading for upload_id:', createdData2.upload.id);
                }
                break;

            case "video.asset.created":
                const createdData = payload.data as VideoAssetCreatedWebhookEvent["data"];
                if (!createdData.upload_id) {
                    throw new Error("data.upload_id is undefined");
                }
                await db.update(videos)
                    .set({
                        muxAssetId: createdData.id,
                        muxStatus: createdData.status,
                    })
                    .where(eq(videos.muxUploadId, createdData.upload_id));
                break;

            case "video.asset.ready":
                console.log("👉 Asset ready:", payload.data);
                const readyData = payload.data as VideoAssetReadyWebhookEvent["data"];
                const playbackId = readyData.playback_ids?.[0]?.id;
                console.log("👉 Playback ID:", playbackId);
                if (!playbackId) {
                    throw new Error("No playback ID available");
                }
                if (!readyData.upload_id) {
                    throw new Error("No upload ID available");
                }
                const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
                
                // Buscar el video existente por upload_id
                const [existingVideo] = await db
                    .select()
                    .from(videos)
                    .where(eq(videos.muxUploadId, readyData.upload_id))
                    .limit(1);

                if (!existingVideo) {
                    throw new Error("No video found for this upload");
                }

                await db.update(videos)
                    .set({
                        muxStatus: readyData.status,
                        videoUrl: `https://stream.mux.com/${playbackId}`,
                        isPublished: true,
                        thumbnailUrl: thumbnailUrl,
                        duration: Math.round(Number(readyData.duration)) || 0,
                        playbackId: playbackId,
                    })
                    .where(eq(videos.muxUploadId, readyData.upload_id));
                break;

            case "video.asset.errored":
                const errorData = payload.data as VideoAssetErroredWebhookEvent["data"];
                if (!errorData.upload_id) {
                    throw new Error("No upload ID available");
                }
                await db.update(videos)
                    .set({
                        muxStatus: errorData.status,
                        isPublished: false,
                    })
                    .where(eq(videos.muxUploadId, errorData.upload_id));
                break;

            case "video.asset.deleted":
                const deletedData = payload.data as VideoAssetDeletedWebhookEvent["data"];
                if (!deletedData.upload_id) {
                    throw new Error("No upload ID available");
                }
                await db.update(videos)
                    .set({
                        muxStatus: "deleted",
                        isPublished: false,
                    })
                    .where(eq(videos.muxUploadId, deletedData.upload_id));
                break;

            case "video.asset.track.ready":
                const trackData = payload.data as MuxTrackReadyData;
                if (!trackData.asset.id) {
                    throw new Error("No asset ID available");
                }
                // Verificamos que sea una pista de tipo video
                if (trackData.track.type === "video" && trackData.track.max_width) {
                    await db.update(videos)
                        .set({
                            thumbnailUrl: `https://image.mux.com/${trackData.track.id}/thumbnail.jpg`,
                        })
                        .where(eq(videos.muxAssetId, trackData.asset.id));
                }
                break;
        }

        return NextResponse.json("webhook received", { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
}
