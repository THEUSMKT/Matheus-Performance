/* ==========================================================================
   Perguntas frequentes — EDITE AQUI
   As 6 primeiras aparecem direto na página; as demais, em "Ver todas".
   Respostas curtas, com o que o serviço faz hoje. Valores, prazos e
   limites vêm de packages.ts para nunca divergirem do configurador.
   Nada de formas de pagamento, garantias ou condições que não existam.
   ========================================================================== */
import { brl, packages, priceNotes, priceRange, revisionRounds, serviceTerms } from './packages';

const [essencial, profissional, completo] = packages;
const numbers = packages.flatMap((p) => p.deadline.match(/\d+/g) ?? []).map(Number);
const prazos = `${Math.min(...numbers)} a ${Math.max(...numbers)} dias úteis`;

/**
 * Ordem = prioridade: as 6 primeiras respondem ao que decide a compra
 * (prévia x site final, o que o preço inclui, domínio e hospedagem, prazo,
 * materiais e alterações depois da entrega).
 */
export const projectFaq: [string, string][] = [
  [
    'A prévia grátis já é o meu site?',
    'Não. A prévia é uma demonstração gratuita, sem cadastro, para você ver como o site pode ficar. O site final é desenvolvido depois que você confirma o pacote, com a sua logo, suas fotos e as informações revisadas com você, e só então é publicado.',
  ],
  [
    'O que está incluído no valor?',
    `Página responsiva, aplicação da logo e das cores da marca, estilos disponíveis, botão de WhatsApp, links para as redes, ${revisionRounds} rodadas de ajustes e acompanhamento da publicação. Cada pacote soma seções e recursos.`,
  ],
  [
    'Domínio e hospedagem estão incluídos?',
    'Não. O domínio (o endereço do site) e a hospedagem são pagos à parte, direto aos fornecedores — assim como um e-mail profissional ou ferramentas externas, se você quiser e se forem combinados. A produção de textos, fotos e vídeos também não está incluída.',
  ],
  [
    'Qual é o prazo de desenvolvimento?',
    `De ${prazos}, conforme o pacote, ${priceNotes.deadlineStart}. O prazo não conta a partir da prévia: ele é confirmado por escrito antes do início.`,
  ],
  [
    'O que preciso enviar para o site final?',
    `Para a prévia, nada. Para o site final: a logo (se tiver), fotos da empresa, dos produtos ou dos trabalhos, e os serviços, horários e formas de contato. ${serviceTerms.textReview}`,
  ],
  [
    'Posso alterar o site depois da entrega?',
    `Antes da publicação, estão incluídas ${revisionRounds} rodadas de ajustes. ${serviceTerms.afterDelivery}`,
  ],
  [
    'Por que existem três pacotes?',
    `Porque o valor depende do que o site mostra: ${essencial.name} (${brl(essencial.price)}) com até ${essencial.maxSections} seções; ${profissional.name} (${brl(profissional.price)}) com até ${profissional.maxSections} seções, galeria e formulário; ${completo.name} (${brl(completo.price)}) com até ${completo.maxSections} seções e vitrine de produtos. O preço é o total — não há cobrança por estilo ou cor.`,
  ],
  [
    'Existe mensalidade?',
    `Não há mensalidade de desenvolvimento: ${priceNotes.payment.toLowerCase()} Manutenção ou atualizações depois da entrega só existem se forem combinadas à parte.`,
  ],
  [
    'Quem fornece os textos?',
    `Você fornece as informações da empresa. ${serviceTerms.textReview} ${serviceTerms.contentProduction}`,
  ],
  [
    'O site funciona no celular?',
    'Sim. Todos os pacotes incluem layout responsivo, pensado primeiro para o celular e ajustado para o computador.',
  ],
  [
    'Meu projeto precisa de mais que uma página. E agora?',
    `Sim. Quando a necessidade vai além de uma página — por exemplo, mais de uma página ou informações de várias unidades —, conte o que sua empresa precisa: o escopo é avaliado na conversa e a proposta é feita sob medida. Os pacotes de página única vão de ${priceRange}.`,
  ],
  [
    'Quem fica com o domínio e os acessos?',
    'O site entregue passa a ser seu após a quitação. A titularidade do domínio e das contas, e a transferência dos acessos, ficam registradas na proposta antes da contratação.',
  ],
];
