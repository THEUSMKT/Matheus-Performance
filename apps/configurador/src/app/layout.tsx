import type { Metadata, Viewport } from 'next';

import { contact } from '@/config/contact';
import './globals.css';

const title = 'Beck Performance | Monte seu Site Profissional';
const description =
  'Estruture seu site profissional em até 3 minutos. Escolha estilo, funcionalidades e receba uma estimativa clara para o seu projeto.';

export const metadata: Metadata = {
  metadataBase: new URL(contact.siteUrl),
  title,
  description,
  applicationName: contact.brand,
  authors: [{ name: contact.brand }],
  keywords: [
    'criação de sites',
    'desenvolvimento de sites',
    'landing page',
    'site profissional',
    'orçamento de site',
  ],
  alternates: { canonical: '/' },
  robots: contact.indexarNoGoogle
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: contact.brand,
    url: '/',
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = {
  themeColor: '#081B5C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${contact.siteUrl}/#servico`,
      name: `${contact.brand} — ${contact.tagline}`,
      description,
      url: contact.siteUrl,
      areaServed: 'BR',
      serviceType: 'Criação de sites',
    },
    {
      '@type': 'WebSite',
      '@id': `${contact.siteUrl}/#site`,
      url: contact.siteUrl,
      name: contact.brand,
      inLanguage: 'pt-BR',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = '';

  return (
    <html lang="pt-BR" className={fontVars}>
      <body>
        <a
          href="#configurador"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
        >
          Ir para o configurador
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
