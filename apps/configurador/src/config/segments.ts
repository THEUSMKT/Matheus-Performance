/* ==========================================================================
   Segmentos e sugestões de conteúdo — EDITE AQUI
   Textos neutros que a prévia usa enquanto o visitante não escreve os
   próprios. Todos aparecem na prévia como sugestões editáveis. Nada de
   localização, tempo de mercado, certificações, números ou resultados.
   As imagens são ilustrações próprias em public/demo/.
   ========================================================================== */

export type Segment = {
  id: string;
  /** Nome completo (resumos e mensagem). */
  name: string;
  /** Rótulo curto do botão de escolha. */
  short: string;
  /** Nome fictício usado enquanto a empresa não tem nome. */
  demo: string;
  title: string;
  intro: string;
  services: string[];
  image: string;
  /** Objetivos mais comuns no segmento (o primeiro é o sugerido). */
  objectives: string[];
  /** Três estilos sugeridos, na ordem de exibição. */
  styles: string[];
  palette: string;
  /** Exemplos de serviço principal para escolher com um toque. */
  quick: string[];
};

export const segments: Segment[] = [
  {
    id: 'local',
    name: 'Serviços locais',
    short: 'Serviços locais',
    demo: 'Oficina do Lar',
    title: 'Sua casa bem cuidada, sem complicação.',
    intro: 'Reparos e instalações para deixar cada ambiente pronto para o dia a dia.',
    services: ['Pequenos reparos', 'Instalações', 'Manutenção'],
    image: 'reparos',
    objectives: ['orcamento', 'servicos'],
    styles: ['marcante', 'essencial', 'tecnologico'],
    palette: 'azul',
    quick: ['Instalação de ar-condicionado', 'Serviços elétricos', 'Pintura'],
  },
  {
    id: 'beleza',
    name: 'Beleza e estética',
    short: 'Beleza e estética',
    demo: 'Ateliê Aurora',
    title: 'Um tempo para você. Um cuidado só seu.',
    intro: 'Beleza e bem-estar com atenção ao seu estilo e à sua rotina.',
    services: ['Cuidados faciais', 'Cabelo', 'Unhas'],
    image: 'beleza',
    objectives: ['agendamento', 'servicos'],
    styles: ['elegante', 'sofisticado', 'essencial'],
    palette: 'terracota',
    quick: ['Estética facial', 'Corte e coloração', 'Manicure'],
  },
  {
    id: 'consultoria',
    name: 'Consultoria e serviços profissionais',
    short: 'Consultoria',
    demo: 'Clara Consultoria',
    title: 'Clareza para dar o próximo passo.',
    intro: 'Orientação próxima para organizar prioridades e decidir com segurança.',
    services: ['Diagnóstico inicial', 'Planejamento', 'Acompanhamento'],
    image: 'consultoria',
    objectives: ['orcamento', 'empresa'],
    styles: ['essencial', 'elegante', 'tecnologico'],
    palette: 'azul',
    quick: ['Contabilidade', 'Consultoria empresarial', 'Assessoria jurídica'],
  },
  {
    id: 'alimentacao',
    name: 'Alimentação',
    short: 'Alimentação',
    demo: 'Casa Oliva',
    title: 'Feito com calma. Servido com afeto.',
    intro: 'Receitas da casa e uma boa razão para reunir quem você gosta.',
    services: ['Pratos da casa', 'Opções da estação', 'Encomendas'],
    image: 'alimentacao',
    objectives: ['produtos', 'empresa'],
    styles: ['sofisticado', 'elegante', 'marcante'],
    palette: 'verde',
    quick: ['Bolos e doces', 'Marmitas', 'Pizzas'],
  },
  {
    id: 'criativo',
    name: 'Arquitetura ou portfólio criativo',
    short: 'Arquitetura e criativo',
    demo: 'Estúdio Forma',
    title: 'Espaços e ideias que ganham forma.',
    intro: 'Projetos pensados do conceito à entrega, com atenção a cada detalhe.',
    services: ['Projetos residenciais', 'Projetos comerciais', 'Interiores'],
    image: 'interiores',
    objectives: ['trabalhos', 'orcamento'],
    styles: ['escuro', 'marcante', 'sofisticado'],
    palette: 'roxo',
    quick: ['Projetos de arquitetura', 'Fotografia', 'Design gráfico'],
  },
  {
    id: 'imoveis',
    name: 'Imóveis e corretores',
    short: 'Imóveis e corretores',
    demo: 'Clara Imóveis',
    title: 'Encontre um imóvel com orientação em cada etapa.',
    intro: 'Conheça opções e converse sobre o que faz sentido para você, com atendimento próximo do primeiro contato à visita.',
    services: ['Compra e venda de imóveis', 'Avaliação de imóveis', 'Consultoria imobiliária'],
    image: 'imoveis',
    objectives: ['trabalhos', 'agendamento', 'orcamento'],
    styles: ['sofisticado', 'elegante', 'marcante'],
    palette: 'azul',
    quick: ['Compra de imóveis', 'Venda de imóveis', 'Consultoria imobiliária'],
  },
  {
    id: 'outro',
    name: 'Outro segmento',
    short: 'Outro',
    demo: 'Seu Negócio',
    title: 'O que você precisa, com atenção de verdade.',
    intro: 'Conheça nossos serviços e encontre a solução que faz sentido para você.',
    services: ['Atendimento', 'Soluções sob medida', 'Acompanhamento'],
    image: 'loja',
    objectives: ['orcamento', 'empresa'],
    styles: ['essencial', 'marcante', 'elegante'],
    palette: 'azul',
    quick: [],
  },
];

