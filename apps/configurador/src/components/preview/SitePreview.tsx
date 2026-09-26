/* ==========================================================================
   Prévia do site do visitante, montada a partir das escolhas reais:
   nome e logo, segmento, objetivo (texto dos botões), estilo, cores,
   seções e recursos. É uma ilustração: nada aqui envia contato ou
   formulário, e todo texto que falta aparece como exemplo editável.
   O layout se adapta à largura (container query): estreito = celular.
   ========================================================================== */
import type { CSSProperties, ReactNode } from 'react';
import { Compass, Images, MapPin, MessageCircle, PenTool, Quote, Sparkles, Store, UtensilsCrossed, Wrench } from 'lucide-react';
import { contrastInk, objectives, palettes, segments, type Project } from '@/lib/project';
import s from './Preview.module.css';

const segmentIcon: Record<string, typeof Store> = {
  local: Wrench,
  beleza: Sparkles,
  consultoria: Compass,
  criativo: PenTool,
  alimentacao: UtensilsCrossed,
  outro: Store,
};

const styleClass: Record<string, string> = { marcante: s.moderno, elegante: s.elegante, essencial: s.minimal, tecnologico: s.tecnologico, sofisticado: s.sofisticado, escuro: s.escuro };

function Tag({ children }: { children: ReactNode }) {
  return <span className={s.tag}>{children}</span>;
}

