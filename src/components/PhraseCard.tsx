'use client';

import type { Phrase } from '@/lib/supabase/database.types';

interface PhraseCardProps {
  phrase: Phrase;
  index: number;
  onClick: () => void;
}

export function PhraseCard({ phrase, index, onClick }: PhraseCardProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <article
      className="pin-card animate-in group cursor-pointer"
      style={{ animationDelay: `${(index % 4) * 0.1}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Ver e gravar: ${phrase.text_pt}`}
    >
      <div className="p-5">
        {/* Texto principal */}
        <p className="text-body-md text-ink leading-relaxed mb-2">{phrase.text_pt}</p>

        {/* Glosa */}
        {phrase.text_gloss && (
          <p className="text-body-sm text-mute font-mono leading-relaxed mb-3">
            {phrase.text_gloss}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-caption-sm text-ash">
          <span>#{phrase.order_index}</span>
          {phrase.video_duration && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(phrase.video_duration)}
            </span>
          )}
        </div>

        {/* CTA visual */}
        <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-center gap-2 text-primary text-body-sm-strong">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
          Ver vídeo e gravar
        </div>
      </div>
    </article>
  );
}