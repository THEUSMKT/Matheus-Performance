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
import { contrastInk, headFont, objectiveOf, palettes, sectionName, siteContent, type Project } from '@/lib/project';
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

const segmentCopy: Record<string, { about: string; serviceDetails: string[]; differentials: string[]; processSteps: string[]; faqQuestions: string[] }> = {
  imoveis: {
    about: 'Uma apresentação clara do seu trabalho como corretor, dos perfis de imóvel que atende e de como orienta cada pessoa durante a busca, a visita e a negociação.',
    serviceDetails: ['Conversa inicial para entender localização, tipo de imóvel e prioridades da busca.', 'Apresentação do imóvel e organização de uma visita, conforme disponibilidade confirmada.', 'Orientação para comparar opções e entender os próximos passos da negociação.'],
    differentials: ['Busca orientada pelo que você procura', 'Informações claras antes da visita', 'Acompanhamento em cada etapa da negociação'],
    processSteps: ['Conte o que procura', 'Converse sobre opções e visita', 'Avalie os próximos passos'],
    faqQuestions: ['Quais informações ajudam a começar a busca?', 'Como funciona uma visita ao imóvel?', 'Posso conversar antes de escolher um imóvel?'],
  },
  consultoria: {
    about: 'Conheça as frentes de atuação, entenda como começa o atendimento e veja qual tipo de orientação pode fazer sentido para o seu momento.',
    serviceDetails: ['Uma primeira conversa para entender o contexto e alinhar o que precisa ser resolvido.', 'Organização de prioridades e próximos passos a partir das informações compartilhadas.', 'Acompanhamento combinado conforme o escopo definido entre as partes.'],
    differentials: ['Escopo alinhado antes do início', 'Etapas explicadas com clareza', 'Contato direto para tirar dúvidas'],
    processSteps: ['Compartilhe seu contexto', 'Alinhe escopo e prioridades', 'Defina os próximos passos'],
    faqQuestions: ['O que devo levar para a primeira conversa?', 'Como é definido o escopo do trabalho?', 'O atendimento pode ser feito online?'],
  },
  beleza: {
    about: 'Veja os cuidados disponíveis, escolha o que combina com seu objetivo e consulte os detalhes antes de pedir um horário.',
    serviceDetails: ['Converse sobre a rotina de cuidados e o serviço mais adequado ao que procura.', 'Entenda as opções de cuidado e os detalhes antes de marcar.', 'Escolha um horário para o atendimento e confirme os detalhes diretamente.'],
    differentials: ['Escolha do cuidado com orientação', 'Detalhes explicados antes do horário', 'Atendimento organizado por agendamento'],
    processSteps: ['Escolha o cuidado', 'Tire suas dúvidas', 'Peça um horário'],
    faqQuestions: ['Como escolho o cuidado mais adequado?', 'Quanto tempo devo reservar para o atendimento?', 'Como remarco um horário?'],
  },
  local: {
    about: 'Entenda quais serviços estão disponíveis, conte o que precisa ser feito e combine uma avaliação antes de definir os próximos passos.',
    serviceDetails: ['Explique o que precisa e, se possível, envie fotos ou detalhes para orientar a avaliação.', 'Combine o serviço considerando o local, o acesso e as condições do ambiente.', 'Tire dúvidas sobre o que está incluído e os cuidados depois do serviço.'],
    differentials: ['Pedido organizado desde o primeiro contato', 'Escopo combinado antes da execução', 'Orientações claras sobre as etapas'],
    processSteps: ['Conte o que precisa', 'Combine a avaliação', 'Aprove o escopo do serviço'],
    faqQuestions: ['Quais detalhes ajudam a avaliar o serviço?', 'O atendimento cobre minha região?', 'Como recebo o orçamento?'],
  },
  alimentacao: {
    about: 'Conheça as opções do cardápio, veja os detalhes de cada pedido e converse para confirmar disponibilidade e retirada ou entrega.',
    serviceDetails: ['Conheça as opções preparadas pela casa e consulte os detalhes do dia.', 'Veja tamanhos, sabores e possibilidades antes de fazer uma encomenda.', 'Informe a data e a quantidade para consultar disponibilidade.'],
    differentials: ['Opções apresentadas de forma clara', 'Pedido confirmado diretamente', 'Detalhes da encomenda alinhados antes'],
    processSteps: ['Escolha os itens', 'Consulte disponibilidade', 'Confirme os detalhes do pedido'],
    faqQuestions: ['Como consulto os itens disponíveis?', 'Com quanta antecedência devo pedir?', 'Quais são as opções de retirada ou entrega?'],
  },
  criativo: {
    about: 'Explore projetos, conheça as etapas de criação e compartilhe referências para iniciar uma conversa sobre o que você quer desenvolver.',
    serviceDetails: ['Conheça projetos e etapas de trabalho relacionados ao espaço que imagina.', 'Organize referências, necessidades e prioridades para a criação do projeto.', 'Defina escopo e entregas em uma conversa antes de iniciar.'],
    differentials: ['Processo apresentado por etapas', 'Referências consideradas no briefing', 'Escopo alinhado antes da criação'],
    processSteps: ['Compartilhe referências', 'Alinhe escopo e direção', 'Acompanhe as etapas do projeto'],
    faqQuestions: ['Que referências devo enviar?', 'Quais informações entram no briefing?', 'Como são combinadas as etapas do projeto?'],
  },
  default: {
    about: 'Apresente o que sua empresa faz, para quem trabalha e como uma pessoa interessada pode dar o primeiro passo.',
    serviceDetails: ['Entenda os detalhes do serviço e converse sobre o que precisa.', 'Veja as opções disponíveis e tire dúvidas antes de escolher.', 'Combine o atendimento e os próximos passos diretamente.'],
    differentials: ['Informações organizadas para facilitar sua escolha', 'Etapas alinhadas antes de começar', 'Contato direto para esclarecer dúvidas'],
    processSteps: ['Conte o que procura', 'Alinhe os detalhes', 'Combine os próximos passos'],
    faqQuestions: ['Como funciona o primeiro contato?', 'Quais informações devo enviar?', 'Como são combinados os próximos passos?'],
  },
};

