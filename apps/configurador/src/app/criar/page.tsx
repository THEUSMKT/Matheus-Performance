import type { Metadata } from 'next';
import Builder from '@/components/builder/Builder';

export const metadata: Metadata = {
  title: 'Crie a prévia do seu site | Beck Performance',
  description: 'Crie a prévia do site da sua empresa em quatro etapas, sem cadastro, e veja o valor do pacote de desenvolvimento.',
  alternates: { canonical: '/criar/' },
  // A página de criação mostra dados digitados pelo visitante: nunca indexar.
  robots: { index: false, follow: false },
};

export default function Criar() {
  return <Builder />;
}
