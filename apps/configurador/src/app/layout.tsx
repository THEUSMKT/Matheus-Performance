import type { Metadata, Viewport } from 'next';

import { contact } from '@/config/contact';
import { isProduction } from '@/config/integrations';
import './globals.css';

const title = 'Beck Performance | Criação de sites para pequenas e médias empresas';
const description =
  'Veja uma prévia do site da sua empresa, conheça a estimativa de investimento e receba orientação para publicar. Escopo e custos confirmados antes da contratação.';

/** Indexa só no build de produção E com a liberação em contact.ts. */
const indexable = isProduction && contact.indexarNoGoogle;

export const metadata: Metadata = {
  metadataBase: new URL(contact.siteUrl),
  title,
  description,
  applicationName: contact.brand,
  authors: [{ name: contact.owner }],
  keywords: ['criação de sites', 'site para empresas', 'site profissional', 'landing page', 'orçamento de site'],
  alternates: { canonical: '/' },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
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
      name: contact.brand,
      description,
      url: `${contact.siteUrl}/`,
      image: `${contact.siteUrl}/icon.png`,
      areaServed: 'BR',
      serviceType: 'Criação de sites',
      founder: { '@type': 'Person', name: contact.owner },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+${contact.whatsapp}`,
        availableLanguage: 'pt-BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${contact.siteUrl}/#site`,
      url: `${contact.siteUrl}/`,
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
