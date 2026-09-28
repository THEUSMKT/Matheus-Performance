import type { Metadata, Viewport } from 'next';

import { contact } from '@/config/contact';
import { priceRange } from '@/config/packages';
import { isProduction } from '@/config/integrations';
import './globals.css';

const title = 'Beck Performance | Sites para empresas de todos os portes';
const description = `Um site profissional para apresentar sua empresa e facilitar novos contatos. Veja uma prévia grátis, sem cadastro. Desenvolvimento de ${priceRange}, pagamento único.`;

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
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
        >
          Ir para o conteúdo
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
