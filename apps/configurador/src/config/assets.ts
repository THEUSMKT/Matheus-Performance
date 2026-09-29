/* ==========================================================================
   Catálogo de imagens das prévias — EDITE AQUI
   Só entram aqui arquivos locais de public/demo, com metadados: categoria,
   subsegmentos compatíveis, cortes que funcionam, ponto focal, texto
   alternativo, origem e licença. A IA pode sugerir uma categoria; a página
   só usa uma imagem se a categoria for permitida para o subsegmento
   (config/subsegments.ts). Sem imagem adequada, o topo vira uma composição
   tipográfica — melhor que uma imagem bonita e errada.

   Todas são ilustrações vetoriais próprias (ver public/demo/README.md): não
   representam trabalhos, clientes, equipes ou imóveis reais, e a prévia as
   identifica como ilustrativas.
   ========================================================================== */

export type AssetCrop = '4:3' | '16:9' | '1:1' | '3:4';

export type Asset = {
  /** Nome do arquivo em public/demo, sem extensão. */
  id: string;
  category: string;
  /** Subsegmentos em que a imagem faz sentido (vazio = qualquer um da categoria). */
  subsegments: string[];
  /** Cortes testados (o arquivo é 4:3, 480 × 360). */
  crops: AssetCrop[];
  /** object-position do ponto de interesse. */
  focal: string;
  /** Texto alternativo (descreve a ilustração, não um lugar real). */
  alt: string;
  /** Legenda curta, usada na galeria e nos destaques. */
  caption: string;
  /** item = um produto ou objeto que representa uma oferta (vitrine, destaques); cena = ambiente (topo, galeria). */
  role: 'item' | 'cena';
};

export const ASSET_ORIGIN = 'Ilustração vetorial própria, criada para as prévias do configurador (public/demo).';
export const ASSET_LICENSE = 'Uso livre neste projeto, sem atribuição a terceiros.';
export const ASSET_WIDTH = 480;
export const ASSET_HEIGHT = 360;

const ITEMS = new Set([
  'pet-vacina', 'confeitaria-bolo', 'confeitaria-doces', 'bolo-fatia', 'sobremesa-torta', 'prato-massa', 'prato-salada', 'prato-risoto', 'prato-sopa',
  'marmitas', 'paes-cesta', 'imovel-sobrado', 'imovel-apartamento', 'imovel-casa-terrea', 'limpeza-organizacao',
]);

const a = (id: string, category: string, alt: string, caption: string, focal = '50% 50%', crops: AssetCrop[] = ['4:3', '16:9', '1:1'], subsegments: string[] = []): Asset => ({
  id,
  category,
  subsegments,
  crops,
  focal,
  alt,
  caption,
  role: ITEMS.has(id) ? 'item' : 'cena',
});

