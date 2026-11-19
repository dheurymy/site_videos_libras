'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Phrase } from '@/lib/supabase/database.types';

interface VideoModalProps {
  phrase: Phrase | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ phrase, isOpen, onClose }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap & ESC key
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') trapFocus(e);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const trapFocus = (e: KeyboardEvent) => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements?.length) return;

    const first = focusableElements[0] as HTMLElement;
    const last = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

  if (!isOpen || !phrase) return null;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="modal-card max-w-lg w-full max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="modal-title" className="text-heading-md">{phrase.text_pt}</h2>
            {phrase.text_gloss && (
              <p className="text-body-sm text-mute font-mono mt-1">{phrase.text_gloss}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-icon-circular flex-shrink-0"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Video Player */}
        <div className="relative video-container pin-aspect-4-3 mb-5">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={phrase.video_url}
            controls
            controlsList="nodownload nofullscreen noremoteplayback"
            preload="auto"
            playsInline
            aria-label={`Vídeo de referência: ${phrase.text_pt}`}
            onError={() => videoRef.current?.parentElement?.classList.add('video-error')}
          />
        </div>

        {/* Meta + CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 text-caption-sm text-mute">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {phrase.video_duration ? formatDuration(phrase.video_duration) : '—'}
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Link
              href={`/record/${phrase.id}`}
              className="btn-secondary w-full sm:w-auto min-h-[48px] flex-1"
              onClick={onClose}
            >
              Só assistir
            </Link>
            <Link
              href={`/record/${phrase.id}`}
              className="btn-primary w-full sm:w-auto min-h-[48px] flex-1 font-semibold"
              onClick={onClose}
            >
              Gravar este sinal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}