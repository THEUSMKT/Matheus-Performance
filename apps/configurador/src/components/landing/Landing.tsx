'use client';
/* ==========================================================================
   Página principal. Ordem: apresentação → exemplos → processo →
   configurador → opções de contratação → quem atende → perguntas →
   chamada final e rodapé.
   ========================================================================== */
import { useRef, useState } from 'react';
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
import { Footer, Header, asset, mainSiteUrl } from './Chrome';
import { Configurator } from './Configurator';
import { ConfirmBox, type Pending } from './Controls';
import { PrintSummary } from './SummaryStep';
import { useProject, type ProjectState } from './useProject';
import s from './Landing.module.css';

const demoSegments = segments.filter((x) => x.id !== 'outro');

const benefits = [
  ['Apresenta seus serviços', 'O que você faz, para quem e como contratar, organizado em uma página clara.'],
  ['Facilita pedidos de orçamento', 'Botão de WhatsApp e, se quiser, um formulário que já chega com as informações certas.'],
  ['Organiza as informações', 'Serviços, perguntas frequentes, localização e contato em um endereço só.'],
  ['Apoia a sua divulgação', 'Um link profissional para usar nas redes sociais, no cartão e em anúncios.'],
] as const;

const processSteps = [
  ['Configuração', 'Você monta a prévia aqui, vê a estrutura e a estimativa — sem cadastro.'],
  ['Confirmação do escopo', 'Conversamos, ajustamos o que for preciso e confirmamos escopo, valor e prazo por escrito.'],
  ['Desenvolvimento', 'Com textos, imagens e logo em mãos, o site é desenvolvido no prazo combinado.'],
  ['Aprovação', 'Você revisa e pede ajustes: duas rodadas estão incluídas antes da publicação.'],
  ['Publicação', 'O site vai ao ar no seu domínio, com orientação sobre hospedagem e acessos.'],
] as const;

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

  return (
    <div className={s.page} id="topo">
      <Header ctaLabel={primaryLabel} onStart={start} />
      <main>
        <Hero state={state} title={hero.title} description={hero.description} primaryLabel={primaryLabel} onStart={start} />
        <Examples state={state} />
        <section className={`${s.section} ${s.band}`} id="como-funciona" aria-labelledby="processo-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="processo-titulo">Como funciona, do primeiro clique à publicação</h2>
              <p>Nada é contratado ou publicado sem a sua aprovação em cada etapa.</p>
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
        <section className={s.section} id="perguntas" aria-labelledby="faq-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="faq-titulo">Perguntas frequentes</h2>
              <p>O que está incluído, o que fica à parte e como seguimos depois da prévia.</p>
            </div>
            <div className={s.faq}>
              {projectFaq.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
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
      <PrintSummary p={p} />
    </div>
  );
}

