import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, bucket = 'user-recordings' } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    // Validate content type - only allow video
    const allowedTypes = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Only video files allowed.' },
        { status: 400 }
      );
    }

    // Generate unique path
    const ext = filename.split('.').pop() || 'webm';
    const path = `recordings/${crypto.randomUUID()}.${ext}`;

    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error('Supabase sign upload error:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Get public URL for reference after upload
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      path,
      bucket,
    });
  } catch (error) {
    console.error('Sign upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}