const isRealEstateProject = (p: Project) => p.segment === 'imoveis' || /corretor|im[oó]ve|imobili[aá]ri|compra e venda|avalia[cç][aã]o de im[oó]ve/i.test(p.service);

/** Lista própria com lacunas preenchidas pelo exemplo; vazia = exemplo inteiro. */
const fill = (own: string[], example: string[]) => (own.some((t) => t.trim()) ? own.map((t, i) => t.trim() || example[i] || '').filter(Boolean) : example);

/**
 * Textos das seções exatamente como a prévia mostra: os do visitante (ou da
 * IA) e, no que faltar, os de exemplo do segmento. Usado também como
 * sugestão nos campos de edição.
 */
export function previewTexts(p: Project): Project['previewCopy'] {
  const c = siteContent(p);
  const detail = isRealEstateProject(p) ? segmentCopy.imoveis : segmentCopy[p.segment] ?? segmentCopy.default;
  return {
    about: c.previewCopy.about || detail.about,
    serviceDetails: c.services.map((_, i) => c.previewCopy.serviceDetails[i] || detail.serviceDetails[i] || detail.serviceDetails[0]),
    differentials: fill(c.previewCopy.differentials, detail.differentials),
    processSteps: fill(c.previewCopy.processSteps, detail.processSteps),
    faqQuestions: fill(c.previewCopy.faqQuestions, detail.faqQuestions),
  };
}

