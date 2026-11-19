import { PhraseList } from '@/components/PhraseList';
import { ConsentBanner } from '@/components/ConsentBanner';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas flex flex-col">
      <ConsentBanner />

      {/* Hero Section - Pinterest style */}
      <section className="bg-surface-soft" aria-labelledby="hero-title">
        <div className="container-max">
          <header className="py-section sm:py-[80px] animate-in">
            <h1 id="hero-title" className="text-display-lg text-center sm:text-left max-w-3xl mx-auto sm:mx-0 tracking-tight mb-6">
              LIBRAS - IFMA
            </h1>
            <p className="text-body-md text-body max-w-2xl mx-auto sm:mx-0 text-center sm:text-left leading-relaxed">
              Grave frases em LIBRAS para a ciência.
              Sua gravação ajuda a criar um banco de dados aberto para pesquisa em LIBRAS.
              Pesquisadores usam para melhorar tradução automática e acessibilidade.
            </p>
          </header>

          {/* CTA Button - sticky style */}
          <div className="mt-8 text-center sm:text-left animate-in" style={{ animationDelay: '0.1s' }}>
            <a href="#phrases" className="btn-primary">
              Começar a gravar!
            </a>
          </div>
        </div>
      </section>

      {/* Stats Strip - subtle */}
      

      {/* Frases list - Masonry grid */}
      <section className="bg-canvas" aria-labelledby="phrases-heading" id="phrases">
        <div className="container-max">
          <header className="py-section pb-6 animate-in">
            <h2 id="phrases-heading" className="text-center text-heading-xl tracking-tight mb-2">
              Frases para gravar.
            </h2>
            <p className="text-center text-body-md text-body max-w-2xl leading-relaxed">
              Toque em uma frase para ver o vídeo de referência e gravar sua sinalização.
            </p>
          </header>

          <PhraseList />
        </div>
      </section>

      {/* Como funciona - Feature cards alternating */}
      <section className="bg-surface-soft" aria-labelledby="about-heading">
        <div className="container-max">
          <header className="py-section pb-6 text-center animate-in">
            <h2 id="about-heading" className="text-heading-xl tracking-tight mb-2">
              Como funciona.
            </h2>
            <p className="text-body-md text-body max-w-2xl mx-auto leading-relaxed">
              Simples, rápido e sua privacidade é respeitada.
            </p>
          </header>

          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4 pb-section">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Assista',
                desc: 'Veja a frase em LIBRAS no vídeo de referência.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 00-9-9 9 9 0 000 18 9 9 0 009 9z" />
                  </svg>
                ),
                title: 'Grave',
                desc: 'Use sua câmera para gravar você sinalizando a frase em LIBRAS.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Revise',
                desc: 'Assista sua gravação e decida se quer enviar.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
                title: 'Envie',
                desc: 'Sua gravação vai para o banco de dados anônimo de LIBRAS e é usada para pesquisa científica.'
              },
            ].map((step, i) => (
              <article key={step.title} className="feature-card text-center animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-heading-md mb-2">{step.title}</h3>
                <p className="text-body-md text-body leading-relaxed">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip - dark */}
      <section className="hero-cta-strip" aria-labelledby="cta-heading">
        <div className="container-max">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
            <div className="max-w-xl">
              <h2 id="cta-heading" className="text-heading-xl tracking-tight mb-2">
                Pronto para contribuir?
              </h2>
              <p className="text-body-md text-on-dark-mute">
                Sua participação ajuda a ciência a entender melhor a LIBRAS.
              </p>
            </div>
            <a href="#phrases" className="btn-primary w-full md:w-auto flex-shrink-0">
              Ver frases
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section" role="contentinfo">
        <div className="container-max">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 text-center md:text-left mb-8">
            <div className="md:pl-2">
              <h3 className="text-body-sm-strong mb-2">Sobre o projeto</h3>
              <p className="text-body-sm text-mute leading-relaxed">
                Banco de dados de LIBRAS para pesquisa acadêmica em reconhecimento e tradução de LIBRAS.
                Gravações anônimas, usadas somente para ciência.
              </p>
            </div>
            <div>
              <h3 className="text-body-sm-strong mb-2">Sua privacidade</h3>
              <ul className="space-y-1.5 text-body-sm text-mute">
                <li>• Nenhum dado pessoal coletado</li>
                <li>• Vídeos salvos sem identificação</li>
                <li>• Nenhum vídeo é publicado publicamente</li>
              </ul>
            </div>
            <div className="md:pr-2">
              <h3 className="text-body-sm-strong mb-2">Contato</h3>
              <p className="text-body-sm text-mute leading-relaxed">
                Para dúvidas ou sugestões, entre em contato com o pesquisador responsável:
                <br />
                <a href="mailto:rycherdsilva@acad.ifma.edu.br" className="link-inline">rycherdsilva@acad.ifma.edu.br</a>
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-hairline text-center">
            <p className="text-caption-sm text-mute">
              © 2026 IFMA-LIBRAS Dataset — Dados abertos para pesquisa científica.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}