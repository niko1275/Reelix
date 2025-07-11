import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

const client = new Mux({
  tokenId: process.env['MUX_TOKEN_ID'],
  tokenSecret: process.env['MUX_TOKEN_SECRET'],
});

export async function POST() {
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

    return NextResponse.json({ 
      uploadUrl: directUpload.url,
      uploadId: directUpload.id,
    });
  } catch (error) {
    console.error('Error creating Mux upload:', error);
    return NextResponse.json(
      { error: 'Error creating upload URL' },
      { status: 500 }
    );
  }
}