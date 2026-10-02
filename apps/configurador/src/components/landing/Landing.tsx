'use client';
/* ==========================================================================
   Página inicial — dois caminhos de contratação:
   1. Hero: logo, orbe animado, título, dois botões (modelos / prévia grátis);
   2. Projetos reais em seção própria (#exemplos), com "Quero um site nesse
      estilo" (WhatsApp) e "Ver site";
   3. Benefícios; 4. Como funciona (site simples + site completo);
   5. Valores (pacotes e sob medida); 6. Matheus Beck; 7. FAQ; 8. CTA final.
   Preços e condições vêm de config/packages.ts. Todos os caminhos principais
   são links comuns: funcionam mesmo se o JavaScript não carregar.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Check, ChevronDown, ExternalLink, LayoutList, MessageCircle, MessagesSquare, MoveRight, Palette, Sparkles } from 'lucide-react';
import { contact, packageInterestMessage } from '@/config/contact';
import { brl, packageKeyPoints, packages, priceRange, type Package } from '@/config/packages';
import { projectFaq } from '@/config/projectFaq';
import { realProjects, testimonials, SHOW_TESTIMONIALS, type RealProject } from '@/config/proof';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Carousel } from './Carousel';
import { Footer, Header, asset, builderHref, packagesHref } from './Chrome';
import { FloatingCta } from './FloatingCta';
import { HeroShowcase } from './HeroShowcase';
import { Orbe } from './Orbe';
import { useProject } from './useProject';
import s from './Landing.module.css';
import h from './Home.module.css';

const stepsSimple = [
  ['Conte sobre o negócio', 'Digite ou grave, em poucas frases, o que a empresa faz. Grátis e sem cadastro.'],
  ['Veja e ajuste a prévia', 'O site aparece montado. Se quiser, mude estilo, cores, textos e seções.'],
  ['Converse e confirme', 'Escopo, prazo e valor são confirmados por escrito antes de começar.'],
] as const;

const stepsComplete = [
  ['Escolha um modelo', 'Veja os projetos publicados e escolha o que mais combina com a sua empresa.'],
  ['Me chame no WhatsApp', 'Conte sobre o negócio, o que a empresa faz e o que o site precisa mostrar.'],
  ['Escopo confirmado', 'Escopo, prazo e valor são confirmados por escrito antes de começar.'],
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
  const { resumable } = state;
  const start = (context: string) => () => track('start_click', { context });
  const pkgRef = useRef<HTMLDivElement>(null);
  const [pkgVisible, setPkgVisible] = useState(false);
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith('#projeto=')) location.replace(builderHref + hash);
    else if (hash === '#configurador') location.replace(builderHref);
    else if (hash === '#investimento' || hash === '#pacotes') location.replace(packagesHref);
  }, []);

  useEffect(() => {
    const el = pkgRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setPkgVisible(true); io.disconnect(); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const modelMessage = (name: string) =>
    `Olá, Matheus! Vi o site da Beck Performance e quero um site na linha do modelo da ${name} para a minha empresa.`;

  const projectOrder: RealProject[] = [
    realProjects.find((p) => p.id === 'pablo-design')!,
    realProjects.find((p) => p.id === 'matheus-beck')!,
    realProjects.find((p) => p.id === 'julia-studio')!,
    realProjects.find((p) => p.id === 'schay-corretora')!,
  ];

  return (
    <div className={`${s.page} ${s.bright}`} id="topo">
      <Header ctaLabel="Ver modelos de sites" ctaHref="#exemplos" onStart={() => track('nav_click', { target: 'exemplos', context: 'cabecalho' })} />
      <main id="conteudo">
        {/* 1. Hero: logo, orbe, título, dois caminhos */}
        <section className={h.hero} aria-labelledby="hero-titulo" data-cta-zone="">
          <div className={`${s.wrap} ${h.heroCenter}`}>
            <img className={h.heroLogo} src={asset('/brand/logo-beck-performance.png')} alt="Beck Performance" width={340} height={83} />
            <Orbe />
            <h1 id="hero-titulo" className={h.heroTitle}>
              Um site <em className={h.mark}>à altura</em> da sua empresa.
            </h1>
            <p className={h.lead}>Escolha um modelo e eu monto o seu.</p>
            <div className={h.heroBtns}>
              <a className={`${s.primary} ${h.heroBtn} ${h.heroPrimary}`} href="#exemplos" onClick={() => track('nav_click', { target: 'exemplos', context: 'hero' })}>
                Ver modelos de sites <MoveRight className={h.heroArrow} aria-hidden="true" />
              </a>
              <a className={`${s.secondary} ${h.heroBtn} ${h.heroBtnOutline}`} href={builderHref} onClick={start('hero')}>
                Prévia grátis de site simples
              </a>
            </div>
            <p className={h.safe}>Sem cadastro. Respondo no mesmo dia.</p>
            <a className={h.scrollHint} href="#exemplos" aria-label="Rolar até os exemplos de sites">
              <span>Veja os sites que já criei</span>
              <ChevronDown aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 2. Sites completos e profissionais */}
        <section className={`${s.section} ${h.exBand}`} id="exemplos" aria-labelledby="exemplos-titulo">
          <div className={s.wrap}>
            <div className={h.head}>
              <h2 id="exemplos-titulo">Sites completos e profissionais</h2>
              <p>Escolha o modelo que combina com a sua empresa e me chame no WhatsApp.</p>
            </div>
            <Carousel label="Modelos de sites" className={h.exCarousel}>
              {projectOrder.map((p, i) => (
                <div key={p.id} className={h.exCard}>
                  {i === 0 && <p className={h.exLabel}>Sites completos</p>}
                  {i === 3 && <p className={h.exLabel} data-simple="">Exemplo de site simples</p>}
                  <a className={h.exShot} href={p.url} target="_blank" rel="noopener noreferrer" draggable={false} onClick={() => track('real_project_open', { project: p.id, context: 'exemplos_home' })} aria-label={`Ver site: ${p.name} (abre em nova aba)`}>
                    <img
                      src={asset(`${p.image}-640.webp`)}
                      srcSet={`${asset(`${p.image}-640.webp`)} 640w, ${asset(`${p.image}-1080.webp`)} 1080w`}
                      sizes="(min-width: 1000px) 340px, 82vw"
                      width={640}
                      height={400}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                  <p className={h.exMeta}>
                    <strong>{p.shortName ?? p.name}</strong>
                    <span>{p.category}{p.ownBrand ? ' · marca própria' : ''}</span>
                  </p>
                  <div className={h.exActions}>
                    <a className={h.exVisit} href={p.url} target="_blank" rel="noopener noreferrer" onClick={() => track('real_project_open', { project: p.id, context: 'exemplos_home' })}>
                      Ver site <ExternalLink aria-hidden="true" />
                    </a>
                    <a
                      className={h.exWant}
                      href={whatsappLink(modelMessage(p.shortName ?? p.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('whatsapp_open', { context: 'modelo', project: p.id })}
                      aria-label={`Quero um site no estilo ${p.shortName ?? p.name} (abre o WhatsApp em nova aba)`}
                    >
                      <MessageCircle aria-hidden="true" /> Quero um site nesse estilo
                    </a>
                  </div>
                </div>
              ))}
            </Carousel>
            <p className={h.exFooter}>
              <Talk className={h.talkLink} message={contact.whatsappConversa} context="exemplos_home_footer">
                <MessageCircle aria-hidden="true" /> Não encontrou o ideal? Conte sua ideia no WhatsApp.
              </Talk>
            </p>
          </div>
        </section>

        {/* 3. Benefícios concretos */}
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

        {/* 4. Como funciona — dois caminhos */}
        <section className={s.section} id="como-funciona" aria-labelledby="processo-titulo">
          <div className={`${s.wrap} ${h.howGrid}`}>
            <div>
              <div className={h.head}>
                <h2 id="processo-titulo">Como funciona</h2>
              </div>
              <div className={h.howPaths}>
                <div className={h.howPath}>
                  <h3 className={h.howPathTitle}>
                    <Sparkles aria-hidden="true" /> Site simples (prévia)
                  </h3>
                  <ol className={h.steps}>
                    {stepsSimple.map(([title, text]) => (
                      <li key={title}>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className={h.howPath}>
                  <h3 className={h.howPathTitle}>
                    <BadgeCheck aria-hidden="true" /> Site completo
                  </h3>
                  <ol className={h.steps}>
                    {stepsComplete.map(([title, text]) => (
                      <li key={title}>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
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

        {/* 4b. Depoimentos — ocultos até receber conteúdo real */}
        {SHOW_TESTIMONIALS && testimonials.length > 0 && (
          <section className={`${s.section} ${h.testimonialsBand}`} id="depoimentos" aria-labelledby="depoimentos-titulo">
            <div className={s.wrap}>
              <div className={h.head}>
                <h2 id="depoimentos-titulo">Quem já tem o site no ar</h2>
              </div>
              <ul className={h.testimonials}>
                {testimonials.map((t) => (
                  <li key={t.name} className={h.testimonialCard}>
                    <div className={h.testimonialPhoto} aria-hidden="true" />
                    <blockquote>
                      <p>{t.text}</p>
                    </blockquote>
                    <p className={h.testimonialAuthor}>
                      <strong>{t.name}</strong>
                      {t.company && <span>{t.company}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 5. Valores */}
        <section className={`${s.section} ${h.pathsBand}`} id="contratar" aria-labelledby="valores-titulo">
          <div className={s.wrap}>
            <div className={h.head}>
              <h2 id="valores-titulo">Valores</h2>
              <p>Escolha pelo que o site precisa fazer, não pelo tamanho da empresa.</p>
            </div>
            <div ref={pkgRef} className={h.pkgCarousel} data-visible={pkgVisible ? '' : undefined}>
              <Carousel label="Pacotes de desenvolvimento">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </Carousel>
            </div>
            <p className={h.pathNote}>Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.</p>
            <article className={h.customPath} aria-labelledby="sob-medida-titulo">
              <p className={h.pill} data-tone="lavender">
                Sob medida
              </p>
              <h3 id="sob-medida-titulo">Seu projeto precisa ir além de uma página?</h3>
              <p>Conte o que sua empresa precisa. Definimos o escopo e preparamos uma proposta.</p>
              <div className={h.pathActions}>
                <Talk className={s.secondary} message={contact.whatsappSobMedida} context="sob_medida">
                  <MessagesSquare aria-hidden="true" /> Conversar sobre um projeto sob medida
                </Talk>
              </div>
            </article>
          </div>
        </section>

        {/* 6. Matheus Beck */}
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
                  <BadgeCheck aria-hidden="true" /> Resposta pelo WhatsApp normalmente no mesmo dia
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
            <p>Escolha um modelo ou gere uma prévia de site simples, sem cadastro.</p>
            <div className={`${s.finalActions} ${h.finalActions}`}>
              <a className={`${s.primary} ${s.shine}`} href="#exemplos" onClick={() => track('nav_click', { target: 'exemplos', context: 'final' })} data-main-cta="">
                Ver modelos de sites <MoveRight aria-hidden="true" />
              </a>
              <a className={s.secondary} href={builderHref} onClick={start('final')}>
                Prévia grátis de site simples
              </a>
              <Talk className={s.secondary} message={contact.whatsappConversa} context="final">
                <MessageCircle aria-hidden="true" /> Conversar sobre meu projeto
              </Talk>
            </div>
            <p className={h.reassurance} style={{ color: 'rgb(255 255 255 / 0.65)' }}>Quem responde sou eu, normalmente no mesmo dia.</p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCta />
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

function PackageCard({ pkg }: { pkg: Package }) {
  const points = packageKeyPoints(pkg);
  const popular = pkg.id === 'profissional';
  return (
    <article className={h.pkgCard} data-popular={popular ? '' : undefined}>
      {popular && <span className={h.pkgBadge}>Mais escolhido</span>}
      <h3 className={h.pkgName}>{pkg.name}</h3>
      <p className={h.pkgFor}>{pkg.forWhom}</p>
      <p className={h.pkgPrice}>{brl(pkg.price)}</p>
      <ul className={h.pkgPoints}>
        {points.map((pt) => (
          <li key={pt}>
            <Check aria-hidden="true" /> {pt}
          </li>
        ))}
      </ul>
      <p className={h.pkgDeadline}>Prazo: {pkg.deadline}</p>
      <a
        className={h.pkgAction}
        href={whatsappLink(packageInterestMessage(pkg.name, brl(pkg.price)))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_open', { context: 'pacote', package: pkg.id })}
      >
        <MessageCircle aria-hidden="true" /> Falar sobre o pacote {pkg.name}
      </a>
    </article>
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
