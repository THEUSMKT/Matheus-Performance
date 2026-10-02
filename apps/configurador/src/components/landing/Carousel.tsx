'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import c from './Carousel.module.css';

type Props = {
  children: ReactNode[];
  label: string;
  className?: string;
};

export function Carousel({ children, label, className }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = children.length;
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement | undefined;
    if (!card) return;
    const offset = card.offsetLeft - (track.offsetWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: offset, behavior: 'smooth' });
  }, []);

  const updateActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const child = track.children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    setActive(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateActive, { passive: true });
    return () => track.removeEventListener('scroll', updateActive);
  }, [updateActive]);

  const prev = () => scrollTo(Math.max(0, active - 1));
  const next = () => scrollTo(Math.min(count - 1, active + 1));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    dragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.style.scrollSnapType = 'none';
    track.style.cursor = 'grabbing';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    trackRef.current.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current || !trackRef.current) return;
    dragging.current = false;
    trackRef.current.releasePointerCapture(e.pointerId);
    trackRef.current.style.scrollSnapType = '';
    trackRef.current.style.cursor = '';
    const movedCard = trackRef.current.children[active] as HTMLElement | undefined;
    if (movedCard) {
      const offset = movedCard.offsetLeft - (trackRef.current.offsetWidth - movedCard.offsetWidth) / 2;
      trackRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
    updateActive();
  };

  return (
    <div
      className={`${c.carousel} ${className ?? ''}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <ul
        ref={trackRef}
        className={c.track}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children.map((child, i) => (
          <li
            key={i}
            className={c.slide}
            data-active={i === active ? '' : undefined}
            aria-hidden={i !== active}
          >
            {child}
          </li>
        ))}
      </ul>
      <button type="button" className={`${c.arrow} ${c.arrowPrev}`} onClick={prev} disabled={active === 0} aria-label="Anterior">
        <ChevronLeft aria-hidden="true" />
      </button>
      <button type="button" className={`${c.arrow} ${c.arrowNext}`} onClick={next} disabled={active === count - 1} aria-label="Próximo">
        <ChevronRight aria-hidden="true" />
      </button>
      <div className={c.dots} role="tablist" aria-label="Posição no carrossel">
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            className={c.dot}
            role="tab"
            aria-selected={i === active}
            aria-label={`Item ${i + 1} de ${count}`}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