/**
 * Regras por palavra-chave: quando o serviço principal (ou o segmento
 * digitado em "Outro") combina, a prévia usa uma imagem e serviços mais
 * próximos. São sugestões — o visitante confirma ou edita.
 * `segment` diz em qual segmento o nome de exemplo (demo) combina com o
 * serviço; sem ele, a prévia usa um nome neutro ("Seu Negócio").
 * A ordem importa: vale a primeira regra que combinar.
 */
export const keywordRules: { match: RegExp; image?: string; segment?: string; services: string[] }[] = [
  { match: /pet ?shop|banho e tosa|\btosa|veterin|cachorr|\bc[aã]es\b|\bgatos?\b|\bpets?\b|animais de estima/i, image: 'pet', services: ['Banho e tosa', 'Cuidados com o pet', 'Produtos para pets'] },
  { match: /mec[aâ]nic|oficina(?! de (costura|arte))|autom[oó]v|\bcarros?\b|funilaria|troca de [oó]leo|\bfreios?\b|\bpneus?\b|auto ?el[eé]tric|alinhamento/i, image: 'auto', services: ['Revisão', 'Troca de óleo', 'Freios e suspensão'] },
  { match: /corretor|im[oó]ve|imobili[aá]ri|compra e venda|avalia[cç][aã]o de im[oó]ve/i, image: 'imoveis', segment: 'imoveis', services: ['Compra e venda de imóveis', 'Consultoria imobiliária', 'Avaliação de imóveis'] },
  { match: /ar[\s-]?condicionado|climatiza|refrigera/i, image: 'clima', segment: 'local', services: ['Instalação de ar-condicionado', 'Manutenção preventiva', 'Limpeza e higienização'] },
  { match: /el[eé]tric/i, image: 'reparos', segment: 'local', services: ['Instalações elétricas', 'Manutenção elétrica', 'Troca de disjuntores e tomadas'] },
  { match: /hidr[aá]ulic|encana/i, image: 'reparos', segment: 'local', services: ['Reparos hidráulicos', 'Instalações', 'Troca de torneiras e registros'] },
  { match: /pintur/i, image: 'reparos', segment: 'local', services: ['Pintura residencial', 'Pintura comercial', 'Textura e acabamento'] },
  { match: /reforma|pedreir|marido de aluguel|montagem de m[oó]veis|gesso|marcenar|serralh/i, image: 'reparos', segment: 'local', services: ['Pequenas reformas', 'Reparos', 'Montagem e instalação'] },
  { match: /limpez|faxin|diarista/i, image: 'reparos', segment: 'local', services: ['Limpeza residencial', 'Limpeza pós-obra', 'Limpeza comercial'] },
  { match: /cabel|sal[aã]o|barb|corte|colora/i, image: 'beleza', segment: 'beleza', services: ['Corte', 'Coloração', 'Tratamentos capilares'] },
  { match: /unha|manicure|pedicure/i, image: 'beleza', segment: 'beleza', services: ['Manicure', 'Pedicure', 'Alongamento de unhas'] },
  { match: /est[eé]tic|facial|pele|sobrancelh|c[ií]lio/i, image: 'beleza', segment: 'beleza', services: ['Limpeza de pele', 'Design de sobrancelhas', 'Tratamentos faciais'] },
  { match: /arquitet|interior/i, image: 'interiores', segment: 'criativo', services: ['Projetos residenciais', 'Projetos comerciais', 'Design de interiores'] },
  { match: /contab|cont[aá]bil/i, image: 'consultoria', segment: 'consultoria', services: ['Abertura de empresa', 'Contabilidade mensal', 'Imposto de renda'] },
  { match: /advoca|advoga|jur[ií]dic/i, image: 'consultoria', segment: 'consultoria', services: ['Consultoria jurídica', 'Contratos', 'Acompanhamento de processos'] },
  { match: /academia|personal trainer|\btreinos?\b|pilates|yoga|ioga|crossfit/i, services: ['Treinos personalizados', 'Aulas em grupo', 'Avaliação física'] },
  { match: /idioma|ingl[eê]s|espanhol|aula|curso|escola/i, image: 'consultoria', services: ['Aulas individuais', 'Turmas', 'Aulas online'] },
  { match: /bolo|doce|confeit/i, image: 'alimentacao', segment: 'alimentacao', services: ['Bolos', 'Doces', 'Encomendas para festas'] },
  { match: /pizza|lanche|hamb[uú]rg/i, image: 'alimentacao', segment: 'alimentacao', services: ['Cardápio da casa', 'Combos', 'Pedidos para retirada'] },
  { match: /marmit|refei[cç]/i, image: 'alimentacao', segment: 'alimentacao', services: ['Marmitas da semana', 'Refeições congeladas', 'Pedidos para empresas'] },
  { match: /fotogra/i, image: 'criativo', segment: 'criativo', services: ['Ensaios', 'Eventos', 'Fotos para empresas'] },
  { match: /design|identidade visual|logotipo/i, image: 'criativo', segment: 'criativo', services: ['Identidade visual', 'Materiais gráficos', 'Direção de arte'] },
  { match: /roupa|moda|boutique|loja/i, image: 'loja', services: ['Novidades', 'Mais vendidos', 'Peças sob encomenda'] },
  { match: /psic[oó]log|terapia|fisioterap|nutricion|dentist|odonto|fonoaudi/i, image: 'consultoria', services: ['Consultas', 'Avaliação inicial', 'Acompanhamento'] },
];
