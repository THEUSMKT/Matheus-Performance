/* ==========================================================================
   Segmentos e sugestões de conteúdo — EDITE AQUI
   Textos neutros que a prévia usa enquanto o visitante não escreve os
   próprios. Todos aparecem na prévia como sugestões editáveis. Nada de
   localização, tempo de mercado, certificações, números ou resultados.
   O tipo de negócio dentro de cada segmento (clínica veterinária, banho e
   tosa, confeitaria...) fica em subsegments.ts; as imagens, em assets.ts.
   ========================================================================== */

export type Segment = {
  id: string;
  /** Nome completo (resumos e mensagem). */
  name: string;
  /** Rótulo curto do botão de escolha. */
  short: string;
  /** Objetivos mais comuns no segmento (o primeiro é o sugerido). */
  objectives: string[];
  /** Três estilos sugeridos, na ordem de exibição. */
  styles: string[];
  palette: string;
  /** Exemplos de serviço principal para escolher com um toque. */
  quick: string[];
  /** Finalidade do exemplo, em uma frase curta (cartão da apresentação). */
  purpose: string;
  /** Subsegmento do exemplo da apresentação (config/subsegments.ts). */
  example: string;
};

export const segments: Segment[] = [
  {
    id: 'local',
    example: 'servicos-locais',
    name: 'Serviços locais',
    short: 'Serviços locais',
    objectives: ['orcamento', 'servicos'],
    styles: ['marcante', 'essencial', 'tecnologico'],
    palette: 'azul',
    quick: ['Limpeza residencial', 'Instalação de ar-condicionado', 'Pintura'],
    purpose: 'Pedidos de orçamento pelo WhatsApp',
  },
  {
    id: 'beleza',
    example: 'beleza',
    name: 'Beleza e estética',
    short: 'Beleza e estética',
    objectives: ['agendamento', 'servicos'],
    styles: ['elegante', 'sofisticado', 'essencial'],
    palette: 'terracota',
    quick: ['Estética facial', 'Corte e coloração', 'Manicure'],
    purpose: 'Serviços e pedidos de horário',
  },
  {
    id: 'consultoria',
    example: 'consultoria',
    name: 'Consultoria e serviços profissionais',
    short: 'Consultoria',
    objectives: ['orcamento', 'empresa'],
    styles: ['essencial', 'elegante', 'tecnologico'],
    palette: 'azul',
    quick: ['Contabilidade', 'Consultoria empresarial', 'Assessoria jurídica'],
    purpose: 'Áreas de atuação e primeiro contato',
  },
  {
    id: 'alimentacao',
    example: 'restaurante',
    name: 'Alimentação',
    short: 'Alimentação',
    objectives: ['produtos', 'empresa'],
    styles: ['sofisticado', 'elegante', 'marcante'],
    palette: 'verde',
    quick: ['Bolos e doces', 'Marmitas', 'Pizzas'],
    purpose: 'Cardápio com pedidos pelo WhatsApp',
  },
  {
    id: 'criativo',
    example: 'arquitetura',
    name: 'Arquitetura ou portfólio criativo',
    short: 'Arquitetura e criativo',
    objectives: ['trabalhos', 'orcamento'],
    styles: ['escuro', 'marcante', 'sofisticado'],
    palette: 'roxo',
    quick: ['Projetos de arquitetura', 'Fotografia', 'Design gráfico'],
    purpose: 'Portfólio de projetos',
  },
  {
    id: 'imoveis',
    example: 'corretor',
    name: 'Imóveis e corretores',
    short: 'Imóveis e corretores',
    objectives: ['agendamento', 'orcamento', 'trabalhos'],
    styles: ['sofisticado', 'elegante', 'marcante'],
    palette: 'azul',
    quick: ['Compra de imóveis', 'Venda de imóveis', 'Consultoria imobiliária'],
    purpose: 'Imóveis e visitas com orientação',
  },
  {
    id: 'pet',
    example: 'clinica-veterinaria',
    name: 'Veterinária e cuidados pet',
    short: 'Pet e veterinária',
    objectives: ['agendamento', 'servicos'],
    styles: ['essencial', 'elegante', 'marcante'],
    palette: 'petroleo',
    quick: ['Clínica veterinária', 'Banho e tosa', 'Pet shop'],
    purpose: 'Consultas e pedidos de horário',
  },
  {
    id: 'outro',
    example: 'outro',
    name: 'Outro segmento',
    short: 'Outro',
    objectives: ['orcamento', 'empresa'],
    styles: ['essencial', 'marcante', 'elegante'],
    palette: 'azul',
    quick: [],
    purpose: 'Apresentação e contato para qualquer negócio',
  },
];
