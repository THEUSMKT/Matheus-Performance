'use client';
/* ==========================================================================
   Página inicial — objetiva, pensada primeiro para o celular:
   1. apresentação e benefício, com "Criar minha prévia grátis" (ou
      "Continuar minha prévia" quando há um projeto salvo);
   2. dois projetos reais ("Da ideia ao ar");
   3. como funciona, em três passos;
   4. acessos às páginas internas: "Explorar exemplos de sites" e "Ver
      pacotes e valores";
   5. quem desenvolve; 6. dúvidas essenciais e chamada final.
   A galeria completa de modelos e a comparação dos pacotes ficam em
   /exemplos/ e /pacotes/. Nada flutua sobre o conteúdo.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { contact } from '@/config/contact';
import { brl, packages, priceNotes, priceRange } from '@/config/packages';
import { projectFaq } from '@/config/projectFaq';
import { ctaVariants, heroVariants } from '@/config/experiments';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Footer, Header, asset, builderHref, examplesHref, packagesHref } from './Chrome';
import { HeroShowcase } from './HeroShowcase';
import { RealProjectCards } from './RealProjects';
import { useProject } from './useProject';
import s from './Landing.module.css';

const processSteps = [
  ['Crie sua prévia', 'Conte sobre o negócio por texto ou áudio e veja o site montado. Grátis e sem cadastro.'],
  ['Ajuste e escolha o pacote', 'Mude estilo, cores, textos e seções. O valor do pacote fica sempre à vista.'],
  ['Converse e confirme', 'O resumo abre no WhatsApp. Escopo, prazo e valor são confirmados por escrito antes de começar.'],
] as const;

const FAQ_PREVIEW = 6;

export default function Landing() {
  const state = useProject({ readHash: false });
  const { resumable, variants } = state;
  const hero = heroVariants[variants.hero as keyof typeof heroVariants] ?? heroVariants.a;
  const cta = ctaVariants[variants.cta as keyof typeof ctaVariants] ?? ctaVariants.a;
  const primaryLabel = resumable ? 'Continuar minha prévia' : cta.primary;
  const start = (context: string) => () => track('start_click', { context });
  // Campanha de um segmento: os exemplos abrem já filtrados.
  const examplesLink = state.origin.segment && state.origin.segment !== 'outro' ? `${examplesHref}?segmento=${state.origin.segment}` : examplesHref;

  // Links antigos: o configurador ficava nesta página (#configurador, #projeto=…),
  // e os exemplos e pacotes eram seções dela (#exemplos, #investimento).
  useEffect(() => {
    const h = location.hash;
    if (h.startsWith('#projeto=')) location.replace(builderHref + h);
    else if (h === '#configurador') location.replace(builderHref);
    else if (h === '#exemplos') location.replace(examplesHref + location.search);
    else if (h === '#investimento' || h === '#pacotes') location.replace(packagesHref);
  }, []);

  return (
    <div className={s.page} id="topo">
      <Header ctaLabel={primaryLabel} onStart={start('cabecalho')} />
      <main id="conteudo">
        <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-titulo">
          <div className={s.heroCopy}>
            <h1 id="hero-titulo">
              {/* No celular, o título curto (o longo continua para leitores de tela). */}
              <span className={s.titleLong}>{hero.title}</span>
              <span className={s.titleShort} aria-hidden="true">
                {hero.short}
              </span>
            </h1>
            <p className={s.heroLead}>Veja uma prévia grátis. Depois, a Beck Performance desenvolve seu site com a identidade e as informações do seu negócio.</p>
            <p className={s.heroPrice}>
              Desenvolvimento de <strong>{priceRange}</strong>.
            </p>
            <p className={s.priceNote}>{priceNotes.payment}</p>
            <div className={s.heroActions}>
              <a className={`${s.primary} ${s.shine}`} href={builderHref} onClick={start('hero')} data-main-cta="">
                <span>{primaryLabel}</span>
              </a>
            </div>
            <p className={s.micro}>Sem cadastro. Sem compromisso.</p>
            <p className={s.heroLinks}>
              <a className={s.quiet} href="#projetos">
                Ver sites que já criamos
              </a>
              {resumable && (
                <a className={s.quiet} href={`${builderHref}#novo`}>
                  Começar uma nova prévia
                </a>
              )}
            </p>
          </div>
          <HeroShowcase />
        </section>

        <section className={`${s.section} ${s.projectsBand}`} id="projetos" aria-labelledby="projetos-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="projetos-titulo">Da ideia ao ar: conheça sites que criamos.</h2>
              <p>Explore dois projetos desenvolvidos pela Beck Performance e veja diferentes formas de apresentar um negócio na internet.</p>
            </div>
            <RealProjectCards context="inicio" />
          </div>
        </section>

        <section className={s.section} id="como-funciona" aria-labelledby="processo-titulo">
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
          </div>
        </section>

        <section className={s.section} id="explorar" aria-labelledby="explorar-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="explorar-titulo">Antes de começar, compare com calma</h2>
            </div>
            <div className={s.paths}>
              {/* Os ids mantêm os atalhos antigos (#exemplos, #investimento) mesmo sem script. */}
              <article className={s.path} data-path="exemplos" id="exemplos">
                <h3>Modelos por segmento</h3>
                <p>Serviços locais, beleza, consultoria, alimentação, arquitetura e imóveis. Veja cada modelo no computador e no celular e comece a sua prévia com o que mais combina com você.</p>
                <a className={s.primary} href={examplesLink} onClick={() => track('nav_click', { target: 'exemplos', context: 'inicio' })}>
                  Explorar exemplos de sites
                </a>
              </article>
              <article className={s.path} data-path="pacotes" id="investimento">
                <h3>Três pacotes, valor fechado</h3>
                <p className={s.pathPrices}>
                  {packages.map((pkg) => (
                    <span key={pkg.id}>
                      {pkg.name} <strong>{brl(pkg.price)}</strong>
                    </span>
                  ))}
                </p>
                <p>Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte. Veja o que cada pacote inclui, os prazos e as condições.</p>
                <a className={s.primary} href={packagesHref} onClick={() => track('nav_click', { target: 'pacotes', context: 'inicio' })}>
                  Ver pacotes e valores
                </a>
              </article>
            </div>
          </div>
        </section>

        <About />
        <Faq />

        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Veja o site da sua empresa antes de contratar.</h2>
            <p>Prévia grátis em poucos passos. Desenvolvimento de {priceRange}, com escopo confirmado por escrito.</p>
            <div className={s.finalActions}>
              <a className={s.primary} href={builderHref} onClick={start('final')} data-main-cta="">
                {primaryLabel}
              </a>
              <a className={s.quietLight} href={whatsappLink(contact.whatsappCurta)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'final' })}>
                <MessageCircle aria-hidden="true" /> Tirar uma dúvida no WhatsApp
                <span className={s.srOnly}> (abre em nova aba)</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function About() {
  return (
    <section className={`${s.section} ${s.band}`} id="quem-atende" aria-labelledby="sobre-titulo">
      <div className={`${s.wrap} ${s.about}`}>
        <img className={s.aboutPhoto} src={asset('/brand/matheus-beck.webp')} alt={`Foto de ${contact.owner}`} width={280} height={334} loading="lazy" />
        <div>
          <h2 id="sobre-titulo">Quem desenvolve seu site</h2>
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