function Hero({ state, title, description, primaryLabel, onStart }: { state: ProjectState; title: string; description: string; primaryLabel: string; onStart: () => void }) {
  const campaign = state.origin.segment && state.origin.segment !== 'outro' ? state.origin.segment : null;
  const [segment, setSegment] = useState<string | null>(null);
  const shown = segment ?? campaign ?? 'local';
  const demo = exampleProject(shown);

  return (
    <>
      <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-titulo">
        <div>
          <p className={s.audience}>Criação de sites para pequenas e médias empresas</p>
          <h1 id="hero-titulo">{title}</h1>
          <p className={s.heroLead}>{description}</p>
          <div className={s.heroActions}>
            <a className={s.primary} href="#configurador" onClick={onStart}>
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
        <div className={s.heroVisual}>
          <div className={s.segmentTabs} role="group" aria-label="Ver exemplo de prévia por segmento">
            {demoSegments.map((x) => (
              <button key={x.id} type="button" aria-pressed={shown === x.id} onClick={() => setSegment(x.id)}>
                {x.name}
              </button>
            ))}
          </div>
          <ProjectPreview project={demo} compact />
          <p className={s.heroVisualNote}>Exemplo demonstrativo · {demoSegments.find((x) => x.id === shown)?.demo} é um nome fictício.</p>
        </div>
      </section>
      <div className={s.wrap}>
        <ul className={s.benefits} aria-label="O que o site faz pela sua empresa">
          {benefits.map(([t, d]) => (
            <li key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Aplica um ponto de partida; confirma só se for substituir escolhas próprias. */
function useStartingPoint(state: ProjectState) {
  const [pending, setPending] = useState<{ id: string; data: Pending } | null>(null);
  function apply(id: string, keepStep = false) {
    const p = state.project;
    const next = mergeStartingPoint(p, exampleProject(id));
    const run = () => {
      state.replace({ ...next, step: keepStep ? next.step : 0 });
      track('example_applied', { segment: id });
      track('configurator_start');
      state.setNotice(`Ponto de partida aplicado: ${segments.find((x) => x.id === id)!.name}. O que você já tinha digitado foi mantido.`);
      requestAnimationFrame(() => {
        scrollToConfigurator();
        if (id === 'outro') document.getElementById('segmento-outro')?.focus({ preventScroll: true });
      });
    };
    const changes = choiceChanges(p, next);
    if (state.hasProgress && hasOwnChoices(p) && changes.length) {
      setPending({ id, data: { title: 'Usar este exemplo substitui escolhas que você já fez.', changes, confirmLabel: 'Usar este exemplo', apply: run } });
    } else run();
  }
  return { pending, apply, cancel: () => setPending(null) };
}

function Examples({ state }: { state: ProjectState }) {
  const { pending, apply, cancel } = useStartingPoint(state);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  function enlarge(id: string, button: HTMLButtonElement) {
    opener.current = button;
    setOpen(id);
    setDevice('desktop');
    track('example_opened', { segment: id });
    dialog.current?.showModal();
  }
  const opened = open ? segments.find((x) => x.id === open)! : null;

  return (
    <section className={s.section} id="exemplos" aria-labelledby="exemplos-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="exemplos-titulo">Exemplos demonstrativos por segmento</h2>
          <p>Modelos criados para mostrar estruturas possíveis — não são sites de clientes. Amplie para ver os detalhes ou use um deles como ponto de partida.</p>
        </div>
        <div className={s.examples}>
          {demoSegments.map((x, i) => (
            <article key={x.id} className={s.exampleCard}>
              <div className={s.exampleThumb} aria-hidden="true">
                <InspirationPreview index={i} />
              </div>
              <div className={s.exampleBody}>
                <span className={s.tag}>Exemplo demonstrativo</span>
                <h3>{x.name}</h3>
                <p>
                  {x.demo} · {x.services.join(', ')}
                </p>
                {pending?.id === x.id && <ConfirmBox pending={pending.data} onCancel={cancel} />}
                <div className={s.cardActions}>
                  <button type="button" className={`${s.secondary} ${s.small}`} onClick={(ev) => enlarge(x.id, ev.currentTarget)} aria-label={`Ampliar exemplo de ${x.name}`}>
                    Ampliar
                  </button>
                  <button type="button" className={`${s.primary} ${s.small}`} onClick={() => apply(x.id)} aria-label={`Usar ${x.name} como ponto de partida`}>
                    Usar como ponto de partida
                  </button>
                </div>
              </div>
            </article>
          ))}
          <article className={`${s.exampleCard} ${s.otherCard}`}>
            <div className={s.exampleBody}>
              <h3>Seu segmento não está aqui?</h3>
              <p>Comece por um modelo neutro e conte qual é o seu negócio. A estrutura se ajusta ao objetivo que você escolher.</p>
              {pending?.id === 'outro' && <ConfirmBox pending={pending.data} onCancel={cancel} />}
              <div className={s.cardActions}>
                <button type="button" className={`${s.primary} ${s.small}`} onClick={() => apply('outro')}>
                  Começar com outro segmento
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <dialog
        ref={dialog}
        className={s.dialog}
        aria-labelledby="exemplo-titulo"
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
        onClick={(ev) => ev.target === dialog.current && dialog.current?.close()}
      >
        {opened && (
          <div className={s.dialogInner}>
            <div className={s.dialogHead}>
              <div>
                <h3 id="exemplo-titulo">
                  {opened.name} · {opened.demo}
                </h3>
                <p>Exemplo demonstrativo com nome, textos e imagens ilustrativos.</p>
              </div>
              <button type="button" className={`${s.secondary} ${s.small}`} onClick={() => dialog.current?.close()} autoFocus>
                Fechar
              </button>
            </div>
            <div className={s.deviceToggle} role="group" aria-label="Tamanho da prévia">
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
                Computador
              </button>
              <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
                Celular
              </button>
            </div>
            <div className={s.previewScroll} style={{ maxHeight: '60vh' }}>
              <ProjectPreview project={exampleProject(opened.id)} mobile={device === 'mobile'} />
            </div>
            <div className={s.actionRow}>
              <button
                type="button"
                className={s.primary}
                onClick={() => {
                  const id = opened.id;
                  dialog.current?.close();
                  apply(id);
                }}
              >
                Usar como ponto de partida
              </button>
            </div>
          </div>
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
          <p>Três pontos de partida. Escolher um aplica a estrutura no configurador e recalcula a estimativa — você ainda pode ajustar tudo.</p>
        </div>
        <div className={s.plans}>
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
                <div className={s.planList}>
                  <h4>Fica à parte</h4>
                  <ul className={`${s.checkList} ${s.dashList}`}>
                    {plan.extras.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
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
        </div>
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
          <p>
            Sou {contact.owner}, da Beck Performance. Eu mesmo conduzo o projeto: entendo o seu negócio, desenvolvo o site, faço os ajustes combinados e acompanho a publicação.
          </p>
          <p>Além de sites, trabalho com gestão de tráfego pago — por isso a página é pensada para apresentar bem a empresa e facilitar o contato de quem chega até ela.</p>
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
