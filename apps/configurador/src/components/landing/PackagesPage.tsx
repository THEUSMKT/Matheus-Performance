'use client';
/* ==========================================================================
   Página "Pacotes e valores" (/pacotes/).

   1. Abertura com a comparação compacta do maior para o menor (Completo →
      Profissional → Essencial): uma frase por pacote, para qual
      necessidade ele serve. O Completo ancora o escopo e o valor.
   2. Cartões completos — cada um se explica sozinho, sem "tudo do
      anterior". No celular a ordem é Profissional, Essencial, Completo (é
      também a ordem do documento, para leitor de tela e teclado); no
      computador a grade põe Essencial, Profissional e Completo lado a lado.
   3. Comparação completa, condições (domínio, hospedagem, depois da
      entrega, o que não está incluído) e projeto personalizado.

   Valores, limites e prazos vêm de config/packages.ts. Nada de preço
   riscado, desconto, contador, escassez ou "mais vendido".
   ========================================================================== */
import { Check, MessageCircle, Plus } from 'lucide-react';
import { contact } from '@/config/contact';
import { brl, customNeeds, externalCosts, packageById, packageFeatures, packages, priceNotes, revisionRounds, upgradeNote, type Package, type PackageId } from '@/config/packages';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { PackageCompare } from '../builder/Packages';
import { Footer, Header, builderHref, examplesHref, homeHref } from './Chrome';
import { useProject } from './useProject';
import s from './Landing.module.css';

/** Ordem dos cartões no documento (= ordem no celular). */
const cardOrder: PackageId[] = ['profissional', 'essencial', 'completo'];
/** Selo factual do pacote em destaque. */
const featured: PackageId = 'profissional';
const featuredBadge = 'Equilíbrio entre apresentação e recursos';

const packageHref = (id: PackageId) => `${builderHref}?pacote=${id}`;

/** "a, b e c" — ou "a, b, além de c" quando o último item já tem um "e". */
function listSentence(items: string[]) {
  if (items.length < 2) return items.join('');
  const last = items[items.length - 1];
  return `${items.slice(0, -1).join(', ')}${last.includes(' e ') ? ', além de ' : ' e '}${last}`;
}

