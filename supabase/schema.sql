-- Supabase Schema for Libras Dataset
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Phrases table (reference videos managed by admin)
CREATE TABLE phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_pt TEXT NOT NULL,
  text_gloss TEXT,
  video_url TEXT NOT NULL,
  video_duration INTEGER,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recordings table (user submissions)
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phrase_id UUID NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_duration INTEGER,
  video_size_bytes BIGINT,
  mime_type TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_phrases_active_order ON phrases(is_active, order_index);
CREATE INDEX idx_recordings_phrase ON recordings(phrase_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Policies for phrases
-- Public can read active phrases
CREATE POLICY "public_read_active_phrases" ON phrases
  FOR SELECT USING (is_active = true);

-- Admin (service_role) can do everything - handled by service role key bypassing RLS

-- Policies for recordings
-- Public can insert recordings (for active phrases only)
CREATE POLICY "public_insert_recordings" ON recordings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM phrases
      WHERE phrases.id = recordings.phrase_id
      AND phrases.is_active = true
    )
  );

-- Public can read recordings (for dataset access)
CREATE POLICY "public_read_recordings" ON recordings
  FOR SELECT USING (true);

-- Storage buckets
-- Run these in Supabase Dashboard > Storage or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('reference-videos', 'reference-videos', true),
--   ('user-recordings', 'user-recordings', false);

-- Storage policies for reference-videos (public read)
-- CREATE POLICY "public_read_reference_videos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'reference-videos');

-- Storage policies for user-recordings (public read, authenticated insert via signed URLs)
-- CREATE POLICY "public_read_user_recordings" ON storage.objects
--   FOR SELECT USING (bucket_id = 'user-recordings');
--
-- CREATE POLICY "signed_upload_user_recordings" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'user-recordings');

-- Updated_at trigger for phrases
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phrases_updated_at
  BEFORE UPDATE ON phrases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();