import Link from 'next/link';
import { contact } from '@/config/contact';
import { shortWhatsappLink } from '@/lib/whatsapp';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface py-10">
      <div className="wrap flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold tracking-[-0.03em]">{contact.brand}</p>
          <p className="mt-0.5 text-sm text-muted">
            {contact.tagline} · © {year}
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 text-[0.9375rem] text-muted">

          <li>
            <a
              href={shortWhatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-ink"
            >
              WhatsApp
            </a>
          </li>
          <li>
            <Link href="/privacidade/" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
              Privacidade
            </Link>
          </li>
          <li>
            <Link href="/termos/" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
              Termos
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

