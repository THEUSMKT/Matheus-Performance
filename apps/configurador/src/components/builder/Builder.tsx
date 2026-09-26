'use client';
/* ==========================================================================
   Página dedicada à criação da prévia (/criar/).
   Quatro etapas: Seu negócio → Aparência → Conteúdo → Sua prévia.
   Tudo fica salvo neste navegador; voltar para a apresentação não perde
   nada. No celular, "Editar" e "Ver prévia" alternam na mesma etapa.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, Eye, MessageCircle, Monitor, Pencil, Smartphone } from 'lucide-react';
import { STEP_COUNT, applyPlan, choiceChanges, customStructure, helpMessage, projectMessage, recommendedPlan, steps, type Project } from '@/lib/project';
import { track } from '@/lib/analytics';
import { originTag } from '@/lib/origin';
import { clearLogo, readLogo, saveLogo } from '@/lib/logo';
import { whatsappLink } from '@/lib/whatsapp';
import { plans } from '@/config/offer';
import { Brand, asset } from '../landing/Chrome';
import { ConfirmBox, type Pending } from '../landing/Controls';
import { DesktopFrame, PhoneFrame } from '../landing/DemoFrames';
import { useTyping } from '../landing/hooks';
import { useNarrow, useProject } from '../landing/useProject';
import { SitePreview } from '../preview/SitePreview';
import { StepBusiness, StepContent, StepLook } from './Steps';
import { PrintSummary, QuoteButton, StepPreview } from './Summary';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

const hints: (string | null)[] = [null, null, 'Marque o que deve aparecer no seu site.', null];

export default function Builder() {
  const state = useProject();
  const { project: p, update, replace, reset, ready, notice, setNotice, hasProgress, origin } = state;
  const narrow = useNarrow();
  const typing = useTyping();
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [deviceChoice, setDevice] = useState<'mobile' | 'desktop' | null>(null);
  const device = deviceChoice ?? (narrow ? 'mobile' : 'desktop');
  const [nameError, setNameError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [logo, setLogoState] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const focusHeading = useRef(false);

  useEffect(() => {
    setLogoState(readLogo());
    track('configurator_start');
  }, []);

  // Ao trocar de etapa: topo da página e foco no título (teclado e leitor de tela).
  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    heading.current?.focus({ preventScroll: true });
  }, [p.step]);

  function edit(patch: Partial<Project>) {
    if ('name' in patch && nameError) setNameError('');
    update(patch);
  }

  function setLogo(dataUrl: string | null) {
    if (!dataUrl) {
      clearLogo();
      setLogoState(null);
      return;
    }
    if (saveLogo(dataUrl)) setLogoState(dataUrl);
    else {
      setLogoState(dataUrl);
      setNotice('O navegador não guardou a logo. Ela aparece agora, mas some se a página for recarregada.');
    }
  }

  function go(target: number) {
    const to = Math.max(0, Math.min(STEP_COUNT - 1, target));
    if (to > p.step && p.step === 0 && p.name.trim().length < 2) {
      setNameError('Informe o nome da empresa.');
      setView('edit');
      requestAnimationFrame(() => nameRef.current?.focus());
      return;
    }
    if (to > p.step) for (let i = p.step; i < to; i++) track('step_complete', { step: i + 1 });
    let next: Project = { ...p, step: to };
    // Primeira vez em Conteúdo: aplica a estrutura sugerida para o objetivo.
    if (to === 2 && !p.plan && customStructure(p).length === 0) next = { ...applyPlan(p, recommendedPlan(p)), step: to };
    if (to === STEP_COUNT - 1) {
      track('summary_view');
      track('preview_view', { source: 'etapa', step: to + 1 });
    }
    setNameError('');
    setPending(null);
    setNotice('');
    setView('edit');
    focusHeading.current = true;
    replace(next);
  }

  /** Troca a estrutura; pede confirmação só se desfizer ajustes do visitante. */
  function choosePlan(id: Project['plan'] & string) {
    const next = { ...applyPlan(p, id), step: p.step };
    const apply = () => {
      replace(next);
      track(id === recommendedPlan(p) ? 'recommendation_applied' : 'plan_selected', { plan: id, source: 'conteudo' });
    };
    const changes = choiceChanges(p, next).filter((c) => c !== 'caminho de contratação');
    if (customStructure(p).length && changes.length) {
      setPending({ title: `Usar a estrutura “${plans.find((x) => x.id === id)!.name}” muda o que você ajustou.`, changes, confirmLabel: 'Usar esta estrutura', apply });
    } else apply();
  }

  function showPreview() {
    setView('preview');
    track('preview_view', { source: 'alternancia', step: p.step + 1 });
  }

  function openForm() {
    setFormOpen(true);
    requestAnimationFrame(() => document.getElementById('pedido')?.scrollIntoView({ block: 'start' }));
  }

  const message = projectMessage(p, originTag(origin), { logo: Boolean(logo) });
  const last = p.step === STEP_COUNT - 1;
  const nextLabel = p.step === STEP_COUNT - 2 ? 'Ver minha prévia' : 'Continuar';

  return (
    <div className={`${s.page} ${b.builder}`}>
      <header className={b.header}>
        <div className={`${s.wrap} ${b.headerInner}`}>
          <Brand href={asset('/')} />
          <a className={b.back} href={asset('/')}>
            <ChevronLeft aria-hidden="true" /> Voltar
          </a>
        </div>
      </header>

      <main id="conteudo" className={b.main}>
        <div className={s.wrap}>
          <div className={b.top}>
            <h1>Crie a prévia do seu site</h1>
            <div className={b.progress}>
              <span>
                Etapa {p.step + 1} de {STEP_COUNT}
              </span>
              <span className={b.progressBar} aria-hidden="true">
                <i style={{ width: `${((p.step + 1) / STEP_COUNT) * 100}%` }} />
              </span>
              {hasProgress && (
                <span className={b.saved}>
                  <Check aria-hidden="true" /> Salvo neste navegador
                </span>
              )}
            </div>
            {notice && (
              <p className={b.notice} role="status">
                {notice}
              </p>
            )}
            {!last && (
              <div className={b.viewSwitch} role="group" aria-label="Alternar entre editar e ver a prévia">
                <button type="button" aria-pressed={view === 'edit'} onClick={() => setView('edit')}>
                  <Pencil aria-hidden="true" /> Editar
                </button>
                <button type="button" aria-pressed={view === 'preview'} onClick={showPreview}>
                  <Eye aria-hidden="true" /> Ver prévia
                </button>
              </div>
            )}
          </div>

          <div className={b.grid} data-view={view} data-step={p.step}>
            <section className={b.editor} aria-labelledby="etapa-titulo">
              <h2 id="etapa-titulo" ref={heading} tabIndex={-1} className={b.stepTitle}>
                {steps[p.step]}
              </h2>
              {hints[p.step] && <p className={b.hint}>{hints[p.step]}</p>}
              {pending && <ConfirmBox pending={pending} onCancel={() => setPending(null)} />}

              {p.step === 0 && <StepBusiness p={p} edit={edit} nameError={nameError} nameRef={nameRef} />}
              {p.step === 1 && <StepLook p={p} edit={edit} logo={logo} setLogo={setLogo} />}
              {p.step === 2 && <StepContent p={p} edit={edit} onPlan={choosePlan} />}
              {p.step === 3 && (
                <StepPreview p={p} update={update} replace={replace} setNotice={setNotice} go={go} origin={origin} message={message} formOpen={formOpen} openForm={openForm} />
              )}

              <div className={b.editorFoot}>
                {!last && (
                  <a className={b.helpLink} href={whatsappLink(helpMessage(p))} target="_blank" rel="noopener noreferrer" onClick={() => {
                    track('help_open', { step: p.step + 1 });
                    track('whatsapp_open', { context: 'ajuda' });
                  }}>
                    <MessageCircle aria-hidden="true" /> Dúvidas? Fale no WhatsApp
                  </a>
                )}
                {hasProgress && !resetting && (
                  <button type="button" className={b.restart} onClick={() => setResetting(true)}>
                    Começar novamente
                  </button>
                )}
              </div>
              {resetting && (
                <div className={s.confirmBox} role="alertdialog" aria-labelledby="recomecar-titulo">
                  <p id="recomecar-titulo">Apagar suas respostas e começar de novo?</p>
                  <div className={s.actionRow}>
                    <button
                      type="button"
                      className={`${s.primary} ${s.small}`}
                      onClick={() => {
                        reset();
                        setLogoState(null);
                        setResetting(false);
                        setView('edit');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                        requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
                      }}
                    >
                      Sim, apagar
                    </button>
                    <button type="button" className={`${s.secondary} ${s.small}`} autoFocus onClick={() => setResetting(false)}>
                      Manter
                    </button>
                  </div>
                </div>
              )}

              <div className={b.desktopActions}>
                {p.step > 0 && (
                  <button type="button" className={b.backButton} onClick={() => go(last ? 0 : p.step - 1)}>
                    {last ? 'Editar prévia' : 'Voltar'}
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
                </span>
              </div>
              <div className={b.previewArea}>
                {device === 'desktop' ? (
                  <DesktopFrame width={900}>
                    <SitePreview project={p} logo={logo} />
                  </DesktopFrame>
                ) : (
                  <PhoneFrame>
                    <SitePreview project={p} logo={logo} bare />
                  </PhoneFrame>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {!typing && (
        <div className={b.bottomBar} data-bar="configurador">
          {last ? (
            <>
              <button type="button" className={b.backButton} onClick={() => go(0)}>
                Editar prévia
              </button>
              <QuoteButton message={message} onForm={openForm} className={b.next} />
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

      {ready && <PrintSummary p={p} />}
    </div>
  );
}
