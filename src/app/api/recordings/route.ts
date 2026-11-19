import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const recordingSchema = z.object({
  phrase_id: z.string().uuid('ID da frase inválido'),
  video_url: z.string().url('URL de vídeo inválida'),
  video_duration: z.number().int().positive().optional().nullable(),
  video_size_bytes: z.number().int().positive().optional().nullable(),
  mime_type: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phraseId = searchParams.get('phrase_id');

    const supabase = createAdminClient();

    let query = supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (phraseId) {
      query = query.eq('phrase_id', phraseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recordings:', error);
      return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 });
    }

    return NextResponse.json({ recordings: data });
  } catch (error) {
    console.error('GET recordings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = recordingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify phrase exists and is active
    const { data: phrase, error: phraseError } = await supabase
      .from('phrases')
      .select('id')
      .eq('id', parsed.data.phrase_id)
      .eq('is_active', true)
      .single();

    if (phraseError || !phrase) {
      return NextResponse.json({ error: 'Phrase not found or inactive' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('recordings')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      console.error('Error creating recording:', error);
      return NextResponse.json({ error: 'Failed to create recording' }, { status: 500 });
    }

    return NextResponse.json({ recording: data }, { status: 201 });
  } catch (error) {
    console.error('POST recordings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}