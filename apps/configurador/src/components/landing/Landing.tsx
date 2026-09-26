'use client';
/* ==========================================================================
   Página de apresentação. Ordem: abertura curta → exemplos (carrossel) →
   benefícios → como funciona → investimento → quem cuida → perguntas →
   chamada final. A construção da prévia fica numa página própria (/criar/).
   ========================================================================== */
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Inbox, LayoutTemplate, ListChecks, Megaphone, MessageCircle, Monitor, Pointer, Smartphone, X } from 'lucide-react';
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
  mergeStartingPoint,
  projectEstimate,
  segments,
  type Project,
} from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { InspirationPreview } from '../InspirationPreview';
import { SitePreview } from '../preview/SitePreview';
import { Carousel, type CarouselApi } from './Carousel';
import { Footer, Header, asset, builderHref, mainSiteUrl } from './Chrome';
import { ConfirmBox, type Pending } from './Controls';
import { DesktopFrame, PhoneFrame } from './DemoFrames';
import { prefersReducedMotion } from './hooks';
import { useProject, type ProjectState } from './useProject';
import s from './Landing.module.css';

const demoSegments = segments.filter((x) => x.id !== 'outro');

const benefits = [
  { icon: LayoutTemplate, title: 'Apresenta seus serviços', text: 'O que você faz, para quem e como contratar, em uma página clara.' },
  { icon: Inbox, title: 'Facilita pedidos de orçamento', text: 'Botão de WhatsApp e, se quiser, um formulário que já chega organizado.' },
  { icon: ListChecks, title: 'Organiza as informações', text: 'Serviços, perguntas frequentes, localização e contato em um endereço só.' },
  { icon: Megaphone, title: 'Apoia a sua divulgação', text: 'Um link profissional para redes sociais, cartões e anúncios.' },
] as const;

const processSteps = [
  ['Prévia', 'Você monta a prévia e vê a estimativa, sem cadastro.'],
  ['Escopo', 'Escopo, valor e prazo confirmados por escrito.'],
  ['Desenvolvimento', 'Feito depois de receber textos, imagens e logo.'],
  ['Aprovação', 'Você revisa; duas rodadas de ajustes incluídas.'],
  ['Publicação', 'O site vai ao ar no seu domínio.'],
] as const;

const FAQ_PREVIEW = 5;

/** Vai para a página de criação (o projeto já foi gravado antes). */
function openBuilder() {
  location.href = builderHref;
}

export default function Landing() {
  const state = useProject({ readHash: false });
  const { resumable, variants } = state;
  const hero = heroVariants[variants.hero as keyof typeof heroVariants] ?? heroVariants.a;
  const cta = ctaVariants[variants.cta as keyof typeof ctaVariants] ?? ctaVariants.a;
  const primaryLabel = resumable ? 'Continuar minha prévia' : cta.primary;
  const start = () => track('configurator_start');

  // Os botões principais não abrem a criação direto: levam ao cartão
  // flutuante "Estruturar meu site profissional", que é quem abre.
  const card = useRef<HTMLAnchorElement>(null);
  const [spot, setSpot] = useState(0);
  function toCard(ev: MouseEvent<HTMLAnchorElement>) {
    ev.preventDefault();
    const target = document.getElementById('exemplos');
    const smooth = !prefersReducedMotion();
    if (target && target.getBoundingClientRect().top > 80) target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    card.current?.focus({ preventScroll: true });
    setSpot((n) => n + 1);
  }

  // Links antigos: o configurador ficava nesta página (#configurador, #projeto=…).
  useEffect(() => {
    const h = location.hash;
    if (h.startsWith('#projeto=')) location.replace(builderHref + h);
    else if (h === '#configurador') location.replace(builderHref);
  }, []);


  return (
    <div className={s.page} id="topo">
      <Header ctaLabel={primaryLabel} ctaHref="#exemplos" onStart={toCard} />
      <main id="conteudo">
        <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-titulo">
          <div className={s.heroCopy}>
            <p className={s.audience}>{hero.eyebrow}</p>
            <h1 id="hero-titulo">{hero.title}</h1>
            <p className={s.heroLead}>{hero.description}</p>
            <a className={`${s.primary} ${s.shine}`} href="#exemplos" onClick={toCard}>
              <span>{primaryLabel}</span>
            </a>
            <p className={s.micro}>Sem cadastro.</p>
            <a className={s.quiet} href={whatsappLink(contact.whatsappCurta)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'hero' })}>
              <MessageCircle aria-hidden="true" /> Tirar uma dúvida no WhatsApp
            </a>
          </div>
          <FloatingPitch />
        </section>

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
              <h2 id="processo-titulo">Como funciona</h2>
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

        <Investment state={state} />
        <About />
        <Faq />

        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Veja como o site da sua empresa pode ficar.</h2>
            <p>Monte a prévia e receba a estimativa na hora.</p>
            <div className={s.finalActions}>
              <a className={s.primary} href="#exemplos" onClick={toCard}>
                {primaryLabel}
              </a>
              <a className={s.quietLight} href={whatsappLink(contact.whatsappCurta)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'final' })}>
                <MessageCircle aria-hidden="true" /> Tirar uma dúvida no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <a ref={card} className={s.floatCta} href={builderHref} onClick={start} data-spot={spot ? (spot % 2 ? 'a' : 'b') : undefined}>
        <LayoutTemplate aria-hidden="true" />
        <span>Estruturar meu site profissional</span>
        <ArrowRight aria-hidden="true" className={s.floatArrow} />
      </a>
    </div>
  );
}

