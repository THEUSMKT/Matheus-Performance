/* ==========================================================================
   Guarda o progresso do configurador no navegador.
   Se a pessoa recarregar a página, as escolhas continuam lá.
   ========================================================================== */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { emptySelection, type Selection } from './types';

const KEY = 'mb.configurador.v1';

type Stored = { selection: Selection; step: number };

function read(): Stored | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (!parsed.selection) return null;
    const selection = { ...emptySelection, ...parsed.selection };
    // 'formulario' foi dividido em duas opções. A antiga é descartada em vez
    // de convertida: escolher entre WhatsApp e e-mail é decisão de quem está
    // montando o site, não nossa. O resto das escolhas fica intacto.
    selection.features = selection.features.filter((f) => f !== 'formulario');
    return {
      selection,
      step: typeof parsed.step === 'number' ? parsed.step : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Estado persistido. Começa vazio no servidor e no primeiro render do
 * cliente — só depois recupera o que estava salvo, para não quebrar a
 * hidratação do HTML estático.
 */
export function usePersistedConfig() {
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [step, setStep] = useState(0);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = read();
    if (saved && countFilled(saved.selection) > 0) {
      setSelection(saved.selection);
      setStep(saved.step);
      setRestored(true);
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ selection, step }));
    } catch {
      /* navegação privada ou armazenamento cheio: seguimos sem salvar */
    }
  }, [selection, step]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignora */
    }
    setSelection(emptySelection);
    setStep(0);
    setRestored(false);
  }, []);

  return { selection, setSelection, step, setStep, reset, restored, dismissRestored: () => setRestored(false) };
}

function countFilled(selection: Selection): number {
  return [
    selection.type,
    selection.template,
    selection.style,
    selection.color ?? selection.customColor,
    selection.font,
    selection.features.length ? 'x' : null,
  ].filter(Boolean).length;
}

/* ── ponte entre a vitrine de projetos e o configurador ──────────────────── */
const PRESET_EVENT = 'mb:preset';

/** A vitrine pede ao configurador para adotar uma combinação pronta. */
export function applyPreset(patch: Partial<Selection>) {
  window.dispatchEvent(new CustomEvent<Partial<Selection>>(PRESET_EVENT, { detail: patch }));
}

export function usePresetListener(handler: (patch: Partial<Selection>) => void) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const onPreset = (event: Event) => {
      ref.current((event as CustomEvent<Partial<Selection>>).detail);
    };
    window.addEventListener(PRESET_EVENT, onPreset);
    return () => window.removeEventListener(PRESET_EVENT, onPreset);
  }, []);
}
