'use client';
/* ==========================================================================
   Página de criação da prévia (/criar/). Caminho contínuo:
   A. Conte sobre seu negócio (gravando ou digitando; ou passo a passo)
   B/C. Revise o texto e gere a prévia
   D. Sua prévia está pronta (no celular, a prévia abre sozinha)
   E. Personalize — uma escolha por vez: pacote, estilo, cores, títulos,
      conteúdo, seções — com a prévia ao vivo
   F. Revise e solicite o desenvolvimento
   O pacote e o preço ficam sempre à vista ("Profissional · R$ 750 ·
   Alterar pacote"); mudanças que pedem outro pacote só são aplicadas
   depois que a pessoa escolhe, e trocas de pacote, restaurações e novas
   gerações podem ser desfeitas. Tudo fica salvo neste dispositivo. No
   celular, "Personalizar" e "Ver meu site" alternam, e a
   volta cai exatamente na escolha (e na rolagem) em que a pessoa estava.
   ========================================================================== */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronLeft, Eye, LoaderCircle, Maximize2, MessageCircle, Monitor, Pencil, Smartphone, X } from 'lucide-react';
import { brl, customNeeds, packageById, packageOrder, rank, type PackageId } from '@/config/packages';
import { aiEnabled, integrations } from '@/config/integrations';
import {
  CHOICE_STEPS,
  STEP,
  STEP_COUNT,
  checkChange,
  currentPackage,
  featurePackage,
  helpMessage,
  packageOffer,
  phaseOf,
  phases,
  requestMessage,
  restoreParked,
  sectionName,
  stepQuestions,
  steps,
  switchPackage,
  type Project,
} from '@/lib/project';
import { DESCRIPTION_MIN, aiReasonText, applySuggestion, requestSuggestion, withDetails, type Suggestion } from '@/lib/aiPreview';
import { track } from '@/lib/analytics';
import { originTag } from '@/lib/origin';
import { clearLogo, readLogo, saveLogo } from '@/lib/logo';
import { whatsappLink } from '@/lib/whatsapp';
import { Brand, asset } from '../landing/Chrome';
import { ConfirmBox, type Pending } from '../landing/Controls';
import { DesktopFrame, PhoneFrame } from '../landing/DemoFrames';
import { useTyping } from '../landing/hooks';
import { canResume, useNarrow, useProject } from '../landing/useProject';
import { SitePreview } from '../preview/SitePreview';
import { PackageDialog, PriceBar, StepPackage } from './Packages';
import { PrintSummary, RequestButton, StepSite } from './Site';
import { StepBusiness, StepObjective, type StepErrors } from './Steps';
import { StepColors, StepContent, StepFonts, StepReady, StepSections, StepStyle } from './Choices';
import { DRAFT_KEY, Describe, type DescribePhase } from './Describe';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type RegenField = 'about' | 'differentials' | 'processSteps' | 'faqQuestions';

/** O que conta como "a escolha" de cada etapa, para saber se a pessoa mudou algo. */
const choiceValue = (p: Project, step: number) =>
  step === STEP.estilo ? p.direction : step === STEP.cores ? `${p.palette}${p.custom ?? ''}` : step === STEP.titulos ? p.font : '';

/** Para onde leva cada fase concluída no topo. */
const phaseTarget = [STEP.negocio, STEP.pronta, STEP.pacote, STEP.revisao];

const hints: Partial<Record<number, string>> = {
  [STEP.objetivo]: 'Isso define o botão principal e a ordem das seções.',
};