export function SitePreview({
  project: p,
  logo = null,
  compact = false,
  mobile = false,
  bare = false,
}: {
  project: Project;
  logo?: string | null;
  /** Só topo e serviços (miniaturas). */
  compact?: boolean;
  /** Força o layout de celular. */
  mobile?: boolean;
  /** Sem barra de navegador (dentro da moldura de celular). */
  bare?: boolean;
}) {
  const seg = segments.find((x) => x.id === p.segment) ?? segments[0];
  const palette = palettes.find((x) => x.id === p.palette) ?? palettes[0];
  const accent = p.custom ?? palette.accent;
  const name = p.name.trim() || seg.demo;
  const segName = p.segment === 'outro' && p.segmentOther.trim() ? p.segmentOther.trim() : seg.name;
  const cta = objectives.find((o) => o.id === p.objective)?.cta ?? 'Fale conosco';
  const intro = p.description.trim() || seg.intro;
  const services = p.service.trim() ? [p.service.trim(), ...seg.services.slice(0, 2)] : [...seg.services];
  const has = (id: string) => p.sections.includes(id);
  const feature = (id: string) => p.features.includes(id);
  const Icon = segmentIcon[p.segment] ?? Store;
  const serif = p.font === 'serif' || (p.font === 'auto' && (p.direction === 'elegante' || p.direction === 'sofisticado'));
  const vars = {
    '--acc': accent,
    '--on': contrastInk(accent),
    '--soft': palette.bg,
    '--head': serif ? 'Georgia, "Times New Roman", serif' : p.direction === 'marcante' ? '"Arial Black", "Segoe UI", Arial, sans-serif' : '"Segoe UI", system-ui, Arial, sans-serif',
  } as CSSProperties;

  const navLinks = [has('servicos') && 'Serviços', has('sobre') && 'Sobre', (has('galeria') || feature('catalogo')) && (feature('catalogo') ? 'Produtos' : 'Galeria'), feature('paginaExtra') && 'Blog']
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <div
      className={`${s.root} ${styleClass[p.direction] ?? s.minimal} ${mobile ? s.forceMobile : ''} ${bare ? s.bare : ''}`}
      style={vars}
      role="group"
      aria-roledescription="prévia"
      aria-label={`Prévia do site de ${name}`}
    >
      {bare ? (
        !compact && <div className={s.strip}>Prévia · não publicada</div>
      ) : (
        <div className={s.bar} aria-hidden="true">
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.url}>{name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'suaempresa'}.com.br</span>
          <span className={s.badge}>Prévia</span>
        </div>
      )}

      <div className={s.site}>
        <div className={s.nav}>
          {logo ? <img className={s.logo} src={logo} alt={name} /> : <span className={s.brand}>{name}</span>}
          <span className={s.links}>
            {navLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </span>
          <span className={s.navCta}>{cta}</span>
        </div>

        <div className={s.hero}>
          <div className={s.heroText}>
            <span className={s.eyebrow}>{segName}</span>
            <span className={s.title}>{seg.title}</span>
            <span className={s.lead}>{intro}</span>
            <span className={s.actions}>
              <span className={s.btn}>{cta}</span>
              {has('contato') && <span className={s.btnGhost}>WhatsApp</span>}
            </span>
          </div>
          <div className={s.art} aria-hidden="true">
            <span className={s.artShape} />
            <span className={s.artShape2} />
            <Icon className={s.artIcon} />
          </div>
        </div>

        {has('servicos') && (
          <div className={s.section}>
            <span className={s.h}>{p.objective === 'produtos' ? 'Nossos produtos' : 'O que fazemos'}</span>
            <div className={s.cards}>
              {services.map((sv, i) => (
                <div key={`${sv}-${i}`} className={s.card}>
                  <span className={s.num}>0{i + 1}</span>
                  <span className={s.cardTitle}>{sv}</span>
                  <span className={s.cardText}>Descrição curta do serviço.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!compact && (
          <>
            {feature('catalogo') && (
              <div className={s.section}>
                <span className={s.h}>Catálogo</span>
                <div className={s.products}>
                  {services.map((sv, i) => (
                    <div key={`${sv}-${i}`} className={s.product}>
                      <span className={s.productImg} />
                      <span className={s.cardTitle}>{sv}</span>
                      <span className={s.cardText}>Consulte</span>
                    </div>
                  ))}
                </div>
                <Tag>Itens de exemplo · sem pagamento online</Tag>
              </div>
            )}

            {has('sobre') && (
              <div className={s.section}>
                <span className={s.h}>Sobre nós</span>
                <span className={s.text}>Conte aqui como a empresa trabalha e o que torna o atendimento especial.</span>
                <Tag>Texto de exemplo · editável</Tag>
              </div>
            )}

            {has('galeria') && (
              <div className={s.section}>
                <span className={s.h}>Galeria</span>
                <div className={s.gallery}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={s.tile}>
                      {i === 0 && <Images />}
                    </span>
                  ))}
                </div>
                <Tag>Suas fotos entram aqui</Tag>
              </div>
            )}

            {has('depoimentos') && (
              <div className={s.section}>
                <span className={s.h}>O que dizem os clientes</span>
                <div className={s.quote}>
                  <Quote aria-hidden="true" />
                  <span className={s.text}>Espaço para depoimentos reais, com autorização dos seus clientes.</span>
                </div>
              </div>
            )}

            {has('faq') && (
              <div className={s.section}>
                <span className={s.h}>Perguntas frequentes</span>
                <div className={s.faq}>
                  <span>Como funciona o atendimento?</span>
                  <span>Quais são as formas de contato?</span>
                </div>
                <Tag>Perguntas de exemplo · editáveis</Tag>
              </div>
            )}

            {has('localizacao') && (
              <div className={s.section}>
                <span className={s.h}>Onde estamos</span>
                <div className={s.map}>
                  <MapPin aria-hidden="true" />
                  <span>Seu endereço aqui</span>
                </div>
              </div>
            )}

            {feature('instagram') && (
              <div className={s.section}>
                <span className={s.h}>No Instagram</span>
                <div className={s.gallery}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={s.tile} />
                  ))}
                </div>
              </div>
            )}

            {has('contato') && (
              <div className={`${s.section} ${s.contact}`}>
                <span className={s.h}>Vamos conversar?</span>
                {feature('formularioWhatsapp') || feature('formularioEmail') ? (
                  <div className={s.form}>
                    <span className={s.input}>Nome</span>
                    <span className={s.input}>{feature('formularioEmail') ? 'E-mail' : 'Telefone'}</span>
                    <span className={`${s.input} ${s.area}`}>Mensagem</span>
                    <span className={s.btn}>{feature('formularioEmail') ? 'Enviar mensagem' : 'Enviar pelo WhatsApp'}</span>
                  </div>
                ) : (
                  <span className={s.actions}>
                    <span className={s.btn}>{cta}</span>
                    <span className={s.btnGhost}>
                      <MessageCircle aria-hidden="true" /> WhatsApp
                    </span>
                  </span>
                )}
                {feature('agendamento') && <Tag>Agenda online conectada a uma plataforma externa</Tag>}
              </div>
            )}

            <div className={s.footer}>
              <span>© {name}</span>
              <span>Prévia demonstrativa · textos e imagens ilustrativos</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
