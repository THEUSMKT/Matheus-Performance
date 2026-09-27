/* ==========================================================================
   Prévia do site do visitante, montada a partir das escolhas reais: nome e
   logo, segmento, serviço principal, objetivo (botão e caminho de contato),
   estilo, cores e seções na ordem escolhida.

   É uma demonstração: nenhum botão abre contato ou envia formulário, e todo
   conteúdo sugerido aparece marcado como sugestão. Nada de depoimentos,
   números, selos ou endereços inventados. Cada estilo muda a composição
   (não só as cores) e o layout se adapta à largura do próprio componente.
   ========================================================================== */
import type { CSSProperties, ReactNode } from 'react';
import { Clock, HelpCircle, ImageIcon, MapPin, MessageCircle, Quote } from 'lucide-react';
import { contrastInk, objectiveOf, palettes, sectionName, siteContent, type Project } from '@/lib/project';
import { asset } from '../landing/Chrome';
import s from './Preview.module.css';

const styleClass: Record<string, string> = {
  marcante: s.moderno,
  elegante: s.elegante,
  essencial: s.minimal,
  tecnologico: s.tecnologico,
  sofisticado: s.sofisticado,
  escuro: s.escuro,
};
const darkHeader = new Set(['marcante', 'tecnologico', 'escuro', 'sofisticado']);

function Tag({ children }: { children: ReactNode }) {
  return <span className={s.tag}>{children}</span>;
}

const differentials: Record<string, string[]> = {
  orcamento: ['Orçamento pelo WhatsApp', 'Atendimento direto', 'Tudo combinado antes de começar'],
  default: ['Atendimento próximo', 'Explicação clara de cada etapa', 'Contato direto pelo WhatsApp'],
};

const processSteps: Record<string, string[]> = {
  trabalhos: ['Conversa inicial', 'Proposta e ajustes', 'Desenvolvimento e entrega'],
  default: ['Você entra em contato', 'Combinamos os detalhes', 'Execução e acompanhamento'],
};

const faqs: Record<string, string[]> = {
  agendamento: ['Como peço um horário?', 'Posso remarcar?', 'Quais formas de contato?'],
  produtos: ['Como faço um pedido?', 'Quais são as formas de entrega?', 'Vocês fazem encomendas?'],
  default: ['Como funciona o atendimento?', 'Como peço um orçamento?', 'Quais regiões vocês atendem?'],
};

