'use client';
/* ==========================================================================
   Página inicial — pensada primeiro para o celular, em sete blocos:
   1. título curto, os sites publicados num carrossel arrastável (em todas
      as larguras), uma ação principal ("Gerar minha prévia gratuita", ou
      "Continuar minha prévia" quando há um projeto salvo), "Conversar sobre
      meu projeto" como link discreto e o investimento em uma linha;
   2. benefícios concretos; 3. como funciona, com a demonstração do
      configurador identificada como ilustrativa;
   4. dois caminhos de contratação: pacotes e projeto sob medida;
   5. Matheus Beck e o atendimento direto; 6. dúvidas essenciais;
   7. chamada final com prévia e contato direto.
   A galeria completa de modelos e a comparação dos pacotes ficam em
   /exemplos/ e /pacotes/. Preços e condições vêm de config/packages.ts.
   Todos os caminhos principais são links comuns: funcionam mesmo se o
   JavaScript não carregar.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, LayoutList, MessageCircle, MessagesSquare, Palette, Sparkles } from 'lucide-react';
import { contact } from '@/config/contact';
import { brl, packages, priceRange } from '@/config/packages';
import { projectFaq } from '@/config/projectFaq';
import { ctaVariants, heroVariants } from '@/config/experiments';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Footer, Header, asset, builderHref, examplesHref, packagesHref } from './Chrome';
import { FloatingCta } from './FloatingCta';
import { HeroShowcase } from './HeroShowcase';
import { HeroProjects } from './HeroProjects';
import { useProject } from './useProject';
import s from './Landing.module.css';
import h from './Home.module.css';

const steps = [
  ['Conte sobre o negócio', 'Digite ou grave, em poucas frases, o que a empresa faz. Grátis e sem cadastro.'],
  ['Veja e ajuste a prévia', 'O site aparece montado. Se quiser, mude estilo, cores, textos e seções.'],
  ['Converse e confirme', 'Escopo, prazo e valor são confirmados por escrito antes de começar.'],
] as const;

const benefits = [
  {
    icon: LayoutList,
    tone: 'blue',
    title: 'Serviços bem apresentados',
    text: 'Cada serviço explicado com clareza, na ordem que ajuda o cliente a entender o que você faz.',
  },
  {
    icon: Palette,
    tone: 'lavender',
    title: 'A identidade do seu negócio',
    text: 'Sua logo, suas cores e um estilo coerente com a empresa, no celular e no computador.',
  },
  {
    icon: MessageCircle,
    tone: 'sky',
    title: 'Contato em poucos toques',
    text: 'Botão de WhatsApp e caminhos claros para pedir orçamento, agendar ou tirar uma dúvida.',
  },
] as const;

const FAQ_PREVIEW = 6;

/** Link do WhatsApp que registra o clique (não o envio da mensagem). */
function Talk({ message, context, className, children }: { message: string; context: string; className: string; children: React.ReactNode }) {
  return (
    <a className={className} href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context })}>
      {children}
      <span className={s.srOnly}> (abre o WhatsApp em nova aba)</span>
    </a>
  );
}

