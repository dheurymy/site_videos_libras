import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const updatePhraseSchema = z.object({
  text_pt: z.string().min(1).max(500).optional(),
  text_gloss: z.string().max(500).optional().nullable(),
  video_url: z.string().url().optional(),
  video_duration: z.number().int().positive().optional().nullable(),
  order_index: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Phrase not found' }, { status: 404 });
      }
      console.error('Error fetching phrase:', error);
      return NextResponse.json({ error: 'Failed to fetch phrase' }, { status: 500 });
    }

    return NextResponse.json({ phrase: data });
  } catch (error) {
    console.error('GET phrase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updatePhraseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('phrases')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Phrase not found' }, { status: 404 });
      }
      console.error('Error updating phrase:', error);
      return NextResponse.json({ error: 'Failed to update phrase' }, { status: 500 });
    }

    return NextResponse.json({ phrase: data });
  } catch (error) {
    console.error('PATCH phrase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('phrases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting phrase:', error);
      return NextResponse.json({ error: 'Failed to delete phrase' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE phrase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}