export function SitePreview({
  project: p,
  logo = null,
  compact = false,
  mobile = false,
  bare = false,
}: {
  project: Project;
  logo?: string | null;
  /** Só o topo e o primeiro bloco (miniaturas). */
  compact?: boolean;
  /** Força o layout de celular. */
  mobile?: boolean;
  /** Sem barra de navegador (tela cheia ou celular). */
  bare?: boolean;
}) {
  const c = siteContent(p);
  const obj = objectiveOf(p);
  const palette = palettes.find((x) => x.id === p.palette) ?? palettes[0];
  const accent = p.custom ?? palette.accent;
  const image = asset(`/demo/${c.image}.svg`);
  const serif = p.font === 'serif' || (p.font === 'auto' && (p.direction === 'elegante' || p.direction === 'sofisticado'));
  const vars = {
    '--acc': accent,
    '--on': contrastInk(accent),
    '--soft': p.custom ? `color-mix(in srgb, ${accent} 8%, #fff)` : palette.bg,
    '--head': serif ? 'Georgia, "Times New Roman", serif' : p.direction === 'marcante' ? '"Arial Black", "Segoe UI", Arial, sans-serif' : '"Segoe UI", system-ui, Arial, sans-serif',
  } as CSSProperties;

  const middle = p.sections.filter((id) => id !== 'apresentacao' && id !== 'contato');
  const navLinks = middle.slice(0, 3).map((id) => sectionName(p, id).replace(/ em destaque$/, '').replace('Informações de atendimento', 'Atendimento'));
  const showcase = p.objective === 'produtos' || p.objective === 'trabalhos';
  const pick = <T,>(map: Record<string, T>) => map[p.objective] ?? map.default;

  const blocks: Record<string, () => ReactNode> = {
    servicos: () => (
      <div className={s.section} key="servicos">
        <span className={s.h}>{p.objective === 'orcamento' ? 'O que fazemos' : sectionName(p, 'servicos')}</span>
        <div className={showcase ? s.products : s.cards}>
          {c.services.map((sv, i) =>
            showcase ? (
              <div key={`${sv}-${i}`} className={s.product}>
                <img className={s.productImg} src={image} alt="" loading="lazy" width={480} height={360} style={{ objectPosition: `${20 + i * 30}% 50%` }} />
                <span className={s.cardTitle}>{sv}</span>
              </div>
            ) : (
              <div key={`${sv}-${i}`} className={s.card}>
                <span className={s.num}>0{i + 1}</span>
                <span className={s.cardTitle}>{sv}</span>
                <span className={s.cardText}>Descrição curta, escrita por você.</span>
              </div>
            ),
          )}
        </div>
        {c.servicesSuggested && <Tag>Sugestões · confirme ou edite</Tag>}
      </div>
    ),
    sobre: () => (
      <div className={`${s.section} ${s.about}`} key="sobre">
        <span className={s.h}>Sobre {c.name}</span>
        <span className={s.text}>Aqui entra a história da empresa e a forma de trabalhar, com as suas palavras.</span>
        <Tag>Texto seu · revisado antes de publicar</Tag>
      </div>
    ),
    diferenciais: () => (
      <div className={s.section} key="diferenciais">
        <span className={s.h}>Por que escolher {c.name}</span>
        <ul className={s.list}>
          {pick(differentials).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <Tag>Exemplos · troque pelos seus diferenciais reais</Tag>
      </div>
    ),
    atendimento: () => (
      <div className={s.section} key="atendimento">
        <span className={s.h}>Atendimento</span>
        <div className={s.info}>
          <span>
            <Clock aria-hidden="true" /> Seus dias e horários
          </span>
          <span>
            <MapPin aria-hidden="true" /> Sua região ou endereço
          </span>
          <span>
            <MessageCircle aria-hidden="true" /> {p.objective === 'agendamento' ? 'Pedido de horário pelo WhatsApp' : 'Contato pelo WhatsApp'}
          </span>
        </div>
        <Tag>Você informa estes dados</Tag>
      </div>
    ),
    processo: () => (
      <div className={s.section} key="processo">
        <span className={s.h}>Como funciona</span>
        <ol className={s.steps}>
          {pick(processSteps).map((t, i) => (
            <li key={t}>
              <b>{i + 1}</b>
              {t}
            </li>
          ))}
        </ol>
        <Tag>Etapas de exemplo · editáveis</Tag>
      </div>
    ),
    galeria: () => (
      <div className={s.section} key="galeria">
        <span className={s.h}>{p.objective === 'trabalhos' ? 'Trabalhos' : 'Galeria'}</span>
        <div className={s.gallery}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <img key={i} className={s.tile} src={image} alt="" loading="lazy" width={480} height={360} style={{ objectPosition: `${(i * 23) % 100}% ${(i * 41) % 100}%` }} />
          ))}
        </div>
        <Tag>
          <ImageIcon aria-hidden="true" /> Suas fotos entram aqui · até {p.gallery} imagens
        </Tag>
      </div>
    ),
    faq: () => (
      <div className={s.section} key="faq">
        <span className={s.h}>Perguntas frequentes</span>
        <div className={s.faq}>
          {pick(faqs).map((q) => (
            <span key={q}>{q}</span>
          ))}
        </div>
        <Tag>
          <HelpCircle aria-hidden="true" /> Perguntas de exemplo · as respostas são suas
        </Tag>
      </div>
    ),
    depoimentos: () => (
      <div className={s.section} key="depoimentos">
        <span className={s.h}>Depoimentos</span>
        <div className={s.quote}>
          <Quote aria-hidden="true" />
          <span className={s.text}>Espaço reservado para relatos reais dos seus clientes, com autorização. A prévia não inventa depoimentos.</span>
        </div>
      </div>
    ),
    vitrine: () => (
      <div className={s.section} key="vitrine">
        <span className={s.h}>{p.objective === 'produtos' ? 'Vitrine' : 'Escolha o seu'}</span>
        <div className={s.products}>
          {[...c.services, 'Item 4', 'Item 5', 'Item 6'].map((sv, i) => (
            <div key={`${sv}-${i}`} className={s.product}>
              <img className={s.productImg} src={image} alt="" loading="lazy" width={480} height={360} style={{ objectPosition: `${(i * 37) % 100}% 40%` }} />
              <span className={s.cardTitle}>{sv}</span>
              <span className={s.pill}>Pedir pelo WhatsApp</span>
            </div>
          ))}
        </div>
        <Tag>Itens de exemplo · até 10 · pedido pelo WhatsApp, sem pagamento online</Tag>
      </div>
    ),
  };

  const contactTitle = { orcamento: 'Peça seu orçamento', agendamento: 'Peça seu horário', produtos: 'Faça seu pedido' }[p.objective] ?? 'Vamos conversar?';

  return (
    <div
      className={`${s.root} ${styleClass[p.direction] ?? s.minimal} ${mobile ? s.forceMobile : ''} ${bare ? s.bare : ''}`}
      style={vars}
      role="group"
      aria-roledescription="prévia"
      aria-label={`Prévia do site de ${c.name}`}
    >
      {bare ? (
        !compact && <div className={s.strip}>Prévia demonstrativa · botões sem ação</div>
      ) : (
        <div className={s.bar} aria-hidden="true">
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.url}>{c.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '') || 'suaempresa'}.com.br</span>
          <span className={s.badge}>Prévia</span>
        </div>
      )}

      <div className={s.site}>
        <div className={s.nav}>
          {logo ? (
            <span className={`${s.logoBox} ${darkHeader.has(p.direction) ? s.logoOnDark : ''}`}>
              <img className={s.logo} src={logo} alt={c.name} />
            </span>
          ) : (
            <span className={s.brand}>{c.name}</span>
          )}
          <span className={s.links}>
            {navLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </span>
          <span className={s.navCta}>{c.cta}</span>
        </div>

        <div className={s.hero}>
          <img className={s.heroImg} src={image} alt="" width={480} height={360} />
          <div className={s.heroText}>
            <span className={s.eyebrow}>{c.segmentName}</span>
            <span className={s.title}>{c.title}</span>
            <span className={s.lead}>{c.intro}</span>
            <span className={s.actions}>
              <span className={s.btn}>{c.cta}</span>
              <span className={s.btnGhost}>
                <MessageCircle aria-hidden="true" /> WhatsApp
              </span>
            </span>
          </div>
        </div>

        {compact
          ? middle.slice(0, 1).map((id) => blocks[id]?.())
          : (
            <>
              {middle.map((id) => blocks[id]?.())}
              <div className={`${s.section} ${s.contact}`}>
                <span className={s.h}>{contactTitle}</span>
                {p.form ? (
                  <div className={s.form}>
                    <span className={s.input}>Seu nome</span>
                    <span className={s.input}>{p.objective === 'agendamento' ? 'Serviço e melhor dia' : p.objective === 'produtos' ? 'O que você quer pedir' : 'O que você precisa'}</span>
                    <span className={`${s.input} ${s.area}`}>Mensagem</span>
                    <span className={s.btn}>Enviar pelo WhatsApp</span>
                  </div>
                ) : (
                  <span className={s.actions}>
                    <span className={s.btn}>
                      <MessageCircle aria-hidden="true" /> {c.cta} pelo WhatsApp
                    </span>
                  </span>
                )}
                <span className={s.text}>{obj.contactPath}.</span>
              </div>
              <div className={s.footer}>
                <span>© {c.name}</span>
                <span>Prévia demonstrativa · textos e imagens ilustrativos</span>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
