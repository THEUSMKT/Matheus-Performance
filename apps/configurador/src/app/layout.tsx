import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Instrument_Serif,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from 'next/font/google';
import { contact } from '@/config/contact';
import './globals.css';

/* A interface inteira usa Plus Jakarta Sans. As outras famílias existem
   só para as amostras da etapa de tipografia e para o preview ao vivo. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap', preload: false });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-playfair', display: 'swap', preload: false });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap', preload: false });
const instrument = Instrument_Serif({ subsets: ['latin'], weight: ['400'], variable: '--font-instrument', display: 'swap', preload: false });

const title = 'Criação de Sites Profissionais | Monte seu Projeto';
const description =
  'Escolha o estilo, as funcionalidades e o modelo do seu site e receba uma estimativa de valor e prazo em poucos minutos.';

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
  themeColor: '#f8f9fb',
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
      priceRange: 'R$ 500 – R$ 1.200',
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
  const fontVars = [jakarta.variable, inter.variable, playfair.variable, grotesk.variable, instrument.variable].join(' ');

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
