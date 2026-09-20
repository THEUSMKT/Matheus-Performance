import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { Icon } from './ui/Icon';

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="wrap max-w-2xl py-16 sm:py-24">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <Icon name="ArrowLeft" className="size-4" />
          Voltar para o início
        </a>

        <h1 className="mt-6 text-section font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted">Atualizado em {updated}.</p>

        <div className="mt-10 space-y-8 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_p]:leading-relaxed [&_p]:text-muted">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
