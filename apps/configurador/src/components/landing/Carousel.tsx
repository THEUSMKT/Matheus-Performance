'use client';
/* ==========================================================================
   Carrossel horizontal com rolagem nativa (scroll-snap), sem biblioteca.
   Bolinhas marcam o card atual; setas no computador; um "empurrãozinho"
   na primeira vez que aparece (desligado com movimento reduzido).
   `untilDesktop`: a partir de 1080px vira grade (usado nas opções).
   ========================================================================== */
import { Children, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { prefersReducedMotion } from './hooks';
import s from './Landing.module.css';

export type CarouselApi = { goTo: (index: number, smooth?: boolean) => void };

type Props = {
  id: string;
  label: string;
  /** Rótulo de cada item, ex.: "Exemplo 2 de 6". */
  itemLabel: (index: number, total: number) => string;
  start?: number;
  untilDesktop?: boolean;
  slideClassName?: string;
  hint?: string;
  apiRef?: Ref<CarouselApi>;
  children: ReactNode;
};

const NUDGE_KEY = 'bp.carrossel.dica.v1';

export function Carousel({ id, label, itemLabel, start = 0, untilDesktop = false, slideClassName = '', hint = 'Arraste para o lado →', apiRef, children }: Props) {
  const items = Children.toArray(children);
  const total = items.length;
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(start);
  const [touched, setTouched] = useState(false);
  const [overflowing, setOverflowing] = useState(true);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [nudging, setNudging] = useState(false);
  /** Card escolhido por código (bolinha, seta, campanha): vale enquanto estiver à vista. */
  const target = useRef<number | null>(null);

  const goTo = useCallback((index: number, smooth = true) => {
    const t = track.current;
    const slide = slides.current[index];
    if (!t || !slide) return;
    target.current = index;
    t.scrollTo({ left: slide.offsetLeft + slide.offsetWidth / 2 - t.clientWidth / 2, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
    setCurrent(index);
  }, []);
  useImperativeHandle(apiRef, () => ({ goTo }), [goTo]);

  // Setas: avançam um card de cada vez, mesmo com vários cards à vista.
  const step = (dir: 1 | -1) => {
    const t = track.current;
    const first = slides.current[0];
    const second = slides.current[1];
    if (!t || !first) return;
    target.current = null;
    const width = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    t.scrollBy({ left: dir * width, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // Card atual = o mais próximo do centro (nas pontas, o primeiro/último).
  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setOverflowing(t.scrollWidth - t.clientWidth > 4);
    setEdges({ start: t.scrollLeft <= 2, end: t.scrollLeft >= t.scrollWidth - t.clientWidth - 2 });
    const fullyVisible = (el: HTMLDivElement | null) =>
      !!el && el.offsetLeft >= t.scrollLeft - 1 && el.offsetLeft + el.offsetWidth <= t.scrollLeft + t.clientWidth + 1;
    if (target.current !== null && fullyVisible(slides.current[target.current])) return setCurrent(target.current);
    const max = t.scrollWidth - t.clientWidth;
    if (t.scrollLeft <= 2) return setCurrent(0);
    if (t.scrollLeft >= max - 2) return setCurrent(total - 1);
    const center = t.scrollLeft + t.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setCurrent(best);
  }, [total]);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const io = new IntersectionObserver(measure, { root: t, threshold: [0, 0.5, 0.9, 1] });
    slides.current.forEach((el) => el && io.observe(el));
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 80);
    };
    const onUser = () => {
      target.current = null;
      setTouched(true);
    };
    t.addEventListener('scroll', onScroll, { passive: true });
    t.addEventListener('pointerdown', onUser);
    t.addEventListener('wheel', onUser, { passive: true });
    t.addEventListener('keydown', onUser);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      io.disconnect();
      clearTimeout(timer);
      t.removeEventListener('scroll', onScroll);
      t.removeEventListener('pointerdown', onUser);
      t.removeEventListener('wheel', onUser);
      t.removeEventListener('keydown', onUser);
      window.removeEventListener('resize', measure);
    };
  }, [measure, total]);

  // Ponto de partida (ex.: segmento da campanha), enquanto o visitante não mexeu.
  useEffect(() => {
    if (touched) return;
    const raf = requestAnimationFrame(() => goTo(Math.min(Math.max(start, 0), total - 1), false));
    return () => cancelAnimationFrame(raf);
  }, [start, total, touched, goTo]);

  // Empurrãozinho: só na primeira vez que o carrossel aparece na tela.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let seen: string[] = [];
    try {
      seen = JSON.parse(sessionStorage.getItem(NUDGE_KEY) || '[]');
    } catch {
      /* sem sessionStorage: mostra uma vez por carregamento */
    }
    if (seen.includes(id)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        try {
          sessionStorage.setItem(NUDGE_KEY, JSON.stringify([...seen, id]));
        } catch {
          /* ignora */
        }
        const t = track.current;
        if (prefersReducedMotion() || !t || t.scrollWidth - t.clientWidth <= 4) return;
        setNudging(true);
        setTimeout(() => setNudging(false), 1300);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id]);

  return (
    <div ref={root} className={`${s.carousel} ${untilDesktop ? s.carouselUntilDesktop : ''}`}>
      <div
        ref={track}
        id={id}
        className={`${s.track} ${nudging ? s.nudging : ''}`}
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
      >
        {items.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              slides.current[i] = el;
            }}
            className={`${s.slide} ${slideClassName}`}
            role="group"
            aria-roledescription="slide"
            aria-label={itemLabel(i, total)}
          >
            {child}
          </div>
        ))}
      </div>
      {overflowing && (
        <div className={s.carouselFoot}>
          <button type="button" className={s.arrow} onClick={() => step(-1)} disabled={edges.start} aria-label="Anterior" aria-controls={id}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className={s.dots}>
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para ${itemLabel(i, total).toLowerCase()}`}
                aria-current={i === current ? 'true' : undefined}
                aria-controls={id}
                onClick={() => {
                  setTouched(true);
                  goTo(i);
                }}
              />
            ))}
          </div>
          <button type="button" className={s.arrow} onClick={() => step(1)} disabled={edges.end} aria-label="Próximo" aria-controls={id}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
      {overflowing && !touched && (
        <p className={s.dragHint} aria-hidden="true">
          {hint}
        </p>
      )}
    </div>
  );
}