export const assets: Asset[] = [
  // Pet — cada subsegmento com a sua imagem: consulta não usa banho.
  a('pet-clinica', 'clinica-veterinaria', 'Ilustração de um consultório veterinário com um cachorro sobre a mesa de atendimento', 'Consultório', '42% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('pet-vacina', 'clinica-veterinaria', 'Ilustração de uma carteira de vacinação e uma seringa sobre a mesa', 'Vacinação', '50% 50%'),
  a('pet', 'banho-e-tosa', 'Ilustração de um cachorro tomando banho com espuma', 'Banho', '40% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('pet-tosa', 'banho-e-tosa', 'Ilustração de um cachorro na mesa de tosa, com secador e pente', 'Tosa', '45% 55%'),
  a('pet-shop', 'pet-shop', 'Ilustração de prateleiras com sacos de ração, brinquedos e coleiras', 'Loja', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),

  // Serviços locais
  a('limpeza', 'limpeza', 'Ilustração de uma sala limpa com balde, rodo e borrifador', 'Limpeza residencial', '55% 60%', ['4:3', '16:9', '1:1', '3:4']),
  a('limpeza-organizacao', 'limpeza', 'Ilustração de um armário com caixas e roupas organizadas', 'Organização', '50% 50%'),
  a('clima', 'climatizacao', 'Ilustração de um aparelho de ar-condicionado instalado na parede', 'Ar-condicionado', '50% 40%'),
  a('servico-eletrica', 'eletrica', 'Ilustração de um quadro de disjuntores', 'Parte elétrica', '50% 50%'),
  a('servico-pintura', 'pintura', 'Ilustração de uma parede sendo pintada com rolo', 'Pintura', '40% 50%'),
  a('reparos', 'reparos', 'Ilustração de ferramentas organizadas sobre uma bancada', 'Reparos', '50% 55%'),
  a('auto', 'automotivo', 'Ilustração de um carro numa oficina', 'Oficina', '50% 55%'),

  // Beleza
  a('beleza-cadeira', 'salao', 'Ilustração de uma cadeira de salão diante de um espelho', 'Atendimento', '50% 45%', ['4:3', '16:9', '1:1', '3:4']),
  a('beleza-recepcao', 'salao', 'Ilustração da recepção de um salão com plantas', 'Recepção', '50% 50%'),
  a('beleza', 'salao', 'Ilustração de uma bancada com espelho e produtos de beleza', 'Bancada', '50% 45%', ['4:3', '16:9', '1:1', '3:4']),
  a('barbearia', 'barbearia', 'Ilustração de uma cadeira de barbearia diante do espelho', 'Barbearia', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),
  a('beleza-facial', 'estetica', 'Ilustração de uma sala de estética com maca e produtos', 'Sala de estética', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('beleza-manicure', 'unhas', 'Ilustração de frascos de esmalte sobre a mesa de manicure', 'Manicure', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),

  // Consultoria (elementos da atividade, nunca pessoas apresentadas como equipe)
  a('consultoria-graficos', 'planejamento', 'Ilustração de um quadro com gráficos de planejamento', 'Planejamento', '50% 45%'),
  a('consultoria-reuniao', 'reuniao', 'Ilustração de uma mesa de reunião com notebooks', 'Reunião', '50% 50%'),
  a('consultoria', 'reuniao', 'Ilustração de uma mesa de trabalho organizada', 'Atendimento', '50% 50%'),

  // Alimentação — buffet e vitrine têm imagens diferentes
  a('confeitaria-bolo', 'confeitaria', 'Ilustração de um bolo decorado sobre um suporte', 'Bolo decorado', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('confeitaria-doces', 'confeitaria', 'Ilustração de uma bandeja com doces em forminhas', 'Doces para festas', '50% 50%'),
  a('bolo-fatia', 'confeitaria', 'Ilustração de uma fatia de bolo com frutas vermelhas', 'Fatia de bolo', '50% 50%'),
  a('sobremesa-torta', 'confeitaria', 'Ilustração de uma fatia de torta de limão', 'Torta', '50% 50%'),
  a('prato-massa', 'pratos', 'Ilustração de um prato de massa ao molho de tomate', 'Massa ao molho de tomate', '50% 50%'),
  a('prato-salada', 'pratos', 'Ilustração de uma salada colorida', 'Salada da estação', '50% 50%'),
  a('prato-risoto', 'pratos', 'Ilustração de um risoto de cogumelos', 'Risoto de cogumelos', '50% 50%'),
  a('prato-sopa', 'pratos', 'Ilustração de uma sopa servida no prato', 'Sopa do dia', '50% 50%'),
  a('restaurante-salao', 'restaurante', 'Ilustração do salão de um restaurante', 'Salão', '50% 60%'),
  a('alimentacao', 'restaurante', 'Ilustração de uma mesa posta com prato e pães', 'Mesa posta', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),
  a('marmitas', 'marmitas', 'Ilustração de marmitas com arroz, feijão e legumes', 'Marmitas da semana', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),
  a('buffet-mesa', 'buffet', 'Ilustração de uma mesa de buffet com travessas', 'Mesa de buffet', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('padaria-balcao', 'padaria', 'Ilustração de um balcão de padaria com pães', 'Balcão', '50% 55%'),
  a('paes-cesta', 'padaria', 'Ilustração de uma cesta de pães', 'Pães da casa', '50% 50%'),

  // Arquitetura e criativos — estudos ilustrativos, nunca "projetos realizados"
  a('projeto-fachada', 'arquitetura', 'Ilustração de uma fachada residencial contemporânea', 'Estudo de fachada', '55% 50%', ['4:3', '16:9', '1:1', '3:4']),
  a('projeto-planta', 'arquitetura', 'Ilustração de uma planta baixa com ambientes', 'Planta baixa', '50% 50%'),
  a('projeto-escritorio', 'arquitetura', 'Ilustração de um escritório compacto com estante', 'Escritório compacto', '50% 50%'),
  a('projeto-varanda', 'arquitetura', 'Ilustração de uma varanda com plantas', 'Varanda', '50% 55%'),
  a('criativo', 'arquitetura', 'Ilustração de uma prancheta com estudo de volumes', 'Estudo de volumes', '50% 50%'),
  a('interiores', 'interiores', 'Ilustração de uma sala integrada com janela em arco', 'Sala integrada', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('imovel-cozinha', 'interiores', 'Ilustração de uma cozinha', 'Cozinha', '50% 55%'),
  a('imovel-quarto', 'interiores', 'Ilustração de um quarto', 'Quarto', '50% 55%'),
  a('fotografia', 'fotografia', 'Ilustração de um estúdio de fotografia com câmera no tripé e rebatedor', 'Estúdio', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),
  a('design-estudio', 'design', 'Ilustração de uma mesa de design com amostras de cores e esboços de logotipo', 'Estudos de marca', '50% 50%', ['4:3', '16:9', '1:1', '3:4']),

  // Imóveis — ilustrativos, sem preço, endereço, metragem ou disponibilidade
  a('imoveis', 'imoveis', 'Ilustração de uma fachada de casa', 'Fachada', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('imovel-sobrado', 'imoveis', 'Ilustração de uma casa com quintal', 'Casa com quintal', '50% 55%'),
  a('imovel-apartamento', 'imoveis', 'Ilustração de um prédio residencial', 'Apartamento', '50% 50%'),
  a('imovel-casa-terrea', 'imoveis', 'Ilustração de uma casa térrea', 'Casa térrea', '50% 55%'),

  // Institucional
  a('loja', 'loja', 'Ilustração da fachada de uma loja com vitrine', 'Fachada', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
  a('treino', 'treino', 'Ilustração de halteres, colchonete e garrafa de água', 'Espaço de treino', '50% 55%', ['4:3', '16:9', '1:1', '3:4']),
];

export const assetCategories = [...new Set(assets.map((x) => x.category))];

export function assetById(id: string): Asset | undefined {
  return assets.find((x) => x.id === id);
}

/** Imagens de uma lista de categorias, na ordem das categorias e depois na do catálogo. */
export function assetsIn(categories: string[], subsegment = ''): Asset[] {
  return categories.flatMap((c) => assets.filter((x) => x.category === c && (!x.subsegments.length || !subsegment || x.subsegments.includes(subsegment))));
}
