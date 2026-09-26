'use client';
/* ==========================================================================
   Molduras da prévia: computador (site desenhado numa largura fixa e
   reduzido para caber) e celular (moldura com "notch").
   ========================================================================== */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import s from './Landing.module.css';

const DESKTOP_WIDTH = 1100;

/** Desenha o conteúdo em `width` px e reduz para caber na largura disponível. */
export function DesktopFrame({ children, width = DESKTOP_WIDTH, className }: { children: ReactNode; width?: number; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const next = Math.min(1, o.clientWidth / width);
      setScale(next);
      setHeight(Math.ceil(i.offsetHeight * next));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    fit();
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className={`${s.desktopFrame} ${className ?? ''}`} style={{ height }}>
      <div ref={inner} className={s.desktopCanvas} style={{ width, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={s.phoneFrame}>
      <div className={s.phoneScreen}>{children}</div>
    </div>
  );
}