/** Espaço de foto, claramente marcado: nunca a mesma ilustração repetida como se fossem trabalhos diferentes. */
function PhotoSlot({ label, className }: { label: string; className: string }) {
  return (
    <span className={`${className} ${s.slot}`}>
      <ImageIcon aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function SitePreview({
  project: p,
  logo = null,
  compact = false,
  mobile = false,
  bare = false,
  demo = false,
}: {
  project: Project;
  logo?: string | null;
  /** Só o topo e o primeiro bloco (miniaturas). */
  compact?: boolean;
  /** Força o layout de celular. */
  mobile?: boolean;
  /** Sem barra de navegador (tela cheia ou celular). */
  bare?: boolean;
  /** Exemplo da apresentação: usa o nome fictício do segmento. */
  demo?: boolean;
}) {
  const c = siteContent(p, { demo });
  const obj = objectiveOf(p);
  const palette = palettes.find((x) => x.id === p.palette) ?? palettes[0];
  const accent = p.custom ?? palette.accent;
  const image = asset(`/demo/${c.image}.svg`);
  const head = headFont(p.font, p.direction);
  const vars = {
    '--acc': accent,
    '--on': contrastInk(accent),
    '--soft': p.custom ? `color-mix(in srgb, ${accent} 8%, #fff)` : palette.bg,
    '--head': head,
  } as CSSProperties;

  const middle = p.sections.filter((id) => id !== 'apresentacao' && id !== 'contato');
  const navLinks = middle.slice(0, 3).map((id) => sectionName(p, id).replace(/ em destaque$/, '').replace('Informações de atendimento', 'Atendimento'));
  const showcase = p.objective === 'produtos' || p.objective === 'trabalhos';
  const isRealEstate = isRealEstateProject(p);
  const texts = previewTexts(p);
  const serviceDetails = texts.serviceDetails;
  const region = p.details.region.trim();

  const blocks: Record<string, () => ReactNode> = {
    servicos: () => (
      <div className={s.section} key="servicos">
        <span className={s.h}>{p.objective === 'orcamento' ? 'O que fazemos' : sectionName(p, 'servicos')}</span>
        <div className={showcase ? s.products : s.cards}>
          {c.services.map((sv, i) =>
            showcase ? (
              <div key={`${sv}-${i}`} className={s.product}>
                <PhotoSlot className={s.productImg} label={p.objective === 'trabalhos' ? 'Foto do trabalho' : 'Foto do produto'} />
                <span className={s.cardTitle}>{sv}</span>
              </div>
            ) : (
              <div key={`${sv}-${i}`} className={s.card}>
                <span className={s.num}>0{i + 1}</span>
                <span className={s.cardTitle}>{sv}</span>
                <span className={s.cardText}>{serviceDetails[i]}</span>
              </div>
            ),
          )}
        </div>
      </div>
    ),
    sobre: () => (
      <div className={`${s.section} ${s.about}`} key="sobre">
        <span className={s.h}>Sobre {c.name}</span>
        <span className={s.text}>{texts.about}</span>
      </div>
    ),
    diferenciais: () => (
      <div className={s.section} key="diferenciais">
        <span className={s.h}>Por que escolher {c.name}</span>
        <ul className={s.list}>
          {texts.differentials.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
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
            <MapPin aria-hidden="true" /> {region || 'Sua região ou endereço'}
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
          {texts.processSteps.map((t, i) => (
            <li key={t}>
              <b>{i + 1}</b>
              {t}
            </li>
          ))}
        </ol>
      </div>
    ),
    galeria: () => (
      <div className={s.section} key="galeria">
        <span className={s.h}>{p.objective === 'trabalhos' ? 'Trabalhos' : 'Galeria'}</span>
        <div className={s.gallery}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PhotoSlot key={i} className={s.tile} label={`Sua foto ${i + 1}`} />
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
          {texts.faqQuestions.map((q) => (
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
              <PhotoSlot className={s.productImg} label="Foto do item" />
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
      className={`${s.root} ${styleClass[p.direction] ?? s.minimal} ${isRealEstate ? s.realEstate : ''} ${mobile ? s.forceMobile : ''} ${bare ? s.bare : ''}`}
      style={vars}
      role="group"
      aria-roledescription="prévia"
      aria-label={`Prévia do site de ${c.name}`}
    >
      {bare ? (
        !compact && <div className={s.strip}>Prévia demonstrativa · textos sugeridos para você revisar</div>
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
                <span>Prévia demonstrativa · textos sugeridos e imagens ilustrativas, revisados antes de publicar</span>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
