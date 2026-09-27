/* ==========================================================================
   Link do WhatsApp com a mensagem pronta. O número mora em config/contact.ts;
   a mensagem do projeto é montada em lib/project.ts (projectMessage).
   ========================================================================== */
import { contact } from '@/config/contact';

export function whatsappLink(message: string): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
