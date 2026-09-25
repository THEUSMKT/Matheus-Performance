'use client';
/* ==========================================================================
   Estado do projeto: carrega de um link, do navegador ou de versões
   anteriores; salva a cada mudança; registra origem e variantes.
   Versões antigas são convertidas e mantidas no navegador — nada é apagado
   sem o visitante pedir ("Começar novamente").
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from 'react';
import { KEY, LEGACY_KEYS, fromShare, initialProject, newProjectId, normalizeProject, readStored, type Project } from '@/lib/project';
import { captureOrigin, type Origin } from '@/lib/origin';
import { setContext, variantFor } from '@/lib/analytics';

export type Variants = { hero: string; cta: string; fluxo: string };

export function useProject() {
  const [project, setProject] = useState<Project>(initialProject);
  const [ready, setReady] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
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
    try {
      loaded = fromShare(location.hash);
      if (loaded) setNotice('Opções do link carregadas. Nome, contato e textos não viajam no link — preencha se quiser.');
    } catch {
      setNotice('Este link não é válido ou é de uma versão que não reconhecemos. Suas escolhas salvas foram mantidas.');
    }
    if (!loaded) {
      try {
        const stored = readStored((k) => localStorage.getItem(k));
        if (stored) {
          loaded = stored.project;
          setNotice(
            stored.source === 'v3'
              ? 'Seu projeto foi recuperado neste navegador.'
              : 'Recuperamos o projeto que você montou na versão anterior do configurador. Revise as escolhas antes de continuar.',
          );
        }
      } catch {
        setNotice('Não foi possível recuperar o progresso salvo. Você pode continuar normalmente.');
      }
    }
    if (loaded) {
      setProject(loaded);
      setHasProgress(true);
    } else if (o.segment) {
      // Campanha de um segmento: começa pelo exemplo certo, sem contar como escolha.
      setProject((p) => normalizeProject({ ...p, segment: o.segment }));
    }
    setReady(true);

    const onHash = () => {
      try {
        const linked = fromShare(location.hash);
        if (linked) {
          setProject(linked);
          setHasProgress(true);
          setNotice('Opções do link carregadas.');
        }
      } catch {
        setNotice('Link inválido. Suas escolhas atuais foram preservadas.');
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Salva a cada mudança. O identificador nasce no primeiro salvamento.
  useEffect(() => {
    if (!ready || !hasProgress) return;
    if (!project.id) {
      setProject((p) => (p.id ? p : { ...p, id: newProjectId() }));
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(project));
      saveFailed.current = false;
    } catch {
      if (!saveFailed.current) setNotice('O navegador não permitiu salvar. Mantenha esta aba aberta ou copie o link das opções.');
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

  const reset = useCallback(() => {
    setProject(normalizeProject({ ...initialProject(), segment: origin.segment ?? initialProject().segment }));
    setHasProgress(false);
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEYS.v2);
      localStorage.removeItem(LEGACY_KEYS.v1);
    } catch {
      /* nada salvo para apagar */
    }
    if (location.hash.startsWith('#projeto=')) history.replaceState(null, '', `${location.pathname}${location.search}#configurador`);
    setNotice('Projeto reiniciado. As escolhas salvas neste navegador foram apagadas.');
  }, [origin.segment]);

  return { project, ready, hasProgress, notice, setNotice, origin, variants, update, replace, reset, markStarted: () => setHasProgress(true) };
}

export type ProjectState = ReturnType<typeof useProject>;
