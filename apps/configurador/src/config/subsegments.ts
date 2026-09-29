/* ==========================================================================
   Subsegmentos — EDITE AQUI
   O tipo de negócio dentro de cada segmento (clínica veterinária, banho e
   tosa, confeitaria...). Define a família visual, as imagens permitidas, o
   nome provisório, o botão e os textos de exemplo — específicos, sem fatos
   inventados (anos, clientes, 24 horas, credenciais, preços).

   A detecção soma pesos de termos e ignora trechos negados ("não temos
   atendimento veterinário"): uma palavra isolada e fraca não decide nada.
   ========================================================================== */
import type { FamilyId } from './families';

export type SubsegmentCopy = {
  about: string;
  serviceDetails: string[];
  differentials: string[];
  processSteps: string[];
  faqQuestions: string[];
};

export type Subsegment = {
  id: string;
  segment: string;
  family: FamilyId;
  name: string;
  /** Nome provisório quando a empresa ainda não tem nome ("Sua clínica"). */
  provisional: string;
  /** Nome fictício dos exemplos da apresentação. */
  demo: string;
  /** Subsegmento padrão do segmento: não é detectado por termos. */
  generic?: boolean;
  /** Termos com peso. A soma precisa chegar a 2. */
  terms: [RegExp, number][];
  /** Contexto obrigatório para os termos valerem (ex.: animais no pet). */
  requires?: RegExp;
  /** Categorias de imagem permitidas (config/assets.ts), na ordem de preferência. Vazio = topo tipográfico. */
  assets: string[];
  services: string[];
  title: string;
  intro: string;
  /** Botão principal por objetivo, quando o do objetivo seria genérico demais. */
  cta?: Partial<Record<string, string>>;
  copy: SubsegmentCopy;
  /** A única pergunta que vale fazer quando a descrição é ambígua. */
  question?: string;
};

const PET = /\bpets?\b|c[aã]es|cachorr|\bgat[oa]s?\b|felin|animai?s|veterin|\btosa|pet ?shop|tutor/i;