function Limits({ pkg }: { pkg: Package }) {
  const rows: [string, string][] = [
    ['Seções', `até ${pkg.maxSections}`],
    ['Fotos na galeria', pkg.galleryImages ? `até ${pkg.galleryImages}` : 'não inclui'],
    ['Itens na vitrine', pkg.showcaseItems ? `até ${pkg.showcaseItems}` : 'não inclui'],
  ];
  return (
    <dl className={s.tierLimits}>
      {rows.map(([k, v]) => (
        <div key={k} data-off={v === 'não inclui' ? '' : undefined}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function TierCard({ pkg }: { pkg: Package }) {
  const up = upgradeNote(pkg);
  const features = packageFeatures(pkg);
  const isFeatured = pkg.id === featured;
  return (
    <li id={`pacote-${pkg.id}`} className={s.tier} data-tier={pkg.id} data-featured={isFeatured ? '' : undefined}>
      {isFeatured && <p className={s.tierBadge}>{featuredBadge}</p>}
      <h3 className={s.tierName}>{pkg.name}</h3>
      <p className={s.tierPrice}>
        <strong>{brl(pkg.price)}</strong>
        <span>pagamento único pelo desenvolvimento</span>
      </p>
      <p className={s.tierFor}>{pkg.forWhom}</p>
      {up && (
        <p className={s.tierUp}>
          <strong>
            {brl(up.diff)} a mais que o {up.from}:
          </strong>{' '}
          {listSentence(up.gains)}.
        </p>
      )}
      <Limits pkg={pkg} />
      <h4 className={s.tierListTitle}>Recursos incluídos</h4>
      <ul className={s.tierFeatures}>
        {features.map((f) => (
          <li key={f.text} data-extra={f.extra ? '' : undefined}>
            {f.extra ? <Plus aria-hidden="true" /> : <Check aria-hidden="true" />}
            <span>
              {f.text}
              {f.extra && up && <span className={s.srOnly}> (a mais que o {up.from})</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className={s.tierDeadline}>
        <strong>Prazo:</strong> {pkg.deadline}, {priceNotes.deadlineStart}.
      </p>
      <a
        className={isFeatured ? s.primary : s.secondary}
        href={packageHref(pkg.id)}
        onClick={() => track('start_click', { context: 'pacotes', package: pkg.id })}
        aria-label={`Criar prévia com este pacote: ${pkg.name}`}
      >
        Criar prévia com este pacote
      </a>
    </li>
  );
}

export default function PackagesPage() {
  const state = useProject({ readHash: false });
  const ctaLabel = state.resumable ? 'Continuar minha prévia' : 'Criar minha prévia grátis';
  const anchor = [...packages].reverse();

  return (
    <div className={`${s.page} ${s.inner}`} id="topo">
      <Header where="pacotes" ctaLabel={ctaLabel} onStart={() => track('start_click', { context: 'cabecalho' })} />
      <main id="conteudo">
        <section className={s.pageHead} aria-labelledby="pacotes-titulo">
          <div className={s.wrap}>
            <nav className={s.crumbs} aria-label="Você está em">
              <a href={homeHref}>Início</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Pacotes e valores</span>
            </nav>
            <h1 id="pacotes-titulo">Escolha como sua empresa vai se apresentar ao mundo.</h1>
            <p className={s.pageLead}>Compare o que cada pacote entrega e encontre a opção adequada para o seu negócio.</p>
            <ol className={s.ladder} aria-label="Os três pacotes, do mais completo ao mais simples">
              {anchor.map((pkg) => (
                <li key={pkg.id} data-tier={pkg.id}>
                  <a href={`#pacote-${pkg.id}`}>
                    <span className={s.ladderName}>
                      {pkg.name} — {brl(pkg.price)}
                    </span>
                    <span className={s.ladderFor}>{pkg.forWhom}</span>
                  </a>
                </li>
              ))}
            </ol>
            <p className={s.pageNote}>
              Valores totais do desenvolvimento, em pagamento único. Domínio e hospedagem à parte. A prévia é grátis e não contrata nada.
            </p>
          </div>
        </section>

        <section className={s.section} id="detalhes" aria-labelledby="detalhes-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="detalhes-titulo">O que cada pacote entrega</h2>
              <p>
                <Plus aria-hidden="true" className={s.inlineIcon} /> marca o que o pacote acrescenta ao anterior. Todos incluem {revisionRounds} rodadas de ajustes antes da
                publicação.
              </p>
            </div>
            <ul className={s.tiers}>
              {cardOrder.map((id) => (
                <TierCard key={id} pkg={packageById(id)} />
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.band}`} id="comparar" aria-labelledby="comparar-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="comparar-titulo">Comparação completa</h2>
              <p>Os mesmos recursos, lado a lado.</p>
            </div>
            <div className={s.compareBox}>
              <PackageCompare caption="Comparação dos pacotes" />
            </div>
          </div>
        </section>

        <section className={s.section} id="condicoes" aria-labelledby="condicoes-titulo">
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 id="condicoes-titulo">Condições</h2>
              <p>O que vale para todos os pacotes, antes de você decidir.</p>
            </div>
            <div className={s.terms}>
              <article>
                <h3>Domínio e hospedagem</h3>
                <p>Pagos à parte, direto aos fornecedores. Não entram no valor do desenvolvimento:</p>
                <ul className={s.dotList}>
                  {externalCosts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>Depois da entrega</h3>
                <p>
                  Antes da publicação, estão incluídas {revisionRounds} rodadas de ajustes. Depois da publicação, alterações e manutenção são combinadas e orçadas à parte.
                  Não há mensalidade de desenvolvimento.
                </p>
              </article>
              <article>
                <h3>Não incluído nos pacotes</h3>
                <ul className={s.dotList}>
                  <li>Produção de textos, fotos ou vídeos</li>
                  <li>Alterações e manutenção depois da publicação</li>
                  <li>Mais de uma página, loja virtual com pagamento online, área de login, sistemas e integrações</li>
                </ul>
              </article>
              <article className={s.termsCustom}>
                <h3>Projeto personalizado</h3>
                <p>Quando o site precisa de algo fora dos pacotes, o orçamento é separado. Por exemplo:</p>
                <ul className={s.dotList}>
                  {customNeeds.slice(0, 6).map((n) => (
                    <li key={n.id}>{n.name}</li>
                  ))}
                </ul>
                <a
                  className={s.secondary}
                  href={whatsappLink(contact.whatsappProjetoPersonalizado)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_open', { context: 'projeto_personalizado' })}
                >
                  <MessageCircle aria-hidden="true" /> Falar sobre um projeto personalizado
                  <span className={s.srOnly}> (abre o WhatsApp em nova aba)</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className={s.final} aria-labelledby="final-titulo">
          <div className={s.wrap}>
            <h2 id="final-titulo">Veja o site da sua empresa antes de escolher.</h2>
            <p>A prévia é grátis, sem cadastro. O pacote pode mudar depois, e nada é contratado na prévia.</p>
            <div className={s.finalActions}>
              <a className={s.primary} href={builderHref} onClick={() => track('start_click', { context: 'final' })}>
                {ctaLabel}
              </a>
              <a className={s.secondary} href={examplesHref} onClick={() => track('nav_click', { target: 'exemplos', context: 'pacotes' })}>
                Explorar exemplos de sites
              </a>
            </div>
            <a className={s.backHome} href={homeHref}>
              Voltar ao início
            </a>
          </div>
        </section>
      </main>
      <Footer where="pacotes" />
    </div>
  );
}
