'use client';
/* ==========================================================================
   Pequenos hooks de apresentação compartilhados pela página e pelo
   configurador — mesmos critérios para as duas barras do celular.
   ========================================================================== */
import { useEffect, useState, type RefObject } from 'react';

/** Faixa em que o configurador conta como "na tela" para as barras fixas. */
export const CONFIG_IN_VIEW_MARGIN = '0px 0px -30% 0px';

/** Visitante prefere menos movimento. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Elemento visível na janela (com margem opcional). */
export function useInView(target: RefObject<Element | null> | string, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = typeof target === 'string' ? document.getElementById(target) : target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [target, rootMargin]);
  return inView;
}

/** O elemento já passou para cima da tela (saiu por cima, não por baixo). */
export function useScrolledPast(target: RefObject<Element | null>): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return past;
}

/** Algum campo de texto está em edição — o teclado virtual pode estar aberto. */
export function useTyping(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=color]), textarea, select');
    const onIn = (ev: FocusEvent) => isField(ev.target) && setTyping(true);
    const onOut = (ev: FocusEvent) => isField(ev.target) && setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}