export const subsegments: Subsegment[] = [
  /* ── Pet ─────────────────────────────────────────────────────────────── */
  {
    id: 'clinica-veterinaria',
    segment: 'pet',
    family: 'pet',
    name: 'Clínica veterinária',
    provisional: 'Sua clínica',
    demo: 'Clínica Vila Pet',
    requires: PET,
    terms: [[/cl[ií]nica veterin[aá]ria|hospital veterin[aá]rio|consult[oó]rio veterin[aá]rio/i, 4], [/veterin[aá]ri[oa]s?/i, 3], [/vacina/i, 2], [/cirurgi|castra[cç]/i, 2], [/\bconsultas?\b/i, 1], [/\bexames?\b/i, 1]],
    assets: ['clinica-veterinaria'],
    services: ['Consultas', 'Vacinação', 'Orientação preventiva'],
    title: 'Consultas para cães e gatos, com horário combinado.',
    intro: 'Peça um horário pelo WhatsApp e conte o que o seu pet precisa.',
    cta: { agendamento: 'Agendar consulta', orcamento: 'Falar com a clínica', empresa: 'Falar com a clínica', servicos: 'Ver atendimentos' },
    copy: {
      about: 'Atendimento clínico para cães e gatos, com consultas agendadas e orientação clara para o tutor em cada etapa do cuidado.',
      serviceDetails: ['Avaliação clínica do seu pet, com orientação sobre os próximos cuidados.', 'Aplicação de vacinas e orientação sobre o calendário de vacinação.', 'Conversa sobre alimentação, rotina e prevenção no dia a dia.'],
      differentials: ['Consultas com horário combinado', 'Orientação explicada ao tutor', 'Atendimento de cães e gatos'],
      processSteps: ['Peça um horário pelo WhatsApp', 'Confirme o dia da consulta', 'Leve seu pet à clínica'],
      faqQuestions: ['Como peço um horário de consulta?', 'O que levar na primeira consulta?', 'Como sei quais vacinas meu pet precisa?'],
    },
  },
  {
    id: 'banho-e-tosa',
    segment: 'pet',
    family: 'pet',
    name: 'Banho e tosa',
    provisional: 'Seu espaço pet',
    demo: 'Banho de Cheiro',
    requires: PET,
    terms: [[/banho e tosa|banho & tosa/i, 3], [/\btosa\b|tosador|tosas?\s+higi[eê]nica/i, 2], [/\bbanhos?\b/i, 1], [/hidrata[cç][aã]o|escova[cç][aã]o de pelo|est[eé]tica animal|grooming/i, 1]],
    assets: ['banho-e-tosa'],
    services: ['Banho', 'Tosa', 'Hidratação'],
    title: 'Banho e tosa com horário marcado para o seu pet.',
    intro: 'Escolha o cuidado e peça um horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar banho e tosa', orcamento: 'Consultar valores', servicos: 'Ver cuidados' },
    copy: {
      about: 'Um espaço dedicado à higiene e ao conforto do seu pet, com banho, tosa e cuidados com a pelagem combinados com o tutor.',
      serviceDetails: ['Banho com produtos adequados ao tipo de pelagem.', 'Tosa conforme o combinado com o tutor, com atenção ao conforto.', 'Hidratação para pelagens que pedem um cuidado extra.'],
      differentials: ['Horário combinado com antecedência', 'Cuidados explicados ao tutor', 'Atenção ao conforto do pet'],
      processSteps: ['Escolha o serviço', 'Peça um horário pelo WhatsApp', 'Traga seu pet no dia combinado'],
      faqQuestions: ['Quanto tempo leva o banho e tosa?', 'Quais portes vocês atendem?', 'Como peço um horário?'],
    },
  },
  {
    id: 'pet-shop',
    segment: 'pet',
    family: 'pet',
    name: 'Pet shop',
    provisional: 'Seu pet shop',
    demo: 'Empório Pet',
    requires: PET,
    terms: [[/pet ?shop/i, 3], [/ra[cç][aã]o|ra[cç][oõ]es/i, 2], [/produtos? para (pets?|c[aã]es|gatos)|acess[oó]rios|brinquedos|coleiras?|petiscos/i, 2]],
    assets: ['pet-shop'],
    services: ['Rações', 'Petiscos e brinquedos', 'Acessórios'],
    title: 'Produtos para o dia a dia do seu pet.',
    intro: 'Veja o que temos e faça seu pedido pelo WhatsApp.',
    cta: { produtos: 'Ver produtos', orcamento: 'Fazer um pedido', empresa: 'Falar com a loja', agendamento: 'Falar com a loja' },
    copy: {
      about: 'Uma loja para o dia a dia do seu pet, com rações, petiscos e acessórios, e pedidos combinados pelo WhatsApp.',
      serviceDetails: ['Rações para cães e gatos, conforme a disponibilidade da loja.', 'Petiscos e brinquedos para a rotina do seu pet.', 'Coleiras, camas e outros itens para o dia a dia.'],
      differentials: ['Pedido pelo WhatsApp', 'Retirada ou entrega combinada', 'Ajuda para escolher'],
      processSteps: ['Veja os produtos', 'Mande seu pedido pelo WhatsApp', 'Combine a retirada ou a entrega'],
      faqQuestions: ['Como faço um pedido?', 'Vocês entregam na minha região?', 'Como consulto a disponibilidade de um produto?'],
    },
  },
  {
    id: 'pet',
    segment: 'pet',
    family: 'pet',
    name: 'Cuidados pet',
    provisional: 'Seu negócio pet',
    demo: 'Vila Pet',
    generic: true,
    terms: [],
    assets: [],
    services: ['Atendimento', 'Cuidados', 'Orientação'],
    title: 'Cuidado com atenção para o seu pet.',
    intro: 'Conheça os serviços e fale com a gente pelo WhatsApp.',
    question: 'Você oferece consultas veterinárias, banho e tosa ou os dois?',
    copy: {
      about: 'Conheça os serviços para o seu pet e converse com a gente para combinar o que ele precisa.',
      serviceDetails: ['Conte o que o seu pet precisa e combine o atendimento.', 'Veja as opções e tire dúvidas antes de escolher.', 'Combine o horário e os detalhes pelo WhatsApp.'],
      differentials: ['Atendimento combinado com o tutor', 'Informações claras antes', 'Contato direto pelo WhatsApp'],
      processSteps: ['Conte o que o seu pet precisa', 'Combine o atendimento', 'Confirme pelo WhatsApp'],
      faqQuestions: ['Como funciona o primeiro atendimento?', 'Quais informações devo enviar?', 'Como combino um horário?'],
    },
  },

  /* ── Serviços locais ─────────────────────────────────────────────────── */
  {
    id: 'climatizacao',
    segment: 'local',
    family: 'local',
    name: 'Ar-condicionado',
    provisional: 'Sua empresa',
    demo: 'Clima Sul Refrigeração',
    terms: [[/ar[\s-]?condicionado|climatiza|refrigera[cç][aã]o|split\b/i, 3]],
    assets: ['climatizacao'],
    services: ['Instalação de ar-condicionado', 'Manutenção preventiva', 'Limpeza e higienização'],
    title: 'Instalação e manutenção de ar-condicionado.',
    intro: 'Conte o modelo e o local da instalação e peça seu orçamento pelo WhatsApp.',
    copy: {
      about: 'Instalação, manutenção e higienização de ar-condicionado para casas e empresas, com o serviço combinado antes da visita.',
      serviceDetails: ['Instalação conforme o modelo do aparelho e as condições do local.', 'Revisão periódica para o aparelho funcionar melhor.', 'Limpeza dos filtros e da parte interna do aparelho.'],
      differentials: ['Visita combinada com antecedência', 'Serviço explicado antes', 'Casas e empresas'],
      processSteps: ['Informe o modelo e o local', 'Combine a visita', 'Aprove o orçamento'],
      faqQuestions: ['Que informações ajudam no orçamento?', 'De quanto em quanto tempo fazer manutenção?', 'Vocês atendem empresas?'],
    },
  },
  {
    id: 'limpeza',
    segment: 'local',
    family: 'local',
    name: 'Limpeza',
    provisional: 'Sua empresa',
    demo: 'Casa Limpa Serviços',
    terms: [[/limpeza (residencial|comercial|p[oó]s[- ]obra|de (casas?|escrit[oó]rios|apartamentos|condom[ií]nios))|faxina|diarista|higieniza[cç][aã]o de (sof[aá]s?|estofados?|colch[oõ]es)/i, 3], [/limpeza(?! de pele)/i, 1], [/p[oó]s[- ]obra/i, 2], [/organiza[cç][aã]o de (arm[aá]rios|ambientes|casas?)|personal organizer/i, 1]],
    assets: ['limpeza'],
    services: ['Limpeza residencial', 'Limpeza pós-obra', 'Limpeza comercial'],
    title: 'Limpeza para casas, apartamentos e escritórios.',
    intro: 'Conte o tipo de limpeza e o tamanho do imóvel e peça seu orçamento.',
    copy: {
      about: 'Limpeza residencial e comercial combinada antes: você conta o que precisa, recebe o orçamento e agenda o dia.',
      serviceDetails: ['Limpeza dos ambientes do dia a dia, da cozinha aos banheiros.', 'Remoção de pó e resíduos depois de reformas e pequenas obras.', 'Limpeza de salas e escritórios, no horário combinado.'],
      differentials: ['Orçamento conforme o tamanho do imóvel', 'Tipo de limpeza combinado antes', 'Dia e horário agendados'],
      processSteps: ['Conte o tipo de limpeza', 'Informe o tamanho do imóvel', 'Receba o orçamento'],
      faqQuestions: ['Quais informações ajudam no orçamento?', 'Os produtos de limpeza estão incluídos?', 'Vocês atendem aos fins de semana?'],
    },
  },
  {
    id: 'eletrica',
    segment: 'local',
    family: 'local',
    name: 'Serviços elétricos',
    provisional: 'Sua empresa',
    demo: 'Volt Serviços Elétricos',
    terms: [[/el[eé]tric[ao]s?|eletricista|disjuntor|tomadas?\b|quadro de (luz|distribui)/i, 3]],
    assets: ['eletrica'],
    services: ['Instalações elétricas', 'Manutenção elétrica', 'Troca de disjuntores e tomadas'],
    title: 'Serviços elétricos para casas e comércios.',
    intro: 'Descreva o problema ou a instalação e peça seu orçamento.',
    copy: {
      about: 'Instalações e reparos elétricos em casas e comércios, com o serviço avaliado e combinado antes da execução.',
      serviceDetails: ['Novos pontos, iluminação e instalações conforme o projeto do local.', 'Identificação e reparo de falhas na instalação.', 'Substituição de disjuntores, tomadas e interruptores.'],
      differentials: ['Avaliação antes do orçamento', 'Serviço explicado com clareza', 'Casas e comércios'],
      processSteps: ['Descreva o serviço', 'Combine a avaliação', 'Aprove o orçamento'],
      faqQuestions: ['Posso enviar fotos do problema?', 'Vocês atendem comércios?', 'Como recebo o orçamento?'],
    },
  },
  {
    id: 'pintura',
    segment: 'local',
    family: 'local',
    name: 'Pintura',
    provisional: 'Sua empresa',
    demo: 'Cor & Acabamento Pinturas',
    terms: [[/pintura|pintor|textura|grafiato|massa corrida/i, 3]],
    assets: ['pintura'],
    services: ['Pintura residencial', 'Pintura comercial', 'Textura e acabamento'],
    title: 'Pintura residencial e comercial, com acabamento cuidadoso.',
    intro: 'Conte os ambientes e o tipo de acabamento e peça seu orçamento.',
    copy: {
      about: 'Pintura de casas, apartamentos e comércios, com preparação das paredes e acabamento combinados antes de começar.',
      serviceDetails: ['Pintura de ambientes internos e externos, com proteção dos móveis.', 'Pintura de lojas e escritórios, no horário que atrapalha menos.', 'Texturas e acabamentos escolhidos junto com você.'],
      differentials: ['Preparação das paredes antes', 'Cores e acabamento combinados', 'Ambiente protegido durante o serviço'],
      processSteps: ['Conte os ambientes', 'Combine a visita', 'Aprove o orçamento'],
      faqQuestions: ['Vocês ajudam a escolher as cores?', 'Quanto tempo leva a pintura de um cômodo?', 'O material está incluído?'],
    },
  },
  {
    id: 'reformas',
    segment: 'local',
    family: 'local',
    name: 'Reparos e reformas',
    provisional: 'Sua empresa',
    demo: 'Oficina do Lar',
    terms: [[/reforma|pedreir|marido de aluguel|montagem de m[oó]veis|gesso|marcenar|serralh|hidr[aá]ulic|encanad|vazamento/i, 3], [/reparos?|consertos?|manuten[cç][aã]o/i, 1]],
    assets: ['reparos'],
    services: ['Pequenos reparos', 'Instalações', 'Pequenas reformas'],
    title: 'Reparos e pequenas reformas sem complicação.',
    intro: 'Conte o que precisa ser feito e peça seu orçamento pelo WhatsApp.',
    copy: {
      about: 'Reparos, instalações e pequenas reformas para casas e apartamentos, com o serviço combinado antes de começar.',
      serviceDetails: ['Consertos do dia a dia, de portas a torneiras.', 'Instalação de prateleiras, suportes, chuveiros e luminárias.', 'Pequenas reformas com etapas e prazos combinados.'],
      differentials: ['Serviço combinado antes', 'Orçamento por escrito', 'Ambiente limpo ao final'],
      processSteps: ['Conte o que precisa', 'Envie fotos, se puder', 'Aprove o orçamento'],
      faqQuestions: ['Posso enviar fotos do serviço?', 'O material está incluído?', 'Vocês atendem minha região?'],
    },
  },
  {
    id: 'jardinagem',
    segment: 'local',
    family: 'local',
    name: 'Jardinagem e paisagismo',
    provisional: 'Sua empresa',
    demo: 'Jardim Bem Cuidado',
    terms: [[/jardin|paisagis|jardim|gramado|ro[cç]ad|ro[cç]agem|poda (de )?(árvor|arvor|plant|arbust|cerca)|corte de grama|horta/i, 3], [/\bgrama\b|\bplantas?\b|mudas?\b|canteiros?|\bpodas?\b|irriga[cç]/i, 1]],
    assets: ['jardinagem'],
    services: ['Manutenção de jardins', 'Corte de grama', 'Poda e limpeza'],
    title: 'Jardins bem cuidados, com visita combinada.',
    intro: 'Conte o tamanho do espaço e o que ele precisa e peça seu orçamento pelo WhatsApp.',
    copy: {
      about: 'Manutenção e cuidado de jardins em casas, condomínios e empresas, com o serviço combinado antes da visita.',
      serviceDetails: ['Corte de grama, limpeza de canteiros e recolhimento do que foi cortado.', 'Poda de plantas e arbustos, respeitando a época e o formato de cada uma.', 'Plantio de mudas e orientação sobre rega e cuidados no dia a dia.'],
      differentials: ['Serviço combinado antes da visita', 'Espaço limpo ao final', 'Orientação sobre os cuidados'],
      processSteps: ['Conte o tamanho do espaço', 'Envie fotos, se puder', 'Combine a visita'],
      faqQuestions: ['Posso enviar fotos do jardim?', 'Vocês fazem manutenção periódica?', 'Vocês atendem minha região?'],
    },
  },
  {
    id: 'oficina',
    segment: 'local',
    family: 'local',
    name: 'Oficina mecânica',
    provisional: 'Sua oficina',
    demo: 'Garagem Central',
    terms: [[/mec[aâ]nic|oficina(?! de (costura|arte))|autom[oó]v|automotiv|funilaria|troca de [oó]leo|\bfreios?\b|\bpneus?\b|alinhamento/i, 3], [/auto ?el[eé]tric/i, 4], [/ve[ií]culos?|\bcarros?\b|\bmotos?\b/i, 2]],
    assets: ['automotivo'],
    services: ['Revisão', 'Troca de óleo', 'Freios e suspensão'],
    title: 'Revisão e manutenção para o seu carro.',
    intro: 'Conte o modelo e o que está acontecendo e peça seu orçamento.',
    copy: {
      about: 'Manutenção e reparos para carros, com diagnóstico explicado e orçamento aprovado antes do serviço.',
      serviceDetails: ['Revisão dos itens principais do carro, conforme o combinado.', 'Troca de óleo e filtros com o produto indicado para o modelo.', 'Avaliação e reparo de freios e suspensão.'],
      differentials: ['Diagnóstico explicado', 'Orçamento aprovado antes', 'Serviço combinado'],
      processSteps: ['Conte o modelo e o problema', 'Traga o carro para avaliação', 'Aprove o orçamento'],
      faqQuestions: ['Preciso agendar a avaliação?', 'Quanto tempo leva uma revisão?', 'Como recebo o orçamento?'],
    },
  },
  {
    id: 'servicos-locais',
    segment: 'local',
    family: 'local',
    name: 'Serviços para casa',
    provisional: 'Sua empresa',
    demo: 'Oficina do Lar',
    generic: true,
    terms: [],
    assets: ['reparos'],
    services: ['Pequenos reparos', 'Instalações', 'Manutenção'],
    title: 'Serviços para sua casa, combinados antes de começar.',
    intro: 'Conte o que precisa e peça seu orçamento pelo WhatsApp.',
    copy: {
      about: 'Entenda quais serviços estão disponíveis, conte o que precisa ser feito e combine uma avaliação antes de definir os próximos passos.',
      serviceDetails: ['Explique o que precisa e, se possível, envie fotos para orientar a avaliação.', 'Combine o serviço considerando o local, o acesso e as condições do ambiente.', 'Tire dúvidas sobre o que está incluído e os cuidados depois do serviço.'],
      differentials: ['Pedido organizado desde o primeiro contato', 'Escopo combinado antes da execução', 'Orientações claras sobre as etapas'],
      processSteps: ['Conte o que precisa', 'Combine a avaliação', 'Aprove o orçamento'],
      faqQuestions: ['Quais detalhes ajudam a avaliar o serviço?', 'O atendimento cobre minha região?', 'Como recebo o orçamento?'],
    },
  },

  /* ── Beleza ──────────────────────────────────────────────────────────── */
  {
    id: 'barbearia',
    segment: 'beleza',
    family: 'beleza',
    name: 'Barbearia',
    provisional: 'Sua barbearia',
    demo: 'Barbearia Navalha',
    terms: [[/barbearia|barbeiro|\bbarba\b/i, 3]],
    assets: ['barbearia'],
    services: ['Corte', 'Barba', 'Corte e barba'],
    title: 'Corte e barba com horário marcado.',
    intro: 'Escolha o serviço e peça seu horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar horário' },
    copy: {
      about: 'Barbearia com cortes e barba feitos com calma, no horário que você marcar.',
      serviceDetails: ['Corte conforme o estilo que você prefere.', 'Barba aparada e desenhada com toalha quente.', 'Corte e barba no mesmo horário.'],
      differentials: ['Horário marcado', 'Atendimento sem pressa', 'Estilo combinado antes'],
      processSteps: ['Escolha o serviço', 'Peça seu horário', 'Confirme pelo WhatsApp'],
      faqQuestions: ['Como peço um horário?', 'Quanto tempo dura o atendimento?', 'Como remarco?'],
    },
  },
  {
    id: 'estetica',
    segment: 'beleza',
    family: 'beleza',
    name: 'Estética',
    provisional: 'Seu estúdio',
    demo: 'Ateliê Aurora',
    terms: [[/est[eé]tica|limpeza de pele|facial|sobrancelh|c[ií]lios|depila[cç]|massagem/i, 3], [/\bpele\b/i, 1]],
    assets: ['estetica'],
    services: ['Limpeza de pele', 'Design de sobrancelhas', 'Tratamentos faciais'],
    title: 'Cuidados com a pele, com horário marcado.',
    intro: 'Veja os cuidados e peça seu horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar horário' },
    copy: {
      about: 'Um estúdio de estética com cuidados faciais e de sobrancelhas, explicados antes de cada atendimento.',
      serviceDetails: ['Limpeza de pele com etapas explicadas antes de começar.', 'Design de sobrancelhas de acordo com o formato do rosto.', 'Tratamentos faciais combinados conforme o que você procura.'],
      differentials: ['Cuidados explicados antes', 'Horário reservado para você', 'Ambiente tranquilo'],
      processSteps: ['Escolha o cuidado', 'Tire suas dúvidas', 'Peça seu horário'],
      faqQuestions: ['Como escolho o cuidado mais adequado?', 'Quanto tempo dura cada atendimento?', 'Como remarco um horário?'],
    },
  },
  {
    id: 'unhas',
    segment: 'beleza',
    family: 'beleza',
    name: 'Unhas',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Esmalte',
    terms: [[/unhas?|manicure|pedicure|alongamento|nail/i, 3]],
    assets: ['unhas'],
    services: ['Manicure', 'Pedicure', 'Alongamento de unhas'],
    title: 'Manicure e pedicure com hora marcada.',
    intro: 'Escolha o serviço e peça seu horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar horário' },
    copy: {
      about: 'Um estúdio de unhas com manicure, pedicure e alongamento, com atendimento no horário que você reservar.',
      serviceDetails: ['Cutilagem, esmaltação e acabamento cuidadoso.', 'Cuidados com os pés, com calma e conforto.', 'Alongamento com formato e tamanho combinados.'],
      differentials: ['Horário reservado', 'Material separado para cada atendimento', 'Cores e formatos combinados'],
      processSteps: ['Escolha o serviço', 'Peça seu horário', 'Confirme pelo WhatsApp'],
      faqQuestions: ['Quanto tempo dura o alongamento?', 'Como peço um horário?', 'Como remarco?'],
    },
  },
  {
    id: 'salao',
    segment: 'beleza',
    family: 'beleza',
    name: 'Salão de beleza',
    provisional: 'Seu salão',
    demo: 'Salão Aurora',
    terms: [[/sal[aã]o de beleza|cabelos?|cabeleireir|colora[cç]|\bescova\b|mechas|penteado/i, 3], [/sal[aã]o|\bcortes?\b/i, 1]],
    assets: ['salao'],
    services: ['Corte', 'Coloração', 'Tratamentos capilares'],
    title: 'Cabelo cuidado do jeito que você gosta.',
    intro: 'Veja os serviços e peça seu horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar horário' },
    copy: {
      about: 'Um salão para cuidar do seu cabelo com calma: corte, cor e tratamentos combinados antes de começar.',
      serviceDetails: ['Corte pensado para o seu estilo e a sua rotina.', 'Coloração com o tom escolhido junto com você.', 'Tratamentos para hidratar e recuperar os fios.'],
      differentials: ['Conversa antes de começar', 'Horário reservado para você', 'Cuidados explicados'],
      processSteps: ['Escolha o serviço', 'Tire suas dúvidas', 'Peça seu horário'],
      faqQuestions: ['Como escolho o tom da coloração?', 'Quanto tempo devo reservar?', 'Como remarco um horário?'],
    },
  },
  {
    id: 'beleza',
    segment: 'beleza',
    family: 'beleza',
    name: 'Beleza e estética',
    provisional: 'Seu estúdio',
    demo: 'Ateliê Aurora',
    generic: true,
    terms: [],
    assets: ['salao'],
    services: ['Cuidados faciais', 'Cabelo', 'Unhas'],
    title: 'Um tempo para você. Um cuidado só seu.',
    intro: 'Beleza e bem-estar com atenção ao seu estilo e à sua rotina.',
    cta: { agendamento: 'Agendar horário' },
    copy: {
      about: 'Veja os cuidados disponíveis, escolha o que combina com seu objetivo e consulte os detalhes antes de pedir um horário.',
      serviceDetails: ['Converse sobre a rotina de cuidados e o serviço mais adequado ao que procura.', 'Entenda as opções de cuidado e os detalhes antes de marcar.', 'Escolha um horário para o atendimento e confirme os detalhes diretamente.'],
      differentials: ['Escolha do cuidado com orientação', 'Detalhes explicados antes do horário', 'Atendimento organizado por agendamento'],
      processSteps: ['Escolha o cuidado', 'Tire suas dúvidas', 'Peça um horário'],
      faqQuestions: ['Como escolho o cuidado mais adequado?', 'Quanto tempo devo reservar para o atendimento?', 'Como remarco um horário?'],
    },
  },

  /* ── Consultoria e serviços profissionais ────────────────────────────── */
  {
    id: 'contabilidade',
    segment: 'consultoria',
    family: 'consultoria',
    name: 'Contabilidade',
    provisional: 'Seu escritório',
    demo: 'Prisma Contabilidade',
    terms: [[/contab|cont[aá]bil|imposto de renda|abertura de empresa|\bmei\b/i, 3]],
    assets: ['planejamento'],
    services: ['Abertura de empresa', 'Contabilidade mensal', 'Imposto de renda'],
    title: 'Contabilidade para quem quer a empresa em dia.',
    intro: 'Conheça os serviços e converse sobre o momento da sua empresa.',
    cta: { orcamento: 'Solicitar proposta', empresa: 'Conversar com o escritório', agendamento: 'Agendar uma conversa' },
    copy: {
      about: 'Escritório de contabilidade que acompanha a rotina fiscal e contábil de pequenas empresas, com prazos e obrigações explicados.',
      serviceDetails: ['Orientação sobre o tipo de empresa e os documentos para a abertura.', 'Rotina contábil e fiscal organizada mês a mês.', 'Declaração de imposto de renda com os documentos conferidos.'],
      differentials: ['Prazos explicados com antecedência', 'Contato direto com o escritório', 'Documentos organizados'],
      processSteps: ['Conte o momento da empresa', 'Receba a proposta', 'Envie os documentos'],
      faqQuestions: ['Quais documentos preciso para abrir a empresa?', 'Como funciona o atendimento mensal?', 'Vocês atendem MEI?'],
    },
  },
  {
    id: 'juridico',
    segment: 'consultoria',
    family: 'consultoria',
    name: 'Advocacia',
    provisional: 'Seu escritório',
    demo: 'Almeida & Costa Advocacia',
    terms: [[/advoca|advogad|jur[ií]dic|direito (civil|trabalhista|de fam[ií]lia|previdenci)/i, 3]],
    assets: [],
    services: ['Consultoria jurídica', 'Contratos', 'Acompanhamento de processos'],
    title: 'Orientação jurídica clara para decidir com segurança.',
    intro: 'Conheça as áreas de atuação e agende uma conversa.',
    cta: { orcamento: 'Agendar atendimento', empresa: 'Agendar atendimento', agendamento: 'Agendar atendimento' },
    copy: {
      about: 'Escritório de advocacia com atendimento próximo, explicando cada etapa e as alternativas disponíveis em linguagem clara.',
      serviceDetails: ['Análise da situação e orientação sobre os caminhos possíveis.', 'Elaboração e revisão de contratos.', 'Acompanhamento das etapas do processo, com retorno sobre cada movimentação.'],
      differentials: ['Linguagem clara', 'Etapas explicadas', 'Atendimento com hora marcada'],
      processSteps: ['Conte a sua situação', 'Agende o atendimento', 'Receba a orientação'],
      faqQuestions: ['Quais documentos devo levar?', 'O atendimento pode ser online?', 'Como funciona a primeira conversa?'],
    },
  },
  {
    id: 'saude',
    segment: 'consultoria',
    family: 'consultoria',
    name: 'Saúde e bem-estar',
    provisional: 'Seu consultório',
    demo: 'Consultório Equilíbrio',
    terms: [[/psic[oó]log|terapia|terapeuta|fisioterap|nutricion|dentist|odonto|fonoaudi|psicopedagog/i, 3]],
    assets: [],
    services: ['Consultas', 'Avaliação inicial', 'Acompanhamento'],
    title: 'Atendimento com hora marcada e escuta atenta.',
    intro: 'Conheça o atendimento e peça um horário pelo WhatsApp.',
    cta: { agendamento: 'Agendar consulta', orcamento: 'Agendar consulta', empresa: 'Agendar consulta' },
    copy: {
      about: 'Atendimento com hora marcada, começando por uma avaliação e seguindo com um acompanhamento combinado com você.',
      serviceDetails: ['Consultas com tempo para entender o que você procura.', 'Primeiro encontro para conhecer o seu contexto e combinar o acompanhamento.', 'Encontros regulares, com a frequência combinada.'],
      differentials: ['Horário reservado', 'Acompanhamento combinado', 'Contato direto para agendar'],
      processSteps: ['Peça um horário', 'Faça a avaliação inicial', 'Combine o acompanhamento'],
      faqQuestions: ['Como funciona a primeira consulta?', 'O atendimento pode ser online?', 'Como remarco um horário?'],
    },
  },
  {
    id: 'consultoria-empresarial',
    segment: 'consultoria',
    family: 'consultoria',
    name: 'Consultoria empresarial',
    provisional: 'Sua consultoria',
    demo: 'Clara Consultoria',
    terms: [[/consultoria (empresarial|de gest[aã]o|financeira|de processos|de marketing|de vendas)|gest[aã]o empresarial|mentoria/i, 3], [/pequenas? empresas?|neg[oó]cios?|processos|planejamento|finan[cç]/i, 1], [/consult(or|oria)/i, 1]],
    assets: ['planejamento', 'reuniao'],
    services: ['Diagnóstico inicial', 'Planejamento', 'Acompanhamento'],
    title: 'Clareza para organizar e fazer a empresa avançar.',
    intro: 'Conheça as áreas de atuação e agende uma conversa.',
    cta: { orcamento: 'Solicitar proposta', empresa: 'Agendar uma conversa', agendamento: 'Agendar uma conversa', servicos: 'Ver áreas de atuação' },
    copy: {
      about: 'Consultoria para pequenas e médias empresas que querem organizar prioridades, rever processos e decidir com mais segurança.',
      serviceDetails: ['Uma primeira conversa para entender o contexto e o que precisa ser resolvido.', 'Organização de prioridades e próximos passos a partir do diagnóstico.', 'Acompanhamento combinado conforme o escopo definido entre as partes.'],
      differentials: ['Escopo alinhado antes do início', 'Etapas explicadas com clareza', 'Contato direto para tirar dúvidas'],
      processSteps: ['Conversa inicial', 'Diagnóstico do contexto', 'Plano de trabalho'],
      faqQuestions: ['O que levar para a primeira conversa?', 'Como é definido o escopo do trabalho?', 'O atendimento pode ser online?'],
    },
  },
  {
    id: 'consultoria',
    segment: 'consultoria',
    family: 'consultoria',
    name: 'Serviços profissionais',
    provisional: 'Seu escritório',
    demo: 'Clara Consultoria',
    generic: true,
    terms: [],
    assets: ['reuniao', 'planejamento'],
    services: ['Diagnóstico inicial', 'Planejamento', 'Acompanhamento'],
    title: 'Clareza para dar o próximo passo.',
    intro: 'Orientação próxima para organizar prioridades e decidir com segurança.',
    cta: { orcamento: 'Solicitar proposta', empresa: 'Agendar uma conversa', agendamento: 'Agendar uma conversa' },
    copy: {
      about: 'Conheça as frentes de atuação, entenda como começa o atendimento e veja qual tipo de orientação pode fazer sentido para o seu momento.',
      serviceDetails: ['Uma primeira conversa para entender o contexto e alinhar o que precisa ser resolvido.', 'Organização de prioridades e próximos passos a partir das informações compartilhadas.', 'Acompanhamento combinado conforme o escopo definido entre as partes.'],
      differentials: ['Escopo alinhado antes do início', 'Etapas explicadas com clareza', 'Contato direto para tirar dúvidas'],
      processSteps: ['Compartilhe seu contexto', 'Alinhe escopo e prioridades', 'Defina os próximos passos'],
      faqQuestions: ['O que devo levar para a primeira conversa?', 'Como é definido o escopo do trabalho?', 'O atendimento pode ser online?'],
    },
  },

  /* ── Alimentação ─────────────────────────────────────────────────────── */
  {
    id: 'buffet',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Buffet e eventos',
    provisional: 'Seu buffet',
    demo: 'Buffet Mesa Farta',
    terms: [[/buffet|bufê|catering|coffee ?break/i, 4], [/eventos?|festas?|casamentos?|formaturas?/i, 1]],
    assets: ['buffet'],
    services: ['Buffet para festas', 'Coffee break', 'Eventos corporativos'],
    title: 'Buffet para festas e eventos, do cardápio ao serviço.',
    intro: 'Conte a data, o número de convidados e o tipo de evento e peça seu orçamento.',
    cta: { orcamento: 'Pedir orçamento do evento', produtos: 'Pedir orçamento do evento', empresa: 'Pedir orçamento do evento', agendamento: 'Consultar data' },
    copy: {
      about: 'Buffet para festas e eventos, com cardápio e serviço combinados conforme o tipo de evento e o número de convidados.',
      serviceDetails: ['Cardápio e serviço montados para o estilo da festa.', 'Opções para reuniões e intervalos de eventos.', 'Serviço para confraternizações e eventos de empresas.'],
      differentials: ['Cardápio combinado antes', 'Orçamento conforme o número de convidados', 'Consulta de data pelo WhatsApp'],
      processSteps: ['Conte a data e o tipo de evento', 'Escolha o cardápio', 'Receba o orçamento'],
      faqQuestions: ['Com quanta antecedência devo reservar a data?', 'O cardápio pode ser personalizado?', 'Quais informações ajudam no orçamento?'],
    },
  },
  {
    id: 'confeitaria',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Confeitaria',
    provisional: 'Sua confeitaria',
    demo: 'Doce Ateliê',
    terms: [[/confeit|bolos?\b|doces? finos|brigadeir|docinhos|cupcakes?|tortas? doces?/i, 3], [/doces?\b|encomendas?/i, 1]],
    assets: ['confeitaria'],
    services: ['Bolos decorados', 'Doces para festas', 'Encomendas'],
    title: 'Bolos e doces por encomenda para a sua festa.',
    intro: 'Veja as opções e faça sua encomenda pelo WhatsApp.',
    cta: { produtos: 'Fazer uma encomenda', orcamento: 'Fazer uma encomenda', empresa: 'Fazer uma encomenda', agendamento: 'Fazer uma encomenda' },
    copy: {
      about: 'Bolos e doces feitos por encomenda, com sabores, tamanhos e decoração combinados antes da data.',
      serviceDetails: ['Bolos com sabor, tamanho e decoração escolhidos para a ocasião.', 'Doces para mesas de aniversário, casamento e outras festas.', 'Encomendas combinadas com antecedência pelo WhatsApp.'],
      differentials: ['Feito por encomenda', 'Sabores e decoração combinados', 'Data confirmada pelo WhatsApp'],
      processSteps: ['Escolha o bolo ou os doces', 'Informe a data e a quantidade', 'Confirme a encomenda'],
      faqQuestions: ['Com quanta antecedência devo encomendar?', 'Posso escolher o tema da decoração?', 'Como funciona a retirada ou a entrega?'],
    },
  },
  {
    id: 'marmitas',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Marmitas e refeições',
    provisional: 'Sua cozinha',
    demo: 'Cozinha da Semana',
    terms: [[/marmit|refei[cç][oõ]es|congelad|comida caseira|delivery de (almo[cç]o|comida)/i, 3], [/almo[cç]o|delivery|entrega/i, 1]],
    assets: ['marmitas'],
    services: ['Marmitas da semana', 'Refeições congeladas', 'Pedidos para empresas'],
    title: 'Refeições caseiras para a sua semana.',
    intro: 'Veja o cardápio e faça seu pedido pelo WhatsApp.',
    cta: { produtos: 'Ver cardápio da semana', orcamento: 'Fazer pedido', empresa: 'Fazer pedido', agendamento: 'Fazer pedido' },
    copy: {
      about: 'Refeições caseiras preparadas para a semana, com cardápio divulgado e pedidos combinados pelo WhatsApp.',
      serviceDetails: ['Pratos do cardápio da semana, prontos para aquecer.', 'Refeições congeladas para organizar a rotina.', 'Pedidos em quantidade para equipes e escritórios.'],
      differentials: ['Cardápio da semana', 'Pedido pelo WhatsApp', 'Retirada ou entrega combinada'],
      processSteps: ['Veja o cardápio', 'Faça o pedido pelo WhatsApp', 'Combine a retirada ou a entrega'],
      faqQuestions: ['Até quando posso fazer o pedido?', 'Vocês entregam na minha região?', 'Como conservo as refeições?'],
    },
  },
  {
    id: 'padaria',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Padaria e café',
    provisional: 'Sua padaria',
    demo: 'Padaria Trigo',
    terms: [[/padaria|panifica|\bp[aã]es\b|fermenta[cç][aã]o natural|cafeteria|\bcaf[eé]s?(?![a-zà-ú])/i, 3]],
    assets: ['padaria'],
    services: ['Pães da casa', 'Cafés', 'Salgados e doces'],
    title: 'Pães da casa e um bom café todos os dias.',
    intro: 'Veja o que sai do forno e faça sua encomenda pelo WhatsApp.',
    cta: { produtos: 'Ver produtos', orcamento: 'Fazer encomenda', empresa: 'Falar com a padaria' },
    copy: {
      about: 'Padaria com pães da casa, cafés e salgados, e encomendas combinadas pelo WhatsApp.',
      serviceDetails: ['Pães preparados na casa, conforme a produção do dia.', 'Cafés para acompanhar o pão ou levar para viagem.', 'Salgados e doces para o lanche ou para encomendas.'],
      differentials: ['Produção da casa', 'Encomendas pelo WhatsApp', 'Retirada no balcão'],
      processSteps: ['Veja os produtos', 'Faça a encomenda', 'Retire no dia combinado'],
      faqQuestions: ['Como faço uma encomenda?', 'Com quanta antecedência devo pedir?', 'Vocês fazem entregas?'],
    },
  },
  {
    id: 'restaurante',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Restaurante',
    provisional: 'Seu restaurante',
    demo: 'Casa Oliva',
    terms: [[/restaurante|bistr[oô]|cantina|trattoria|culin[aá]ria|card[aá]pio/i, 3], [/pizza|hamb[uú]rg|lanche|petisco|pratos?\b/i, 2]],
    assets: ['pratos', 'restaurante'],
    services: ['Pratos da casa', 'Opções da estação', 'Sobremesas'],
    title: 'Feito com calma. Servido com afeto.',
    intro: 'Veja o cardápio e faça seu pedido pelo WhatsApp.',
    cta: { produtos: 'Ver cardápio', agendamento: 'Reservar mesa', orcamento: 'Fazer pedido', empresa: 'Ver cardápio' },
    copy: {
      about: 'Receitas da casa servidas no salão ou para levar, com o cardápio sempre à vista e pedidos combinados pelo WhatsApp.',
      serviceDetails: ['Pratos da casa preparados com ingredientes escolhidos.', 'Opções que mudam conforme a época do ano.', 'Sobremesas para fechar a refeição.'],
      differentials: ['Cardápio à vista', 'Pedido pelo WhatsApp', 'Retirada combinada'],
      processSteps: ['Escolha os pratos', 'Faça o pedido pelo WhatsApp', 'Combine a retirada ou a entrega'],
      faqQuestions: ['Como consulto o cardápio do dia?', 'Vocês fazem entregas?', 'Como faço um pedido para grupos?'],
    },
  },
  {
    id: 'alimentacao',
    segment: 'alimentacao',
    family: 'alimentacao',
    name: 'Alimentação',
    provisional: 'Seu negócio',
    demo: 'Casa Oliva',
    generic: true,
    terms: [],
    assets: ['restaurante', 'pratos'],
    services: ['Pratos da casa', 'Opções da estação', 'Encomendas'],
    title: 'Feito com calma. Servido com afeto.',
    intro: 'Receitas da casa e uma boa razão para reunir quem você gosta.',
    cta: { produtos: 'Ver cardápio', orcamento: 'Fazer pedido' },
    copy: {
      about: 'Conheça as opções do cardápio, veja os detalhes de cada pedido e converse para confirmar disponibilidade e retirada ou entrega.',
      serviceDetails: ['Conheça as opções preparadas pela casa e consulte os detalhes do dia.', 'Veja tamanhos, sabores e possibilidades antes de fazer uma encomenda.', 'Informe a data e a quantidade para consultar disponibilidade.'],
      differentials: ['Opções apresentadas de forma clara', 'Pedido confirmado diretamente', 'Detalhes da encomenda alinhados antes'],
      processSteps: ['Escolha os itens', 'Consulte disponibilidade', 'Confirme os detalhes do pedido'],
      faqQuestions: ['Como consulto os itens disponíveis?', 'Com quanta antecedência devo pedir?', 'Quais são as opções de retirada ou entrega?'],
    },
  },

  /* ── Arquitetura e criativos ─────────────────────────────────────────── */
  {
    id: 'arquitetura',
    segment: 'criativo',
    family: 'portfolio',
    name: 'Arquitetura',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Forma',
    terms: [[/arquitet|projeto (arquitet|residencial|comercial)|projeto executivo|planta baixa/i, 3]],
    assets: ['arquitetura', 'interiores'],
    services: ['Projetos residenciais', 'Projetos comerciais', 'Interiores'],
    title: 'Espaços pensados do primeiro estudo à entrega.',
    intro: 'Conheça a forma de trabalho do estúdio e peça uma proposta.',
    cta: { orcamento: 'Solicitar proposta', trabalhos: 'Ver projetos', empresa: 'Conversar sobre um projeto' },
    copy: {
      about: 'Estúdio de arquitetura que acompanha cada projeto do briefing à entrega, com etapas combinadas e decisões explicadas.',
      serviceDetails: ['Casas e apartamentos pensados para a rotina de quem vai morar.', 'Lojas, escritórios e espaços de atendimento.', 'Ambientes internos com layout, materiais e iluminação definidos.'],
      differentials: ['Etapas claras do estudo à entrega', 'Briefing detalhado', 'Decisões explicadas'],
      processSteps: ['Briefing', 'Estudo preliminar', 'Projeto e acompanhamento'],
      faqQuestions: ['Como começa um projeto?', 'Quais etapas estão incluídas?', 'Vocês fazem projetos de reforma?'],
    },
  },
  {
    id: 'interiores',
    segment: 'criativo',
    family: 'portfolio',
    name: 'Design de interiores',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Forma',
    terms: [[/interiores|decora[cç][aã]o|design de ambientes/i, 3]],
    assets: ['interiores', 'arquitetura'],
    services: ['Projetos de interiores', 'Consultoria de decoração', 'Reformas de ambientes'],
    title: 'Interiores pensados para a sua rotina.',
    intro: 'Veja como trabalhamos e conte o ambiente que você quer transformar.',
    cta: { orcamento: 'Solicitar proposta', trabalhos: 'Ver projetos' },
    copy: {
      about: 'Projetos de interiores que partem da rotina de quem vai usar o espaço, com materiais e móveis escolhidos junto com você.',
      serviceDetails: ['Layout, materiais e iluminação definidos para cada ambiente.', 'Orientação para escolher móveis, cores e objetos.', 'Mudanças em cômodos específicos, com etapas combinadas.'],
      differentials: ['Projeto a partir da sua rotina', 'Escolhas explicadas', 'Etapas combinadas'],
      processSteps: ['Conte o ambiente', 'Aprove o estudo', 'Acompanhe a execução'],
      faqQuestions: ['Posso fazer só um cômodo?', 'Como funciona a primeira visita?', 'Vocês acompanham a obra?'],
    },
  },
  {
    id: 'fotografia',
    segment: 'criativo',
    family: 'portfolio',
    name: 'Fotografia',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Luz Norte',
    terms: [[/fot[oó]graf|ensaios?|book fotogr/i, 3]],
    assets: ['fotografia'],
    services: ['Ensaios', 'Eventos', 'Fotos para empresas'],
    title: 'Fotografia com olhar atento para cada história.',
    intro: 'Conheça os tipos de trabalho e conte o que você imagina.',
    cta: { orcamento: 'Pedir orçamento', trabalhos: 'Ver trabalhos', agendamento: 'Consultar data' },
    copy: {
      about: 'Fotografia de ensaios, eventos e empresas, com roteiro e entrega combinados antes de cada trabalho.',
      serviceDetails: ['Ensaios individuais, de casal ou de família, com roteiro combinado.', 'Cobertura de eventos, do planejamento à entrega das fotos.', 'Fotos de produtos, equipe e espaço para empresas.'],
      differentials: ['Roteiro combinado antes', 'Entrega combinada', 'Estilo explicado'],
      processSteps: ['Conte o que imagina', 'Combine data e roteiro', 'Receba as fotos'],
      faqQuestions: ['Como escolho o local do ensaio?', 'Como é feita a entrega das fotos?', 'Com quanta antecedência devo reservar?'],
    },
  },
  {
    id: 'design',
    segment: 'criativo',
    family: 'portfolio',
    name: 'Design gráfico',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Traço',
    terms: [[/design gr[aá]fico|identidade visual|logotipo|logomarca|branding|dire[cç][aã]o de arte|ilustra[cç]/i, 3], [/design/i, 1]],
    assets: ['design'],
    services: ['Identidade visual', 'Materiais gráficos', 'Direção de arte'],
    title: 'Identidades visuais que explicam o que você faz.',
    intro: 'Conheça as etapas de criação e conte o que você precisa.',
    cta: { orcamento: 'Pedir orçamento', trabalhos: 'Ver trabalhos' },
    copy: {
      about: 'Estúdio de design que cria identidades visuais e materiais gráficos a partir de um briefing claro e de etapas combinadas.',
      serviceDetails: ['Logotipo, cores e tipografia pensados para a sua marca.', 'Peças impressas e digitais com a mesma linguagem visual.', 'Orientação visual para campanhas, fotos e conteúdos.'],
      differentials: ['Briefing antes da criação', 'Etapas combinadas', 'Arquivos organizados na entrega'],
      processSteps: ['Briefing', 'Criação e ajustes', 'Entrega dos arquivos'],
      faqQuestions: ['O que entra no briefing?', 'Quantas rodadas de ajuste estão incluídas?', 'Em quais formatos recebo os arquivos?'],
    },
  },
  {
    id: 'criativo',
    segment: 'criativo',
    family: 'portfolio',
    name: 'Portfólio criativo',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Forma',
    generic: true,
    terms: [],
    assets: ['arquitetura', 'interiores'],
    services: ['Projetos residenciais', 'Projetos comerciais', 'Interiores'],
    title: 'Espaços e ideias que ganham forma.',
    intro: 'Projetos pensados do conceito à entrega, com atenção a cada detalhe.',
    cta: { orcamento: 'Solicitar proposta', trabalhos: 'Ver projetos' },
    copy: {
      about: 'Explore projetos, conheça as etapas de criação e compartilhe referências para iniciar uma conversa sobre o que você quer desenvolver.',
      serviceDetails: ['Conheça projetos e etapas de trabalho relacionados ao espaço que imagina.', 'Organize referências, necessidades e prioridades para a criação do projeto.', 'Defina escopo e entregas em uma conversa antes de iniciar.'],
      differentials: ['Processo apresentado por etapas', 'Referências consideradas no briefing', 'Escopo alinhado antes da criação'],
      processSteps: ['Compartilhe referências', 'Alinhe escopo e direção', 'Acompanhe as etapas do projeto'],
      faqQuestions: ['Que referências devo enviar?', 'Quais informações entram no briefing?', 'Como são combinadas as etapas do projeto?'],
    },
  },

  /* ── Imóveis ─────────────────────────────────────────────────────────── */
  {
    id: 'imobiliaria',
    segment: 'imoveis',
    family: 'imobiliario',
    name: 'Imobiliária',
    provisional: 'Sua imobiliária',
    demo: 'Clara Imóveis',
    terms: [[/\b(uma|a|nossa|minha)\s+imobili[aá]ria\b|administra[cç][aã]o de (im[oó]veis|alugu)|loca[cç][aã]o de im[oó]veis/i, 3], [/cat[aá]logo|carteira de im[oó]veis|v[aá]rios im[oó]veis|alugu[eé]is|loca[cç][aã]o/i, 1]],
    assets: ['imoveis'],
    services: ['Venda de imóveis', 'Locação', 'Avaliação de imóveis'],
    title: 'Imóveis para comprar ou alugar, com atendimento próximo.',
    intro: 'Conte o que procura e converse com a nossa equipe pelo WhatsApp.',
    cta: { agendamento: 'Agendar uma visita', orcamento: 'Pedir orientação', trabalhos: 'Ver imóveis', empresa: 'Falar com a imobiliária' },
    copy: {
      about: 'Imobiliária que ajuda a comprar, vender ou alugar, com informações claras sobre cada etapa da negociação.',
      serviceDetails: ['Apresentação de imóveis e organização de visitas.', 'Orientação para quem procura um imóvel para alugar.', 'Avaliação para definir o valor de anúncio do seu imóvel.'],
      differentials: ['Informações claras antes da visita', 'Etapas da negociação explicadas', 'Atendimento pelo WhatsApp'],
      processSteps: ['Conte o que procura', 'Visite as opções', 'Siga para a negociação'],
      faqQuestions: ['Quais documentos preciso para alugar?', 'Como funciona uma visita?', 'Como é feita a avaliação do imóvel?'],
    },
  },
  {
    id: 'corretor',
    segment: 'imoveis',
    family: 'imobiliario',
    name: 'Corretor de imóveis',
    provisional: 'Seu nome',
    demo: 'Clara Nunes Imóveis',
    terms: [[/corretor|corretora de im[oó]veis|consultoria imobili[aá]ria/i, 3], [/im[oó]ve(l|is)|imobili[aá]ri/i, 2], [/visitas?/i, 1]],
    assets: ['imoveis'],
    services: ['Compra e venda de imóveis', 'Consultoria imobiliária', 'Avaliação de imóveis'],
    title: 'Encontre um imóvel com orientação em cada etapa.',
    intro: 'Conte o que você procura e converse sobre as opções pelo WhatsApp.',
    cta: { agendamento: 'Agendar uma visita', orcamento: 'Pedir orientação', trabalhos: 'Ver imóveis', empresa: 'Conversar pelo WhatsApp', servicos: 'Ver como posso ajudar' },
    copy: {
      about: 'Uma apresentação clara do seu trabalho como corretor, dos perfis de imóvel que atende e de como orienta cada pessoa durante a busca, a visita e a negociação.',
      serviceDetails: ['Conversa inicial para entender localização, tipo de imóvel e prioridades da busca.', 'Apresentação do imóvel e organização de uma visita, conforme disponibilidade confirmada.', 'Orientação para comparar opções e entender os próximos passos da negociação.'],
      differentials: ['Busca orientada pelo que você procura', 'Informações claras antes da visita', 'Acompanhamento em cada etapa da negociação'],
      processSteps: ['Conte o que procura', 'Converse sobre opções e visita', 'Avalie os próximos passos'],
      faqQuestions: ['Quais informações ajudam a começar a busca?', 'Como funciona uma visita ao imóvel?', 'Posso conversar antes de escolher um imóvel?'],
    },
  },

  /* ── Outros (institucional) ──────────────────────────────────────────── */
  {
    id: 'loja',
    segment: 'outro',
    family: 'institucional',
    name: 'Loja',
    provisional: 'Sua loja',
    demo: 'Loja Ateliê',
    terms: [[/\bloja\b|boutique|moda|roupas?|cal[cç]ados|presentes|papelaria/i, 3]],
    assets: ['loja'],
    services: ['Novidades', 'Mais procurados', 'Peças sob encomenda'],
    title: 'Novidades para ver de perto e pedir pelo WhatsApp.',
    intro: 'Veja os produtos e faça seu pedido pelo WhatsApp.',
    cta: { produtos: 'Ver produtos', orcamento: 'Fazer pedido', empresa: 'Falar com a loja' },
    copy: {
      about: 'Uma loja com peças escolhidas com cuidado e atendimento pelo WhatsApp para tirar dúvidas e combinar a retirada.',
      serviceDetails: ['Peças que acabaram de chegar à loja.', 'Os itens que os clientes mais procuram.', 'Peças feitas ou separadas por encomenda.'],
      differentials: ['Atendimento pelo WhatsApp', 'Retirada combinada', 'Ajuda para escolher'],
      processSteps: ['Veja os produtos', 'Mande seu pedido', 'Combine a retirada ou a entrega'],
      faqQuestions: ['Como faço um pedido?', 'Vocês entregam?', 'Como consulto tamanhos e cores?'],
    },
  },
  {
    id: 'academia',
    segment: 'outro',
    family: 'institucional',
    name: 'Treino e movimento',
    provisional: 'Seu estúdio',
    demo: 'Estúdio Movimento',
    terms: [[/academia|personal trainer|\btreinos?\b|pilates|yoga|ioga|crossfit|treino funcional/i, 3]],
    assets: ['treino'],
    services: ['Treinos personalizados', 'Aulas em grupo', 'Avaliação física'],
    title: 'Treinos com acompanhamento, no seu ritmo.',
    intro: 'Conheça as modalidades e agende uma aula experimental.',
    cta: { agendamento: 'Agendar aula experimental', orcamento: 'Consultar planos', empresa: 'Falar com o estúdio' },
    copy: {
      about: 'Um estúdio de treino com aulas em grupo e treinos individuais, começando por uma conversa sobre o seu momento.',
      serviceDetails: ['Treinos montados conforme o seu objetivo e a sua rotina.', 'Aulas em grupo com horários fixos.', 'Avaliação para acompanhar a sua evolução.'],
      differentials: ['Aula experimental', 'Treino conforme o seu ritmo', 'Horários organizados'],
      processSteps: ['Agende a aula experimental', 'Converse sobre seus objetivos', 'Comece o treino'],
      faqQuestions: ['Como funciona a aula experimental?', 'Preciso ter experiência?', 'Quais são os horários?'],
    },
  },
  {
    id: 'aulas',
    segment: 'outro',
    family: 'institucional',
    name: 'Aulas e cursos',
    provisional: 'Sua escola',
    demo: 'Escola Nota Clara',
    terms: [[/aulas?\b|cursos?\b|escola|idiomas?|ingl[eê]s|espanhol|m[uú]sica|refor[cç]o escolar/i, 3]],
    assets: [],
    services: ['Aulas individuais', 'Turmas', 'Aulas online'],
    title: 'Aulas para aprender com acompanhamento de perto.',
    intro: 'Conheça as aulas e agende uma aula experimental.',
    cta: { agendamento: 'Agendar aula experimental', orcamento: 'Consultar turmas', empresa: 'Falar com a escola' },
    copy: {
      about: 'Aulas individuais e em turma, com o conteúdo organizado conforme o nível e o objetivo de cada aluno.',
      serviceDetails: ['Aulas no seu ritmo, com o conteúdo combinado.', 'Turmas pequenas, organizadas por nível.', 'Aulas a distância, com o mesmo acompanhamento.'],
      differentials: ['Aula experimental', 'Conteúdo por nível', 'Horários combinados'],
      processSteps: ['Conte seu objetivo', 'Faça a aula experimental', 'Escolha o formato'],
      faqQuestions: ['Como funciona a aula experimental?', 'Como sei o meu nível?', 'As aulas podem ser online?'],
    },
  },
  {
    id: 'outro',
    segment: 'outro',
    family: 'institucional',
    name: 'Negócio',
    provisional: 'Seu negócio',
    demo: 'Sua Marca',
    generic: true,
    terms: [],
    assets: [],
    services: ['Primeira conversa', 'Proposta', 'Acompanhamento'],
    title: 'Conheça o que fazemos e fale com a gente.',
    intro: 'Veja os serviços, tire dúvidas e combine o atendimento pelo WhatsApp.',
    copy: {
      about: 'Apresente o que sua empresa faz, para quem trabalha e como uma pessoa interessada pode dar o primeiro passo.',
      serviceDetails: ['Conte o que você procura e tire as primeiras dúvidas pelo WhatsApp.', 'Receba uma proposta com o que está incluído e os próximos passos.', 'Acompanhe cada etapa com contato direto.'],
      differentials: ['Informações organizadas para facilitar sua escolha', 'Etapas alinhadas antes de começar', 'Contato direto para esclarecer dúvidas'],
      processSteps: ['Conte o que procura', 'Alinhe os detalhes', 'Combine os próximos passos'],
      faqQuestions: ['Como funciona o primeiro contato?', 'Quais informações devo enviar?', 'Como são combinados os próximos passos?'],
    },
  },
];

