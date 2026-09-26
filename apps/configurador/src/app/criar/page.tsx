import type { Metadata } from 'next';
import Builder from '@/components/builder/Builder';

export const metadata: Metadata = {
  title: 'Crie a prévia do seu site | Beck Performance',
  description: 'Monte a prévia do site da sua empresa em quatro etapas, sem cadastro, e veja a estimativa de investimento.',
  alternates: { canonical: '/criar/' },
};

export default function Criar() {
  return <Builder />;
}
