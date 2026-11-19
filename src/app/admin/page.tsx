'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Phrase } from '@/lib/supabase/database.types';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'libras2026';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  const [formData, setFormData] = useState({
    text_pt: '',
    text_gloss: '',
    video_url: '',
    video_duration: '',
    order_index: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check auth on load
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-auth');
    if (saved === 'true') setAuthenticated(true);
    else fetchPhrases();
  }, []);

  // Fetch phrases
  const fetchPhrases = useCallback(async () => {
    try {
      const res = await fetch('/api/phrases');
      const data = await res.json();
      if (data.phrases) setPhrases(data.phrases);
    } catch (err) {
      console.error('Fetch phrases error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem('admin-auth', 'true');
      setAuthenticated(true);
      fetchPhrases();
    } else {
      setToast({ type: 'error', message: 'Código de acesso incorreto' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin-auth');
    setAuthenticated(false);
    setPhrases([]);
  };

  // Modal handling
  const openModal = (phrase?: Phrase) => {
    if (phrase) {
      setEditingPhrase(phrase);
      setFormData({
        text_pt: phrase.text_pt,
        text_gloss: phrase.text_gloss || '',
        video_url: phrase.video_url,
        video_duration: phrase.video_duration?.toString() || '',
        order_index: phrase.order_index.toString(),
        is_active: phrase.is_active,
      });
    } else {
      setEditingPhrase(null);
      setFormData({
        text_pt: '',
        text_gloss: '',
        video_url: '',
        video_duration: '',
        order_index: phrases.length.toString(),
        is_active: true,
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPhrase(null);
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.text_pt.trim()) errors.text_pt = 'Texto em português é obrigatório';
    if (!formData.video_url.trim()) errors.video_url = 'URL do vídeo é obrigatória';
    else {
      try { new URL(formData.video_url); } catch { errors.video_url = 'URL inválida'; }
    }
    if (formData.video_duration && isNaN(Number(formData.video_duration))) {
      errors.video_duration = 'Duração deve ser um número';
    }
    if (formData.order_index && isNaN(Number(formData.order_index))) {
      errors.order_index = 'Ordem deve ser um número';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      text_pt: formData.text_pt.trim(),
      text_gloss: formData.text_gloss.trim() || null,
      video_url: formData.video_url.trim(),
      video_duration: formData.video_duration ? Number(formData.video_duration) : null,
      order_index: Number(formData.order_index) || 0,
      is_active: formData.is_active,
    };

    try {
      const url = editingPhrase
        ? `/api/phrases/${editingPhrase.id}`
        : '/api/phrases';
      const method = editingPhrase ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');

      setToast({
        type: 'success',
        message: editingPhrase ? 'Frase atualizada' : 'Frase criada',
      });
      fetchPhrases();
      closeModal();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Erro desconhecido' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete phrase
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta frase?')) return;

    try {
      const res = await fetch(`/api/phrases/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      setToast({ type: 'success', message: 'Frase excluída' });
      fetchPhrases();
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao excluir frase' });
    }
  };

  // Reorder phrases
  const movePhrase = async (id: string, direction: 'up' | 'down') => {
    const index = phrases.findIndex((p) => p.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= phrases.length) return;

    const [phraseA, phraseB] = [phrases[index], phrases[targetIndex]];

    try {
      await Promise.all([
        fetch(`/api/phrases/${phraseA.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: phraseB.order_index }),
        }),
        fetch(`/api/phrases/${phraseB.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: phraseA.order_index }),
        }),
      ]);
      fetchPhrases();
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao reordenar' });
    }
  };

  // Input change handler
  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="modal-card w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-heading-xl tracking-tight mb-2">Área Administrativa</h1>
            <p className="text-body-md text-body">Gerenciar frases de referência do dataset</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label htmlFor="passcode" className="block text-body-strong text-sm mb-2">Código de acesso</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="input"
                placeholder="Digite o código"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={!passcode.trim()}>
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header - Pinterest style nav */}
      <header className="primary-nav sticky top-0 z-10">
        <div className="container-max h-full flex items-center justify-between gap-4 px-4">
          <h1 className="text-heading-lg">Painel Admin</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="btn-tertiary text-body-strong">Ver site público</a>
            <button onClick={logout} className="btn-secondary">Sair</button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in">
          <div
            className={`modal-card shadow-modal border-2 ${
              toast.type === 'success' ? 'border-success' : 'border-error'
            } min-w-[280px]`}
          >
            <p className={`text-body-md ${toast.type === 'success' ? 'text-success' : 'text-error'}`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="section">
        <div className="container-max">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-heading-xl tracking-tight">Frases de Referência</h2>
              <p className="text-body-md text-mute mt-1">
                {phrases.length} frase{phrases.length !== 1 ? 's' : ''} cadastrada{phrases.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto">
              + Nova frase
            </button>
          </div>

          {/* Phrases Table */}
          <div className="bg-canvas rounded-md border border-hairline overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-mute">Carregando...</div>
            ) : phrases.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-heading-md mb-2">Nenhuma frase cadastrada</h3>
                <p className="text-body-md text-mute mb-4">Comece adicionando a primeira frase de referência.</p>
                <button onClick={() => openModal()} className="btn-primary">
                  Criar primeira frase
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="grid">
                  <thead>
                    <tr className="border-b border-hairline bg-surface-soft">
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider">Texto (PT)</th>
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider hidden md:table-cell">Glosa</th>
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider hidden lg:table-cell">Vídeo</th>
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider">Duração</th>
                      <th className="px-4 py-3 text-left text-caption-sm font-semibold text-mute uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-caption-sm font-semibold text-mute uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phrases.map((phrase, index) => (
                      <tr key={phrase.id} className="border-b border-hairline hover:bg-surface-soft/50 transition-colors">
                        <td className="px-4 py-3 text-button-sm text-mute font-medium">{phrase.order_index}</td>
                        <td className="px-4 py-3 text-body-md text-ink max-w-xs truncate">{phrase.text_pt}</td>
                        <td className="px-4 py-3 text-body-sm text-mute font-mono hidden md:table-cell max-w-xs truncate">
                          {phrase.text_gloss || '—'}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <video
                            src={phrase.video_url}
                            className="w-20 h-15 object-cover rounded"
                            muted
                            preload="metadata"
                          />
                        </td>
                        <td className="px-4 py-3 text-button-sm font-mono tabular-nums">{formatDuration(phrase.video_duration)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`pin-overlay-pill text-xs ${
                              phrase.is_active ? 'bg-success-pale text-success' : 'bg-secondary-bg text-mute'
                            }`}
                          >
                            {phrase.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => movePhrase(phrase.id, 'up')}
                              disabled={index === 0}
                              className="btn-icon-circular disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Mover para cima"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => movePhrase(phrase.id, 'down')}
                              disabled={index === phrases.length - 1}
                              className="btn-icon-circular disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Mover para baixo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openModal(phrase)}
                              className="btn-secondary text-body-sm px-3 py-1.5 h-auto"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(phrase.id)}
                              className="btn-secondary text-body-sm px-3 py-1.5 h-auto text-error border-error hover:bg-error-pale"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="feature-card text-center">
              <p className="text-caption-md text-mute mb-1">Total de frases</p>
              <p className="text-display-lg font-semibold text-ink">{phrases.length}</p>
            </div>
            <div className="feature-card text-center">
              <p className="text-caption-md text-mute mb-1">Frases ativas</p>
              <p className="text-display-lg font-semibold text-ink">
                {phrases.filter((p) => p.is_active).length}
              </p>
            </div>
            <div className="feature-card text-center">
              <p className="text-caption-md text-mute mb-1">Tempo total de referência</p>
              <p className="text-display-lg font-semibold text-ink font-mono tabular-nums">
                {formatDuration(phrases.reduce((acc, p) => acc + (p.video_duration || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-in sm:items-start sm:pt-16">
          <div className="modal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between border-b border-hairline mb-6 pb-4">
              <h2 className="text-heading-lg">{editingPhrase ? 'Editar frase' : 'Nova frase'}</h2>
              <button onClick={closeModal} className="btn-icon-circular" aria-label="Fechar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="text_pt" className="block text-body-strong text-sm mb-2">
                  Texto em Português <span className="text-error">*</span>
                </label>
                <textarea
                  id="text_pt"
                  value={formData.text_pt}
                  onChange={(e) => handleChange('text_pt', e.target.value)}
                  className="input min-h-[100px] resize-y"
                  placeholder="Ex: Bom dia, como vai você?"
                  rows={3}
                />
                {formErrors.text_pt && (
                  <p className="text-body-sm text-error mt-1">{formErrors.text_pt}</p>
                )}
              </div>

              <div>
                <label htmlFor="text_gloss" className="block text-body-strong text-sm mb-2">
                  Glosa (Libras)
                </label>
                <input
                  id="text_gloss"
                  type="text"
                  value={formData.text_gloss}
                  onChange={(e) => handleChange('text_gloss', e.target.value)}
                  className="input font-mono"
                  placeholder="Ex: BOM-DIA COMO VOCÊ"
                />
                <p className="text-caption-md text-mute mt-1">Notação da estrutura gramatical em Libras (opcional)</p>
              </div>

              <div>
                <label htmlFor="video_url" className="block text-body-strong text-sm mb-2">
                  URL do Vídeo de Referência <span className="text-error">*</span>
                </label>
                <input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className="input"
                  placeholder="https://exemplo.com/video.mp4"
                />
                {formErrors.video_url && (
                  <p className="text-body-sm text-error mt-1">{formErrors.video_url}</p>
                )}
                <p className="text-caption-md text-mute mt-1">URL pública do vídeo (Supabase Storage, CDN, etc.)</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="video_duration" className="block text-body-strong text-sm mb-2">
                    Duração (segundos)
                  </label>
                  <input
                    id="video_duration"
                    type="number"
                    min="1"
                    value={formData.video_duration}
                    onChange={(e) => handleChange('video_duration', e.target.value)}
                    className="input"
                    placeholder="30"
                  />
                  {formErrors.video_duration && (
                    <p className="text-body-sm text-error mt-1">{formErrors.video_duration}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="order_index" className="block text-body-strong text-sm mb-2">
                    Ordem
                  </label>
                  <input
                    id="order_index"
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => handleChange('order_index', e.target.value)}
                    className="input"
                  />
                  {formErrors.order_index && (
                    <p className="text-body-sm text-error mt-1">{formErrors.order_index}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="w-4 h-4 rounded border-ash text-primary focus:ring-2 focus:ring-focus-outer focus:ring-offset-2"
                    />
                    <span className="text-body-sm">Frase ativa (visível ao público)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingPhrase ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}