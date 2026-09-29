import type { Metadata } from 'next';
import ExamplesPage from '@/components/landing/ExamplesPage';
import { shareImage } from '@/config/share';

const title = 'Exemplos de sites | Beck Performance';
const description = 'Sites reais desenvolvidos pela Beck Performance e modelos por segmento para imaginar o site da sua empresa. Crie uma prévia grátis a partir de um modelo.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/exemplos/' },
  openGraph: { type: 'website', locale: 'pt_BR', url: '/exemplos/', title, description, images: [shareImage] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function Exemplos() {
  return <ExamplesPage />;
}