/** Quadrado 3D flutuante com a frase de destaque (decorativo, não é botão). */
function FloatingPitch() {
  return (
    <div className={s.pitch}>
      <span className={s.pitchShadow} aria-hidden="true" />
      <div className={s.pitchFloat}>
        <div className={s.pitchCube}>
          <p>Estruture seu site profissional em até 5 minutos</p>
        </div>
      </div>
    </div>
  );
}

/** Ponto de partida: aplica mantendo o que foi digitado; diz se precisa confirmar. */
function startingPoint(state: ProjectState, id: string) {
  const p = state.project;
  const next = mergeStartingPoint(p, exampleProject(id));
  const run = () => {
    state.commit({ ...next, step: 0 });
    track('example_applied', { segment: id });
    track('configurator_start');
    openBuilder();
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
    // Depois da devolução de foco do próprio <dialog>, que volta ao card que o abriu.
    requestAnimationFrame(() => cards.current[index]?.focus({ preventScroll: true }));
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
          <small className={s.sectionNote}>Exemplos demonstrativos, com nomes fictícios.</small>
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
                  <SitePreview project={exampleProject(opened.id)} />
                </DesktopFrame>
              ) : (
                <PhoneFrame key={`m-${opened.id}`}>
                  <SitePreview project={exampleProject(opened.id)} bare />
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

/** Área compacta de investimento: preço inicial e os três caminhos. */
function Investment({ state }: { state: ProjectState }) {
  const [pending, setPending] = useState<Pending | null>(null);

  function choose(id: Project['plan'] & string) {
    const p = state.project;
    const next = { ...applyPlan(p, id), step: p.name.trim() ? 2 : 0 };
    const run = () => {
      state.commit(next);
      track('plan_selected', { plan: id, source: 'investimento' });
      track('configurator_start');
      openBuilder();
    };
    const changes = choiceChanges(p, next).filter((c) => c !== 'caminho de contratação');
    if (customStructure(p).length && changes.length) setPending({ title: 'Este caminho muda a estrutura que você ajustou.', changes, confirmLabel: 'Aplicar mesmo assim', apply: run });
    else run();
  }

  return (
    <section className={s.section} id="investimento" aria-labelledby="investimento-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="investimento-titulo">Investimento</h2>
          <p>Estimativa na prévia; valor confirmado por escrito antes da contratação.</p>
        </div>
        <div className={s.invest}>
          <div className={s.investMain}>
            <span>Projetos a partir de</span>
            <strong>{brl(pricing.base)}</strong>
            <small>Pagamento único pelo desenvolvimento.</small>
          </div>
          <ul className={s.investList}>
            {plans.map((plan) => {
              const e = projectEstimate(applyPlan(initialProject(), plan.id));
              return (
                <li key={plan.id}>
                  <button type="button" onClick={() => choose(plan.id)} aria-label={`Começar a prévia com ${plan.name}`}>
                    <span className={s.investName}>{plan.name}</span>
                    <span className={s.investPrice}>{plan.needsAssessment ? 'Após levantamento' : `a partir de ${brl(e.min)}`}</span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          {pending && <ConfirmBox pending={pending} onCancel={() => setPending(null)} />}
          <p className={s.hint}>
            Domínio, hospedagem e plataformas externas são contratados à parte. <a href="#perguntas">Ver dúvidas</a>
          </p>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={`${s.section} ${s.band}`} id="quem-atende" aria-labelledby="sobre-titulo">
      <div className={`${s.wrap} ${s.about}`}>
        <img className={s.aboutPhoto} src={asset('/brand/matheus-beck.webp')} alt={`Foto de ${contact.owner}`} width={280} height={334} loading="lazy" />
        <div>
          <h2 id="sobre-titulo">Quem cuida do seu projeto</h2>
          <p>Sou {contact.owner}, da Beck Performance. Conduzo seu projeto do escopo à publicação.</p>
          <ul className={`${s.checkList} ${s.aboutFacts}`}>
            <li>Atendimento direto, sem intermediários</li>
            <li>Escopo, investimento e prazo por escrito antes do início</li>
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