export default function Landing() {
  const state = useProject({ readHash: false });
  const { resumable, variants } = state;
  const title = heroVariants[variants.hero as keyof typeof heroVariants] ?? heroVariants.a;
  const cta = ctaVariants[variants.cta as keyof typeof ctaVariants] ?? ctaVariants.a;
  const primaryLabel = resumable ? 'Continuar minha prévia' : cta.primary;
  const start = (context: string) => () => track('start_click', { context });
  // Campanha de um segmento: os exemplos abrem já filtrados.
  const examplesLink = state.origin.segment && state.origin.segment !== 'outro' ? `${examplesHref}?segmento=${state.origin.segment}` : examplesHref;

  // Links antigos: o configurador ficava nesta página (#configurador, #projeto=…),
  // e os exemplos e pacotes eram seções dela (#exemplos, #investimento).
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith('#projeto=')) location.replace(builderHref + hash);
    else if (hash === '#configurador') location.replace(builderHref);
    else if (hash === '#exemplos') location.replace(examplesHref + location.search);
    else if (hash === '#investimento' || hash === '#pacotes') location.replace(packagesHref);
  }, []);

  return (
    <div className={`${s.page} ${s.bright}`} id="topo">
      <Header ctaLabel={primaryLabel} onStart={start('cabecalho')} />
      <main id="conteudo">
        {/* 1. Primeira tela, montada para o celular: título, apoio, os sites publicados
            (carrossel), a ação principal, a alternativa discreta e o investimento. */}
        <section className={h.hero} aria-labelledby="hero-titulo">
          <div className={`${s.wrap} ${h.heroGrid}`}>
            <div className={h.heroHead}>
              <h1 id="hero-titulo" className={h.heroTitle}>
                {title.lines.map((line, i) => (
                  <span key={line} className={h.line}>
                    <Marked text={line} mark={title.mark} />
                    {i < title.lines.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h1>
              <p className={h.lead}>Apresente seus serviços com clareza e facilite os pedidos de orçamento. Veja uma prévia grátis ou converse sobre o seu projeto.</p>
            </div>
            <div className={h.visual}>
              <HeroProjects />
              {/* O id mantém o atalho antigo #exemplos mesmo sem script. */}
              <p className={h.more} id="exemplos">
                <a href={examplesLink} onClick={() => track('nav_click', { target: 'exemplos', context: 'inicio' })}>
                  Explorar exemplos de sites <ArrowRight aria-hidden="true" />
                </a>
              </p>
            </div>
            <div className={h.heroAct} data-cta-zone="">
              <a className={`${s.primary} ${s.shine} ${h.mainCta}`} href={builderHref} onClick={start('hero')} data-main-cta="">
                <Sparkles aria-hidden="true" />
                <span>{primaryLabel}</span>
              </a>
              <p className={h.alt}>
                <span className={h.safe}>Sem cadastro. Sem compromisso.</span>
                <Talk className={h.talkLink} message={contact.whatsappConversa} context="inicio">
                  <MessageCircle aria-hidden="true" /> Conversar sobre meu projeto
                </Talk>
              </p>
              {resumable && (
                <p className={h.newPreview}>
                  <a href={`${builderHref}#novo`}>Começar uma nova prévia</a>
                </p>
              )}
            </div>
            <div className={h.priceLine}>
              <p>
                <strong>
                  Sites de página única: <span className={h.price}>{priceRange}</span>.
                </strong>{' '}
                Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.
              </p>
              <p className={h.priceLinks}>
                <a href={packagesHref} onClick={() => track('nav_click', { target: 'pacotes', context: 'inicio_topo' })}>
                  Ver pacotes e condições
                </a>
                <a href="#contratar">Outras necessidades: orçamento sob medida</a>
              </p>
            </div>
          </div>
        </section>

        {/* 2. Benefícios concretos */}
        <section className={`${s.section} ${h.benefitsBand}`} id="beneficios" aria-labelledby="beneficios-titulo">
          <div className={s.wrap}>
            <div className={h.head}>
              <h2 id="beneficios-titulo">
                O que o seu site <em className={h.mark}>faz pela sua empresa</em>
              </h2>
            </div>
            <ul className={h.benefits}>
              {benefits.map(({ icon: Icon, tone, title, text }) => (
                <li key={title} className={h.benefit}>
                  <span className={h.icon} data-tone={tone} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Como funciona */}
        <section className={s.section} id="como-funciona" aria-labelledby="processo-titulo">
          <div className={`${s.wrap} ${h.howGrid}`}>
            <div>
              <div className={h.head}>
                <h2 id="processo-titulo">Como funciona</h2>
                <p>Três passos curtos, e você decide com calma.</p>
              </div>
              <ol className={h.steps}>
                {steps.map(([title, text]) => (
                  <li key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className={h.demo}>
              <p className={h.demoLabel}>
                <span className={h.pill} data-tone="lavender">
                  <Sparkles aria-hidden="true" /> Exemplo ilustrativo do configurador
                </span>
              </p>
              <HeroShowcase />
            </div>
          </div>
        </section>

        {/* 4. Dois caminhos de contratação. */}
        <section className={`${s.section} ${h.pathsBand}`} id="contratar" aria-labelledby="caminhos-titulo">
          <div className={s.wrap}>
            <div className={h.head}>
              <h2 id="caminhos-titulo">
                Dois caminhos para <em className={h.mark}>contratar</em>
              </h2>
              <p>Escolha pelo que o site precisa fazer, não pelo tamanho da empresa.</p>
            </div>
            <div className={h.paths}>
              <article className={h.path} data-kind="pacotes" aria-labelledby="pacotes-resumo">
                <p className={h.pill}>Página única · valor fechado</p>
                <h3 id="pacotes-resumo">Pacotes com preço definido</h3>
                <ul className={h.pkgList}>
                  {packages.map((pkg) => (
                    <li key={pkg.id}>
                      <span className={h.pkgName}>{pkg.name}</span>
                      <span className={h.pkgPurpose}>{pkg.purpose}</span>
                      <span className={h.pkgPrice}>{brl(pkg.price)}</span>
                    </li>
                  ))}
                </ul>
                <p className={h.pathNote}>Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.</p>
                <div className={h.pathActions}>
                  <a className={s.primary} href={packagesHref} onClick={() => track('nav_click', { target: 'pacotes', context: 'inicio' })}>
                    Ver pacotes e valores
                  </a>
                </div>
              </article>
              <article className={h.path} data-kind="custom" aria-labelledby="sob-medida-titulo">
                <p className={h.pill} data-tone="lavender">
                  Sob medida
                </p>
                <h3 id="sob-medida-titulo">Seu projeto precisa ir além de uma página?</h3>
                <p>Conte o que sua empresa precisa. Definimos o escopo e preparamos uma proposta de acordo com o projeto.</p>
                <ul className={h.needList}>
                  <li>Um site com mais de uma página</li>
                  <li>Informações de várias unidades ou equipes</li>
                  <li>Um conteúdo que não cabe nos limites dos pacotes</li>
                </ul>
                <p className={h.pathNote}>O que é possível fazer e o valor são definidos na conversa, antes de qualquer compromisso.</p>
                <div className={h.pathActions}>
                  <Talk className={s.secondary} message={contact.whatsappSobMedida} context="sob_medida">
                    <MessagesSquare aria-hidden="true" /> Conversar sobre um projeto sob medida
                  </Talk>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 5. Matheus Beck */}
        <section className={s.section} id="quem-atende" aria-labelledby="sobre-titulo">
          <div className={`${s.wrap} ${h.about}`}>
            <div className={h.photoWrap}>
              <img className={h.photo} src={asset('/brand/matheus-beck.webp')} alt={`Foto de ${contact.owner}`} width={260} height={310} loading="lazy" decoding="async" />
            </div>
            <div>
              <p className={h.pill}>
                <BadgeCheck aria-hidden="true" /> Atendimento direto
              </p>
              <h2 id="sobre-titulo">Quem desenvolve o seu site</h2>
              <p>
                Sou {contact.owner}, da {contact.brand}. Conduzo seu site do escopo à publicação e falo com você diretamente, sem intermediários.
              </p>
              <ul className={h.facts}>
                <li>
                  <BadgeCheck aria-hidden="true" /> Escopo, valor e prazo por escrito antes do início
                </li>
                <li>
                  <BadgeCheck aria-hidden="true" /> Orientação para reunir logo, fotos e informações
                </li>
                <li>
                  <BadgeCheck aria-hidden="true" /> WhatsApp {contact.whatsappDisplay}
                </li>
              </ul>
              <div className={h.aboutAction}>
                <Talk className={s.secondary} message={contact.whatsappConversa} context="sobre">
                  <MessageCircle aria-hidden="true" /> Conversar com o Matheus
                </Talk>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Dúvidas essenciais */}
        <Faq />

        {/* 7. Chamada final */}
        <section className={s.final} aria-labelledby="final-titulo" data-cta-zone="">
          <div className={s.wrap}>
            <h2 id="final-titulo" className={h.finalTitle}>
              Veja o site da sua empresa <em className={h.mark}>antes de contratar.</em>
            </h2>
            <p>Crie uma prévia grátis, sem cadastro, ou converse direto sobre o seu projeto.</p>
            <div className={`${s.finalActions} ${h.finalActions}`}>
              <a className={s.primary} href={builderHref} onClick={start('final')} data-main-cta="">
                <Sparkles aria-hidden="true" /> {primaryLabel}
              </a>
              <Talk className={s.secondary} message={contact.whatsappConversa} context="final">
                <MessageCircle aria-hidden="true" /> Conversar sobre meu projeto
              </Talk>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCta label={primaryLabel} />
    </div>
  );
}

/** Texto com a expressão-chave destacada (quando ela aparece na linha). */
function Marked({ text, mark }: { text: string; mark: string }) {
  const at = text.indexOf(mark);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <em className={h.mark}>{mark}</em>
      {text.slice(at + mark.length)}
    </>
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
    <section className={`${s.section} ${h.projects}`} id="perguntas" aria-labelledby="faq-titulo">
      <div className={s.wrap}>
        <div className={h.head}>
          <h2 id="faq-titulo">Dúvidas essenciais</h2>
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
