import { contact } from '@/config/contact';
import { ButtonLink } from './ui/Button';

const links = [
  { href: '#modelos', label: 'Modelos' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#perguntas', label: 'Perguntas' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <nav className="wrap flex h-16 items-center gap-3 md:gap-8" aria-label="Principal">
        <a href="#topo" className="flex flex-none items-center gap-2.5 whitespace-nowrap font-bold tracking-[-0.03em]">
          <span className="brand-gradient grid size-7 place-items-center rounded-[9px] text-[13px] font-bold text-white">
            M
          </span>
          {contact.brand}
        </a>

        <ul className="ml-auto hidden items-center gap-7 text-[0.9375rem] text-muted md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <ButtonLink href="#configurador" size="sm" className="ml-auto whitespace-nowrap md:ml-0">
          Criar meu projeto
        </ButtonLink>
      </nav>
    </header>
  );
}
