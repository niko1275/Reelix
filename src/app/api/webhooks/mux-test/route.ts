import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { mux } from "@/lib/mux/mux";

const SIGNING_SECRET = process.env.MUX_SECRET_WEBHOOK;

export async function POST(req: NextRequest) {
    console.log("🔍 MUX WEBHOOK RECEIVED - Testing endpoint");
    console.log("📋 Timestamp:", new Date().toISOString());
    
    if(!SIGNING_SECRET){
        console.error("❌ MUX_SECRET_WEBHOOK is not set");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const headerspayload = await headers();
    const signature = headerspayload.get("mux-signature");

    if(!signature){
        console.error("❌ No signature in webhook");
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    try {
        // Verificar la firma
        mux.webhooks.verifySignature(body, {
            "mux-signature": signature,
        }, SIGNING_SECRET); 

        console.log("✅ Webhook signature verified");
        console.log("📋 Event type:", payload.type);
        console.log("📋 Full payload:", JSON.stringify(payload, null, 2));

        // Reenviar al endpoint principal
        const response = await fetch(`${req.nextUrl.origin}/api/videos/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'mux-signature': signature,
            },
            body: body,
        });

        console.log("📤 Forwarded to main webhook, status:", response.status);

        return NextResponse.json({ 
            success: true, 
            event: payload.type,
            forwarded: response.status === 200 
        }, { status: 200 });
        
    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
} 