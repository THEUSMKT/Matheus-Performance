'use client';
/* ==========================================================================
   Assinatura da marca, cabeçalho e rodapé — os mesmos na página principal,
   nos termos e na privacidade. A marca é só o símbolo oficial + o nome
   "Beck Performance", sem subtítulo.
   ========================================================================== */
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { contact } from '@/config/contact';
import { whatsappLink } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import s from './Landing.module.css';

export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;

/** Site de gestão de tráfego, na raiz do mesmo repositório publicado. */
export const mainSiteUrl = contact.mainSiteUrl;

export function Brand({ href = '#topo', onHome = true }: { href?: string; onHome?: boolean }) {
  const inner = (
    <>
      <span className={s.brandTile}>
        <img src={asset('/brand/simbolo.png')} alt="" width={28} height={24} />
      </span>
      <span>{contact.brand}</span>
    </>
  );
  return onHome ? (
    <a className={s.brand} href={href} aria-label={`${contact.brand} — início`}>
      {inner}
    </a>
  ) : (
    <Link className={s.brand} href="/" aria-label={`${contact.brand} — início`}>
      {inner}
    </Link>
  );
}

const navItems = [
  ['#exemplos', 'Exemplos'],
  ['#como-funciona', 'Como funciona'],
  ['#opcoes', 'Opções'],
  ['#perguntas', 'Perguntas'],
] as const;

/** Âncora da própria página ou link para a página inicial com a âncora. */
function NavLink({ hash, onHome, className, onClick, children }: { hash: string; onHome: boolean; className?: string; onClick?: () => void; children: ReactNode }) {
  return onHome ? (
    <a className={className} href={hash} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link className={className} href={`/${hash}`} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Header({ onHome = true, ctaLabel = 'Ver a prévia do meu site', onStart }: { onHome?: boolean; ctaLabel?: string; onStart?: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  return (
    <header className={s.header}>
      <div className={s.wrap}>
        <nav className={s.nav} aria-label="Navegação principal">
          <Brand onHome={onHome} />
          <div className={s.navLinks}>
            {navItems.map(([hash, label]) => (
              <NavLink key={hash} hash={hash} onHome={onHome}>
                {label}
              </NavLink>
            ))}
          </div>
          <NavLink hash="#configurador" onHome={onHome} className={`${s.primary} ${s.small} ${s.navCta}`} onClick={onStart}>
            {ctaLabel}
          </NavLink>
          <button type="button" className={s.menuButton} aria-expanded={open} aria-controls="menu-celular" onClick={() => setOpen(!open)}>
            {open ? 'Fechar' : 'Menu'}
          </button>
        </nav>
        {open && (
          <div className={s.mobileMenu} id="menu-celular">
            {navItems.map(([hash, label]) => (
              <NavLink key={hash} hash={hash} onHome={onHome} onClick={close}>
                {label}
              </NavLink>
            ))}
            <NavLink
              hash="#configurador"
              onHome={onHome}
              className={s.primary}
              onClick={() => {
                close();
                onStart?.();
              }}
            >
              {ctaLabel}
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer({ onHome = true }: { onHome?: boolean }) {
  return (
    <footer className={s.footer}>
      <div className={s.wrap}>
        <div className={s.footerGrid}>
          <div>
            <Brand onHome={onHome} />
            <p style={{ marginTop: 10, maxWidth: '36ch' }}>
              Criação de sites para pequenas e médias empresas, com escopo e investimento combinados antes do início.
            </p>
          </div>
          <div>
            <h3>Navegação</h3>
            <ul>
              {[...navItems.slice(0, 2), ['#configurador', 'Montar a prévia'] as const, ...navItems.slice(2)].map(([hash, label]) => (
                <li key={hash}>
                  <NavLink hash={hash} onHome={onHome}>
                    {label}
                  </NavLink>
                </li>
              ))}
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
                  </a>
                </li>
              )}
              <li>
                <a href={mainSiteUrl}>Gestão de tráfego pago</a>
              </li>
              <li>
                <Link href="/privacidade/">Privacidade</Link>
              </li>
              <li>
                <Link href="/termos/">Termos de uso</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className={s.footerBottom}>
          © {new Date().getFullYear()} {contact.brand}. Valores exibidos são estimativas; escopo, investimento e prazo são confirmados por escrito antes da contratação.
        </p>
      </div>
    </footer>
  );
}
