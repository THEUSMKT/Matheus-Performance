'use client';
/* ==========================================================================
   Vitrine do topo: um site demonstrativo (arquitetura e interiores) numa
   janela de navegador em perspectiva, a versão de celular sobreposta e o
   selo de tempo, sobre a base azul. Só apresentação: nada aqui é clicável.
   A montagem acontece uma vez, quando a vitrine entra na tela; depois fica
   só uma flutuação lenta. Sem JavaScript ou com "reduzir movimento", aparece
   pronta e parada.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Clock3, House, Store, Sofa } from 'lucide-react';
import { asset } from './Chrome';
import { prefersReducedMotion } from './hooks';
import v from './HeroShowcase.module.css';

const image = asset('/demo/interiores.svg');
const services = [
  { icon: House, name: 'Residencial' },
  { icon: Store, name: 'Comercial' },
  { icon: Sofa, name: 'Interiores' },
] as const;

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
      aria-label="Exemplo ilustrativo: o mesmo site no computador e no celular. Sua prévia em até 5 minutos."
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
            <span className={v.url}>atelienorte.com.br</span>
            <span className={v.tag}>Exemplo ilustrativo</span>
          </div>
          <div className={v.site}>
            <div className={`${v.nav} ${v.step1}`}>
              <span className={v.logo}>
                <b>A</b> Atelier Norte
              </span>
              <span className={v.links}>
                <span>Projetos</span>
                <span>Estúdio</span>
                <span>Contato</span>
              </span>
            </div>
            <div className={v.heroRow}>
              <div className={`${v.heroText} ${v.step2}`}>
                <span className={v.eyebrow}>Arquitetura e interiores</span>
                <span className={v.title}>Espaços pensados para viver bem.</span>
                <span className={v.btn}>Agendar visita</span>
              </div>
              <img className={`${v.photo} ${v.step2b}`} src={image} alt="" width={480} height={360} />
            </div>
            <div className={v.cards}>
              {services.map(({ icon: Icon, name }, i) => (
                <span key={name} className={v.card} style={{ animationDelay: `${0.95 + i * 0.1}s` }}>
                  <Icon />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={v.phone}>
          <div className={v.screen}>
            <div className={v.pNav}>
              <b>A</b> Atelier Norte
            </div>
            <img className={v.pPhoto} src={image} alt="" width={480} height={360} />
            <span className={v.pTitle}>Espaços pensados para viver bem.</span>
            <span className={v.pBtn}>Agendar visita</span>
            <span className={v.pCard}>
              <House /> Residencial
            </span>
          </div>
        </div>

        <span className={v.badge}>
          <Clock3 /> Sua prévia em até 5 minutos
        </span>
      </div>
    </div>
  );
}
