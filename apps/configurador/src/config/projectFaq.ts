/* ==========================================================================
   Perguntas frequentes — EDITE AQUI
   As 5 primeiras aparecem direto na página; as demais, em "Ver todas".
   Respostas curtas, com o que o serviço faz hoje. Valores, prazos e
   limites vêm de packages.ts para nunca divergirem do configurador.
   Nada de formas de pagamento, garantias ou condições que não existam.
   ========================================================================== */
import { brl, customNeeds, externalCosts, packages, priceNotes, priceRange, revisionRounds } from './packages';

const [essencial, profissional, completo] = packages;
const numbers = packages.flatMap((p) => p.deadline.match(/\d+/g) ?? []).map(Number);
const prazos = `${Math.min(...numbers)} a ${Math.max(...numbers)} dias úteis`;

export const projectFaq: [string, string][] = [
  [
    'A prévia é gratuita?',
    'Sim. Você cria e ajusta a prévia sem cadastro e sem pagar nada. Só o desenvolvimento do site final é pago.',
  ],
  [
    'O que fica pronto em cinco minutos?',
    'A prévia: uma demonstração do seu site com nome, segmento, objetivo, estilo e cores. O site final é desenvolvido depois, com o seu conteúdo.',
  ],
  [
    'O que está incluído no valor?',
    `Página responsiva, aplicação da logo e das cores da marca, estilos disponíveis, botão de WhatsApp, links para as redes, ${revisionRounds} rodadas de ajustes e acompanhamento da publicação. Cada pacote soma seções e recursos.`,
  ],
  [
    'Por que existem três pacotes?',
    `Porque o valor depende do que o site mostra: ${essencial.name} (${brl(essencial.price)}) com até ${essencial.maxSections} seções; ${profissional.name} (${brl(profissional.price)}) com até ${profissional.maxSections} seções, galeria e formulário; ${completo.name} (${brl(completo.price)}) com até ${completo.maxSections} seções e vitrine de produtos. O preço é o total — não há cobrança por estilo ou cor.`,
  ],
  [
    'O que é pago à parte?',
    `${externalCosts.join(', ')} são pagos direto aos fornecedores. Produção de textos, fotos e vídeos não está incluída.`,
  ],
  [
    'Existe mensalidade?',
    `Não há mensalidade de desenvolvimento: ${priceNotes.payment.toLowerCase()} Manutenção ou atualizações depois da entrega só existem se forem combinadas à parte.`,
  ],
  [
    'Qual é o prazo de desenvolvimento?',
    `De ${prazos}, conforme o pacote, ${priceNotes.deadlineStart}. O prazo é confirmado por escrito antes do início.`,
  ],
  [
    'Preciso ter logo e fotos para criar a prévia?',
    'Não. Sem logo, a prévia usa o nome da empresa; as imagens são ilustrações de exemplo. Para o site final, você envia a logo (se tiver) e as fotos da empresa.',
  ],
  [
    'Quem fornece os textos?',
    'Você fornece as informações da empresa. Os textos sugeridos na prévia são um ponto de partida e são revisados com você antes de entrar no site.',
  ],
  [
    'Quantos ajustes estão incluídos?',
    `${revisionRounds} rodadas de ajustes antes da publicação, em todos os pacotes. Mudanças de escopo depois da aprovação são orçadas à parte.`,
  ],
  [
    'O site funciona no celular?',
    'Sim. Todos os pacotes incluem layout responsivo, pensado primeiro para o celular e ajustado para o computador.',
  ],
  [
    'Posso contratar algo mais complexo?',
    `Sim, como projeto personalizado, com orçamento separado. Por exemplo: ${customNeeds.slice(0, 5).map((n) => n.name.toLowerCase()).join(', ')}. Os pacotes vão de ${priceRange}.`,
  ],
  [
    'Quem fica com o domínio e os acessos?',
    'O site entregue passa a ser seu após a quitação. A titularidade do domínio e das contas, e a transferência dos acessos, ficam registradas na proposta antes da contratação.',
  ],
  [
    'Posso alterar o site depois?',
    'Sim. Depois da publicação, alterações e manutenção são combinadas e orçadas à parte.',
  ],
];