export default function Builder() {
  const state = useProject();
  const { project: p, update, replace, reset, ready, saved, notice, setNotice, hasProgress, origin, backup, restoreBackup, dropBackup } = state;
  const narrow = useNarrow();
  const typing = useTyping();
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [deviceChoice, setDevice] = useState<'mobile' | 'desktop' | null>(null);
  const device = deviceChoice ?? (narrow ? 'mobile' : 'desktop');
  const [errors, setErrors] = useState<StepErrors>({});
  const [resetting, setResetting] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [logo, setLogoState] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [included, setIncluded] = useState(false);
  const [full, setFull] = useState(false);
  /** Caminho sem descrição (com a IA ligada): nome, segmento e serviço. */
  const [manual, setManual] = useState(false);
  const [describePhase, setDescribePhase] = useState<DescribePhase>('escolher');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  /** Prévia gerada que chegou depois de a pessoa sair da etapa. */
  const [late, setLate] = useState<Suggestion | null>(null);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [updated, setUpdated] = useState(false);
  /** Última mudança ampla (pacote, restauração, nova geração), para desfazer. */
  const [undo, setUndo] = useState<{ label: string; project: Project } | null>(null);
  /** Nova geração que manteve textos editados à mão: permite usar os novos. */
  const [keptEdits, setKeptEdits] = useState<{ base: Project; sug: Suggestion } | null>(null);
  /** A descrição parece de outro segmento que o escolhido à mão: a pessoa decide. */
  const [segConflict, setSegConflict] = useState<{ suggested: string; other: string } | null>(null);
  /** Lista de etapas do celular: fecha ao trocar de etapa. */
  const stepMenu = useRef<HTMLDetailsElement>(null);
  /** Seção sendo gerada de novo (só ela muda) e o erro, se houver. */
  const [regen, setRegen] = useState<{ field: RegenField | null; error: string }>({ field: null, error: '' });
  /** Valor da escolha ao entrar na etapa: sem mudança, o botão diz "Manter sugestão". */
  const entry = useRef<{ step: number; value: string }>({ step: -1, value: '' });
  const heading = useRef<HTMLHeadingElement>(null);
  const readyHeading = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLDialogElement>(null);
  const focusAfter = useRef<'heading' | 'ready' | null>(null);
  const editScroll = useRef(0);
  const restoreScroll = useRef<number | null>(null);
  const pNow = useRef(p);
  pNow.current = p;
  const prevP = useRef(p);
  const updatedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setLogoState(readLogo());
    track('configurator_start');
    // "Começar uma nova prévia" na apresentação chega aqui com #novo: confirma antes de apagar.
    if (location.hash === '#novo') {
      history.replaceState(null, '', `${location.pathname}${location.search}`);
      setResetting(true);
    }
  }, []);

  // Botão de um pacote na apresentação (?pacote=profissional): começa nele. Com
  // uma prévia em andamento, pergunta antes — nada é apagado nem trocado sozinho.
  const pkgParam = useRef(false);
  useEffect(() => {
    if (!ready || pkgParam.current) return;
    pkgParam.current = true;
    const params = new URLSearchParams(location.search);
    const want = packageOrder.find((id) => id === params.get('pacote'));
    if (!params.has('pacote')) return;
    params.delete('pacote');
    history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
    if (!want || want === p.pkg) {
      if (want) replace({ ...p, pkgChosen: true });
      return;
    }
    const target = packageById(want);
    if (!hasProgress || !canResume(p)) {
      replace({ ...switchPackage(p, want).project, step: p.step });
      track('package_selected', { package: want, source: 'apresentacao' });
      setNotice(`Sua prévia começa no ${target.name} — ${brl(target.price)}. Nada é contratado agora; você pode mudar depois.`);
      return;
    }
    const current = currentPackage(p);
    setPending({
      title: `Você já tem uma prévia no ${current.name}. Aplicar o ${target.name} (${brl(target.price)}) a ela?`,
      detail: 'Nada do que você fez é apagado. Se o pacote for menor, o que não couber fica guardado no rascunho e dá para desfazer.',
      confirmLabel: `Aplicar o ${target.name}`,
      cancelLabel: `Continuar no ${current.name}`,
      apply: () => applyPackage(want, switchPackage(pNow.current, want).project, 'apresentacao'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Ao trocar de etapa: topo da página e foco no título (teclado e leitor de tela).
  useEffect(() => {
    if (stepMenu.current) stepMenu.current.open = false;
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    window.scrollTo({ top: 0, behavior: 'instant' });
    (target === 'ready' ? readyHeading.current : heading.current)?.focus({ preventScroll: true });
  }, [p.step, view]);

  // "Prévia atualizada": retorno discreto no celular quando uma escolha muda o site.
  useEffect(() => {
    const before = prevP.current;
    prevP.current = p;
    // Ganhar o identificador ao salvar pela primeira vez não é mudança no site.
    if (!narrow || view !== 'edit' || before === p || before.id !== p.id || before.step !== p.step || !CHOICE_STEPS.includes(p.step)) return;
    setUpdated(true);
    window.clearTimeout(updatedTimer.current);
    updatedTimer.current = window.setTimeout(() => setUpdated(false), 1400);
  }, [p, narrow, view]);
  useEffect(() => () => window.clearTimeout(updatedTimer.current), []);

  useEffect(() => {
    const d = fullRef.current;
    if (!d) return;
    if (full && !d.open) d.showModal();
    if (!full && d.open) d.close();
  }, [full]);

  function edit(patch: Partial<Project>) {
    if (('name' in patch || 'segmentOther' in patch) && (errors.name || errors.segment)) setErrors({});
    update(patch);
  }

  function setLogo(dataUrl: string | null) {
    if (!dataUrl) {
      clearLogo();
      setLogoState(null);
      return;
    }
    setLogoState(dataUrl);
    if (!saveLogo(dataUrl)) setNotice('A logo aparece na prévia, mas o navegador não conseguiu guardá-la: ela some se a página for recarregada. Você pode continuar normalmente.');
  }

  /** Passo a passo: nome e segmento antes de sair do negócio. */
  function businessErrors(): StepErrors {
    const found: StepErrors = {};
    if (p.name.trim().length < 2) found.name = 'Informe o nome da empresa.';
    if (!p.segment) found.segment = 'Escolha o segmento da empresa.';
    else if (p.segment === 'outro' && p.segmentOther.trim().length < 2) found.segment = 'Conte qual é o segmento.';
    return found;
  }

  function go(target: number, { validate = true } = {}) {
    const to = Math.max(0, Math.min(STEP_COUNT - 1, target));
    if (validate && to > p.step && p.step === STEP.negocio) {
      const found = businessErrors();
      if (found.name || found.segment) {
        setErrors(found);
        setManual(true);
        setView('edit');
        requestAnimationFrame(() => {
          if (found.name) nameRef.current?.focus();
          else document.querySelector<HTMLElement>(p.segment === 'outro' ? '#segmento-outro' : '[role=radiogroup] [role=radio]')?.focus();
        });
        return;
      }
    }
    if (to > p.step) for (let i = p.step; i < to; i++) track('step_complete', { step: i + 1 });
    if (p.step === STEP.pacote && to > p.step) track('package_selected', { package: p.pkg, source: 'etapa' });
    if (to === STEP.pronta || to === STEP.revisao) track('preview_view', { source: 'etapa', step: to + 1 });
    setErrors({});
    setPending(null);
    setNotice('');
    setUpdated(false);
    setUndo(null);
    // A prévia pronta abre direto no celular; nas escolhas, a pessoa decide quando ver.
    const ready = narrow && to === STEP.pronta;
    setView(ready ? 'preview' : 'edit');
    focusAfter.current = ready ? 'ready' : 'heading';
    // Avançar da etapa do pacote confirma a escolha (deixa de ser "pacote inicial").
    replace({ ...p, step: to, ...(p.step === STEP.pacote && to > p.step ? { pkgChosen: true } : {}) });
  }

  const back = () => {
    if (p.step === STEP.pronta || p.step === STEP.pacote) return go(p.step === STEP.pacote ? STEP.pronta : backFromReady());
    go(p.step - 1);
  };
  /** "Editar minha descrição" volta ao começo; no passo a passo, ao objetivo. */
  const backFromReady = () => (aiEnabled && !manual ? STEP.negocio : STEP.objetivo);

  /** Troca de pacote escolhida pelo visitante. */
  function applyPackage(to: PackageId, next: Project, source: string) {
    const from = p.pkg;
    replace({ ...next, step: p.step, pkgChosen: true });
    track('package_selected', { package: to, source });
    if (from !== to) track('package_changed', { from, to, source });
    setNotice('');
    if (from !== to) setUndo({ label: `Pacote ${packageById(to).name} escolhido — ${brl(packageById(to).price)} no total.`, project: p });
  }

  /** Traz de volta o que ficou guardado numa troca para um pacote menor. */
  function restore() {
    const r = restoreParked(p);
    if (!r.restored.length) return;
    replace({ ...r.project, step: p.step });
    setUndo({ label: `Restaurado: ${r.restored.join(', ')}.`, project: p });
  }

  /** Mudança ampla feita pela pessoa (textos de volta à sugestão): pode ser desfeita. */
  function broadEdit(label: string, patch: Partial<Project>) {
    setUndo({ label, project: p });
    update(patch);
  }

  /**
   * Nova sugestão da IA só para uma seção: usa a mesma descrição (guardada
   * nesta aba) e troca só aquele texto. As outras seções ficam intactas, e
   * a versão anterior fica no "Desfazer".
   */
  async function regenerateSection(field: RegenField, label: string) {
    if (regen.field) return;
    let draft = '';
    try {
      draft = sessionStorage.getItem(DRAFT_KEY) ?? '';
    } catch {
      /* sem a descrição, não há como pedir */
    }
    if (draft.trim().length < DESCRIPTION_MIN) return setRegen({ field: null, error: 'Para gerar outra sugestão, descreva o negócio de novo em “Editar minha descrição”.' });
    setRegen({ field, error: '' });
    const before = pNow.current;
    const result = await requestSuggestion(withDetails(draft, before.details), before.pkg, integrations.aiEndpoint);
    track('ai_generate', { result: result.ok ? 'ok' : 'erro', reason: result.ok ? 'secao' : result.reason });
    if (!result.ok) return setRegen({ field: null, error: aiReasonText[result.reason] });
    const text = result.suggestion.previewCopy[field];
    if (!text || (Array.isArray(text) && !text.length)) return setRegen({ field: null, error: 'A sugestão veio vazia. Tente de novo.' });
    const now = pNow.current;
    // Editou esta seção enquanto a sugestão era gerada: a edição mais recente vale.
    if (JSON.stringify(now.previewCopy[field]) !== JSON.stringify(before.previewCopy[field]))
      return setRegen({ field: null, error: 'Você mudou este texto enquanto a sugestão era gerada. Mantivemos o seu texto.' });
    setUndo({ label: `Nova sugestão para “${label}”.`, project: now });
    replace({ ...now, previewCopy: { ...now.previewCopy, [field]: text }, edited: now.edited.filter((f) => f !== field) });
    setRegen({ field: null, error: '' });
  }

  function undoLast() {
    if (!undo) return;
    replace({ ...undo.project, step: p.step });
    setUndo(null);
    setKeptEdits(null);
    setNotice('Alteração desfeita.');
  }

  /** Mudança de escopo: aplica se couber no pacote atual; senão, pergunta antes. */
  function scope(patch: Partial<Project>, anchor: string) {
    const r = checkChange(p, patch);
    if (r.kind === 'ok') {
      setPending(null);
      replace(r.project);
      return;
    }
    if (r.kind === 'custom') {
      setPending({
        anchor,
        title: `Os pacotes comportam até ${packageById('completo').maxSections} seções.`,
        detail: 'Desmarque uma seção para incluir outra, ou peça um projeto personalizado. Sua prévia continua salva.',
        confirmLabel: 'Preciso de um projeto personalizado',
        cancelLabel: 'Voltar',
        apply: openCustom,
      });
      return;
    }
    const target = packageById(r.to);
    const pkg = currentPackage(p);
    // Limite atingido (e não um recurso de outro pacote): explica o limite.
    if (r.project.sections.length > pkg.maxSections && rank(featurePackage(r.project)) <= rank(p.pkg)) {
      setPending({
        anchor,
        title: `Você já selecionou ${p.sections.length} de ${pkg.maxSections} seções do ${pkg.name}.`,
        detail: `Desmarque uma seção para incluir outra, ou mude para o ${target.name} (${brl(target.price)} no total), que comporta até ${target.maxSections}.`,
        confirmLabel: `Mudar para o ${target.name}`,
        cancelLabel: `Manter o ${pkg.name}`,
        apply: () => applyPackage(r.to, r.project, anchor),
      });
      return;
    }
    setPending({
      anchor,
      title: packageOffer(r.to),
      detail: `O ${target.name} inclui ${target.includes.slice(1).join('; ').toLowerCase()}.`,
      confirmLabel: `Mudar para o ${target.name}`,
      cancelLabel: `Continuar no ${currentPackage(p).name}`,
      apply: () => applyPackage(r.to, r.project, anchor),
    });
  }

  /** Sugestão de pacote maior: mostra o que muda e só aplica com a escolha. */
  function offerUpgrade(to: PackageId, source: string) {
    const target = packageById(to);
    setPending({
      anchor: source,
      title: packageOffer(to),
      detail: `O ${target.name} inclui ${target.includes.slice(1).join('; ').toLowerCase()}. Nada muda na sua prévia até você escolher.`,
      confirmLabel: `Mudar para o ${target.name}`,
      cancelLabel: `Continuar no ${currentPackage(p).name}`,
      apply: () => applyPackage(to, switchPackage(p, to).project, source),
    });
  }

  function openCustom() {
    setIncluded(false);
    setPending(null);
    if (p.step !== STEP.secoes) go(STEP.secoes, { validate: false });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById('personalizado') as HTMLDetailsElement | null;
        if (el) {
          el.open = true;
          el.scrollIntoView({ block: 'start' });
          el.querySelector('summary')?.focus({ preventScroll: true });
        }
      }),
    );
  }

  /** Pede a prévia à IA. Continua mesmo se a pessoa trocar de etapa. */
  async function generate(text: string) {
    if (generating) return;
    setGenerating(true);
    setGenError('');
    setLate(null);
    track('ai_generate', { result: 'iniciada' });
    const result = await requestSuggestion(withDetails(text, pNow.current.details), pNow.current.pkg, integrations.aiEndpoint);
    setGenerating(false);
    if (!result.ok) {
      track('ai_generate', { result: 'erro', reason: result.reason });
      setGenError(aiReasonText[result.reason]);
      return;
    }
    track('ai_generate', { result: 'ok' });
    // Saiu da etapa enquanto gerava: não muda de tela sozinho; avisa com "Ver minha prévia".
    if (pNow.current.step !== STEP.negocio) return setLate(result.suggestion);
    applyAi(result.suggestion);
  }

  /** Sugestão da IA: aplica nos layouts existentes e abre a prévia pronta. */
  function applyAi(sug: Suggestion) {
    const before = pNow.current;
    const next = applySuggestion(before, sug);
    const notes: string[] = [];
    if (sug.extraSections.length) {
      const names = sug.extraSections.map((id) => sectionName(next, id)).join(', ');
      notes.push(`Também combinam com o seu site: ${names}. São de outro pacote — você decide em “Seções”.`);
    }
    if (sug.needs.length) {
      const names = customNeeds.filter((n) => sug.needs.includes(n.id)).map((n) => n.name.toLowerCase()).join(', ');
      notes.push(`Sua descrição cita itens fora dos pacotes (${names}). Se precisar deles, marque em “Seções”.`);
    }
    setAiNotes(notes);
    // Textos editados à mão ficaram; a pessoa pode trocar pelos novos.
    setKeptEdits(before.edited.length ? { base: before, sug } : null);
    // Segmento escolhido à mão foi mantido, mas a descrição aponta outro: pergunta, sem trocar sozinho.
    setSegConflict(sug.segment && next.segment !== sug.segment ? { suggested: sug.segment, other: sug.segmentOther } : null);
    // Uma nova geração sobre uma prévia existente pode ser desfeita.
    setUndo(before.aiFilled.segment || before.identitySet ? { label: 'Nova prévia montada.', project: before } : null);
    setLate(null);
    setErrors({});
    setPending(null);
    setNotice('');
    // Com uma decisão pendente (segmento), fica na tela do resultado para o aviso não se perder.
    const direct = narrow && !(sug.segment && next.segment !== sug.segment);
    setView(direct ? 'preview' : 'edit');
    // Foco no aviso "Sua prévia está pronta" (no celular, dentro da prévia), depois de renderizar.
    focusAfter.current = direct ? 'ready' : 'heading';
    replace(next);
    track('preview_view', { source: 'ia', step: next.step + 1 });
  }

  function showPreview() {
    editScroll.current = window.scrollY;
    setView('preview');
    window.scrollTo({ top: 0, behavior: 'instant' });
    track('preview_view', { source: 'alternancia', step: p.step + 1 });
  }

  /** Volta à escolha em que a pessoa estava, na mesma rolagem. */
  function backToEdit() {
    restoreScroll.current = editScroll.current;
    setView('edit');
  }
  // Antes de pintar: a volta já aparece na rolagem de antes (sem pulo para o topo).
  useLayoutEffect(() => {
    if (view !== 'edit' || restoreScroll.current === null) return;
    window.scrollTo({ top: restoreScroll.current, behavior: 'instant' });
    restoreScroll.current = null;
    heading.current?.focus({ preventScroll: true });
  }, [view]);

  function openFull() {
    setFull(true);
    track('preview_view', { source: 'tela_cheia', step: p.step + 1 });
  }

  function openForm() {
    setFormOpen(true);
    requestAnimationFrame(() => document.getElementById('pedido')?.scrollIntoView({ block: 'start' }));
  }

  const gate = (anchor: string): ReactNode => (pending?.anchor === anchor ? <ConfirmBox pending={pending} onCancel={() => setPending(null)} /> : null);

  const request = requestMessage(p, originTag(origin), { logo: Boolean(logo) });
  const message = request.text;
  const step = p.step;
  const choiceIndex = CHOICE_STEPS.indexOf(step);
  const phase = phaseOf(step);
  const describing = step === STEP.negocio && aiEnabled && !manual;
  /** Gravando ou transcrevendo: só a ação da gravação fica na tela. */
  const capturing = describing && (describePhase === 'iniciando' || describePhase === 'gravando' || describePhase === 'transcrevendo');
  /** Sem barras nem "Continuar" competindo com a gravação ou com "Montando sua prévia…". */
  const busy = capturing || (describing && generating);
  /** Já existe uma prévia montada para voltar (depois de gerar ou do passo a passo). */
  const hasPreview = Boolean(p.segment) && (p.aiFilled.segment !== '' || p.objectiveSet || p.identitySet);
  if (entry.current.step !== step) entry.current = { step, value: choiceValue(p, step) };
  const keeping = (step === STEP.estilo || step === STEP.cores || step === STEP.titulos) && choiceValue(p, step) === entry.current.value;
  const nextLabel = step === STEP.objetivo ? 'Ver minha prévia' : step === STEP.secoes ? 'Revisar e solicitar' : keeping ? 'Manter sugestão' : 'Continuar';
  const canRegen = aiEnabled && !manual;
  const editLabel = backFromReady() === STEP.negocio ? 'Editar minha descrição' : 'Voltar ao objetivo';

  const preview = (mode: 'mobile' | 'desktop', inFull = false) =>
    mode === 'desktop' ? (
      <DesktopFrame width={inFull ? 1100 : 900}>
        <SitePreview project={p} logo={logo} />
      </DesktopFrame>
    ) : narrow || inFull ? (
      <div className={inFull ? b.fullMobile : b.screen}>
        <SitePreview project={p} logo={logo} bare />
      </div>
    ) : (
      <PhoneFrame>
        <SitePreview project={p} logo={logo} bare />
      </PhoneFrame>
    );

  /* Conteúdo da etapa atual */
  let body: ReactNode = null;
  if (step === STEP.negocio) {
    body = (
      <>
        {describing && (
          <>
            <Describe generating={generating} error={genError} onGenerate={generate} onPhase={setDescribePhase} clearError={() => setGenError('')} />
            {!capturing && (
              <p className={b.orSteps}>
                <button type="button" className={b.textButton} onClick={() => setManual(true)}>
                  Prefiro escolher tudo passo a passo
                </button>
              </p>
            )}
          </>
        )}
        {!describing && (
          <>
            <p className={b.hint}>Nome e segmento bastam para começar.</p>
            <StepBusiness p={p} edit={edit} replace={replace} errors={errors} nameRef={nameRef} />
            {aiEnabled && (
              <p className={b.orSteps}>
                <button type="button" className={b.textButton} onClick={() => setManual(false)}>
                  Prefiro descrever o negócio (gravando ou digitando)
                </button>
              </p>
            )}
          </>
        )}
      </>
    );
  } else if (step === STEP.objetivo) {
    body = (
      <>
        <StepObjective p={p} replace={replace} onUpgrade={offerUpgrade} />
        {gate('objetivo')}
      </>
    );
  } else if (step === STEP.pronta) {
    body = (
      <StepReady
        p={p}
        edit={edit}
        notes={aiNotes}
        narrow={narrow}
        onPersonalize={() => go(STEP.pacote)}
        keptEdits={keptEdits ? keptEdits.base.edited : []}
        segConflict={
          segConflict && p.segment !== segConflict.suggested
            ? {
                suggested: segConflict.suggested,
                onUse: () => {
                  setUndo({ label: 'Segmento trocado.', project: p });
                  replace({ ...p, segment: segConflict.suggested, segmentOther: segConflict.other, aiFilled: { ...p.aiFilled, segment: segConflict.suggested } });
                  setSegConflict(null);
                },
                onKeep: () => setSegConflict(null),
              }
            : null
        }
        onUseNewTexts={() => {
          if (!keptEdits) return;
          const next = applySuggestion(keptEdits.base, keptEdits.sug, { replaceEdited: true });
          setUndo({ label: 'Textos novos aplicados.', project: p });
          setKeptEdits(null);
          replace({ ...next, step: p.step });
        }}
        onEditDescription={() => go(backFromReady(), { validate: false })}
        editLabel={editLabel}
        onReview={() => go(STEP.revisao)}
      />
    );
  } else if (step === STEP.pacote)
    body = <StepPackage p={p} onApply={(to, next) => applyPackage(to, next, 'etapa')} onRestore={restore} onCustom={openCustom} />;
  else if (step === STEP.estilo) body = <StepStyle p={p} edit={edit} />;
  else if (step === STEP.cores) body = <StepColors p={p} edit={edit} />;
  else if (step === STEP.titulos) body = <StepFonts p={p} edit={edit} />;
  else if (step === STEP.conteudo)
    body = (
      <StepContent
        p={p}
        edit={edit}
        logo={logo}
        setLogo={setLogo}
        broadEdit={broadEdit}
        regen={canRegen ? { busy: regen.field, error: regen.error, run: regenerateSection } : null}
      />
    );
  else if (step === STEP.secoes) body = <StepSections p={p} edit={edit} scope={scope} gate={gate} onSeePackages={() => setIncluded(true)} onRestore={restore} />;
  else if (step === STEP.revisao)
    body = (
      <StepSite
        p={p}
        update={update}
        gate={gate}
        origin={origin}
        message={message}
        lean={request.lean}
        onImport={(next) => {
          state.replaceKeeping({ ...next, step: STEP.revisao }, 'arquivo');
          setNotice('Projeto aberto a partir do arquivo.');
        }}
        logo={Boolean(logo)}
        formOpen={formOpen}
        openForm={openForm}
        onIncluded={() => setIncluded(true)}
        onUpgrade={offerUpgrade}
        go={(to) => go(to, { validate: false })}
      />
    );

  /* Barra do celular: uma ação principal por vez, nunca durante gravação ou geração. */
  let bar: ReactNode = null;
  if (!busy) {
    if (view === 'preview') {
      if (step === STEP.pronta)
        bar = (
          <>
            <button type="button" className={`${b.backButton} ${b.barSecondary}`} onClick={() => go(backFromReady(), { validate: false })}>
              {editLabel}
            </button>
            <button type="button" className={`${s.primary} ${b.next}`} onClick={() => go(STEP.pacote)}>
              Personalizar meu site
            </button>
          </>
        );
      else if (step === STEP.revisao)
        bar = (
          <>
            <button type="button" className={`${b.backButton} ${b.barSecondary}`} onClick={backToEdit}>
              <ChevronLeft aria-hidden="true" /> Voltar ao resumo
            </button>
            <RequestButton p={p} message={message} onForm={() => (backToEdit(), openForm())} className={b.next} />
          </>
        );
      else
        bar = (
          <button type="button" className={`${s.primary} ${b.next}`} onClick={backToEdit}>
            <Pencil aria-hidden="true" /> {step === STEP.negocio || step === STEP.objetivo ? 'Voltar a editar' : `Voltar para “${steps[step]}”`}
          </button>
        );
    } else if (step === STEP.negocio) {
      if (!describing)
        bar = (
          <button type="button" className={`${s.primary} ${b.next}`} disabled={!ready} onClick={() => go(STEP.objetivo)}>
            Continuar
          </button>
        );
      else if (hasPreview)
        bar = (
          <button type="button" className={`${b.backButton} ${b.next}`} onClick={() => go(STEP.pronta, { validate: false })}>
            Voltar para minha prévia <ArrowRight aria-hidden="true" />
          </button>
        );
    } else if (step === STEP.pronta)
      bar = (
        <>
          <button type="button" className={`${b.backButton} ${b.barSecondary}`} onClick={showPreview}>
            <Eye aria-hidden="true" /> Ver minha prévia
          </button>
          <button type="button" className={`${s.primary} ${b.next}`} onClick={() => go(STEP.pacote)}>
            Personalizar meu site
          </button>
        </>
      );
    else if (step === STEP.revisao)
      bar = (
        <>
          <button type="button" className={`${b.backButton} ${b.barSecondary}`} onClick={showPreview}>
            <Eye aria-hidden="true" /> Ver meu site
          </button>
          <RequestButton p={p} message={message} onForm={openForm} className={b.next} />
        </>
      );
    else
      bar = (
        <>
          <button type="button" className={`${b.backButton} ${b.barSecondary}`} onClick={showPreview}>
            <Eye aria-hidden="true" /> Ver meu site
          </button>
          <button type="button" className={`${s.primary} ${b.next}`} disabled={!ready} onClick={() => go(step + 1)}>
            {nextLabel} <ArrowRight aria-hidden="true" />
          </button>
        </>
      );
  }

  /* Ações no fim da coluna (computador) */
  let desk: ReactNode = null;
  if (!busy && step !== STEP.pronta) {
    const showNext = step !== STEP.revisao && !(step === STEP.negocio && describing);
    desk = (
      <>
        {step > STEP.negocio && (
          <button type="button" className={b.backButton} onClick={back}>
            Voltar
          </button>
        )}
        {step === STEP.negocio && describing && hasPreview && (
          <button type="button" className={b.backButton} onClick={() => go(STEP.pronta, { validate: false })}>
            Voltar para minha prévia
          </button>
        )}
        {showNext && (
          <button type="button" className={`${s.primary} ${b.next}`} disabled={!ready} onClick={() => go(step === STEP.negocio ? STEP.objetivo : step + 1)}>
            {nextLabel} <ArrowRight aria-hidden="true" />
          </button>
        )}
      </>
    );
  }

  return (
    <div className={`${s.page} ${b.builder}`}>
      <header className={b.header}>
        <div className={`${s.wrap} ${b.headerInner}`}>
          <Brand href={asset('/')} />
          <a className={b.back} href={asset('/')}>
            <ChevronLeft aria-hidden="true" /> Início
          </a>
        </div>
      </header>

      <main id="conteudo" className={b.main}>
        <div className={s.wrap}>
          <div className={b.top}>
            <div className={b.progress}>
              <ol className={b.phases} aria-label="Etapas">
                {phases.map((ph, i) => {
                  const inner = (
                    <>
                      <span className={b.phaseDot} aria-hidden="true">
                        {i < phase ? <Check /> : i + 1}
                      </span>
                      <span className={b.phaseName}>{ph.name}</span>
                    </>
                  );
                  return (
                    <li key={ph.name} aria-current={i === phase ? 'step' : undefined} data-done={i < phase || undefined}>
                      {i < phase && !busy ? (
                        <button type="button" className={b.phaseLink} onClick={() => go(phaseTarget[i], { validate: false })} aria-label={`Voltar para ${ph.name} (concluída)`}>
                          {inner}
                        </button>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ol>
              {saved && (
                <span className={b.saved}>
                  <Check aria-hidden="true" /> Salvo<span className={b.savedLong}> neste dispositivo</span>
                </span>
              )}
            </div>
            {/* Celular: uma linha com a etapa, que abre a lista de etapas (sem fileiras espremidas). */}
            <details className={b.stepMenu} ref={stepMenu}>
              <summary>
                <span>
                  Etapa {phase + 1} de {phases.length}: <strong>{phases[phase].name}</strong>
                  {choiceIndex >= 0 && ` · ${steps[step]} (${choiceIndex + 1} de ${CHOICE_STEPS.length})`}
                </span>
                <span className={b.stepMenuHint}>Ver etapas</span>
              </summary>
              <ol>
                {phases.map((ph, i) => (
                  <li key={ph.name}>
                    {i < phase && !busy ? (
                      <button type="button" onClick={() => go(phaseTarget[i], { validate: false })}>
                        <Check aria-hidden="true" /> {ph.name}
                      </button>
                    ) : (
                      <span aria-current={i === phase ? 'step' : undefined}>
                        {i + 1}. {ph.name}
                      </span>
                    )}
                    {i === 2 && (choiceIndex >= 0 || step === STEP.revisao) && (
                      <ol>
                        {CHOICE_STEPS.map((cs, j) => (
                          <li key={cs}>
                            <button type="button" aria-current={cs === step ? 'step' : undefined} onClick={() => go(cs, { validate: false })}>
                              {j + 1}. {steps[cs]}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </details>
            <p className={b.where} aria-live="polite">
              {phases[phase].name}
              {choiceIndex >= 0 && ` · Escolha ${choiceIndex + 1} de ${CHOICE_STEPS.length}: ${steps[step]}`}
            </p>
            {(choiceIndex >= 0 || step === STEP.revisao) && (
              <ol className={b.choices} aria-label="Escolhas da personalização">
                {CHOICE_STEPS.map((cs, i) => (
                  <li key={cs}>
                    <button type="button" aria-current={cs === step ? 'step' : undefined} onClick={() => go(cs, { validate: false })} aria-label={`Escolha ${i + 1}: ${steps[cs]}`}>
                      <b aria-hidden="true">{i + 1}</b>
                      <span className={b.choiceName} aria-hidden="true">
                        {steps[cs]}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <PriceBar p={p} onChange={() => setIncluded(true)} />
            {notice && (
              <p className={b.notice} role="status">
                {notice}
              </p>
            )}
            {undo && (
              <div className={b.undo} role="status">
                <p>{undo.label}</p>
                <button type="button" className={`${s.secondary} ${s.small}`} onClick={undoLast}>
                  Desfazer
                </button>
              </div>
            )}
            {backup && (
              <div className={b.undo} role="status">
                <p>{backup.reason === 'modelo' ? 'Você começou por um modelo de exemplo.' : 'Você abriu um arquivo de projeto.'} Sua versão anterior está guardada.</p>
                <div className={s.actionRow}>
                  <button
                    type="button"
                    className={`${s.secondary} ${s.small}`}
                    onClick={() => {
                      restoreBackup();
                      setNotice('Versão anterior recuperada.');
                    }}
                  >
                    Recuperar minha versão anterior
                  </button>
                  <button type="button" className={b.textButton} onClick={dropBackup}>
                    Dispensar
                  </button>
                </div>
              </div>
            )}
            {late && (
              <div className={b.lateBox} role="status">
                <p>A prévia da sua descrição ficou pronta.</p>
                <div className={s.actionRow}>
                  <button type="button" className={`${s.primary} ${s.small}`} onClick={() => applyAi(late)}>
                    Ver minha prévia
                  </button>
                  <button type="button" className={`${s.secondary} ${s.small}`} onClick={() => setLate(null)}>
                    Agora não
                  </button>
                </div>
              </div>
            )}
            {generating && step !== STEP.negocio && (
              <p className={b.working} role="status">
                <LoaderCircle aria-hidden="true" className={b.spin} /> Montando sua prévia…
              </p>
            )}
            {resetting && (
              <div className={s.confirmBox} role="alertdialog" aria-labelledby="recomecar-titulo">
                <p id="recomecar-titulo">Apagar a prévia salva neste dispositivo e começar de novo?</p>
                <div className={s.actionRow}>
                  <button
                    type="button"
                    className={`${s.primary} ${s.small}`}
                    onClick={() => {
                      reset();
                      setLogoState(null);
                      setResetting(false);
                      setManual(false);
                      setAiNotes([]);
                      setView('edit');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
                    }}
                  >
                    Sim, apagar
                  </button>
                  <button type="button" className={`${s.secondary} ${s.small}`} autoFocus onClick={() => setResetting(false)}>
                    Manter minha prévia
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={b.grid} data-view={view} data-step={step}>
            <section className={b.editor} aria-labelledby="etapa-titulo">
              {step > STEP.negocio && step !== STEP.pronta && (
                <button type="button" className={b.backLink} onClick={back}>
                  <ChevronLeft aria-hidden="true" /> Voltar
                </button>
              )}
              <h1 id="etapa-titulo" ref={heading} tabIndex={-1} className={b.stepTitle} data-ready={step === STEP.pronta || undefined}>
                {step === STEP.pronta && <Check aria-hidden="true" className={b.readyIcon} />}
                {stepQuestions[step]}
              </h1>
              {hints[step] && <p className={b.hint}>{hints[step]}</p>}
              {pending && !pending.anchor && <ConfirmBox pending={pending} onCancel={() => setPending(null)} />}

              <div key={step} className={b.stepBody}>
                {body}
              </div>

              <div className={b.editorFoot}>
                <a
                  className={b.helpLink}
                  href={whatsappLink(helpMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track('help_open', { step: step + 1 });
                    track('whatsapp_open', { context: 'ajuda' });
                  }}
                >
                  <MessageCircle aria-hidden="true" /> Dúvidas? Fale no WhatsApp
                </a>
                {hasProgress && !resetting && !busy && (
                  <button type="button" className={b.restart} onClick={() => setResetting(true)}>
                    Começar novamente
                  </button>
                )}
              </div>

              {desk && <div className={b.desktopActions}>{desk}</div>}
            </section>

            <aside className={b.previewPane} aria-label="Prévia do seu site">
              {step === STEP.pronta && (
                <div className={b.readyBanner}>
                  <h2 ref={readyHeading} tabIndex={-1} id="pronta-titulo">
                    <Check aria-hidden="true" /> Sua prévia está pronta
                  </h2>
                  <p>Role para ver o site inteiro. Depois, personalize — ou siga direto para o pedido.</p>
                  <button type="button" className={b.textButton} onClick={() => go(STEP.revisao)}>
                    Gostei assim — revisar e solicitar
                  </button>
                </div>
              )}
              <div className={b.previewTop}>
                <span className={b.previewLabel}>{view === 'preview' ? 'Seu site' : 'Prévia'}</span>
                <span className={b.device} role="group" aria-label="Ver a prévia no">
                  <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} aria-label="Celular">
                    <Smartphone aria-hidden="true" />
                    <span aria-hidden="true">Celular</span>
                  </button>
                  <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} aria-label="Computador">
                    <Monitor aria-hidden="true" />
                    <span aria-hidden="true">Computador</span>
                  </button>
                  <button type="button" onClick={openFull} aria-label="Ver em tela cheia">
                    <Maximize2 aria-hidden="true" />
                  </button>
                </span>
              </div>
              <div className={b.previewArea}>{preview(device)}</div>
            </aside>
          </div>
        </div>
      </main>

      {updated && view === 'edit' && CHOICE_STEPS.includes(step) && (
        <p className={b.updated} role="status">
          <Check aria-hidden="true" /> Prévia atualizada
        </p>
      )}

      {!typing && bar && (
        <div className={b.bottomBar} data-bar="configurador" data-view={view}>
          {bar}
        </div>
      )}

      <PackageDialog
        p={p}
        open={included}
        onClose={() => setIncluded(false)}
        onChoose={(to, next) => {
          applyPackage(to, next, 'incluido');
          setIncluded(false);
        }}
        onCustom={openCustom}
      />

      <dialog ref={fullRef} className={b.full} aria-labelledby="tela-cheia-titulo" onClose={() => setFull(false)}>
        <div className={b.fullHead}>
          <h2 id="tela-cheia-titulo">Seu site</h2>
          <span className={b.device} role="group" aria-label="Ver a prévia no">
            <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
              <Smartphone aria-hidden="true" /> Celular
            </button>
            <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
              <Monitor aria-hidden="true" /> Computador
            </button>
          </span>
          <button type="button" className={s.closeButton} onClick={() => setFull(false)} aria-label="Fechar tela cheia" autoFocus>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className={b.fullBody}>{full && preview(device, true)}</div>
      </dialog>

      {ready && <PrintSummary p={p} logo={Boolean(logo)} />}
    </div>
  );
}
