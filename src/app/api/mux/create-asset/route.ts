import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';

const client = new Mux({
  tokenId: process.env['MUX_TOKEN_ID'],
  tokenSecret: process.env['MUX_TOKEN_SECRET'],
});

export async function POST(request: Request) {
  try {
    const { uploadId } = await request.json();
    
    if (!uploadId) {
      return NextResponse.json(
        { error: "uploadId is required" },
        { status: 400 }
      );
    }
    
    // Crear asset desde el upload
    const asset = await client.video.assets.create({
      inputs: [{ url: `mux://uploads/${uploadId}` }],
      playback_policy: ['public'],
      encoding_tier: 'baseline',
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