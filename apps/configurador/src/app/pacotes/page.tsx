import type { Metadata } from 'next';
import PackagesPage from '@/components/landing/PackagesPage';
import { priceRange } from '@/config/packages';
import { shareImage } from '@/config/share';

const title = 'Pacotes e valores | Beck Performance';
const description = `Compare os pacotes Essencial, Profissional e Completo: seções, galeria, vitrine, prazos e condições. Desenvolvimento de ${priceRange}, pagamento único.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/pacotes/' },
  openGraph: { type: 'website', locale: 'pt_BR', url: '/pacotes/', title, description, images: [shareImage] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function Pacotes() {
  return <PackagesPage />;
}
