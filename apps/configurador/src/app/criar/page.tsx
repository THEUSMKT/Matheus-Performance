import type { Metadata } from 'next';
import Builder from '@/components/builder/Builder';
import { contact } from '@/config/contact';
import { whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Crie a prévia do seu site | Beck Performance',
  description: 'Conte sobre seu negócio, veja a prévia do site e personalize uma escolha por vez, sem cadastro. O valor do pacote fica à vista.',
  alternates: { canonical: '/criar/' },
  // A página de criação mostra dados digitados pelo visitante: nunca indexar.
  robots: { index: false, follow: false },
};

export default function Criar() {
  return (
    <>
      {/* Sem JavaScript o configurador não funciona: contato direto continua à mão. */}
      <noscript>
        <div className="app-fallback">
          <p>
            <strong>Para criar a prévia, ative o JavaScript do navegador.</strong> Você também pode conversar direto sobre o seu site.
          </p>
          <p className="app-fallback-links">
            <a href={whatsappLink(contact.whatsappConversa)}>Conversar pelo WhatsApp {contact.whatsappDisplay}</a>
            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/pacotes/`}>Ver pacotes e valores</a>
          </p>
        </div>
      </noscript>
      <Builder />
    </>
  );
}
