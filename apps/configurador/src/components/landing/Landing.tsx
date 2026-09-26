'use client';
/* ==========================================================================
   Página principal. Ordem: apresentação → exemplos (carrossel) →
   benefícios → processo → configurador → opções de contratação → quem
   atende → perguntas → chamada final e rodapé.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Inbox, LayoutTemplate, ListChecks, Megaphone, MessageCircle, Monitor, Pointer, Smartphone, X } from 'lucide-react';
import { contact } from '@/config/contact';
import { pricing, brl } from '@/config/pricing';
import { plans } from '@/config/offer';
import { projectFaq } from '@/config/projectFaq';
import { ctaVariants, heroVariants } from '@/config/experiments';
import {
  applyPlan,
  choiceChanges,
  customStructure,
  exampleProject,
  hasOwnChoices,
  initialProject,
  investmentLabel,
  mergeStartingPoint,
  projectEstimate,
  recommendedPlan,
  segments,
  type Project,
} from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { ProjectPreview } from '../ProjectPreview';
import { InspirationPreview } from '../InspirationPreview';
import { Carousel, type CarouselApi } from './Carousel';
import { Footer, Header, asset, mainSiteUrl } from './Chrome';
import { Configurator } from './Configurator';
import { ConfirmBox, type Pending } from './Controls';
import { DesktopFrame, PhoneFrame } from './DemoFrames';
import { CONFIG_IN_VIEW_MARGIN, useInView, useScrolledPast, useTyping } from './hooks';
import { PrintSummary } from './SummaryStep';
import { useProject, type ProjectState } from './useProject';
import s from './Landing.module.css';

const demoSegments = segments.filter((x) => x.id !== 'outro');

const benefits = [
  { icon: LayoutTemplate, title: 'Apresenta seus serviços', text: 'O que você faz, para quem e como contratar, organizado em uma página clara.' },
  { icon: Inbox, title: 'Facilita pedidos de orçamento', text: 'Botão de WhatsApp e, se quiser, um formulário que já chega com as informações certas.' },
  { icon: ListChecks, title: 'Organiza as informações', text: 'Serviços, perguntas frequentes, localização e contato em um endereço só.' },
  { icon: Megaphone, title: 'Apoia a sua divulgação', text: 'Um link profissional para usar nas redes sociais, no cartão e em anúncios.' },
] as const;

const processSteps = [
  ['Configuração', 'Você monta a prévia e vê a estimativa, sem cadastro.'],
  ['Confirmação do escopo', 'Escopo, valor e prazo confirmados por escrito.'],
  ['Desenvolvimento', 'Feito depois de receber textos, imagens e logo.'],
  ['Aprovação', 'Você revisa; duas rodadas de ajustes incluídas.'],
  ['Publicação', 'O site vai ao ar no seu domínio.'],
] as const;

const FAQ_PREVIEW = 5;

function scrollToConfigurator() {
  document.getElementById('configurador')?.scrollIntoView({ block: 'start' });
}

export default function Landing() {
  const state = useProject();
  const { project: p, hasProgress, variants } = state;
  const hero = heroVariants[variants.hero as keyof typeof heroVariants] ?? heroVariants.a;
  const cta = ctaVariants[variants.cta as keyof typeof ctaVariants] ?? ctaVariants.a;
  const primaryLabel = hasProgress ? 'Continuar minha prévia' : cta.primary;

  const start = () => track('configurator_start');

  // Barra fixa do celular: aparece quando o botão principal do topo sai da
  // tela e dá lugar à barra do configurador quando ele está na tela.
  const heroCta = useRef<HTMLAnchorElement>(null);
  const ctaGone = useScrolledPast(heroCta);
  const configInView = useInView('configurador', CONFIG_IN_VIEW_MARGIN);
  const typing = useTyping();

  return (
    <div className={s.page} id="topo">
      <Header ctaLabel={primaryLabel} onStart={start} />
      <main>
        <Hero title={hero.title} description={hero.description} primaryLabel={primaryLabel} onStart={start} ctaRef={heroCta} />
        <Examples state={state} />
        <div className={s.wrap}>
          <ul className={s.benefits} aria-label="O que o site faz pela sua empresa">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className={s.benefitIcon} aria-hidden="true">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <section className={`${s.section} ${s.band}`} id="como-funciona" aria-labelledby="processo-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="processo-titulo">Como funciona, do primeiro clique à publicação</h2>
              <p>Nada é contratado ou publicado sem a sua aprovação.</p>
            </div>
            <ol className={s.process}>
              {processSteps.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <Configurator state={state} />
        <Plans state={state} />
        <About />
        <Faq />
        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Veja como o site da sua empresa pode ficar antes de decidir.</h2>
            <p>Prévia sem cadastro. Escopo e custos confirmados antes da contratação.</p>
            <div className={s.heroActions}>
              <a className={s.primary} href="#configurador" onClick={start}>
                {primaryLabel}
              </a>
              <a className={s.secondary} href={whatsappLink(contact.whatsappCurta)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'final' })}>
                Tirar uma dúvida no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <div className={s.mobileBarSpacer} aria-hidden="true" />
      {ctaGone && !configInView && !typing && (
        <div className={`${s.mobileBar} ${s.pageBar}`} data-bar="pagina">
          <a className={`${s.primary} ${s.small}`} href="#configurador" onClick={start}>
            {primaryLabel}
          </a>
          <a
            className={s.waIcon}
            href={whatsappLink(contact.whatsappCurta)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tirar uma dúvida no WhatsApp"
            onClick={() => track('whatsapp_open', { context: 'barra_fixa' })}
          >
            <MessageCircle aria-hidden="true" />
          </a>
        </div>
      )}
      {state.ready && <PrintSummary p={p} />}
    </div>
  );
}

function Hero({ title, description, primaryLabel, onStart, ctaRef }: { title: string; description: string; primaryLabel: string; onStart: () => void; ctaRef: React.RefObject<HTMLAnchorElement | null> }) {
  return (
    <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-titulo">
      <div>
        <p className={s.audience}>Criação de sites para pequenas e médias empresas</p>
        <h1 id="hero-titulo">{title}</h1>
        <p className={s.heroLead}>{description}</p>
        <div className={s.heroActions}>
          <a ref={ctaRef} className={s.primary} href="#configurador" onClick={onStart}>
            {primaryLabel}
          </a>
          <a className={s.secondary} href={whatsappLink(contact.whatsappCurta)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'hero' })}>
            Tirar uma dúvida no WhatsApp
          </a>
        </div>
        <ul className={s.support}>
          <li>Prévia sem cadastro</li>
          <li>Escopo e custos confirmados antes da contratação</li>
          <li>
            Projetos a partir de <strong>{brl(pricing.base)}</strong>
          </li>
        </ul>
      </div>
      <div className={s.floatZone}>
        <span className={s.floatShadow} aria-hidden="true" />
        <a className={s.floatCard} href="#configurador" onClick={onStart} aria-label="Estruture seu próprio site em até 3 minutos — abrir o configurador">
          <span className={s.floatFace}>
            <span className={s.floatBadge}>
              <Clock aria-hidden="true" /> 3 min
            </span>
            <span className={s.floatTitle}>Estruture seu próprio site em até 3 minutos</span>
            <span className={s.floatPill}>Começar agora →</span>
          </span>
        </a>
        <span className={`${s.floatTag} ${s.floatTag1}`}>
          <Check aria-hidden="true" /> Estimativa na hora
        </span>
        <span className={`${s.floatTag} ${s.floatTag2}`}>
          <Check aria-hidden="true" /> Prévia no computador e no celular
        </span>
      </div>
    </section>
  );
}

/** Ponto de partida: aplica mantendo o que foi digitado; diz se precisa confirmar. */
function startingPoint(state: ProjectState, id: string) {
  const p = state.project;
  const next = mergeStartingPoint(p, exampleProject(id));
  const run = () => {
    state.replace({ ...next, step: 0 });
    track('example_applied', { segment: id });
    track('configurator_start');
    state.setNotice(`Ponto de partida aplicado: ${segments.find((x) => x.id === id)!.name}. O que você já tinha digitado foi mantido.`);
    requestAnimationFrame(() => {
      scrollToConfigurator();
      if (id === 'outro') document.getElementById('segmento-outro')?.focus({ preventScroll: true });
    });
  };
  const changes = choiceChanges(p, next);
  return { needs: state.hasProgress && hasOwnChoices(p) && changes.length > 0, changes, run };
}

