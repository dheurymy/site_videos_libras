import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const phraseSchema = z.object({
  text_pt: z.string().min(1, 'Texto em português é obrigatório').max(500),
  text_gloss: z.string().max(500).optional().nullable(),
  video_url: z.string().url('URL de vídeo inválida'),
  video_duration: z.number().int().positive().optional().nullable(),
  order_index: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching phrases:', error);
      return NextResponse.json({ error: 'Failed to fetch phrases' }, { status: 500 });
    }

    return NextResponse.json({ phrases: data });
  } catch (error) {
    console.error('GET phrases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = phraseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('phrases')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      console.error('Error creating phrase:', error);
      return NextResponse.json({ error: 'Failed to create phrase' }, { status: 500 });
    }

    return NextResponse.json({ phrase: data }, { status: 201 });
  } catch (error) {
    console.error('POST phrases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}