import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import { contact } from '@/config/contact';
import { isProduction } from '@/config/integrations';
import { shareImage } from '@/config/share';
import { AppFallback } from '@/components/AppFallback';
import { AppReady } from '@/components/AppReady';
import './globals.css';

/**
 * Títulos em Plus Jakarta Sans (arquivo local, variável, só o subconjunto
 * latino — OFL, licença em app/fonts). Os textos usam a fonte do sistema
 * (SF no iPhone, Roboto no Android): nada a baixar para ler.
 */
const titleFont = localFont({
  src: './fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  weight: '200 800',
  display: 'swap',
  // Sem preload: no 4G lento o arquivo competia com o CSS e atrasava a primeira pintura.
  // Os títulos aparecem na fonte do sistema e trocam quando a fonte chega.
  preload: false,
  variable: '--font-title',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
});

const title = 'Beck Performance | Sites para empresas de todos os portes';
const description = 'Sites profissionais para empresas. Escolha um modelo entre os projetos já publicados ou gere uma prévia grátis, sem cadastro. Desenvolvimento a partir de R$ 500, pagamento único.';

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
    images: [shareImage],
  },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
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
  const fontVars = titleFont.variable;

  return (
    <html lang="pt-BR" className={fontVars}>
      <body>
        <AppFallback />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
        >
          Ir para o conteúdo
        </a>
        {children}
        <AppReady />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