function Examples({ state }: { state: ProjectState }) {
  const carousel = useRef<CarouselApi>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const applying = useRef(false);
  const [open, setOpen] = useState<number | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dialogPending, setDialogPending] = useState<Pending | null>(null);
  const [otherPending, setOtherPending] = useState<Pending | null>(null);

  // Campanha de um segmento: o carrossel começa no exemplo dele.
  const campaign = state.origin.segment;
  const start = !campaign ? 0 : campaign === 'outro' ? demoSegments.length : Math.max(0, demoSegments.findIndex((x) => x.id === campaign));

  function show(index: number) {
    setOpen(index);
    setDialogPending(null);
    track('example_opened', { segment: demoSegments[index].id });
  }

  function openAt(index: number) {
    show(index);
    dialog.current?.showModal();
  }

  function onClose() {
    const index = open;
    setOpen(null);
    setDialogPending(null);
    if (applying.current) {
      applying.current = false;
      return;
    }
    if (index === null) return;
    carousel.current?.goTo(index, false);
    cards.current[index]?.focus({ preventScroll: true });
  }

  function applyOpened() {
    if (open === null) return;
    const sp = startingPoint(state, demoSegments[open].id);
    const finish = () => {
      applying.current = true;
      dialog.current?.close();
      sp.run();
    };
    if (sp.needs) setDialogPending({ title: 'Usar este modelo substitui escolhas que você já fez.', changes: sp.changes, confirmLabel: 'Usar este modelo', apply: finish });
    else finish();
  }

  function applyOther() {
    const sp = startingPoint(state, 'outro');
    if (sp.needs) setOtherPending({ title: 'Começar com outro segmento substitui escolhas que você já fez.', changes: sp.changes, confirmLabel: 'Começar assim', apply: sp.run });
    else sp.run();
  }

  function changeDevice(next: 'desktop' | 'mobile') {
    setDevice(next);
    if (open !== null) track('example_view_mode', { segment: demoSegments[open].id, device: next === 'desktop' ? 'computador' : 'celular' });
  }

  const opened = open === null ? null : demoSegments[open];

  return (
    <section className={s.section} id="exemplos" aria-labelledby="exemplos-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="exemplos-titulo">Veja exemplos de sites</h2>
          <p>Arraste para o lado e clique para ver no computador e no celular.</p>
          <small className={s.sectionNote}>Exemplos demonstrativos, com nomes fictícios — não são sites de clientes.</small>
        </div>
      </div>
      <Carousel id="carrossel-exemplos" label="Exemplos de sites" itemLabel={(i, n) => `Exemplo ${i + 1} de ${n}`} start={start} apiRef={carousel}>
        {[
          ...demoSegments.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              type="button"
              className={s.exampleCard}
              onClick={() => openAt(i)}
              aria-label={`Abrir exemplo de ${x.name}`}
            >
              <span className={s.clickBadge} aria-hidden="true">
                <Pointer />
                <span className={s.clickText}>Clique aqui</span>
              </span>
              <span className={s.exampleThumb}>
                <InspirationPreview index={i} />
              </span>
              <span className={s.exampleName}>{x.name}</span>
              <span className={s.exampleDemo}>{x.demo}</span>
            </button>
          )),
          <div key="outro" className={`${s.exampleCard} ${s.otherCard}`}>
            <h3>Seu segmento não está aqui?</h3>
            <p>Comece por um modelo neutro e conte qual é o seu negócio.</p>
            {otherPending && <ConfirmBox pending={otherPending} onCancel={() => setOtherPending(null)} />}
            <button type="button" className={`${s.primary} ${s.small}`} onClick={applyOther}>
              Começar com outro segmento
            </button>
          </div>,
        ]}
      </Carousel>

      <dialog ref={dialog} className={s.dialog} aria-labelledby="exemplo-titulo" onClose={onClose} onClick={(ev) => ev.target === dialog.current && dialog.current?.close()}>
        {opened && open !== null && (
          <>
            <div className={s.demoHead}>
              <div>
                <h3 id="exemplo-titulo">{opened.name}</h3>
                <p>{opened.demo} · nome e textos fictícios</p>
              </div>
              <button type="button" className={s.closeButton} onClick={() => dialog.current?.close()} aria-label="Fechar demonstração" autoFocus>
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={s.viewSwitch} role="group" aria-label="Ver a demonstração no">
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => changeDevice('desktop')}>
                <Monitor aria-hidden="true" /> Computador
              </button>
              <button type="button" aria-pressed={device === 'mobile'} onClick={() => changeDevice('mobile')}>
                <Smartphone aria-hidden="true" /> Celular
              </button>
            </div>
            <div className={s.demoBody}>
              {device === 'desktop' ? (
                <DesktopFrame key={`d-${opened.id}`}>
                  <ProjectPreview project={exampleProject(opened.id)} />
                </DesktopFrame>
              ) : (
                <PhoneFrame key={`m-${opened.id}`}>
                  <ProjectPreview project={exampleProject(opened.id)} mobile bare />
                </PhoneFrame>
              )}
            </div>
            <div className={s.demoFoot}>
              {dialogPending && <ConfirmBox pending={dialogPending} onCancel={() => setDialogPending(null)} />}
              <div className={s.demoNav}>
                <button type="button" className={s.ghost} onClick={() => show(open - 1)} disabled={open === 0}>
                  <ChevronLeft aria-hidden="true" /> Anterior
                </button>
                <span aria-live="polite">
                  {open + 1} de {demoSegments.length}
                </span>
                <button type="button" className={s.ghost} onClick={() => show(open + 1)} disabled={open === demoSegments.length - 1}>
                  Próximo <ChevronRight aria-hidden="true" />
                </button>
              </div>
              <button type="button" className={s.primary} onClick={applyOpened}>
                Usar este modelo como ponto de partida
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}

