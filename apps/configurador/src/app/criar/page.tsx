import type { Metadata } from 'next';
import Builder from '@/components/builder/Builder';

export const metadata: Metadata = {
  title: 'Crie a prévia do seu site | Beck Performance',
  description: 'Conte sobre seu negócio, veja a prévia do site e personalize uma escolha por vez, sem cadastro. O valor do pacote fica à vista.',
  alternates: { canonical: '/criar/' },
  // A página de criação mostra dados digitados pelo visitante: nunca indexar.
  robots: { index: false, follow: false },
};

export default function Criar() {
  return <Builder />;
}
