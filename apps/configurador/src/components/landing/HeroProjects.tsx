'use client';
/* ==========================================================================
   Topo da página inicial: os sites publicados (config/proof.ts) num
   carrossel arrastável — no celular e no computador —, com o próximo slide
   aparecendo pela borda, bolinhas e setas. Sem avanço automático nem loop.
   Todos os slides têm a mesma largura e a mesma altura: imagem 16/10,
   selo em uma linha, linha de baixo com altura fixa.
   A captura inteira abre o site em nova aba; arrastar em cima dela não abre
   (useCarousel). Detalhes de cada projeto ficam em /exemplos/.
   ========================================================================== */
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { realProjects, type RealProject } from '@/config/proof';
import { track } from '@/lib/analytics';
import { asset } from './Chrome';
import { useCarousel } from './useCarousel';
import c from './HeroProjects.module.css';

const label = (p: RealProject) => p.shortName ?? p.name;

export function HeroProjects({ className }: { className?: string }) {
  const list = useRef<HTMLUListElement>(null);
  const { index, scrollable, go } = useCarousel(list);
  const open = (p: RealProject) => () => track('real_project_open', { project: p.id, context: 'inicio_topo' });

  return (
    <div className={`${c.root} ${className ?? ''}`} id="projetos" role="region" aria-roledescription="carrossel" aria-label="Sites publicados">
      <span className={c.halo} aria-hidden="true" />
      <span className={c.shapes} aria-hidden="true" />
      <ul className={c.list} ref={list} data-carousel="">
        {realProjects.map((p, i) => (
          <li key={p.id} className={c.slide} aria-roledescription="slide" aria-label={`${i + 1} de ${realProjects.length}: ${label(p)}`}>
            <a
              className={c.frame}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onClick={open(p)}
              aria-label={`Visitar site: ${p.name} (abre em nova aba)`}
            >
              <span className={c.bar} aria-hidden="true">
                <span className={c.dotsDeco}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={c.url}>{p.domain}</span>
              </span>
              <span className={c.shot}>
                <img
                  src={asset(`${p.image}-640.webp`)}
                  srcSet={`${asset(`${p.image}-640.webp`)} 640w, ${asset(`${p.image}-1080.webp`)} 1080w, ${asset(`${p.image}-1280.webp`)} 1280w`}
                  sizes="(min-width: 1000px) 500px, (min-width: 560px) 70vw, 86vw"
                  width={1280}
                  height={800}
                  alt={`${p.alt}, no computador`}
                  // A primeira é a maior imagem da primeira tela; a segunda aparece pela borda.
                  fetchPriority={i === 0 ? 'high' : undefined}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </span>
              <span className={c.badge}>
                <i aria-hidden="true" /> Projeto publicado · {label(p)}
              </span>
            </a>
            <p className={c.meta}>
              <span className={c.category}>
                {p.category}
                {p.ownBrand ? ' · marca própria' : ''}
              </span>
              <a className={c.visit} href={p.url} target="_blank" rel="noopener noreferrer" draggable={false} onClick={open(p)} aria-label={`Ver site: ${p.name} (abre em nova aba)`}>
                Ver site <ExternalLink aria-hidden="true" />
              </a>
            </p>
          </li>
        ))}
      </ul>
      <div className={c.nav} hidden={!scrollable}>
        <p className={c.hint}>Arraste para ver mais</p>
        <div className={c.controls}>
          <button type="button" className={c.arrow} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Site anterior">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className={c.dots}>
            {realProjects.map((p, i) => (
              <button key={p.id} type="button" className={c.dot} onClick={() => go(i)} aria-label={`Ir para ${label(p)}`} aria-current={i === index ? 'true' : undefined} />
            ))}
          </span>
          <button type="button" className={c.arrow} onClick={() => go(index + 1)} disabled={index === realProjects.length - 1} aria-label="Próximo site">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
