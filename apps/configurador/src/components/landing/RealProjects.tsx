'use client';
/* ==========================================================================
   Projetos reais: captura estática (nunca iframe), selo "Projeto publicado",
   segmento, nome, a necessidade atendida, o que foi desenvolvido, "Visitar
   site" em nova aba e "Conversar sobre um projeto assim" (a mensagem do
   WhatsApp já cita o projeto). Sem pacote, preço, resultado ou depoimento
   associado. O site da própria marca é identificado como tal.
   Na página inicial, os cartões formam um carrossel no celular: rolagem
   horizontal nativa com scroll-snap (o gesto vertical continua rolando a
   página), "1 de 2", anterior/próximo e a dica "Arraste para ver outro
   projeto". Sem avanço automático nem loop. Quando os dois cabem lado a
   lado, os controles somem sozinhos (não há o que rolar).
   Dados em config/proof.ts; capturas em public/projetos/.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';
import { projectInterestMessage } from '@/config/contact';
import { realProjects, type RealProject } from '@/config/proof';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { asset } from './Chrome';
import s from './Landing.module.css';

function Actions({ project, context, compact = false }: { project: RealProject; context: string; compact?: boolean }) {
  return (
    <div className={s.projectActions} data-compact={compact ? '' : undefined}>
      <a
        className={`${s.primary} ${s.visit}`}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('real_project_open', { project: project.id, context })}
        aria-label={`Visitar site: ${project.name} (abre em nova aba)`}
      >
        Visitar site
        <ExternalLink aria-hidden="true" />
      </a>
      <a
        className={compact ? s.projectTalk : `${s.secondary} ${s.visit}`}
        href={whatsappLink(projectInterestMessage(project.name))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_open', { context: 'projeto_real', project: project.id })}
        aria-label={`Conversar sobre um projeto assim: ${project.name} (abre o WhatsApp em nova aba)`}
      >
        <MessageCircle aria-hidden="true" />
        Conversar sobre um projeto assim
      </a>
    </div>
  );
}

/** Captura com a barra do navegador (endereço do site) — decorativa, o texto alternativo descreve a página. */
function Shot({ project, sizes, eager = false }: { project: RealProject; sizes: string; eager?: boolean }) {
  return (
    <figure className={s.shot}>
      <div className={s.shotBar} aria-hidden="true">
        <span className={s.shotDots}>
          <i />
          <i />
          <i />
        </span>
        <span className={s.shotUrl}>{project.domain}</span>
      </div>
      <img
        src={asset(`${project.image}-640.webp`)}
        srcSet={`${asset(`${project.image}-640.webp`)} 640w, ${asset(`${project.image}-1080.webp`)} 1080w, ${asset(`${project.image}-1280.webp`)} 1280w`}
        sizes={sizes}
        width={1280}
        height={800}
        alt={`${project.alt}, no computador`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </figure>
  );
}

function Meta({ project, level, compact = false }: { project: RealProject; level: 3 | 2; compact?: boolean }) {
  const Title = level === 2 ? 'h2' : 'h3';
  if (compact)
    return (
      <>
        <p className={s.projectBadges}>
          <span className={s.projectLive}>
            <i aria-hidden="true" /> Projeto publicado
          </span>
          {project.ownBrand && <span className={s.projectOwn}>Projeto da própria marca</span>}
        </p>
        <Title className={s.projectName}>{project.name}</Title>
        <p className={s.projectCategory}>{project.category}</p>
        <p className={s.projectText}>{project.description}</p>
        {/* O resumo acima é o que foi desenvolvido; a necessidade atendida fica em "Ver detalhes", sem corte. */}
        <details className={s.projectMore}>
          <summary>
            Ver detalhes <ChevronDown aria-hidden="true" />
          </summary>
          <p className={s.projectNeed}>
            <strong>Necessidade:</strong> {project.need}
          </p>
        </details>
      </>
    );
  return (
    <>
      <p className={s.projectBadges}>
        <span className={s.projectLive}>
          <i aria-hidden="true" /> Projeto publicado
        </span>
        {project.ownBrand && <span className={s.projectOwn}>Projeto da própria marca</span>}
      </p>
      <p className={s.projectCategory}>{project.category}</p>
      <Title className={s.projectName}>{project.name}</Title>
      <p className={s.projectNeed}>
        <strong>Necessidade:</strong> {project.need}
      </p>
      <p className={s.projectText}>
        <strong>O que foi desenvolvido:</strong> {project.description}
      </p>
    </>
  );
}

/** Página inicial: carrossel no celular; lado a lado quando cabem. */
export function RealProjectCards({ context }: { context: string }) {
  const list = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const total = realProjects.length;

  // O indicador segue a rolagem real (dedo, trackpad, teclado ou botões).
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = [...el.children] as HTMLElement[];
      setScrollable(el.scrollWidth > el.clientWidth + 4);
      const start = items[0]?.offsetLeft ?? 0;
      let best = 0;
      items.forEach((it, i) => {
        if (Math.abs(it.offsetLeft - start - el.scrollLeft) < Math.abs(items[best].offsetLeft - start - el.scrollLeft)) best = i;
      });
      // No fim da rolagem, o último cartão é o visível mesmo que não chegue ao início.
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = items.length - 1;
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function go(to: number) {
    const el = list.current;
    if (!el) return;
    const items = [...el.children] as HTMLElement[];
    const target = items[Math.max(0, Math.min(items.length - 1, to))];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: target.offsetLeft - items[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <div className={s.carousel} role="region" aria-roledescription="carrossel" aria-label="Projetos reais">
      <ul className={s.projectList} ref={list} data-carousel="">
        {realProjects.map((project, i) => (
          <li key={project.id} className={s.projectCard} data-own={project.ownBrand ? '' : undefined} aria-roledescription="projeto" aria-label={`${i + 1} de ${total}: ${project.name}`}>
            <Shot project={project} sizes="(min-width: 760px) 540px, 86vw" />
            <div className={s.projectBody}>
              <Meta project={project} level={3} compact />
              <Actions project={project} context={context} compact />
            </div>
          </li>
        ))}
      </ul>
      <div className={s.carouselNav} hidden={!scrollable}>
        <p className={s.carouselHint}>Arraste para ver outro projeto</p>
        <div className={s.carouselControls}>
          <button type="button" className={s.carouselBtn} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Projeto anterior">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className={s.carouselPos} aria-live="polite">
            {index + 1} de {total}
          </span>
          <button type="button" className={s.carouselBtn} onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Próximo projeto">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Página de exemplos: captura do computador e do celular, lado a lado. */
export function RealProjectShowcase({ context }: { context: string }) {
  return (
    <ul className={s.projectWide}>
      {realProjects.map((project, i) => (
        <li key={project.id} className={s.projectWideItem} data-own={project.ownBrand ? '' : undefined}>
          <div className={s.projectWideShots}>
            {/* Na página de exemplos a primeira captura já aparece na primeira tela: sem adiar. */}
            <Shot project={project} sizes="(min-width: 1080px) 640px, (min-width: 760px) 60vw, calc(100vw - 40px)" eager={i === 0} />
            <img
              className={s.projectPhone}
              src={asset(`${project.image}-celular-300.webp`)}
              srcSet={`${asset(`${project.image}-celular-300.webp`)} 300w, ${asset(`${project.image}-celular-600.webp`)} 600w`}
              sizes="(min-width: 760px) 170px, 34vw"
              width={300}
              height={600}
              alt={`${project.alt}, no celular`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
          <div className={s.projectBody}>
            <Meta project={project} level={3} />
            <Actions project={project} context={context} />
          </div>
        </li>
      ))}
    </ul>
  );
}
