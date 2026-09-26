/* ==========================================================================
   Perguntas frequentes — EDITE AQUI
   As 5 primeiras aparecem direto na página; as demais, em "Ver todas".
   Cada resposta descreve o que a página e o serviço fazem hoje. Valores
   vêm de pricing.ts e offer.ts para não divergirem da estimativa.
   ========================================================================== */
import { pricing, brl } from './pricing';
import { revisionRounds } from './offer';

const spread = Math.round(pricing.rangeSpread * 100);
const numbers = pricing.deadlines.flatMap((d) => d.label.match(/\d+/g) ?? []).map(Number);
const prazos = `${Math.min(...numbers)} a ${Math.max(...numbers)} dias úteis`;

export const projectFaq: [string, string][] = [
  [
    'O que está incluído?',
    `Página principal responsiva, botão de WhatsApp, links para as redes sociais, ${revisionRounds} rodadas de ajustes antes da publicação e acompanhamento até o site ir ao ar. Os opcionais escolhidos aparecem no resumo com o valor de cada um.`,
  ],
  [
    'O que fica à parte?',
    'Domínio, hospedagem, e-mail profissional e plataformas externas (como formulários por e-mail, agendamento ou exibição do Instagram) têm cobrança própria, paga direto ao fornecedor. Produção de textos, fotos e vídeos também não está incluída.',
  ],
  [
    'Há mensalidade?',
    'O desenvolvimento é cobrado uma vez. Não há mensalidade de desenvolvimento. Manutenção ou atualizações depois da entrega só existem se forem combinadas à parte.',
  ],
  [
    'Quanto tempo leva?',
    `A estimativa atual vai de ${prazos}, conforme a complexidade. A contagem começa quando textos, imagens e logo são entregues.`,
  ],
  [
    'A prévia já é o meu site?',
    'Não. A prévia é demonstrativa: mostra a estrutura, a identidade e o tipo de conteúdo. Textos, imagens e nomes são ilustrativos. O site final é desenvolvido com o seu conteúdo depois que o escopo é confirmado.',
  ],
  [
    'Como a estimativa é calculada?',
    `Parte do projeto base de ${brl(pricing.base)} e soma a categoria, a identidade visual, as cores próprias e os recursos escolhidos. O resumo mostra cada item. A faixa varia ${spread}% para cima ou para baixo porque o valor final depende do conteúdo e dos detalhes confirmados na conversa.`,
  ],
  [
    'O valor exibido é uma proposta?',
    'Não. É uma estimativa para você decidir com informação. Escopo, investimento e prazo são confirmados por escrito antes de qualquer contratação. Depois de aprovado, mudanças de escopo são orçadas à parte.',
  ],
  [
    'Por que alguns projetos aparecem como "sob diagnóstico"?',
    'Várias unidades, loja virtual com pagamento, sistema de reservas próprio, integrações, área de login ou mais de um idioma dependem de levantamento. Para esses casos a página não mostra um valor automático, que poderia não se sustentar.',
  ],
  [
    'Qual a diferença entre seção, página e categoria?',
    'Seção é uma parte da página principal, como serviços ou contato. Página adicional tem endereço próprio e aparece como item separado. A categoria só ajusta a organização do conteúdo — não adiciona páginas.',
  ],
  [
    'Catálogo é o mesmo que loja virtual?',
    'Não. O catálogo apresenta itens e encaminha o pedido pelo contato. Carrinho, estoque e pagamento online são loja virtual, que passa por diagnóstico.',
  ],
  [
    'Como funciona a solicitação de horário?',
    'Sem plataforma externa, o visitante pede um horário pelo WhatsApp e você confirma. Agenda com disponibilidade automática exige uma plataforma de agendamento, com assinatura própria e avaliação de compatibilidade.',
  ],
  [
    'O que acontece quando eu clico em "Preparar conversa no WhatsApp"?',
    'A página abre o WhatsApp com um resumo do projeto já escrito. Nada é enviado automaticamente: você revisa a mensagem e decide se envia.',
  ],
  [
    'Minhas respostas ficam salvas?',
    'Ficam só neste navegador, para você continuar de onde parou. O link de compartilhamento leva apenas as opções do projeto — sem nome, contato, textos ou orçamento. "Começar novamente" apaga o que está salvo.',
  ],
  [
    'Posso usar depoimentos?',
    'Sim, desde que sejam relatos reais, autorizados pelos seus clientes. A prévia reserva o espaço, mas não inventa avaliações.',
  ],
  [
    'Quem fica com o site e os acessos?',
    'O site entregue passa a ser seu após a quitação. A titularidade do domínio e das contas, e a transferência dos acessos, ficam registradas na proposta antes da contratação.',
  ],
];
