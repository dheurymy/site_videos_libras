import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'IFMA-LIBRAS Dataset - Gravação de Sinais para Pesquisa',
  description: 'Plataforma para intérpretes de Libras gravarem sinais para construção de dataset científico.',
  keywords: ['Libras', 'Língua Brasileira de Sinais', 'dataset', 'pesquisa', 'acessibilidade'],
  authors: [{ name: 'Projeto Mestrado Computação Aplicada' }],
  openGraph: {
    title: 'IFMA-LIBRAS Dataset',
    description: 'Grave sinais de Libras para pesquisa científica',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#292cdb',
  width: 'device-width',
  initialScale: 1,
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}