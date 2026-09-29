'use client';
/* ==========================================================================
   Assinatura da marca, cabeçalho e rodapé — os mesmos na página inicial,
   em Exemplos, em Pacotes, nos termos e na privacidade. A marca é só o
   símbolo oficial + o nome "Beck Performance", sem subtítulo.

   Tudo aqui é link comum (<a href>): a navegação funciona mesmo que o
   JavaScript da página não carregue. O menu do celular é um <details>
   nativo — abre e fecha sem script; o script só o fecha ao escolher um
   item ou apertar Esc.
   ========================================================================== */
import { useEffect, useRef, type MouseEvent } from 'react';
import { contact } from '@/config/contact';
import { priceRange } from '@/config/packages';
import { whatsappLink } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import s from './Landing.module.css';

export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;

/** Site de gestão de tráfego, na raiz do mesmo repositório publicado. */
export const mainSiteUrl = contact.mainSiteUrl;

/** Página dedicada à criação da prévia. */
export const builderHref = asset('/criar/');
/** Páginas internas. */
export const homeHref = asset('/');
export const examplesHref = asset('/exemplos/');
export const packagesHref = asset('/pacotes/');

/** Página em que o cabeçalho está (marca o item do menu e resolve âncoras). */
export type Where = 'inicio' | 'exemplos' | 'pacotes' | 'outra';

export function Brand({ where = 'inicio' }: { where?: Where }) {
  return (
    <a className={s.brand} href={where === 'inicio' ? '#topo' : homeHref} aria-label={`${contact.brand} — início`}>
      <span className={s.brandTile}>
        <img src={asset('/brand/simbolo.png')} alt="" width={28} height={24} />
      </span>
      <span>{contact.brand}</span>
    </a>
  );
}

type NavItem = { label: string; page?: Where; anchor?: string };
const navItems: NavItem[] = [
  { label: 'Exemplos', page: 'exemplos' },
  { label: 'Como funciona', anchor: 'como-funciona' },
  { label: 'Pacotes', page: 'pacotes' },
  { label: 'Perguntas', anchor: 'perguntas' },
];

function hrefOf(item: NavItem, where: Where) {
  if (item.page === 'exemplos') return examplesHref;
  if (item.page === 'pacotes') return packagesHref;
  // Âncora da página inicial: na própria página, só o #; fora dela, o caminho completo.
  return where === 'inicio' ? `#${item.anchor}` : `${homeHref}#${item.anchor}`;
}

export function Header({
  where = 'inicio',
  ctaLabel = 'Gerar minha prévia gratuita',
  ctaHref = builderHref,
  onStart,
}: {
  where?: Where;
  ctaLabel?: string;
  /** Destino do botão principal: a página de criação. */
  ctaHref?: string;
  onStart?: (ev: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);

  // Melhorias com script: Esc e toque fora fecham o menu.
  useEffect(() => {
    const close = () => menu.current?.removeAttribute('open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !menu.current?.open) return;
      close();
      menu.current.querySelector('summary')?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, []);

  const closeMenu = () => menu.current?.removeAttribute('open');
  const links = (inMenu: boolean) =>
    navItems.map((item) => (
      <a
        key={item.label}
        href={hrefOf(item, where)}
        aria-current={item.page && item.page === where ? 'page' : undefined}
        onClick={inMenu ? closeMenu : undefined}
      >
        {item.label}
      </a>
    ));

  return (
    <header className={s.header}>
      <div className={s.wrap}>
        <nav className={s.nav} aria-label="Navegação principal">
          <Brand where={where} />
          <div className={s.navLinks}>{links(false)}</div>
          <a href={ctaHref} className={`${s.primary} ${s.small} ${s.navCta}`} onClick={onStart}>
            {ctaLabel}
          </a>
          {/* Com o menu aberto, o botão flutuante sai de cena (html[data-menu-open]). */}
          <details className={s.menu} ref={menu} onToggle={(ev) => document.documentElement.toggleAttribute('data-menu-open', ev.currentTarget.open)}>
            <summary className={s.menuButton}>
              <span className={s.menuClosed}>Menu</span>
              <span className={s.menuOpen}>Fechar</span>
            </summary>
            <div className={s.mobileMenu} id="menu-celular">
              {links(true)}
              <a
                href={ctaHref}
                className={s.primary}
                onClick={(ev) => {
                  closeMenu();
                  onStart?.(ev);
                }}
              >
                {ctaLabel}
              </a>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ where = 'inicio' }: { where?: Where }) {
  return (
    <footer className={s.footer}>
      <div className={s.wrap}>
        <div className={s.footerGrid}>
          <div>
            <Brand where={where} />
            <p style={{ marginTop: 10, maxWidth: '36ch' }}>
              Sites para empresas de pequeno, médio e grande porte. O limite é a complexidade do projeto, não o tamanho da empresa.
            </p>
          </div>
          <div>
            <h3>Navegação</h3>
            <ul>
              <li>
                <a href={homeHref}>Início</a>
              </li>
              {navItems.map((item) => (
                <li key={item.label}>
                  <a href={hrefOf(item, where)}>{item.label === 'Pacotes' ? 'Pacotes e valores' : item.label === 'Exemplos' ? 'Exemplos de sites' : item.label}</a>
                </li>
              ))}
              <li>
                <a href={builderHref}>Gerar minha prévia gratuita</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Contato e informações</h3>
            <ul>
              <li>
                <a
                  href={whatsappLink(contact.whatsappCurta)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_open', { context: 'rodape' })}
                >
                  WhatsApp {contact.whatsappDisplay}
                  <span className={s.srOnly}> (abre em nova aba)</span>
                </a>
              </li>
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.instagram && (
                <li>
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram {contact.instagramHandle}
                    <span className={s.srOnly}> (abre em nova aba)</span>
                  </a>
                </li>
              )}
              <li>
                <a href={mainSiteUrl}>Gestão de tráfego pago</a>
              </li>
              <li>
                <a href={asset('/privacidade/')}>Privacidade</a>
              </li>
              <li>
                <a href={asset('/termos/')}>Termos de uso</a>
              </li>
            </ul>
          </div>
        </div>
        <p className={s.footerBottom}>
          © {new Date().getFullYear()} {contact.brand}. Pacotes de desenvolvimento de {priceRange}, pagamento único; domínio e hospedagem à parte. Escopo e prazo
          confirmados por escrito antes da contratação.
        </p>
      </div>
    </footer>
  );
}
