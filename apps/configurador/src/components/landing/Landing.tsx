'use client';
/* ==========================================================================
   Página de apresentação. Ordem: os dois diferenciais e o botão principal →
   exemplos navegáveis → como funciona → pacotes e o que está incluído →
   projetos reais (só com material autorizado) → quem cuida → perguntas →
   chamada final. O botão principal abre direto a criação (/criar/).
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Monitor, Smartphone, X } from 'lucide-react';
import { contact } from '@/config/contact';
import { brl, customNeeds, packageById, packages, priceNotes, priceRange } from '@/config/packages';
import { projectFaq } from '@/config/projectFaq';
import { realProjects, testimonials } from '@/config/proof';
import { ctaVariants, heroVariants } from '@/config/experiments';
import { choiceChanges, exampleProject, hasOwnChoices, mergeStartingPoint, segments } from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { SitePreview } from '../preview/SitePreview';
import { Carousel, type CarouselApi } from './Carousel';
import { Footer, Header, asset, builderHref } from './Chrome';
import { ConfirmBox, type Pending } from './Controls';
import { DesktopFrame, PhoneFrame } from './DemoFrames';
import { HeroShowcase } from './HeroShowcase';
import { useProject, type ProjectState } from './useProject';
import s from './Landing.module.css';

const demoSegments = segments.filter((x) => x.id !== 'outro');

const processSteps = [
  ['Conte sobre sua empresa.', 'Nome, segmento e o que você quer que as pessoas façam no site.'],
  ['Personalize e veja seu investimento.', 'Escolha estilo e cores e veja o valor do pacote na hora.'],
  ['Solicite o desenvolvimento.', 'O resumo vai pronto para o WhatsApp. Nada é contratado sem você aprovar.'],
] as const;

const FAQ_PREVIEW = 5;

export default function Landing() {
  const state = useProject({ readHash: false });
  const { resumable, variants } = state;
  const hero = heroVariants[variants.hero as keyof typeof heroVariants] ?? heroVariants.a;
  const cta = ctaVariants[variants.cta as keyof typeof ctaVariants] ?? ctaVariants.a;
  const primaryLabel = resumable ? 'Continuar minha prévia' : cta.primary;
  const start = (context: string) => () => track('start_click', { context });

  // Links antigos: o configurador ficava nesta página (#configurador, #projeto=…).
  useEffect(() => {
    const h = location.hash;
    if (h.startsWith('#projeto=')) location.replace(builderHref + h);
    else if (h === '#configurador') location.replace(builderHref);
  }, []);

  return (
    <div className={s.page} id="topo">
      <Header ctaLabel={primaryLabel} onStart={start('cabecalho')} />
      <main id="conteudo">
        <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-titulo">
          <div className={s.heroCopy}>
            <h1 id="hero-titulo">{hero.title}</h1>
            <p className={s.heroLead}>
              Crie sua prévia gratuitamente. Desenvolvimento profissional de <strong>{priceRange}</strong>.
            </p>
            <p className={s.priceNote}>{priceNotes.landing}</p>
            <div className={s.heroActions}>
              <a className={`${s.primary} ${s.shine}`} href={builderHref} onClick={start('hero')}>
                <span>{primaryLabel}</span>
              </a>
              <a className={s.secondary} href="#exemplos">
                Ver exemplos de sites
              </a>
            </div>
            <p className={s.micro}>Sem cadastro. Sem compromisso.</p>
            {resumable && (
              <a className={s.quiet} href={`${builderHref}#novo`}>
                Começar uma nova prévia
              </a>
            )}
          </div>
          <HeroShowcase />
        </section>

        <Examples state={state} />

        <section className={`${s.section} ${s.band}`} id="como-funciona" aria-labelledby="processo-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="processo-titulo">Como funciona</h2>
            </div>
            <ol className={s.process}>
              {processSteps.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <p className={s.processNote}>O site final é desenvolvido depois que o escopo é confirmado e os materiais da empresa são recebidos.</p>
            <div className={s.materials}>
              <h3>Para o site final, você envia</h3>
              <ul className={s.checkList}>
                <li>A logo, se tiver</li>
                <li>Fotos da empresa, dos produtos ou dos trabalhos</li>
                <li>Serviços, horários e formas de contato</li>
              </ul>
              <p>Os textos sugeridos na prévia são revisados com você antes de entrar no site.</p>
            </div>
          </div>
        </section>

        <Investment />
        <RealWork />
        <About />
        <Faq />

        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Veja o site da sua empresa antes de contratar.</h2>
            <p>Prévia grátis em até 5 minutos. Desenvolvimento de {priceRange}.</p>
            <div className={s.finalActions}>
              <a className={s.primary} href={builderHref} onClick={start('final')}>
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
    track('start_click', { context: 'exemplo' });
    location.href = builderHref;
  };
  const changes = choiceChanges(p, next);
  return { needs: state.hasProgress && hasOwnChoices(p) && changes.length > 0, changes, run };
}

function packageNote(id: string) {
  const pkg = packageById(exampleProject(id).pkg);
  return `Pacote ${pkg.name} · ${brl(pkg.price)}`;
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
  const startAt = !campaign ? 0 : campaign === 'outro' ? demoSegments.length : Math.max(0, demoSegments.findIndex((x) => x.id === campaign));

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
          <h2 id="exemplos-titulo">Exemplos de sites</h2>
          <p>Toque em um exemplo para ver no computador e no celular.</p>
          <small className={s.sectionNote}>Exemplos demonstrativos, com nomes fictícios.</small>
        </div>
      </div>
      <Carousel id="carrossel-exemplos" label="Exemplos de sites" itemLabel={(i, n) => `Exemplo ${i + 1} de ${n}`} start={startAt} apiRef={carousel}>
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
              <span className={s.exampleThumb} aria-hidden="true">
                <DesktopFrame width={900}>
                  <SitePreview project={exampleProject(x.id)} compact />
                </DesktopFrame>
              </span>
              <span className={s.exampleName}>{x.name}</span>
              <span className={s.exampleDemo}>
                {x.demo} · {packageNote(x.id)}
              </span>
              <span className={s.exampleOpen}>
                Ver exemplo <ChevronRight aria-hidden="true" />
              </span>
            </button>
          )),
          <div key="outro" className={`${s.exampleCard} ${s.otherCard}`}>
            <h3>Outro segmento</h3>
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
                <p>Exemplo fictício · {opened.demo}</p>
              </div>
              <button type="button" className={s.closeButton} onClick={() => dialog.current?.close()} aria-label="Fechar exemplo" autoFocus>
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={s.viewSwitch} role="group" aria-label="Ver o exemplo no">
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
              <div className={s.demoUse}>
                <button type="button" className={s.primary} onClick={applyOpened}>
                  Usar este modelo
                </button>
                <small>Leva o estilo e o segmento. Começa no {packageNote(opened.id)}; você pode mudar no final.</small>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}

/** Pacotes: valor total, o que cada um inclui e o caminho para projetos fora deles. */
function Investment() {
  return (
    <section className={s.section} id="investimento" aria-labelledby="investimento-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="investimento-titulo">O que está incluído</h2>
          <p>Três pacotes de valor fixo. O preço é o total do desenvolvimento — sem cobrança por estilo ou cor.</p>
        </div>
        <ul className={s.packages}>
          {packages.map((pkg) => (
            <li key={pkg.id} className={s.package}>
              <h3>{pkg.name}</h3>
              <strong className={s.packagePrice}>{brl(pkg.price)}</strong>
              <p className={s.packageFor}>{pkg.forWhom}</p>
              <ul className={s.checkList}>
                {pkg.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className={s.packagesNote}>
          {priceNotes.payment} <a href="#perguntas">Ver o que é pago à parte</a>
        </p>
        <div className={s.customBox}>
          <h3>Precisa de algo fora dos pacotes?</h3>
          <p>
            {customNeeds
              .slice(0, 6)
              .map((n) => n.name)
              .join(' · ')}
            . Esses projetos têm orçamento separado.
          </p>
          <a
            className={`${s.secondary} ${s.small}`}
            href={whatsappLink(contact.whatsappProjetoPersonalizado)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_open', { context: 'projeto_personalizado' })}
          >
            Preciso de um projeto personalizado
          </a>
        </div>
        <div className={s.investCta}>
          <a className={s.primary} href={builderHref} onClick={() => track('start_click', { context: 'pacotes' })}>
            Criar minha prévia grátis
          </a>
          <small>Você vê o pacote que combina com o seu site antes de pedir.</small>
        </div>
      </div>
    </section>
  );
}

/**
 * Projetos reais e depoimentos. Só aparece com material autorizado em
 * config/proof.ts — sem ele, a seção não é publicada.
 */
function RealWork() {
  if (!realProjects.length && !testimonials.length) return null;
  return (
    <section className={`${s.section} ${s.band}`} id="projetos" aria-labelledby="projetos-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="projetos-titulo">Projetos reais</h2>
          <p>Sites entregues, publicados com autorização dos clientes.</p>
        </div>
        {realProjects.length > 0 && (
          <ul className={s.realList}>
            {realProjects.map((r) => (
              <li key={r.client} className={s.realCard}>
                <span className={s.realTag}>Projeto real</span>
                <div className={r.previewImage ? s.compare : undefined}>
                  {r.previewImage && (
                    <figure>
                      <img src={asset(r.previewImage)} alt={`Prévia escolhida por ${r.client}`} loading="lazy" width={640} height={400} />
                      <figcaption>Prévia escolhida</figcaption>
                    </figure>
                  )}
                  <figure>
                    <img src={asset(r.image)} alt={`Site entregue para ${r.client}`} loading="lazy" width={640} height={400} />
                    <figcaption>Site entregue</figcaption>
                  </figure>
                </div>
                <h3>{r.client}</h3>
                <p>{r.segment}</p>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    Ver o site
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {testimonials.length > 0 && (
          <ul className={s.quotes}>
            {testimonials.map((t) => (
              <li key={t.name}>
                <blockquote>{t.text}</blockquote>
                <p>
                  {t.name}
                  {t.company ? ` · ${t.company}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
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
          <p>Sou {contact.owner}, da Beck Performance. Conduzo seu site do escopo à publicação, com atendimento direto.</p>
          <ul className={`${s.checkList} ${s.aboutFacts}`}>
            <li>Escopo, valor e prazo por escrito antes do início</li>
            <li>Orientação para reunir logo, fotos e informações</li>
            <li>WhatsApp {contact.whatsappDisplay}</li>
          </ul>
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
