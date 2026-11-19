'use client';

import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Política de Privacidade - Libras Dataset</title>
        <meta name="description" content="Política de privacidade e proteção de dados do projeto Libras Dataset." />
      </Head>
      <main className="min-h-screen bg-canvas flex flex-col">
        {/* Header */}
        <header className="primary-nav sticky top-0 z-10">
          <div className="container-max h-full flex items-center justify-between gap-4 px-4">
            <Link href="/" className="btn-tertiary text-body-strong" aria-label="Voltar ao site">
              ← Voltar
            </Link>
            <h1 className="text-heading-lg flex-1 text-center">Política de Privacidade</h1>
            <div className="w-20" />
          </div>
        </header>

        <article className="flex-1 section container-max max-w-3xl">
          <header className="py-section pb-6 text-center animate-in">
            <h2 className="text-display-lg tracking-tight mb-3">Política de Privacidade</h2>
            <p className="text-body-md text-body max-w-2xl mx-auto leading-relaxed">
              Como coletamos, usamos e protegemos seus dados no projeto Libras Dataset.
            </p>
            <time className="text-caption-md text-mute mt-4 block" dateTime="2026-11-19">
              Última atualização: 19 de novembro de 2026 — Versão 1.0
            </time>
          </header>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-heading-md mb-3">1. Dados que coletamos</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Vídeos de Libras</strong> que você grava e envia voluntariamente</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Metadados técnicos</strong>: duração, tamanho do arquivo, formato, user-agent do navegador</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Nenhum dado pessoal</strong>: não coletamos nome, email, IP, localização ou identificadores pessoais</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-heading-md mb-3">2. Como usamos seus dados</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Construir <strong>banco de dados aberto de Libras</strong> para pesquisa científica</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Treinar modelos de <strong>reconhecimento de sinais</strong> e tradução automática</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Publicar resultados em <strong>artigos acadêmicos</strong> e repositórios abertos</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Nunca</strong> para fins comerciais, publicidade ou rastreamento</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-heading-md mb-3">3. Armazenamento e segurança</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Vídeos armazenados no <strong>Supabase Storage</strong> (compatível AWS S3, criptografado em trânsito e repouso)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Metadados em <strong>PostgreSQL</strong> com Row Level Security</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Upload direto do navegador para storage via <strong>URLs assinadas</strong> (seu vídeo não passa pelo nosso servidor)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Acesso ao banco apenas via <strong>service role key</strong> no backend (nunca exposto ao frontend)</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-heading-md mb-3">4. Anonimização</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cada gravação recebe <strong>UUID aleatório</strong> — sem vínculo com você</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Nomes de arquivo originais são <strong>substituídos</strong> por identificadores únicos</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Metadados de câmera/dispositivo <strong>não incluem</strong> informações pessoais</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Banco publicado terá <strong>apenas</strong> vídeos e glossas — zero identificadores</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-heading-md mb-3">5. Seus direitos (LGPD)</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Acesso</strong>: solicitar cópia dos seus dados</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Exclusão</strong>: pedir remoção completa das suas gravações a qualquer momento</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Retificação</strong>: corrigir metadados incorretos</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Portabilidade</strong>: receber seus dados em formato estruturado</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Contato: <a href="mailto:privacidade@exemplo.com" className="link-inline">privacidade@exemplo.com</a></span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-heading-md mb-3">6. Retenção de dados</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Gravações mantidas enquanto o projeto de pesquisa estiver ativo</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Após conclusão: dataset anônimo publicado em repositório aberto (ex: Zenodo, GitHub)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cópias de backup seguras por até <strong>12 meses</strong> após publicação</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Solicitação de exclusão processada em até <strong>30 dias</strong></span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-heading-md mb-3">7. Consentimento</h3>
            <ul className="space-y-3 text-body-md text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ao gravar e enviar, você dá <strong>consentimento livre, informado e específico</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pode <strong>revogar a qualquer momento</strong> solicitando exclusão</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Navegação no site sem gravação <strong>não requer consentimento</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Banner de consentimento usa <strong>localStorage</strong> (não cookies de rastreamento)</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 animate-in" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-heading-md mb-3">8. Contato e DPO</h3>
            <p className="text-body-md text-body mb-2">
              Encarregado de Proteção de Dados (DPO): <strong>Prof. Orientador do Mestrado</strong>
            </p>
            <p className="text-body-md text-body">
              Email: <a href="mailto:dpo@exemplo.com" className="link-inline">dpo@exemplo.com</a>
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <section className="hero-cta-strip">
          <div className="container-max text-center">
            <Link href="/" className="btn-primary">
              Voltar ao site
            </Link>
          </div>
        </section>

        <footer className="footer-section" role="contentinfo">
          <div className="container-max text-center">
            <p className="text-caption-sm text-mute">
              © 2026 Libras Dataset — Dados abertos para pesquisa científica
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}