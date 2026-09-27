'use client';
/* ==========================================================================
   Estado do projeto: carrega de um link, do navegador ou de versões
   anteriores; salva a cada mudança; registra origem e variantes.
   Versões antigas são convertidas e mantidas no navegador — nada é apagado
   sem o visitante pedir ("Começar novamente").
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KEY,
  LEGACY_KEYS,
  dropStaleCopy,
  editableTexts,
  fromShare,
  hasOwnChoices,
  initialProject,
  newProjectId,
  normalizeProject,
  readStored,
  type EditableText,
  type Project,
} from '@/lib/project';
import { captureOrigin, type Origin } from '@/lib/origin';
import { setContext, variantFor } from '@/lib/analytics';
import { clearLogo } from '@/lib/logo';

export type Variants = { hero: string; cta: string; fluxo: string };

/**
 * Versão anterior guardada antes de uma substituição inteira (usar um
 * modelo, abrir um arquivo de projeto). Fica no mesmo navegador, como o
 * projeto, e sai com "Começar novamente".
 */
export const BACKUP_KEY = 'mb.configurador.anterior';
export type BackupReason = 'modelo' | 'arquivo';
export type Backup = { reason: BackupReason; project: Project };

function readBackup(): Backup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.reason !== 'modelo' && data?.reason !== 'arquivo') return null;
    return { reason: data.reason, project: normalizeProject(data.project) };
  } catch {
    return null;
  }
}

/** Campos de texto que mudaram entre duas versões (para marcar edição manual). */
function editedFields(old: Project, next: Project): EditableText[] {
  return editableTexts.filter((f) => {
    const a = f in old.previewCopy ? old.previewCopy[f as keyof Project['previewCopy']] : old[f as 'headline' | 'description' | 'services'];
    const b = f in next.previewCopy ? next.previewCopy[f as keyof Project['previewCopy']] : next[f as 'headline' | 'description' | 'services'];
    return JSON.stringify(a) !== JSON.stringify(b);
  });
}

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
  /** Só verdadeiro depois que o navegador confirmou a gravação. */
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [origin, setOrigin] = useState<Origin>({});
  const [variants, setVariants] = useState<Variants>({ hero: 'a', cta: 'a', fluxo: 'a' });
  const saveFailed = useRef(false);
  const [backup, setBackup] = useState<Backup | null>(null);

  useEffect(() => {
    const o = captureOrigin();
    const v: Variants = { hero: variantFor('hero', location.search), cta: variantFor('cta', location.search), fluxo: variantFor('fluxo', location.search) };
    setOrigin(o);
    setVariants(v);
    setContext(o, v);
    setBackup(readBackup());

    let loaded: Project | null = null;
    if (readHash) {
      try {
        loaded = fromShare(location.hash);
        if (loaded) setNotice('Opções de layout carregadas do link. Nome, textos e logo não viajam no link.');
      } catch {
        setNotice('Este link não é válido. Suas respostas salvas foram mantidas.');
      }
    }
    if (!loaded) {
      try {
        const stored = readStored((k) => localStorage.getItem(k));
        if (stored) {
          loaded = stored.project;
          if (stored.source !== 'v4') setNotice('Recuperamos a prévia que você montou na versão anterior. Confira as escolhas e o pacote.');
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
          setNotice('Opções de layout carregadas do link.');
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
    if (persistNow(project)) {
      saveFailed.current = false;
      setSaved(true);
    } else {
      if (!saveFailed.current) setNotice('O navegador não permitiu salvar. Mantenha esta aba aberta até enviar o pedido.');
      saveFailed.current = true;
      setSaved(false);
    }
  }, [project, ready, hasProgress]);

  const update = useCallback((patch: Partial<Project>) => {
    // Edição feita pela pessoa: textos da IA que ficaram desatualizados saem,
    // e os textos que ela mexeu ficam marcados como seus.
    setProject((old) => {
      const next = dropStaleCopy(old, normalizeProject({ ...old, ...patch }));
      const touched = 'edited' in patch ? [] : editedFields(old, normalizeProject({ ...old, ...patch }));
      return touched.length ? { ...next, edited: [...new Set([...next.edited, ...touched])] } : next;
    });
    setHasProgress(true);
  }, []);

  const replace = useCallback((next: Project) => {
    setProject(normalizeProject(next));
    setHasProgress(true);
  }, []);

  /** Aplica e grava na hora — usado antes de ir para outra página. */
  const commit = useCallback((next: Project) => {
    const normalized = normalizeProject(next);
    const stored = persistNow(normalized);
    setProject(stored ?? normalized);
    setSaved(Boolean(stored));
    setHasProgress(true);
    return stored ?? normalized;
  }, []);

  /**
   * Troca o projeto inteiro (modelo, arquivo), guardando o atual para
   * "Recuperar minha versão anterior". Grava na hora.
   */
  const replaceKeeping = useCallback(
    (next: Project, reason: BackupReason) => {
      if (hasProgress) {
        const kept: Backup = { reason, project };
        try {
          localStorage.setItem(BACKUP_KEY, JSON.stringify(kept));
        } catch {
          /* sem armazenamento: a versão anterior fica só nesta aba */
        }
        setBackup(kept);
      }
      return commit(next);
    },
    [commit, hasProgress, project],
  );

  const dropBackup = useCallback(() => {
    setBackup(null);
    try {
      localStorage.removeItem(BACKUP_KEY);
    } catch {
      /* nada salvo */
    }
  }, []);

  /** Volta à versão guardada; a atual deixa de existir. */
  const restoreBackup = useCallback(() => {
    if (!backup) return;
    commit(backup.project);
    dropBackup();
  }, [backup, commit, dropBackup]);

  const reset = useCallback(() => {
    setProject(normalizeProject({ ...initialProject(), segment: origin.segment ?? initialProject().segment }));
    setHasProgress(false);
    setResumable(false);
    setSaved(false);
    try {
      localStorage.removeItem(KEY);
      for (const key of Object.values(LEGACY_KEYS)) localStorage.removeItem(key);
      localStorage.removeItem(BACKUP_KEY);
    } catch {
      /* nada salvo para apagar */
    }
    clearLogo();
    setBackup(null);
    if (location.hash) history.replaceState(null, '', `${location.pathname}${location.search}`);
    setNotice('Respostas apagadas. Você pode começar de novo.');
  }, [origin.segment]);

  return { project, ready, hasProgress, resumable, saved, notice, setNotice, origin, variants, update, replace, commit, reset, backup, replaceKeeping, restoreBackup, dropBackup };
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
