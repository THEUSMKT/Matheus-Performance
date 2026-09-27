'use client';
/* ==========================================================================
   Página dedicada à criação da prévia (/criar/).
   Quatro etapas: Seu negócio → Seu objetivo → Sua identidade → Seu site.
   O preço do pacote fica sempre à vista; mudanças que pedem outro pacote só
   são aplicadas depois que o visitante escolhe. Tudo fica salvo neste
   dispositivo. No celular, "Editar" e "Ver meu site" alternam na mesma
   etapa; na última, a prévia vem primeiro.
   ========================================================================== */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronLeft, Eye, Maximize2, MessageCircle, Monitor, Pencil, Smartphone, X } from 'lucide-react';
import { brl, packageById, type PackageId } from '@/config/packages';
import {
  STEP_COUNT,
  checkChange,
  currentPackage,
  helpMessage,
  packageOffer,
  projectMessage,
  sectionName,
  steps,
  switchPackage,
  type Project,
} from '@/lib/project';
import { track } from '@/lib/analytics';
import { originTag } from '@/lib/origin';
import { clearLogo, readLogo, saveLogo } from '@/lib/logo';
import { whatsappLink } from '@/lib/whatsapp';
import { Brand, asset } from '../landing/Chrome';
import { ConfirmBox, type Pending } from '../landing/Controls';
import { DesktopFrame, PhoneFrame } from '../landing/DemoFrames';
import { useTyping } from '../landing/hooks';
import { useNarrow, useProject } from '../landing/useProject';
import { SitePreview } from '../preview/SitePreview';
import { PackageDialog, PriceBar } from './Packages';
import { PrintSummary, RequestButton, StepSite } from './Site';
import { StepBusiness, StepIdentity, StepObjective, type StepErrors } from './Steps';
import { Describe } from './Describe';
import { aiEnabled } from '@/config/integrations';
import { applySuggestion, type Suggestion } from '@/lib/aiPreview';
import { customNeeds } from '@/config/packages';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

const hints: (string | null)[] = [
  'Nome e segmento bastam para começar.',
  'Isso define o botão principal e a ordem das seções.',
  'Tudo aqui está incluído no preço do pacote.',
  null,
];

