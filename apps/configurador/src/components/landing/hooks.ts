'use client';
/* ==========================================================================
   Pequenos hooks de apresentação compartilhados pela página e pelo
   configurador — mesmos critérios para as duas barras do celular.
   ========================================================================== */
import { useEffect, useState, type RefObject } from 'react';

/** Visitante prefere menos movimento. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    let timer: number | undefined;
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=color]), textarea, select');
    const onIn = (ev: FocusEvent) => {
      if (!isField(ev.target)) return;
      window.clearTimeout(timer);
      setTyping(true);
    };
    // Espera um instante: o toque que tirou o foco do campo termina antes de a
    // barra voltar para baixo do dedo.
    const onOut = (ev: FocusEvent) => {
      if (!isField(ev.target)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTyping(isField(document.activeElement)), 300);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}
