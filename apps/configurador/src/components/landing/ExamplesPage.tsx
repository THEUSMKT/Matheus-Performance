'use client';
/* ==========================================================================
   Página "Exemplos de sites" (/exemplos/), em dois grupos:
   - Projetos reais: os sites publicados, com captura e "Visitar site";
   - Modelos para imaginar o seu: os modelos demonstrativos por segmento,
     com filtros, visualização no computador e no celular e "Criar minha
     prévia com este modelo".
   ?segmento=<id> (campanhas) abre a lista já filtrada.
   ========================================================================== */
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { Footer, Header, builderHref, homeHref, packagesHref } from './Chrome';
import { ExampleGallery } from './ExampleGallery';
import { RealProjectShowcase } from './RealProjects';
import { useProject } from './useProject';
import s from './Landing.module.css';

export default function ExamplesPage() {
  const state = useProject({ readHash: false });
  const ctaLabel = state.resumable ? 'Continuar minha prévia' : 'Criar minha prévia grátis';
  const [initialFilter, setInitialFilter] = useState('todos');

  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('segmento');
    const seg = fromUrl ?? state.origin.segment;
    if (seg) setInitialFilter(seg);
  }, [state.origin.segment]);

  return (
    <div className={`${s.page} ${s.inner} ${s.bright}`} id="topo">
      <Header where="exemplos" ctaLabel={ctaLabel} onStart={() => track('start_click', { context: 'cabecalho' })} />
      <main id="conteudo">
        <section className={s.pageHead} aria-labelledby="exemplos-titulo">
          <div className={s.wrap}>
            <nav className={s.crumbs} aria-label="Você está em">
              <a href={homeHref}>Início</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Exemplos de sites</span>
            </nav>
            <h1 id="exemplos-titulo">Inspire-se no próximo site da sua empresa.</h1>
            <p className={s.pageLead}>Veja sites que já estão no ar e modelos por segmento para imaginar o seu.</p>
            <ul className={s.jump} aria-label="Nesta página">
              <li>
                <a href="#projetos-reais">Projetos reais</a>
              </li>
              <li>
                <a href="#modelos">Modelos para imaginar o seu</a>
              </li>
            </ul>
          </div>
        </section>

        <section className={s.section} id="projetos-reais" aria-labelledby="reais-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="reais-titulo">Projetos reais</h2>
              <p>Sites desenvolvidos pela Beck Performance e publicados. Abra cada um em uma nova aba.</p>
            </div>
            <RealProjectShowcase context="exemplos" />
          </div>
        </section>

        <section className={`${s.section} ${s.band}`} id="modelos" aria-labelledby="modelos-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="modelos-titulo">Modelos para imaginar o seu</h2>
              <p>Modelos demonstrativos por segmento, com nomes fictícios e ilustrações. Escolha um para começar a sua prévia grátis e ajuste tudo depois.</p>
            </div>
            <ExampleGallery initialFilter={initialFilter} />
          </div>
        </section>

        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Já sabe o que quer mostrar?</h2>
            <p>Compare os pacotes ou comece a sua prévia grátis, sem cadastro.</p>
            <div className={s.finalActions}>
              <a className={s.primary} href={builderHref} onClick={() => track('start_click', { context: 'final' })}>
                {ctaLabel}
              </a>
              <a className={s.secondary} href={packagesHref} onClick={() => track('nav_click', { target: 'pacotes', context: 'exemplos' })}>
                Ver pacotes e valores
              </a>
            </div>
            <a className={s.backHome} href={homeHref}>
              Voltar ao início
            </a>
          </div>
        </section>
      </main>
      <Footer where="exemplos" />
    </div>
  );
}
