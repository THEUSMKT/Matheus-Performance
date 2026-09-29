/* ==========================================================================
   Prévia do site do visitante. Tudo vem do plano (lib/plan.ts): a família
   visual define a composição (topo, serviços, ritmo das seções, celular), o
   estilo define tons e formas, o pacote define quais seções existem.

   É uma demonstração: nenhum botão abre contato ou envia formulário, e
   nada é inventado (depoimentos, números, selos, endereços, preços). As
   imagens são ilustrações do catálogo (config/assets.ts), identificadas
   como ilustrativas; sem imagem adequada, o topo é tipográfico. O layout
   se adapta à largura do próprio componente (container query).
   ========================================================================== */
import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowRight,
  Bath,
  Briefcase,
  Cake,
  Calculator,
  CalendarCheck,
  Camera,
  Car,
  Check,
  ChefHat,
  ClipboardList,
  Clock,
  Compass,
  Dumbbell,
  GraduationCap,
  HandHeart,
  House,
  KeyRound,
  MapPin,
  MessageCircle,
  Package,
  Paintbrush,
  Palette,
  PenTool,
  Plus,
  Quote,
  Ruler,
  Scale,
  Scissors,
  ShoppingBag,
  Snowflake,
  Sofa,
  Sparkles,
  SprayCan,
  Stethoscope,
  Syringe,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { ASSET_HEIGHT, ASSET_WIDTH, type Asset, type AssetCrop } from '@/config/assets';
import { currentPackage, previewTexts as texts, type Project } from '@/lib/project';
import { previewPlan, type PreviewPlan } from '@/lib/plan';
import { asset as assetUrl } from '../landing/Chrome';
import s from './Preview.module.css';

/** Mantido para quem importava daqui: os textos das seções como a prévia mostra. */
export const previewTexts = texts;

const cx = (...list: (string | false | null | undefined)[]) => list.filter(Boolean).join(' ');

/* ── Ícones dos serviços (só quando a palavra combina; senão, um marcador neutro) ── */

const ICONS: [RegExp, LucideIcon][] = [
  [/vacin/i, Syringe],
  [/consulta|cl[ií]nic|veterin|check-?up|exame|preventiv/i, Stethoscope],
  [/banho|hidrata/i, Bath],
  [/tosa|corte|barba|cabel/i, Scissors],
  [/ra[cç][aã]o|produto|acess[oó]rio|brinquedo|petisco|loja|novidade|pe[cç]as/i, ShoppingBag],
  [/limpeza|faxina|higieniza/i, SprayCan],
  [/organiza/i, Package],
  [/pintur|textura/i, Paintbrush],
  [/el[eé]tric|disjuntor|tomada/i, Zap],
  [/ar-?condicionado|climatiza|refrigera/i, Snowflake],
  [/reparo|instala|reforma|manuten|conserto/i, Wrench],
  [/bolo|doce|confeit|torta|sobremesa/i, Cake],
  [/marmita|refei|prato|card[aá]pio|buffet|almo[cç]o|coffee/i, UtensilsCrossed],
  [/p[aã]es|padaria|caf[eé]/i, ChefHat],
  [/interior|decora/i, Sofa],
  [/projeto|arquitet|planta/i, Ruler],
  [/foto|ensaio/i, Camera],
  [/design|identidade|marca|arte/i, Palette],
  [/im[oó]ve|compra|venda|loca[cç]|aluguel/i, House],
  [/visita/i, KeyRound],
  [/contab|imposto|fiscal/i, Calculator],
  [/jur[ií]d|contrato|processo judicial/i, Scale],
  [/diagn[oó]stic|planejamento|estrat[eé]g/i, Compass],
  [/consultoria|acompanhamento|mentoria/i, Briefcase],
  [/treino|aula em grupo|avalia[cç][aã]o f[ií]sica|pilates/i, Dumbbell],
  [/aula|curso|turma|viol[aã]o|piano|canto|idioma/i, GraduationCap],
  [/revis[aã]o|[oó]leo|freio|pneu|motor/i, Car],
  [/est[eé]tica|pele|sobrancelh|facial|unha|manicure|pedicure/i, Sparkles],
  [/cuidado|orienta/i, HandHeart],
  [/conversa|atendimento/i, MessageCircle],
  [/proposta|or[cç]amento/i, ClipboardList],
  [/escrita|texto|redação/i, PenTool],
];
const iconFor = (name: string): LucideIcon => ICONS.find(([re]) => re.test(name))?.[1] ?? Check;

