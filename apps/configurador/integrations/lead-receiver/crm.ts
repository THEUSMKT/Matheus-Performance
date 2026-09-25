/* ==========================================================================
   Modelo do CRM — etapas do atendimento e registro do pedido.
   Pré-venda não é pedido de produção: o registro nasce em "novo contato" e
   só vira projeto em produção depois de aprovação e materiais recebidos.
   ========================================================================== */

export const CRM_SCHEMA_VERSION = 1;

export const stages = [
  { id: 'novo_contato', name: 'Novo contato', next: 'Responder e confirmar o interesse' },
  { id: 'qualificacao', name: 'Qualificação', next: 'Entender necessidade, prazo, orçamento e quem decide' },
  { id: 'proposta', name: 'Proposta', next: 'Enviar escopo, investimento e prazo por escrito' },
  { id: 'aprovacao', name: 'Aprovação', next: 'Aguardar aceite formal e condições de pagamento' },
  { id: 'materiais', name: 'Materiais', next: 'Receber textos, imagens, logo e acessos' },
  { id: 'desenvolvimento', name: 'Desenvolvimento', next: 'Construir o site no prazo combinado' },
  { id: 'revisao', name: 'Revisão', next: 'Rodadas de ajustes incluídas' },
  { id: 'publicacao', name: 'Publicação', next: 'Publicar e entregar os acessos' },
  { id: 'acompanhamento', name: 'Acompanhamento', next: 'Verificar funcionamento e pedidos recebidos' },
  { id: 'perdido', name: 'Perdido', next: 'Registrar o motivo' },
] as const;

export type StageId = (typeof stages)[number]['id'];

/** Motivo obrigatório ao mover para "perdido". */
export const lossReasons = [
  { id: 'preco', name: 'Investimento acima do esperado' },
  { id: 'prazo', name: 'Prazo não atende' },
  { id: 'sem_resposta', name: 'Sem resposta após contatos' },
  { id: 'escopo', name: 'Precisa de algo fora do escopo' },
  { id: 'concorrente', name: 'Escolheu outro fornecedor' },
  { id: 'adiado', name: 'Projeto adiado' },
  { id: 'outro', name: 'Outro (descrever)' },
] as const;

export type CrmLead = {
  schema: typeof CRM_SCHEMA_VERSION;
  leadId: string;
  idempotencyKey: string;
  createdAt: string;
  stage: StageId;
  lossReason?: (typeof lossReasons)[number]['id'];
  contact: { name: string; channel: string; value: string };
  qualification: { need: string; budget: unknown; deadline: string; decision: string };
  consent: { commercial: true; marketing: boolean };
  /** Estimativa recalculada no servidor — é a que vale para a proposta. */
  estimate: { min: number; max: number; total: number; deadline: string; diagnosis: boolean };
  /** Verdadeiro quando o valor mostrado no navegador não bate com o recalculado. */
  estimateMismatch: boolean;
  flowVersion: string;
  projectId: string;
  project: unknown;
  origin: unknown;
};

/** Transições permitidas. Perda exige motivo; nada pula direto para produção. */
export function canMove(from: StageId, to: StageId, lossReason?: string): boolean {
  if (to === 'perdido') return from !== 'perdido' && Boolean(lossReason);
  if (from === 'perdido') return to === 'novo_contato';
  const order = stages.map((s) => s.id).filter((id) => id !== 'perdido');
  const a = order.indexOf(from);
  const b = order.indexOf(to);
  return b === a + 1 || b < a;
}
