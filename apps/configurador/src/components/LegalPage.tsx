import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer, Header } from './landing/Chrome';
import s from './landing/Landing.module.css';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className={s.page}>
      <Header onHome={false} />
      <main className={`${s.wrap} ${s.legal}`}>
        <Link href="/" className={s.linkButton}>
          ← Voltar para o início
        </Link>
        <h1 style={{ marginTop: 20 }}>{title}</h1>
        <p>Atualizado em {updated}.</p>
        {children}
      </main>
      <Footer onHome={false} />
    </div>
  );
}
