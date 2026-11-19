'use client';

import { useEffect, useState } from 'react';

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('libras-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('libras-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('libras-consent', JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-in p-4 sm:p-6"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      aria-modal="true"
    >
      <div className="modal-card max-w-md mx-auto shadow-modal border border-hairline">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 id="consent-title" className="text-heading-md">Para a pesquisa</h3>
            <p className="text-body-sm text-mute">Precisamos do seu acordo para gravar</p>
          </div>
        </div>

        <p id="consent-desc" className="text-body-md text-body mb-6 leading-relaxed">
          Ao gravar e enviar, seu vídeo entra no banco de dados anônimo de Libras para pesquisa científica.
          Nenhum dado pessoal é coletado. Você pode pedir exclusão quando quiser.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={accept}
            className="btn-primary w-full min-h-[48px] text-body-strong"
            autoFocus
          >
            Entendi, pode gravar
          </button>
          <button
            onClick={decline}
            className="btn-secondary w-full min-h-[48px]"
          >
            Só olhar, não gravar
          </button>
        </div>

        <p className="text-caption-md text-center mt-5 text-mute">
          <a href="/privacidade" className="link-inline">
            Política de privacidade completa
          </a>
        </p>
      </div>

      {/* Overlay background */}
      <div
        className="fixed inset-0 bg-ink/50 z-[-1] sm:hidden"
        aria-hidden="true"
      />
    </div>
  );
}