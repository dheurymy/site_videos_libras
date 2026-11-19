export interface Phrase {
  id: string;
  text_pt: string;
  text_gloss: string | null;
  video_url: string;
  video_duration: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recording {
  id: string;
  phrase_id: string;
  video_url: string;
  video_duration: number | null;
  video_size_bytes: number | null;
  mime_type: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PhraseWithRecordings extends Phrase {
  recordings: Recording[];
  recordings_count: number;
}