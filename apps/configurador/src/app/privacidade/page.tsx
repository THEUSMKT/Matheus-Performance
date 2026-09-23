import type { Metadata } from 'next';
import { contact } from '@/config/contact';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  robots: { index: false, follow: true },
};

export default function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade" updated="setembro de 2026">
      <h2>O que este site coleta</h2>
      <p>
        As escolhas que você faz no configurador ficam guardadas apenas no seu próprio
        navegador, para que você possa voltar de onde parou. Elas não são enviadas para
        nenhum servidor.
      </p>

      <h2>O que acontece ao pedir orçamento</h2>
      <p>
        Ao clicar em “Conversar sobre este projeto”, o resumo do projeto — junto do
        nome e do negócio, se você preencher — é montado como texto e aberto no
        WhatsApp. O envio só acontece quando você confirma, dentro do aplicativo.
      </p>

      <h2>Como esses dados são usados</h2>
      <p>
        O link de compartilhamento contém apenas as opções do projeto. Nome e
        descrição personalizada ficam fora dele. Ao imprimir ou salvar um PDF,
        esses textos podem aparecer no documento; compartilhe-o apenas com quem desejar.
      </p>
      <p>
        As informações recebidas pelo WhatsApp servem para responder ao seu pedido de
        orçamento e conduzir o projeto. Não são vendidas nem compartilhadas com
        terceiros.
      </p>

      <h2>Apagar suas informações</h2>
      <p>
        Para limpar o que está salvo no navegador, use “Começar novamente” no
        configurador. Para pedir a exclusão do histórico de conversa, escreva para{' '}
        <a href={`https://wa.me/${contact.whatsapp}`}>{contact.whatsappDisplay}</a>.
      </p>
    </LegalPage>
  );
}

