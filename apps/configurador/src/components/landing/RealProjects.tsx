'use client';
/* ==========================================================================
   Projetos reais: captura estática (nunca iframe), selo "Projeto publicado",
   segmento, nome, a necessidade atendida, o que foi desenvolvido, "Visitar
   site" em nova aba e "Conversar sobre um projeto assim" (a mensagem do
   WhatsApp já cita o projeto). Sem pacote, preço, resultado ou depoimento
   associado. O site da própria marca é identificado como tal.
   Dados em config/proof.ts; capturas em public/projetos/.
   ========================================================================== */
import { ExternalLink, MessageCircle } from 'lucide-react';
import { projectInterestMessage } from '@/config/contact';
import { realProjects, type RealProject } from '@/config/proof';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { asset } from './Chrome';
import s from './Landing.module.css';

function Actions({ project, context }: { project: RealProject; context: string }) {
  return (
    <div className={s.projectActions}>
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
        className={`${s.secondary} ${s.visit}`}
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

function Meta({ project, level }: { project: RealProject; level: 3 | 2 }) {
  const Title = level === 2 ? 'h2' : 'h3';
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

/** Página inicial: dois cartões lado a lado no computador, empilhados no celular. */
export function RealProjectCards({ context }: { context: string }) {
  return (
    <ul className={s.projectList}>
      {realProjects.map((project) => (
        <li key={project.id} className={s.projectCard} data-own={project.ownBrand ? '' : undefined}>
          <Shot project={project} sizes="(min-width: 900px) 540px, calc(100vw - 40px)" />
          <div className={s.projectBody}>
            <Meta project={project} level={3} />
            <Actions project={project} context={context} />
          </div>
        </li>
      ))}
    </ul>
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