export const subsegmentIds = subsegments.map((s) => s.id);

export function subsegmentById(id: string): Subsegment | undefined {
  return subsegments.find((s) => s.id === id);
}

/** Subsegmento padrão de um segmento (o genérico). */
export function genericSubsegment(segment: string): Subsegment {
  // Imóveis não tem um genérico: sem pista, vale o corretor (atendimento, sem catálogo).
  const fallback: Record<string, string> = { imoveis: 'corretor' };
  return subsegments.find((s) => s.generic && s.segment === segment) ?? subsegments.find((s) => s.id === fallback[segment]) ?? subsegments.find((s) => s.id === 'outro')!;
}

/**
 * Trechos negados não contam: "não temos atendimento veterinário",
 * "sem atendimento clínico", "não fazemos tosa".
 */
const NEGATION = /\b(?:sem|nem|n[aã]o\s+(?:temos|tenho|fazemos|fa[cç]o|oferecemos|ofere[cç]o|atendemos|atendo|trabalhamos|trabalho|somos|sou|[eé]|h[aá]|possu[ií]mos|realizamos|prestamos))\s+[^.;,\n]{0,48}/gi;

/**
 * Subsegmento pela soma de termos com peso. Precisa de pelo menos 2 pontos
 * (uma palavra forte ou duas fracas); o segmento já escolhido desempata.
 */
export function withoutNegations(text: string): string {
  return text.replace(NEGATION, ' ');
}

export function detectSubsegment(text: string, segment = ''): Subsegment | null {
  const clean = ` ${withoutNegations(text)} `;
  if (!clean.trim()) return null;
  let best: Subsegment | null = null;
  let bestScore = 0;
  for (const sub of subsegments) {
    if (sub.generic) continue;
    if (sub.requires && !sub.requires.test(clean)) continue;
    let score = 0;
    for (const [re, w] of sub.terms) if (re.test(clean)) score += w;
    if (score < 2) continue;
    if (segment && sub.segment === segment) score += 1;
    if (score > bestScore) {
      best = sub;
      bestScore = score;
    }
  }
  return best;
}
