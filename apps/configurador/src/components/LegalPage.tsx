import type { ReactNode } from 'react';
import { Footer, Header, homeHref } from './landing/Chrome';
import s from './landing/Landing.module.css';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className={`${s.page} ${s.bright}`}>
      <Header where="outra" />
      <main className={`${s.wrap} ${s.legal}`}>
        <a href={homeHref} className={s.linkButton}>
          ← Voltar para o início
        </a>
        <h1 style={{ marginTop: 20 }}>{title}</h1>
        <p>Atualizado em {updated}.</p>
        {children}
      </main>
      <Footer where="outra" />
    </div>
  );
}
