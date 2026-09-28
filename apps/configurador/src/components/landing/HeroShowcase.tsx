'use client';
/* ==========================================================================
   Vitrine do topo: o exemplo "Estúdio Forma" (arquitetura), desenhado pelo
   mesmo componente das prévias (SitePreview) — nada que o configurador não
   consiga montar —, numa janela de navegador em perspectiva, com a versão
   de celular sobreposta e o selo de tempo, sobre a base azul. Só apresentação: nada aqui é clicável.
   A montagem acontece uma vez, quando a vitrine entra na tela; depois fica
   só uma flutuação lenta. Sem JavaScript ou com "reduzir movimento", aparece
   pronta e parada.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { exampleProject } from '@/lib/project';
import { SitePreview } from '../preview/SitePreview';
import { DesktopFrame } from './DemoFrames';
import { prefersReducedMotion } from './hooks';
import v from './HeroShowcase.module.css';

const demo = exampleProject('criativo');

export function HeroShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPlay(true);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={root}
      className={v.showcase}
      data-showcase=""
      data-play={play ? '' : undefined}
      role="img"
      aria-label="Exemplo ilustrativo montado pelo configurador: o site do Estúdio Forma no computador e no celular. Prévia grátis em poucos passos."
    >
      <noscript>
        <style>{'[data-showcase] *{animation-play-state:running!important}'}</style>
      </noscript>
      <div className={v.float} aria-hidden="true">
        <div className={v.base} />

        <div className={v.window}>
          <div className={v.bar}>
            <span className={v.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={v.url}>estudioforma.com.br</span>
            <span className={v.tag}>Exemplo ilustrativo</span>
          </div>
          <div className={`${v.real} ${v.step2}`}>
            <DesktopFrame width={960} className={v.realFrame}>
              <SitePreview project={demo} compact bare demo />
            </DesktopFrame>
          </div>
        </div>

        <div className={v.phone}>
          <div className={`${v.screen} ${v.realScreen}`}>
            <DesktopFrame width={360} className={v.realFrame}>
              <SitePreview project={demo} compact bare mobile demo />
            </DesktopFrame>
          </div>
        </div>

        <span className={v.badge}>
          <Clock3 /> Prévia grátis em poucos passos
        </span>
      </div>
    </div>
  );
}
