'use client';
/* ==========================================================================
   Molduras da demonstração: computador (site desenhado em 1100px e reduzido
   para caber) e celular (moldura com "notch").
   ========================================================================== */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import s from './Landing.module.css';

const DESKTOP_WIDTH = 1100;

export function DesktopFrame({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const next = Math.min(1, o.clientWidth / DESKTOP_WIDTH);
      setScale(next);
      setHeight(Math.ceil(i.offsetHeight * next));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className={s.desktopFrame} style={{ height }}>
      <div ref={inner} className={s.desktopCanvas} style={{ width: DESKTOP_WIDTH, transform: `scale(${scale})` }}>
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