/* ── Peças comuns ─────────────────────────────────────────────────────────── */

/** Imagem do catálogo com corte e ponto focal. Ilustrativa: o texto alternativo diz o que é. */
function Media({ item, crop, className, lazy, caption }: { item: Asset; crop: AssetCrop; className?: string; lazy?: boolean; caption?: string }) {
  return (
    <figure className={cx(s.media, className)} data-crop={crop}>
      <img
        src={assetUrl(`/demo/${item.id}.svg`)}
        alt={item.alt}
        width={ASSET_WIDTH}
        height={ASSET_HEIGHT}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
        style={{ objectPosition: item.focal }}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

const initials = (name: string) =>
  name
    .replace(/&/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || name.slice(0, 1).toUpperCase();

/** Topo sem imagem: a marca e os serviços viram a composição (nunca uma imagem errada). */
function TypePanel({ plan, className }: { plan: PreviewPlan; className?: string }) {
  const letters = plan.name.provisional ? null : initials(plan.name.text);
  const Icon = iconFor(`${plan.subsegment.name} ${plan.content.services[0] ?? ''}`);
  return (
    <div className={cx(s.typePanel, className)} aria-hidden="true">
      <span className={s.typeMark}>{letters ?? <Icon />}</span>
      <span className={s.typeList}>
        {plan.content.services.slice(0, 3).map((x) => (
          <span key={x}>{x}</span>
        ))}
      </span>
    </div>
  );
}

function Actions({ plan, className }: { plan: PreviewPlan; className?: string }) {
  return (
    <span className={cx(s.actions, className)}>
      <span className={s.btn}>
        {!plan.ctaNavigates && <MessageCircle aria-hidden="true" />}
        {plan.cta}
      </span>
      {plan.secondary && (
        <span className={s.link}>
          {plan.secondary} <ArrowRight aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

function HeroCopy({ plan, className, children, titleClass }: { plan: PreviewPlan; className?: string; children?: ReactNode; titleClass?: string }) {
  return (
    <div className={cx(s.heroCopy, className)}>
      <span className={s.eyebrow}>{plan.content.segmentName}</span>
      <span className={cx(s.title, titleClass)}>
        {plan.content.title}
      </span>
      <span className={s.lead}>{plan.content.intro}</span>
      <Actions plan={plan} />
      {children}
    </div>
  );
}

function HeroImage({ plan, crop, className, lazy }: { plan: PreviewPlan; crop: AssetCrop; className?: string; lazy?: boolean }) {
  return plan.heroAsset ? <Media item={plan.heroAsset} crop={crop} className={className} lazy={lazy} /> : <TypePanel plan={plan} className={className} />;
}

/* ── Primeira dobra de cada família ───────────────────────────────────────── */

function Hero({ plan, lazy }: { plan: PreviewPlan; lazy: boolean }) {
  const { family, variant, content } = plan;
  const services = content.services.slice(0, 3);
  const id = `${family.id}/${variant.id}`;

  switch (id) {
    case 'local/oferta':
      return (
        <section className={cx(s.hero, s.heroSplit)}>
          <HeroCopy plan={plan}>
            <ul className={s.checks}>
              {services.map((x) => (
                <li key={x}>
                  <Check aria-hidden="true" /> {x}
                </li>
              ))}
            </ul>
          </HeroCopy>
          <HeroImage plan={plan} crop="4:3" className={s.heroMedia} lazy={lazy} />
        </section>
      );
    case 'local/faixa':
    case 'alimentacao/mesa':
    case 'imobiliario/orientacao':
      return (
        <section className={cx(s.hero, s.heroBand)}>
          <HeroImage plan={plan} crop="16:9" className={s.bandMedia} lazy={lazy} />
          <HeroCopy plan={plan} className={s.card}>
            {family.id === 'imobiliario' && (
              <ol className={s.miniSteps}>
                {plan.texts.processSteps.slice(0, 3).map((x, i) => (
                  <li key={x}>
                    <b>{i + 1}</b> {x}
                  </li>
                ))}
              </ol>
            )}
          </HeroCopy>
          {family.id !== 'imobiliario' && (
            <ul className={s.chips}>
              {services.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          )}
        </section>
      );
    case 'beleza/editorial':
      return (
        <section className={cx(s.hero, s.heroCover, !plan.heroAsset && s.noImage)}>
          {plan.heroAsset && <Media item={plan.heroAsset} crop="3:4" className={s.coverMedia} lazy={lazy} />}
          <HeroCopy plan={plan} className={s.coverCopy} />
        </section>
      );
    case 'beleza/retrato':
      return (
        <section className={cx(s.hero, s.heroPortrait)}>
          <HeroImage plan={plan} crop="3:4" className={s.arch} lazy={lazy} />
          <HeroCopy plan={plan} />
        </section>
      );
    case 'consultoria/declaracao':
      return (
        <section className={cx(s.hero, s.heroStatement)}>
          <span className={s.eyebrow}>{content.segmentName}</span>
          <span className={cx(s.title, s.statement)}>
            {content.title}
          </span>
          <div className={s.statementRow}>
            <span className={s.lead}>{content.intro}</span>
            <Actions plan={plan} />
          </div>
          <ol className={s.areas} aria-label={plan.titles.servicos}>
            {services.map((x, i) => (
              <li key={x}>
                <b>{String(i + 1).padStart(2, '0')}</b> {x}
              </li>
            ))}
          </ol>
        </section>
      );
    case 'portfolio/galeria':
      return (
        <section className={cx(s.hero, s.heroOpening)}>
          <HeroImage plan={plan} crop="16:9" className={s.openingMedia} lazy={lazy} />
          <div className={s.openingText}>
            <span className={s.caption}>{plan.heroAsset ? `${plan.heroAsset.caption} · imagem ilustrativa` : content.segmentName}</span>
            <span className={cx(s.title, s.light)}>
              {content.title}
            </span>
            <div className={s.openingSide}>
              <span className={s.lead}>{content.intro}</span>
              <Actions plan={plan} />
            </div>
          </div>
        </section>
      );
    case 'portfolio/indice':
      return (
        <section className={cx(s.hero, s.heroIndex)}>
          <span className={s.eyebrow}>{content.segmentName}</span>
          <span className={cx(s.title, s.light)}>
            {content.title}
          </span>
          <div className={s.indexRow}>
            <ol className={s.index}>
              {services.map((x, i) => (
                <li key={x}>
                  <b>{String(i + 1).padStart(2, '0')}</b> {x}
                </li>
              ))}
            </ol>
            <div className={s.indexSide}>
              <span className={s.lead}>{content.intro}</span>
              <Actions plan={plan} />
            </div>
          </div>
          {plan.heroAsset && <Media item={plan.heroAsset} crop="16:9" className={s.indexBand} lazy={lazy} />}
        </section>
      );
    case 'imobiliario/apresentacao': {
      const Icon = iconFor(plan.subsegment.name);
      return (
        <section className={cx(s.hero, s.heroSplit, s.heroAgent)}>
          <HeroCopy plan={plan}>
            <span className={s.agent}>
              <span className={s.monogram} aria-hidden="true">
                {plan.name.provisional ? <Icon /> : initials(plan.name.text)}
              </span>
              <span>
                <b>{plan.name.text}</b>
                <small>{plan.subsegment.generic ? content.segmentName : plan.subsegment.name}</small>
              </span>
            </span>
          </HeroCopy>
          <HeroImage plan={plan} crop="4:3" className={s.heroMedia} lazy={lazy} />
        </section>
      );
    }
    case 'pet/acolhimento':
      return (
        <section className={cx(s.hero, s.heroSplit, s.heroCare)}>
          <HeroCopy plan={plan} />
          <div className={s.careMedia}>
            <HeroImage plan={plan} crop="4:3" className={s.heroMedia} lazy={lazy} />
            <span className={s.carePill}>
              <CalendarCheck aria-hidden="true" /> {plan.subsegment.id === 'pet-shop' || plan.ctaNavigates ? 'Pedidos pelo WhatsApp' : 'Horário combinado pelo WhatsApp'}
            </span>
          </div>
        </section>
      );
    case 'pet/cuidados':
      return (
        <section className={cx(s.hero, s.heroTiles)}>
          <HeroCopy plan={plan} />
          <ul className={s.tiles}>
            {services.map((x) => {
              const Icon = iconFor(x);
              return (
                <li key={x}>
                  <Icon aria-hidden="true" /> {x}
                </li>
              );
            })}
          </ul>
          <HeroImage plan={plan} crop="16:9" className={s.tilesMedia} lazy={lazy} />
        </section>
      );
    case 'alimentacao/cardapio':
      return (
        <section className={cx(s.hero, s.heroSplit, s.heroMenu)}>
          <HeroCopy plan={plan}>
            <ul className={s.menuList}>
              {services.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </HeroCopy>
          <HeroImage plan={plan} crop="1:1" className={s.plate} lazy={lazy} />
        </section>
      );
    case 'institucional/tipografico':
      return (
        <section className={cx(s.hero, s.heroSplit, s.heroMonogram)}>
          <HeroCopy plan={plan} />
          <TypePanel plan={plan} className={s.heroMedia} />
        </section>
      );
    case 'consultoria/painel':
    case 'institucional/equilibrio':
    default:
      return (
        <section className={cx(s.hero, s.heroSplit)}>
          <HeroCopy plan={plan} />
          <HeroImage plan={plan} crop="4:3" className={s.heroMedia} lazy={lazy} />
        </section>
      );
  }
}

/* ── Seções ───────────────────────────────────────────────────────────────── */

function Section({ id, title, children, className, note }: { id: string; title: string; children: ReactNode; className?: string; note?: string }) {
  return (
    <section className={cx(s.section, className)} data-section={id}>
      <span className={s.h}>
        {title}
      </span>
      {children}
      {note && <span className={s.note}>{note}</span>}
    </section>
  );
}

/** Serviços na apresentação da família. Com poucos serviços, a grade se ajusta (nada de espaço vazio). */
function Services({ plan, lazy }: { plan: PreviewPlan; lazy: boolean }) {
  const list = plan.content.services;
  const details = plan.texts.serviceDetails;
  const layout = plan.showcase ? 'produtos' : plan.family.services;
  const count = { '--n': Math.min(list.length, 3) } as CSSProperties;
  const n = list.length;

  if (layout === 'produtos') {
    return (
      <ul className={s.products} style={count} data-count={n}>
        {list.map((x, i) => {
          const img = plan.items[i];
          return (
            <li key={`${x}-${i}`}>
              {img ? (
                <Media item={img} crop="4:3" className={s.productMedia} lazy={lazy} />
              ) : (
                <span className={s.productType} aria-hidden="true">
                  {x.slice(0, 1)}
                </span>
              )}
              <span className={s.productText}>
                <b>{x}</b>
                {details[i] && <span>{details[i]}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
  if (layout === 'menu') {
    return (
      <ul className={s.menu} style={count} data-count={n}>
        {list.map((x, i) => (
          <li key={`${x}-${i}`}>
            <b>{x}</b>
            {details[i] && <span>{details[i]}</span>}
          </li>
        ))}
      </ul>
    );
  }
  if (layout === 'colunas' || layout === 'indice') {
    return (
      <ol className={layout === 'colunas' ? s.columns : s.indexList} style={count} data-count={n}>
        {list.map((x, i) => (
          <li key={`${x}-${i}`}>
            <em>{String(i + 1).padStart(2, '0')}</em>
            <b>{x}</b>
            {details[i] && <span>{details[i]}</span>}
          </li>
        ))}
      </ol>
    );
  }
  // lista (serviços locais), icones (pet), cartoes (imobiliário, institucional)
  const cls = layout === 'lista' ? s.list : layout === 'icones' ? s.iconTiles : s.cards;
  return (
    <ul className={cls} style={count} data-count={n}>
      {list.map((x, i) => {
        const Icon = iconFor(x);
        return (
          <li key={`${x}-${i}`}>
            {layout === 'cartoes' && plan.family.id === 'institucional' ? (
              <em aria-hidden="true">{String(i + 1).padStart(2, '0')}</em>
            ) : (
              <i aria-hidden="true">
                <Icon />
              </i>
            )}
            <b>{x}</b>
            {details[i] && <span>{details[i]}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Blocks({ plan, p, id, lazy }: { plan: PreviewPlan; p: Project; id: string; lazy: boolean }): ReactNode {
  const t = plan.titles;
  const region = p.details.region.trim();
  switch (id) {
    case 'servicos':
      return (
        <Section id={id} title={t.servicos} key={id} className={s.sServices}>
          <Services plan={plan} lazy={lazy} />
        </Section>
      );
    case 'sobre': {
      // Uma imagem de apoio só onde a família pede e se sobrar uma adequada.
      const side = ['beleza', 'alimentacao', 'portfolio'].includes(plan.family.id) ? plan.aside : null;
      return (
        <Section id={id} title={t.sobre} key={id} className={cx(s.sAbout, side && s.withSide)}>
          <span className={s.text}>{plan.texts.about}</span>
          {side && <Media item={side} crop="4:3" className={s.sideMedia} lazy />}
        </Section>
      );
    }
    case 'diferenciais':
      return (
        <Section id={id} title={t.diferenciais} key={id} className={s.sDiffs}>
          <ul className={s.diffs}>
            {plan.texts.differentials.map((d) => (
              <li key={d}>
                <Check aria-hidden="true" /> {d}
              </li>
            ))}
          </ul>
        </Section>
      );
    case 'atendimento':
      return (
        <Section id={id} title={t.atendimento} key={id} className={s.sInfo}>
          <ul className={s.info}>
            <li>
              <MessageCircle aria-hidden="true" /> {plan.contactNote}
            </li>
            {region && (
              <li>
                <MapPin aria-hidden="true" /> Atende em {region}
              </li>
            )}
            <li className={s.muted}>
              <Clock aria-hidden="true" /> {region ? 'Dias e horários: você informa antes da publicação.' : 'Endereço, região e horários: você informa antes da publicação.'}
            </li>
          </ul>
        </Section>
      );
    case 'processo':
      return (
        <Section id={id} title={t.processo} key={id} className={s.sSteps}>
          <ol className={s.steps}>
            {plan.texts.processSteps.map((x, i) => (
              <li key={x}>
                <b>{i + 1}</b>
                <span>{x}</span>
              </li>
            ))}
          </ol>
        </Section>
      );
    case 'galeria': {
      const tiles = plan.gallery;
      const size = Math.min(p.gallery, currentPackage(p).galleryImages || p.gallery);
      return (
        <Section id={id} title={t.galeria} key={id} className={s.sGallery} note={`Imagens ilustrativas · no site entram até ${size} fotos suas.`}>
          {tiles.length ? (
            <div className={s.gallery} data-count={tiles.length}>
              {tiles.map((x) => (
                <Media key={x.id} item={x} crop="4:3" className={s.tile} lazy caption={x.caption} />
              ))}
            </div>
          ) : (
            <div className={s.galleryEmpty} aria-hidden="true">
              <Camera /> Suas fotos, organizadas nesta galeria
            </div>
          )}
        </Section>
      );
    }
    case 'faq':
      return (
        <Section id={id} title={t.faq} key={id} className={s.sFaq} note="Perguntas de exemplo · as respostas são suas.">
          <ul className={s.faq}>
            {plan.texts.faqQuestions.map((q) => (
              <li key={q}>
                {q} <Plus aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Section>
      );
    case 'depoimentos':
      return (
        <Section id={id} title={t.depoimentos} key={id} className={s.sQuotes}>
          <div className={s.quote}>
            <Quote aria-hidden="true" />
            <span>Relatos reais dos seus clientes entram aqui, com a autorização de cada pessoa. A prévia não inventa depoimentos.</span>
          </div>
        </Section>
      );
    case 'vitrine': {
      const realEstate = plan.family.id === 'imobiliario';
      const items = plan.items.slice(0, 6);
      const max = currentPackage(p).showcaseItems || 10;
      return (
        <Section
          id={id}
          title={t.vitrine}
          key={id}
          className={s.sShowcase}
          note={realEstate ? `Imóveis ilustrativos · sem preço, endereço ou disponibilidade · até ${max} no site.` : `Itens ilustrativos · até ${max} no site · pedido pelo WhatsApp, sem pagamento online.`}
        >
          <ul className={s.products} style={{ '--n': 3 } as CSSProperties}>
            {(items.length ? items : plan.content.services.map(() => null)).map((x, i) => (
              <li key={x?.id ?? i}>
                {x ? (
                  <Media item={x} crop="4:3" className={s.productMedia} lazy />
                ) : (
                  <span className={s.productType} aria-hidden="true">
                    {plan.content.services[i]?.slice(0, 1)}
                  </span>
                )}
                <span className={s.productText}>
                  <b>{x?.caption ?? plan.content.services[i]}</b>
                  <span>{realEstate ? 'Imóvel ilustrativo · bairro e detalhes informados por você' : 'Detalhes e disponibilidade pelo WhatsApp'}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      );
    }
    default:
      return null;
  }
}

/* ── Componente ───────────────────────────────────────────────────────────── */

export function SitePreview({
  project: p,
  logo = null,
  compact = false,
  mobile = false,
  bare = false,
  demo = false,
  lazy = false,
}: {
  project: Project;
  logo?: string | null;
  /** Só o topo e o primeiro bloco (miniaturas). */
  compact?: boolean;
  /** Força o layout de celular. */
  mobile?: boolean;
  /** Sem barra de navegador (tela cheia ou celular). */
  bare?: boolean;
  /** Exemplo da apresentação: usa o nome fictício do tipo de negócio. */
  demo?: boolean;
  /** Imagem carregada só perto da tela (miniaturas abaixo da dobra). */
  lazy?: boolean;
}) {
  const plan = previewPlan(p, { demo });
  const { family, variant, name } = plan;
  const vars = {
    '--acc': plan.accent,
    '--on': plan.on,
    ...(plan.soft ? { '--soft': plan.soft } : {}),
    '--head': plan.headStack,
  } as CSSProperties;
  const navLinks = plan.sections.slice(0, 3).map((id) => plan.titles[id]);
  const shown = compact ? plan.sections.slice(0, 1) : plan.sections;

  return (
    <div
      className={cx(s.root, s[`f_${family.id}`], s[`d_${p.direction}`], s[`t_${plan.typography}`], p.custom && s.customColor, mobile && s.forceMobile, bare && s.bare)}
      style={vars}
      role="group"
      aria-roledescription="prévia"
      aria-label={`Prévia do site de ${name.text}${name.provisional ? ' (nome provisório)' : ''}`}
      data-family={family.id}
      data-layout={variant.id}
      data-hero={plan.hero}
      data-subsegment={plan.subsegment.id}
      data-image={plan.heroAsset?.id ?? ''}
    >
      {bare ? (
        !compact && (
          <div className={s.strip}>
            Prévia demonstrativa{name.provisional ? ' · nome provisório' : ''}
          </div>
        )
      ) : (
        <div className={s.bar} aria-hidden="true">
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.url}>prévia ilustrativa · endereço definido na publicação</span>
          <span className={s.badge}>Prévia</span>
        </div>
      )}

      <div className={s.site}>
        <div className={s.nav}>
          {logo ? (
            <span className={s.logoBox}>
              <img className={s.logo} src={logo} alt={name.text} />
            </span>
          ) : (
            <span className={cx(s.brand, name.provisional && s.provisional)}>{name.text}</span>
          )}
          <span className={s.links}>
            {navLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </span>
          <span className={s.navCta}>{plan.cta}</span>
        </div>

        <Hero plan={plan} lazy={lazy} />

        {shown.map((id) => (
          <Blocks key={id} plan={plan} p={p} id={id} lazy={lazy || compact} />
        ))}

        {!compact && (
          <>
            <section className={cx(s.section, s.contact)} data-section="contato">
              <span className={s.h}>
                {plan.contactTitle}
              </span>
              <span className={s.text}>{plan.contactNote}</span>
              {p.form ? (
                <span className={s.form}>
                  <span className={s.input}>Seu nome</span>
                  <span className={s.input}>{p.objective === 'agendamento' ? 'Serviço e melhor dia' : p.objective === 'produtos' ? 'O que você quer pedir' : 'O que você precisa'}</span>
                  <span className={cx(s.input, s.area)}>Mensagem</span>
                  <span className={s.btn}>Enviar pelo WhatsApp</span>
                </span>
              ) : (
                <span className={s.actions}>
                  <span className={s.btn}>
                    <MessageCircle aria-hidden="true" /> {plan.ctaNavigates ? 'Falar pelo WhatsApp' : plan.cta}
                  </span>
                </span>
              )}
            </section>
            <div className={s.footer}>
              <span>
                © {name.text}
                {name.provisional ? ' · nome provisório' : ''}
              </span>
              <span>Prévia demonstrativa · textos sugeridos e imagens ilustrativas, revisados antes de publicar</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
