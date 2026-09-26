'use client';
/* ==========================================================================
   Estado do projeto: carrega de um link, do navegador ou de versões
   anteriores; salva a cada mudança; registra origem e variantes.
   Versões antigas são convertidas e mantidas no navegador — nada é apagado
   sem o visitante pedir ("Começar novamente").
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from 'react';
import { KEY, LEGACY_KEYS, fromShare, hasOwnChoices, initialProject, newProjectId, normalizeProject, readStored, type Project } from '@/lib/project';
import { captureOrigin, type Origin } from '@/lib/origin';
import { setContext, variantFor } from '@/lib/analytics';
import { clearLogo } from '@/lib/logo';

export type Variants = { hero: string; cta: string; fluxo: string };

/** Há algo que valha retomar: uma etapa avançada, um nome ou escolhas próprias. */
export function canResume(p: Project): boolean {
  return p.step > 0 || p.name.trim().length > 0 || hasOwnChoices(p);
}

/** Grava já, com identificador. Devolve o projeto salvo (ou null se o navegador não deixar). */
function persistNow(project: Project): Project | null {
  const saved = project.id ? project : { ...project, id: newProjectId() };
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
    return saved;
  } catch {
    return null;
  }
}

export function useProject({ readHash = true }: { readHash?: boolean } = {}) {
  const [project, setProject] = useState<Project>(initialProject);
  const [ready, setReady] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [resumable, setResumable] = useState(false);
  const [notice, setNotice] = useState('');
  const [origin, setOrigin] = useState<Origin>({});
  const [variants, setVariants] = useState<Variants>({ hero: 'a', cta: 'a', fluxo: 'a' });
  const saveFailed = useRef(false);

  useEffect(() => {
    const o = captureOrigin();
    const v: Variants = { hero: variantFor('hero', location.search), cta: variantFor('cta', location.search), fluxo: variantFor('fluxo', location.search) };
    setOrigin(o);
    setVariants(v);
    setContext(o, v);

    let loaded: Project | null = null;
    if (readHash) {
      try {
        loaded = fromShare(location.hash);
        if (loaded) setNotice('Opções do link carregadas. Nome e textos não viajam no link.');
      } catch {
        setNotice('Este link não é válido. Suas respostas salvas foram mantidas.');
      }
    }
    if (!loaded) {
      try {
        const stored = readStored((k) => localStorage.getItem(k));
        if (stored) {
          loaded = stored.project;
          if (stored.source !== 'v3') setNotice('Recuperamos a prévia que você montou na versão anterior. Confira as escolhas.');
        }
      } catch {
        setNotice('Não foi possível recuperar o que estava salvo. Você pode continuar normalmente.');
      }
    }
    if (loaded) {
      setProject(loaded);
      setHasProgress(true);
      setResumable(canResume(loaded));
    } else if (o.segment) {
      // Campanha de um segmento: começa pelo exemplo certo, sem contar como escolha.
      setProject((p) => normalizeProject({ ...p, segment: o.segment }));
    }
    setReady(true);

    if (!readHash) return;
    const onHash = () => {
      try {
        const linked = fromShare(location.hash);
        if (linked) {
          setProject(linked);
          setHasProgress(true);
          setNotice('Opções do link carregadas.');
        }
      } catch {
        setNotice('Link inválido. Suas respostas foram preservadas.');
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [readHash]);

  // Salva a cada mudança. O identificador nasce no primeiro salvamento.
  useEffect(() => {
    if (!ready || !hasProgress) return;
    if (!project.id) {
      setProject((p) => (p.id ? p : { ...p, id: newProjectId() }));
      return;
    }
    if (persistNow(project)) saveFailed.current = false;
    else {
      if (!saveFailed.current) setNotice('O navegador não permitiu salvar. Mantenha esta aba aberta ou copie o link.');
      saveFailed.current = true;
    }
  }, [project, ready, hasProgress]);

  const update = useCallback((patch: Partial<Project>) => {
    setProject((old) => normalizeProject({ ...old, ...patch }));
    setHasProgress(true);
  }, []);

  const replace = useCallback((next: Project) => {
    setProject(normalizeProject(next));
    setHasProgress(true);
  }, []);

  /** Aplica e grava na hora — usado antes de ir para outra página. */
  const commit = useCallback((next: Project) => {
    const normalized = normalizeProject(next);
    const saved = persistNow(normalized) ?? normalized;
    setProject(saved);
    setHasProgress(true);
    return saved;
  }, []);

  const reset = useCallback(() => {
    setProject(normalizeProject({ ...initialProject(), segment: origin.segment ?? initialProject().segment }));
    setHasProgress(false);
    setResumable(false);
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEYS.v2);
      localStorage.removeItem(LEGACY_KEYS.v1);
    } catch {
      /* nada salvo para apagar */
    }
    clearLogo();
    if (location.hash) history.replaceState(null, '', `${location.pathname}${location.search}`);
    setNotice('Respostas apagadas. Você pode começar de novo.');
  }, [origin.segment]);

  return { project, ready, hasProgress, resumable, notice, setNotice, origin, variants, update, replace, commit, reset };
}

export type ProjectState = ReturnType<typeof useProject>;

/** Tela estreita. O padrão acompanha o ponto de quebra do configurador (1080px). */
export function useNarrow(query = '(max-width: 1079px)') {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return narrow;
}