export default function Builder() {
  const state = useProject();
  const { project: p, update, replace, reset, ready, saved, notice, setNotice, hasProgress, origin } = state;
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
  const [personalize, setPersonalize] = useState(false);
  const [full, setFull] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLDialogElement>(null);
  const focusHeading = useRef(false);

  useEffect(() => {
    setLogoState(readLogo());
    track('configurator_start');
    // "Começar uma nova prévia" na apresentação chega aqui com #novo: confirma antes de apagar.
    if (location.hash === '#novo') {
      history.replaceState(null, '', `${location.pathname}${location.search}`);
      setResetting(true);
    }
  }, []);

  // Ao trocar de etapa: topo da página e foco no título (teclado e leitor de tela).
  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    heading.current?.focus({ preventScroll: true });
  }, [p.step]);

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

  function go(target: number) {
    const to = Math.max(0, Math.min(STEP_COUNT - 1, target));
    if (to > p.step && p.step === 0) {
      const found: StepErrors = {};
      if (p.name.trim().length < 2) found.name = 'Informe o nome da empresa.';
      if (!p.segment) found.segment = 'Escolha o segmento da empresa.';
      else if (p.segment === 'outro' && p.segmentOther.trim().length < 2) found.segment = 'Conte qual é o segmento.';
      if (found.name || found.segment) {
        setErrors(found);
        setView('edit');
        requestAnimationFrame(() => {
          if (found.name) nameRef.current?.focus();
          else document.querySelector<HTMLElement>(p.segment === 'outro' ? '#segmento-outro' : '[role=radiogroup] [role=radio]')?.focus();
        });
        return;
      }
    }
    if (to > p.step) for (let i = p.step; i < to; i++) track('step_complete', { step: i + 1 });
    if (to === STEP_COUNT - 1) track('preview_view', { source: 'etapa', step: to + 1 });
    setErrors({});
    setPending(null);
    setNotice('');
    setView('edit');
    if (to !== STEP_COUNT - 1) setPersonalize(false);
    focusHeading.current = true;
    replace({ ...p, step: to });
  }

  /** Troca de pacote escolhida pelo visitante. */
  function applyPackage(to: PackageId, next: Project, source: string) {
    const from = p.pkg;
    replace({ ...next, step: p.step });
    track('package_selected', { package: to, source });
    if (from !== to) track('package_changed', { from, to, source });
    setNotice(`Pacote ${packageById(to).name} escolhido. Desenvolvimento: ${brl(packageById(to).price)}.`);
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
    if (p.step !== STEP_COUNT - 1) go(STEP_COUNT - 1);
    setPersonalize(true);
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

  /** Sugestão da IA: aplica nos layouts existentes e explica o que ficou de fora. */
  function applyAi(sug: Suggestion) {
    const next = applySuggestion(p, sug);
    const notes = ['Prévia montada a partir da sua descrição. Os textos são sugestões: revise tudo em “Personalizar meu site”.'];
    if (sug.extraSections.length) {
      const names = sug.extraSections.map((id) => sectionName(next, id)).join(', ');
      notes.push(`Também combinam com o seu site: ${names} — de outro pacote; você pode incluir em “Personalizar meu site”.`);
    }
    if (sug.needs.length) {
      const names = customNeeds.filter((n) => sug.needs.includes(n.id)).map((n) => n.name.toLowerCase()).join(', ');
      notes.push(`Sua descrição cita itens fora dos pacotes (${names}). Se precisar deles, marque em “Preciso de algo fora dos pacotes”.`);
    }
    if (next.step === 0) notes.push('Confira o nome da empresa e o segmento para continuar.');
    setErrors({});
    setPending(null);
    setView('edit');
    focusHeading.current = next.step !== p.step;
    replace(next);
    setNotice(notes.join(' '));
    track('preview_view', { source: 'ia', step: next.step + 1 });
  }

  function openPersonalize(open: boolean) {
    setPersonalize(open);
    if (open) requestAnimationFrame(() => document.getElementById('personalizar-titulo')?.focus());
  }

  function showPreview() {
    setView('preview');
    track('preview_view', { source: 'alternancia', step: p.step + 1 });
  }

  function openFull() {
    setFull(true);
    track('preview_view', { source: 'tela_cheia', step: p.step + 1 });
  }

  function openForm() {
    setFormOpen(true);
    requestAnimationFrame(() => document.getElementById('pedido')?.scrollIntoView({ block: 'start' }));
  }

  const gate = (anchor: string): ReactNode =>
    pending?.anchor === anchor ? <ConfirmBox pending={pending} onCancel={() => setPending(null)} /> : null;

  const message = projectMessage(p, originTag(origin), { logo: Boolean(logo) });
  const last = p.step === STEP_COUNT - 1;
  const nextLabel = p.step === STEP_COUNT - 2 ? 'Ver meu site' : 'Continuar';

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
              <span>
                Etapa {p.step + 1} de {STEP_COUNT}
              </span>
              <span className={b.progressBar} aria-hidden="true">
                <i style={{ width: `${((p.step + 1) / STEP_COUNT) * 100}%` }} />
              </span>
              {saved && (
                <span className={b.saved}>
                  <Check aria-hidden="true" /> Salvo neste dispositivo
                </span>
              )}
            </div>
            <ol className={b.stepNames} aria-label="Etapas">
              {steps.map((name, i) => (
                <li key={name} aria-current={i === p.step ? 'step' : undefined} data-done={i < p.step || undefined}>
                  {name}
                </li>
              ))}
            </ol>
            <PriceBar p={p} onIncluded={() => setIncluded(true)} />
            {notice && (
              <p className={b.notice} role="status">
                {notice}
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
                      setPersonalize(false);
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
            {!last && (
              <div className={b.viewSwitch} role="group" aria-label="Alternar entre editar e ver o site">
                <button type="button" aria-pressed={view === 'edit'} onClick={() => setView('edit')}>
                  <Pencil aria-hidden="true" /> Editar
                </button>
                <button type="button" aria-pressed={view === 'preview'} onClick={showPreview}>
                  <Eye aria-hidden="true" /> Ver meu site
                </button>
              </div>
            )}
          </div>

          <div className={b.grid} data-view={view} data-step={p.step}>
            <section className={b.editor} aria-labelledby="etapa-titulo">
              <h1 id="etapa-titulo" ref={heading} tabIndex={-1} className={b.stepTitle}>
                {steps[p.step]}
              </h1>
              {hints[p.step] && <p className={b.hint}>{hints[p.step]}</p>}
              {pending && !pending.anchor && <ConfirmBox pending={pending} onCancel={() => setPending(null)} />}

              {p.step === 0 && aiEnabled && <Describe p={p} onSuggestion={applyAi} />}
              {p.step === 0 && <StepBusiness p={p} edit={edit} replace={replace} errors={errors} nameRef={nameRef} />}
              {p.step === 1 && (
                <>
                  <StepObjective p={p} replace={replace} onUpgrade={offerUpgrade} />
                  {gate('objetivo')}
                </>
              )}
              {p.step === 2 && <StepIdentity p={p} edit={edit} logo={logo} setLogo={setLogo} />}
              {last && (
                <StepSite
                  p={p}
                  update={update}
                  scope={scope}
                  gate={gate}
                  origin={origin}
                  message={message}
                  logo={Boolean(logo)}
                  personalize={personalize}
                  setPersonalize={openPersonalize}
                  formOpen={formOpen}
                  openForm={openForm}
                  onIncluded={() => setIncluded(true)}
                  onUpgrade={offerUpgrade}
                  go={go}
                />
              )}

              <div className={b.editorFoot}>
                <a
                  className={b.helpLink}
                  href={whatsappLink(helpMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track('help_open', { step: p.step + 1 });
                    track('whatsapp_open', { context: 'ajuda' });
                  }}
                >
                  <MessageCircle aria-hidden="true" /> Dúvidas? Fale no WhatsApp
                </a>
                {hasProgress && !resetting && (
                  <button type="button" className={b.restart} onClick={() => setResetting(true)}>
                    Começar novamente
                  </button>
                )}
              </div>

              <div className={b.desktopActions}>
                {p.step > 0 && (
                  <button type="button" className={b.backButton} onClick={() => go(p.step - 1)}>
                    Voltar
                  </button>
                )}
                {!last && (
                  <button type="button" className={`${s.primary} ${b.next}`} disabled={!ready} onClick={() => go(p.step + 1)}>
                    {nextLabel}
                  </button>
                )}
              </div>
            </section>

            <aside className={b.previewPane} aria-label="Prévia do seu site">
              <div className={b.previewTop}>
                <span className={b.previewLabel}>Prévia</span>
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

      {!typing && (
        <div className={b.bottomBar} data-bar="configurador">
          {last ? (
            <>
              <button type="button" className={`${b.backButton} ${b.iconButton}`} onClick={() => openPersonalize(!personalize)} aria-expanded={personalize} aria-label="Personalizar meu site">
                <Pencil aria-hidden="true" />
              </button>
              <RequestButton p={p} message={message} onForm={openForm} className={b.next} />
            </>
          ) : (
            <>
              {p.step > 0 && (
                <button type="button" className={b.backButton} onClick={() => go(p.step - 1)}>
                  Voltar
                </button>
              )}
              <button type="button" className={`${s.primary} ${b.next}`} disabled={!ready} onClick={() => go(p.step + 1)}>
                {nextLabel}
              </button>
            </>
          )}
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