function Plans({ state }: { state: ProjectState }) {
  const { project: p, hasProgress } = state;
  const [pending, setPending] = useState<{ id: string; data: Pending } | null>(null);
  const rec = recommendedPlan(p);

  function choose(id: Project['plan'] & string) {
    const next = { ...applyPlan(p, id), step: 1 };
    const run = () => {
      state.replace(next);
      track('plan_selected', { plan: id, source: 'secao' });
      track('configurator_start');
      state.setNotice(`Caminho “${plans.find((x) => x.id === id)!.name}” aplicado. Confira a recomendação e a estimativa.`);
      requestAnimationFrame(scrollToConfigurator);
    };
    const changes = choiceChanges(p, next).filter((c) => c !== 'caminho de contratação');
    if (customStructure(p).length && changes.length) setPending({ id, data: { title: 'Este caminho muda a estrutura que você ajustou.', changes, confirmLabel: 'Aplicar mesmo assim', apply: run } });
    else run();
  }

  return (
    <section className={`${s.section} ${s.band}`} id="opcoes" aria-labelledby="opcoes-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="opcoes-titulo">Opções de contratação</h2>
          <p>Escolher um caminho aplica a estrutura e recalcula a estimativa.</p>
        </div>
      </div>
      <Carousel
        id="carrossel-opcoes"
        label="Opções de contratação"
        itemLabel={(i, n) => `Opção ${i + 1} de ${n}`}
        start={hasProgress ? Math.max(0, plans.findIndex((x) => x.id === rec)) : 0}
        untilDesktop
        slideClassName={s.planSlide}
      >
        {plans.map((plan) => {
          const base = applyPlan(initialProject(), plan.id);
          const e = projectEstimate(base);
          const recommended = hasProgress && rec === plan.id;
          const current = p.plan === plan.id;
          return (
            <article key={plan.id} className={`${s.plan} ${recommended ? s.planRecommended : ''}`} aria-labelledby={`plano-${plan.id}`}>
              {recommended && <span className={s.badge}>Recomendado para este objetivo</span>}
              <h3 id={`plano-${plan.id}`}>{plan.name}</h3>
              <p className={s.planFor}>{plan.forWhom}</p>
              <p className={s.planPrice}>
                {plan.needsAssessment ? 'Faixa inicial, confirmada após o levantamento' : 'Desenvolvimento a partir de'}
                <strong>{plan.needsAssessment ? investmentLabel(base) : brl(e.min)}</strong>
              </p>
              <div className={s.planList}>
                <h4>Inclui</h4>
                <ul className={s.checkList}>
                  {plan.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
              <details className={s.planExtras}>
                <summary>
                  Ver o que fica à parte <ChevronDown aria-hidden="true" />
                </summary>
                <ul className={`${s.checkList} ${s.dashList}`}>
                  {plan.extras.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </details>
              <p className={s.planNext}>
                <strong>Próximo passo:</strong> {plan.next}
              </p>
              {pending?.id === plan.id && <ConfirmBox pending={pending.data} onCancel={() => setPending(null)} />}
              <button type="button" className={current ? s.secondary : s.primary} onClick={() => choose(plan.id)} style={{ marginTop: 'auto' }}>
                {current ? 'Caminho em uso — revisar' : 'Escolher este caminho'}
              </button>
            </article>
          );
        })}
      </Carousel>
      <div className={s.wrap}>
        <p className={s.hint} style={{ marginTop: 16 }}>
          Valores de desenvolvimento, em pagamento único, com a identidade Essencial. Domínio, hospedagem e plataformas são contratados à parte, direto com os fornecedores.
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={s.section} id="quem-atende" aria-labelledby="sobre-titulo">
      <div className={`${s.wrap} ${s.about}`}>
        <img className={s.aboutPhoto} src={asset('/brand/matheus-beck.webp')} alt={`Foto de ${contact.owner}`} width={280} height={334} loading="lazy" />
        <div>
          <h2 id="sobre-titulo">Quem cuida do seu projeto</h2>
          <p>Sou {contact.owner}, da Beck Performance. Conduzo seu projeto do escopo à publicação.</p>
          <p className={s.desktopOnly}>Além de sites, trabalho com gestão de tráfego pago — por isso a página é pensada para apresentar bem a empresa e facilitar o contato de quem chega até ela.</p>
          <ul className={`${s.checkList} ${s.aboutFacts}`}>
            <li>Atendimento direto, sem intermediários</li>
            <li>Escopo, investimento e prazo confirmados por escrito antes do início</li>
            <li>WhatsApp {contact.whatsappDisplay}</li>
          </ul>
          <div className={s.actionRow} style={{ marginTop: 18 }}>
            <a className={`${s.secondary} ${s.small}`} href={mainSiteUrl}>
              Conhecer a gestão de tráfego pago
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [all, setAll] = useState(false);
  const firstHidden = useRef<HTMLElement>(null);
  const shown = all ? projectFaq : projectFaq.slice(0, FAQ_PREVIEW);

  useEffect(() => {
    if (all) firstHidden.current?.focus();
  }, [all]);

  return (
    <section className={s.section} id="perguntas" aria-labelledby="faq-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="faq-titulo">Perguntas frequentes</h2>
          <p>O que está incluído, o que fica à parte e os próximos passos.</p>
        </div>
        <div className={s.faq} id="lista-perguntas">
          {shown.map(([q, a], i) => (
            <details key={q}>
              <summary ref={i === FAQ_PREVIEW ? firstHidden : undefined}>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        {!all && projectFaq.length > FAQ_PREVIEW && (
          <button type="button" className={`${s.secondary} ${s.faqMore}`} onClick={() => setAll(true)} aria-controls="lista-perguntas">
            Ver todas as perguntas ({projectFaq.length})
          </button>
        )}
      </div>
    </section>
  );
}
