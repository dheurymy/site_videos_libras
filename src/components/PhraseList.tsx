'use client';

import { useEffect, useState } from 'react';
import { PhraseCard } from './PhraseCard';
import { VideoModal } from './VideoModal';
import type { Phrase } from '@/lib/supabase/database.types';

export function PhraseList() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);

  useEffect(() => {
    async function fetchPhrases() {
      try {
        const res = await fetch('/api/phrases');
        const data = await res.json();
        if (data.phrases) setPhrases(data.phrases);
        else setError(data.error || 'Erro ao carregar frases');
      } catch { setError('Erro de conexão'); }
      finally { setLoading(false); }
    }
    fetchPhrases();
  }, []);

  const openModal = (phrase: Phrase) => setSelectedPhrase(phrase);
  const closeModal = () => setSelectedPhrase(null);

  // Loading skeletons
  if (loading) {
    return (
      <div className="masonry-grid" role="status" aria-label="Carregando frases">
        {[...Array(6)].map((_, i) => (
          <article key={i} className="pin-card animate-pulse">
            <div className="p-5 space-y-3">
              <div className="h-4 bg-stone rounded w-3/4" />
              <div className="h-4 bg-stone rounded w-1/2" />
              <div className="h-3 bg-stone rounded w-1/4 mt-4" />
              <div className="h-8 bg-stone rounded-full mt-4" />
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-max py-section text-center">
        <div className="max-w-md mx-auto p-8 rounded-md bg-surface-card border border-hairline">
          <svg className="w-12 h-12 mx-auto mb-4 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-body-md text-body mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (phrases.length === 0) {
    return (
      <div className="container-max py-section text-center">
        <div className="max-w-md mx-auto p-8 rounded-md bg-surface-card border border-hairline">
          <svg className="w-12 h-12 mx-auto mb-4 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-heading-md mb-2">Nenhuma frase disponível</h3>
          <p className="text-body-md text-mute mb-4">Volte mais tarde para ver novas frases para gravar.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid" role="list" aria-label="Frases para gravar">
        {phrases.map((phrase, index) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            index={index + 1}
            onClick={() => openModal(phrase)}
          />
        ))}
      </div>

      <VideoModal
        phrase={selectedPhrase}
        isOpen={!!selectedPhrase}
        onClose={closeModal}
      />
    </>
  );
}