import type { Metadata } from 'next';
import { contact } from '@/config/contact';
import { leadMode } from '@/config/integrations';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  robots: { index: false, follow: true },
};

export default function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade" updated="setembro de 2026">
      <h2>Quem é responsável</h2>
      <p>
        Esta página é mantida por {contact.owner} ({contact.brand}). Para qualquer assunto sobre os seus dados, fale pelo WhatsApp{' '}
        <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
          {contact.whatsappDisplay}
        </a>
        .
      </p>

      <h2>O que fica no seu navegador</h2>
      <p>
        As escolhas do configurador — e o que você digitar, como nome do negócio, serviço, limite de orçamento e seu nome — ficam salvas apenas no
        armazenamento do seu próprio navegador, para você continuar de onde parou. Esses dados não são enviados a nenhum servidor pela página.
      </p>
      <p>
        Também guardamos no navegador, durante a visita, os parâmetros de campanha do endereço (como utm_source), já normalizados e sem dados
        pessoais, e uma marcação para não contar o mesmo evento duas vezes.
      </p>

      <h2>Conversa pelo WhatsApp</h2>
      <p>
        Ao tocar em “Preparar conversa no WhatsApp”, a página abre o aplicativo com um resumo do projeto já escrito. Nada é enviado
        automaticamente: a mensagem só chega até nós se você decidir enviá-la. A partir daí vale também a política do próprio WhatsApp.
      </p>

      {leadMode === 'receptor' && (
        <>
          <h2>Solicitação de proposta</h2>
          <p>
            Se você usar o formulário “Solicitar proposta”, enviamos seu nome, o canal e o contato escolhidos, as respostas opcionais sobre prazo e
            decisão, o projeto configurado e a origem da visita. Esses dados servem para responder ao seu pedido e preparar a proposta.
          </p>
          <p>
            Receber novidades e ofertas é uma escolha separada, desmarcada por padrão. Sem ela, usamos o contato apenas para tratar deste pedido.
          </p>
        </>
      )}

      <h2>Link de compartilhamento e PDF</h2>
      <p>
        O link de compartilhamento leva apenas as opções do projeto: nome, contato, textos e orçamento ficam fora dele. O PDF é gerado pelo seu
        navegador e fica com você; ele inclui os textos do projeto, mas não os seus dados de contato.
      </p>

      <h2>Medição</h2>
      <p>
        A página registra ações como iniciar o configurador, concluir uma etapa ou abrir o WhatsApp, sem nome, telefone, e-mail ou textos que você
        digitou. Hoje nenhuma ferramenta de análise de terceiros está instalada; se isso mudar, esta política será atualizada antes.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos dados que nos enviou, pelo mesmo WhatsApp. Para apagar o que está salvo no navegador,
        use “Começar novamente” no configurador ou limpe os dados do site nas configurações do navegador.
      </p>
      <p>Não vendemos nem compartilhamos seus dados com terceiros para fins de publicidade.</p>
    </LegalPage>
  );
}
