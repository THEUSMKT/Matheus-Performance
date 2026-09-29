// Prévias por família: contrato da IA (v1 e v2), identidade, os 8 casos de negócio, pacotes e migração.
// A prévia é renderizada de verdade (react-dom/server) — os testes olham o HTML que a pessoa veria.
// Run: node tests/previews.test.cjs (after npm ci).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(__dirname, '../src', request.slice(2));
  return original.call(this, request, ...rest);
};
const compile = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText,
    filename,
  );
require.extensions['.ts'] = compile;
require.extensions['.tsx'] = compile;
// CSS Modules: cada classe vira o próprio nome (o HTML fica legível nos testes).
require.extensions['.css'] = (module) => {
  const classes = new Proxy({}, { get: (_, key) => (key === 'default' ? classes : key === '__esModule' ? true : typeof key === 'string' ? key : undefined) });
  module.exports = classes;
};

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const model = require('../src/lib/project.ts');
const ai = require('../src/lib/aiPreview.ts');
const { previewPlan } = require('../src/lib/plan.ts');
const { SitePreview } = require('../src/components/preview/SitePreview.tsx');
const { families } = require('../src/config/families.ts');
const { subsegments, detectSubsegment } = require('../src/config/subsegments.ts');
const { assets } = require('../src/config/assets.ts');
const pk = require('../src/config/packages.ts');
const worker = require('../integrations/ai-preview/worker.ts');
const { whatsappLink } = require('../src/lib/whatsapp.ts');
const { casos } = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/casos-de-negocio.json'), 'utf8'));

let count = 0;
const pending = [];
function test(name, fn) {
  const r = fn();
  if (r && typeof r.then === 'function') pending.push(r.then(() => { count++; console.log('PASS', name); }));
  else { count++; console.log('PASS', name); }
}

const render = (p, props = {}) => renderToStaticMarkup(React.createElement(SitePreview, { project: p, ...props }));
/** Texto visível do HTML (sem marcação), para procurar palavras proibidas. */
const visible = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');
/** Resposta antiga (servidor v1): sem os campos novos e sem o segmento pet. */
function asV1(r) {
  const x = { ...r };
  for (const k of ['subsegment', 'familyId', 'layoutVariantId', 'heroVariantId', 'typography', 'assetCategory', 'nameOrigin', 'missing', 'question']) delete x[k];
  if (x.segment === 'pet') {
    x.segment = 'outro';
    x.segmentOther = r.subsegment === 'banho-e-tosa' ? 'Banho e tosa' : 'Clínica veterinária';
  }
  if (['petroleo', 'grafite', 'vinho'].includes(x.palette)) x.palette = 'azul';
  return x;
}
const fromCase = (c, { v1 = false, pkg = 'essencial', base = model.initialProject() } = {}) => {
  const sug = ai.sanitizeSuggestion(v1 ? asV1(c.resposta) : c.resposta, pkg, { description: c.descricao });
  assert(sug, `${c.id}: sugestão válida`);
  return model.normalizeProject(ai.applySuggestion(model.normalizeProject({ ...base, pkg }), sug));
};

/* ── Casos de negócio ──────────────────────────────────────────────────── */

for (const c of casos) {
  test(`Caso "${c.titulo}": tipo de negócio, família, botão, imagem e textos corretos (resposta nova e antiga)`, () => {
    for (const v1 of [false, true]) {
      const p = fromCase(c, { v1 });
      const plan = previewPlan(p);
      const e = c.espera;
      const tag = `${c.id}${v1 ? ' (v1)' : ''}`;
      assert.equal(p.segment, e.segmento, `${tag}: segmento`);
      assert.equal(plan.subsegment.id, e.subsegmento, `${tag}: tipo de negócio`);
      assert.equal(plan.family.id, e.familia, `${tag}: família`);
      assert.equal(plan.cta, e.botao, `${tag}: botão`);
      assert.equal(plan.heroAsset?.id ?? '', v1 && e.imagemV1 !== undefined ? e.imagemV1 : e.imagem, `${tag}: imagem do topo`);
      for (const img of e.semImagem ?? []) {
        assert.notEqual(plan.heroAsset?.id, img, `${tag}: nunca ${img} no topo`);
        assert(!plan.pool.some((x) => x.id === img), `${tag}: nunca ${img} nas imagens`);
      }
      for (const sec of e.semSecao ?? []) assert(!p.sections.includes(sec), `${tag}: sem ${sec}`);
      const html = render(p);
      const text = visible(html);
      for (const bad of e.semTexto ?? []) assert(!text.toLowerCase().includes(bad.toLowerCase()), `${tag}: não pode aparecer "${bad}"`);
      assert(html.includes(`data-family="${e.familia}"`));
      // O mesmo botão no menu, no topo e no contato.
      assert(text.split(e.botao).length - 1 >= 2, `${tag}: botão repetido com o mesmo texto`);
      assert.equal(pk.packageById(p.pkg).price, 500, `${tag}: a IA não muda o pacote`);
      // Nome: o citado na descrição, ou provisório e identificado.
      const found = ai.suggestNameFromText(c.descricao);
      if (c.resposta.nameOrigin === 'descricao') {
        assert.equal(p.name, c.resposta.name, `${tag}: nome da descrição`);
        assert.equal(found, c.resposta.name, `${tag}: o campo sugere o mesmo nome antes de gerar`);
      } else {
        assert.equal(p.name, '');
        assert(plan.name.provisional && html.includes('nome provisório'), `${tag}: nome provisório identificado`);
      }
    }
  });
}

test('Clínica veterinária e banho e tosa não se confundem, mesmo com a IA errando o tipo', () => {
  const bath = casos.find((c) => c.id === 'banho-e-tosa');
  // A IA diz "clínica", mas a descrição nega atendimento veterinário: vale o que a descrição sustenta.
  const wrong = ai.sanitizeSuggestion({ ...bath.resposta, subsegment: 'clinica-veterinaria' }, 'essencial', { description: bath.descricao });
  assert.equal(wrong.subsegment, 'banho-e-tosa');
  assert.equal(detectSubsegment('Pet shop com banho e tosa e rações').id, 'banho-e-tosa', 'pet shop com banho e tosa não é clínica');
  assert.equal(detectSubsegment('Clínica veterinária com consultas, vacinas e banho e tosa').id, 'clinica-veterinaria');
  assert.equal(detectSubsegment('Fazemos banho e tosa. Não temos atendimento veterinário.').id, 'banho-e-tosa');
  assert.equal(detectSubsegment('Pet shop com rações, petiscos e acessórios').id, 'pet-shop');
  assert.equal(detectSubsegment('Confeitaria por encomenda: bolos e doces para festas').id, 'confeitaria');
  assert.equal(detectSubsegment('Consultoria imobiliária gratuita para quem vai comprar o primeiro imóvel').id, 'corretor');
  assert.equal(detectSubsegment('Buffet para festas de aniversário e casamentos').id, 'buffet');
  assert.equal(detectSubsegment('Limpeza de pele e design de sobrancelhas').id, 'estetica', 'limpeza de pele não é faxina');
  assert.equal(detectSubsegment('Instalação, manutenção e limpeza de ar-condicionado').id, 'climatizacao');
  assert.equal(detectSubsegment('Auto elétrica e troca de bateria').id, 'oficina');
  assert.equal(detectSubsegment('cuidamos'), null, 'palavra solta não decide');
  // Nenhuma imagem de banho em nenhuma prévia de clínica, em qualquer variante ou pacote.
  const clinic = fromCase(casos[0], { pkg: 'completo' });
  for (const f of families.find((x) => x.id === 'pet').variants) {
    for (const hero of ['', 'tipografico']) {
      const html = render(model.normalizeProject({ ...clinic, layout: f.id, hero, sections: ['apresentacao', 'servicos', 'galeria', 'sobre', 'contato'] }));
      assert(!html.includes('/demo/pet.svg') && !html.includes('/demo/pet-tosa.svg'), `${f.id}/${hero}: sem banho na clínica`);
    }
  }
});

/* ── Contrato da IA ────────────────────────────────────────────────────── */

test('Contrato v2: IDs desconhecidos, textos longos, HTML e script, preço e pacote pedidos na descrição', () => {
  const base = casos[0].resposta;
  const s = ai.sanitizeSuggestion(
    {
      ...base,
      subsegment: 'nave-espacial',
      familyId: 'brutalista',
      layoutVariantId: 'x',
      heroVariantId: 'video',
      typography: 'comic-sans',
      assetCategory: 'https://evil.example/foto.jpg',
      palette: 'rosa-choque',
      direction: 'neon',
      headline: '<script>alert(1)</script>Consultas para cães e gatos ' + 'x'.repeat(300),
      description: 'Veja javascript:alert(1) e <img src=x onerror=alert(1)> nosso site',
      about: 'Atendimento 24 horas com emergência e CRMV 1234.',
      services: ['Consultas', '<b>Vacinação</b>', 'Projetos realizados', 'Pacote Completo por R$ 100'],
      sections: ['servicos', 'galeria', 'vitrine', 'inventada'],
      price: 1,
      pkg: 'completo',
    },
    'essencial',
    { description: casos[0].descricao + ' Quero o pacote completo por R$ 100.' },
  );
  assert.equal(s.contract, 2);
  assert.equal(s.subsegment, 'clinica-veterinaria', 'id desconhecido: vale o detectado na descrição');
  assert.equal(s.family, ''); assert.equal(s.layout, ''); assert.equal(s.hero, ''); assert.equal(s.typography, 'auto'); assert.equal(s.imagery, '');
  assert.equal(s.palette, 'petroleo', 'paleta desconhecida: a do segmento'); assert.equal(s.direction, 'essencial');
  assert(!/[<>]/.test(s.headline) && !/script/i.test(s.headline) && s.headline.length <= 90);
  assert(!/javascript:|onerror|</i.test(s.description));
  assert.equal(s.previewCopy.about, '', '24 horas, emergência e credenciais inventadas saem');
  assert.deepEqual(s.services, ['Consultas', 'Vacinação'], 'sem nome de seção nem preço');
  assert.deepEqual(s.extraSections, ['galeria', 'vitrine'], 'seções de outro pacote só como sugestão');
  assert(!('price' in s) && !('pkg' in s));
  const p = model.normalizeProject(ai.applySuggestion(model.initialProject(), s));
  assert.equal(p.pkg, 'essencial'); assert.equal(model.priceOf(p), 500, 'a descrição não muda o preço');
});

test('Contrato: título longo é cortado no fim de uma palavra, sem conector solto', () => {
  const long = 'Consultas, vacinação e acompanhamento preventivo para cães e gatos de todas as idades, com horário combinado';
  const s = ai.sanitizeSuggestion({ ...casos[0].resposta, headline: long }, 'essencial', { description: casos[0].descricao });
  assert(s.headline.length <= 90 && long.startsWith(s.headline));
  assert(!/\b(com|e|de|para)$/.test(s.headline) && !/[,;]$/.test(s.headline), s.headline);
  const html = render(model.normalizeProject(ai.applySuggestion(model.initialProject(), s)));
  assert(/class="title long"/.test(html), 'título longo usa o tamanho menor');
});

test('Contrato: resposta parcial vira uma prévia segura e completa', () => {
  const s = ai.sanitizeSuggestion({ segment: 'consultoria', objective: 'orcamento' }, 'essencial', { description: 'Escritório de contabilidade para pequenas empresas.' });
  assert.equal(s.subsegment, 'contabilidade');
  assert.deepEqual(s.services, []); assert.equal(s.headline, '');
  const p = model.normalizeProject(ai.applySuggestion(model.initialProject(), s));
  const plan = previewPlan(p);
  assert.equal(plan.family.id, 'consultoria');
  assert(plan.content.title && plan.content.services.length === 3, 'textos de apoio do tipo de negócio');
  assert.equal(ai.sanitizeSuggestion({ segment: 'nada', objective: 'orcamento' }), null, 'sem segmento válido: falha');
  assert.equal(ai.sanitizeSuggestion('texto'), null);
  assert.equal(ai.sanitizeSuggestion(null), null);
  assert.deepEqual(ai.parseGeminiResponse({ candidates: [{ content: { parts: [{ text: '{"a":' }] } }] }), { ok: false, reason: 'formato' }, 'JSON inválido');
});

test('Contrato: descrição curta ou ambígua ainda gera uma prévia, com no máximo uma pergunta', () => {
  const short = ai.sanitizeSuggestion({ segment: 'alimentacao', objective: 'produtos', services: ['Bolos'] }, 'essencial', { description: 'Faço bolos por encomenda.' });
  assert.equal(short.subsegment, 'confeitaria');
  assert.deepEqual(short.services, ['Bolos'], 'um serviço citado continua sendo um só');
  const vague = ai.sanitizeSuggestion({ segment: 'pet', subsegment: 'pet', objective: 'agendamento', question: 'Você oferece consultas veterinárias, banho e tosa ou os dois?' }, 'essencial', { description: 'Cuido de pets com carinho e atenção aos tutores.' });
  assert.equal(vague.subsegment, 'pet');
  assert.equal(vague.question, 'Você oferece consultas veterinárias, banho e tosa ou os dois?');
  const p = model.normalizeProject(ai.applySuggestion(model.initialProject(), vague));
  assert.equal(previewPlan(p).heroAsset, null, 'sem saber o tipo, nenhuma imagem de banho ou de consulta');
  assert(model.subsegmentOf(p).question, 'a tela pode perguntar o tipo');
  assert.equal(ai.sanitizeSuggestion({ ...vague, question: 'Pergunta sem interrogação' }).question, '');
  assert(/interrogatório/.test(ai.systemPrompt()) && /uma pergunta|única/.test(ai.systemPrompt()));
});

test('Prompt interno: catálogos, distinções obrigatórias e nada inventado', () => {
  const prompt = ai.systemPrompt();
  for (const t of ['clinica-veterinaria', 'banho-e-tosa', 'pet-shop', 'confeitaria', 'buffet', 'corretor', 'imobiliaria', 'familyId', 'layoutVariantId', 'heroVariantId', 'assetCategory', '24 horas', 'CRECI', 'não invente serviços', 'celular', 'preço']) assert(prompt.toLowerCase().includes(t.toLowerCase()), t);
  for (const f of families) for (const v of f.variants) assert(prompt.includes(v.id), v.id);
  const req = ai.geminiRequest('Clínica veterinária, meu email é a@b.com e fone 51 99999-0000.');
  assert(!JSON.stringify(req).includes('a@b.com') && !JSON.stringify(req).includes('99999'));
  assert(req.generationConfig.responseSchema.properties.subsegment.enum.includes('clinica-veterinaria'));
});

test('Servidor: aceita pedidos v1 e v2; páginas antigas recebem o formato antigo', async () => {
  const env = { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm', ALLOWED_ORIGINS: 'https://theusmkt.github.io' };
  const c = casos[0];
  const gemini = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(c.resposta) }] } }] }), { status: 200 });
  const call = (schema) => worker.handle(new Request('https://ia.example/preview', { method: 'POST', headers: { Origin: 'https://theusmkt.github.io' }, body: JSON.stringify({ schema, description: c.descricao, pkg: 'essencial' }) }), env, gemini);
  const v2 = await (await call(2)).json();
  assert.equal(v2.suggestion.contract, 2); assert.equal(v2.suggestion.segment, 'pet'); assert.equal(v2.suggestion.subsegment, 'clinica-veterinaria');
  const v1 = await (await call(1)).json();
  assert.equal(v1.suggestion.segment, 'outro', 'página antiga não conhece o segmento pet'); assert.equal(v1.suggestion.segmentOther, 'Clínica veterinária');
  assert.equal(v1.suggestion.palette, 'azul', 'paleta nova vira a mais próxima das antigas');
  // Uma página nova que recebe a resposta antiga reconstrói o tipo de negócio.
  assert.equal(ai.sanitizeSuggestion(v1.suggestion, 'essencial', { description: c.descricao }).segment, 'pet');
});

test('Página: pede v2; com servidor antigo ("versao"), repete com v1 sem gastar o limite', async () => {
  const bodies = [];
  const oldServer = async (url, init) => {
    const body = JSON.parse(init.body);
    bodies.push(body.schema);
    if (body.schema !== 1) return { ok: false, status: 422, json: async () => ({ ok: false, error: 'versao' }) };
    return { ok: true, status: 200, json: async () => ({ ok: true, suggestion: asV1(casos[0].resposta) }) };
  };
  const r = await ai.requestSuggestion(casos[0].descricao, 'essencial', 'https://ia.test', oldServer);
  assert.deepEqual(bodies, [2, 1]);
  assert.equal(r.ok, true); assert.equal(r.suggestion.segment, 'pet'); assert.equal(r.suggestion.subsegment, 'clinica-veterinaria');
  const invalid = await ai.requestSuggestion(casos[0].descricao, 'essencial', 'https://ia.test', async () => ({ ok: false, status: 422, json: async () => ({ ok: false, error: 'descricao' }) }));
  assert.deepEqual(invalid, { ok: false, reason: 'invalida' }, 'outra recusa não repete');
  const down = await ai.requestSuggestion(casos[0].descricao, 'essencial', 'https://ia.test', async () => ({ ok: false, status: 502, json: async () => ({}) }));
  assert.deepEqual(down, { ok: false, reason: 'servidor' }, 'falha do provedor');
  const slow = await ai.requestSuggestion(casos[0].descricao, 'essencial', 'https://ia.test', () => Promise.reject(Object.assign(new Error('x'), { name: 'AbortError' })));
  assert.deepEqual(slow, { ok: false, reason: 'tempo' }, 'tempo excedido');
});

/* ── Identidade ────────────────────────────────────────────────────────── */

test('Nome: informado antes vale mais que a IA; confirmado é preservado; sugerido só se escrito', () => {
  const c = casos[0];
  const typed = fromCase(c, { base: { ...model.initialProject(), name: 'Bicho Feliz' } });
  assert.equal(typed.name, 'Bicho Feliz', 'nome digitado antes da descrição');
  const confirmed = model.normalizeProject({ ...fromCase(c), aiFilled: { name: '', segment: 'pet', segmentOther: '' } });
  const again = ai.applySuggestion(confirmed, ai.sanitizeSuggestion({ ...c.resposta, name: 'Outra Marca' }, 'essencial', { description: c.descricao + ' Outra Marca.' }));
  assert.equal(again.name, 'Clínica Vila Pet', 'nome confirmado não é trocado por nova sugestão');
  const invented = ai.sanitizeSuggestion({ ...c.resposta, name: 'Pet Premium' }, 'essencial', { description: c.descricao.replace('A Clínica Vila Pet', 'Minha clínica') });
  assert.equal(invented.name, '', 'nome que não está na descrição não é usado');
  assert.equal(ai.sanitizeSuggestion({ ...casos[2].resposta, name: 'Corretor de imóveis' }, 'essencial', { description: casos[2].descricao }).name, '', '"sou corretor" não é nome');
  for (const t of ['Sou corretor', 'Clínica veterinária', 'Corretor de imóveis', 'minha clínica', 'Salão de beleza']) assert(ai.isTypeWords(t), t);
  for (const t of ['Clínica Vila Pet', 'Doce Ateliê', 'Estúdio Linha']) assert(!ai.isTypeWords(t), t);
  assert.equal(ai.suggestNameFromText('Meu salão se chama Studio Bela Flor e atendo com hora marcada.'), 'Studio Bela Flor');
  assert.equal(ai.suggestNameFromText('Sou corretor de imóveis e atendo em Curitiba.'), '');
});

test('Nome: "Ainda não defini" usa um provisório do tipo de negócio, sem inventar marca e sem bloquear', () => {
  const later = fromCase(casos[0], { base: { ...model.initialProject(), nameLater: true } });
  assert.equal(later.name, '', 'a IA não põe nome quando a pessoa ainda não definiu');
  assert.equal(later.nameLater, true);
  const plan = previewPlan(later);
  assert.equal(plan.name.text, 'Sua clínica'); assert.equal(plan.name.provisional, true);
  const html = render(later);
  assert(html.includes('aria-label="Prévia do site de Sua clínica (nome provisório)"'));
  assert(html.includes('nome provisório'));
  assert(model.projectMessage(later).includes('Empresa: nome ainda não definido (na prévia: “Sua clínica”)'));
  assert.equal(model.exportProject(later).resumo.nomeProvisorio, 'Sua clínica');
  const provisional = { 'banho-e-tosa': 'Seu espaço pet', corretor: 'Seu nome', confeitaria: 'Sua confeitaria', arquitetura: 'Seu estúdio', 'consultoria-empresarial': 'Sua consultoria' };
  for (const [id, label] of Object.entries(provisional)) assert.equal(model.displayName(model.normalizeProject({ ...model.initialProject(), subsegment: id, segment: subsegments.find((x) => x.id === id).segment })).text, label);
  assert.equal(model.normalizeProject({ ...later, name: 'Vila Pet' }).nameLater, false, 'digitar um nome desfaz o provisório');
});

test('Nome com acentos e nome longo; troca de nome atualiza site, resumo, arquivo e WhatsApp', () => {
  const p = fromCase(casos[0]);
  const renamed = model.normalizeProject(model.renameInTexts({ ...p, name: 'Clínica São João' }, 'Clínica Vila Pet', 'Clínica São João'));
  const html = render(renamed);
  assert(html.includes('Clínica São João') && !html.includes('Vila Pet'), 'cabeçalho, rodapé, apresentação e rótulo acessível');
  assert(html.includes('aria-label="Prévia do site de Clínica São João"'));
  assert(model.projectMessage(renamed).includes('Empresa: Clínica São João'));
  assert.equal(model.exportProject(renamed).resumo.empresa, 'Clínica São João');
  assert.equal(model.exportFileName(renamed), 'projeto-site-clinica-sao-joao.json');
  // Troca só o nome exato, só em texto da IA não editado.
  const guarded = { ...p, previewCopy: { ...p.previewCopy, about: 'A Clínica Vila Pet atende. Petrópolis e Vila Petrópolis ficam como estão.' } };
  const r = model.renameInTexts(guarded, 'Clínica Vila Pet', 'Nova');
  assert.equal(r.previewCopy.about, 'A Nova atende. Petrópolis e Vila Petrópolis ficam como estão.');
  assert.equal(model.renameInTexts({ ...guarded, edited: ['about'] }, 'Clínica Vila Pet', 'Nova').previewCopy.about, guarded.previewCopy.about, 'texto editado à mão não muda');
  const long = model.normalizeProject({ ...p, name: 'Clínica Veterinária e Centro de Bem-Estar Animal Vila Pet de Todos os Santos e Arredores Ltda' });
  assert(long.name.length <= 80);
  assert(render(long).includes(long.name), 'nome longo aparece inteiro (o menu corta com reticências no CSS)');
});

test('Exemplo não carrega a marca fictícia para o projeto de outro negócio', () => {
  for (const s of model.segments) {
    const e = model.exampleProject(s.id);
    assert.equal(e.name, '');
    const merged = model.mergeStartingPoint(model.normalizeProject({ ...model.initialProject(), name: 'Minha Marca', service: 'Pintura' }), e);
    assert.equal(merged.name, 'Minha Marca');
    assert(!render(e).includes(subsegments.find((x) => x.id === s.example).demo), `${s.id}: fora da apresentação, sem nome fictício`);
    assert(render(e, { demo: true }).includes(subsegments.find((x) => x.id === s.example).demo), `${s.id}: na apresentação, com nome fictício`);
  }
});

/* ── Famílias e pacotes ────────────────────────────────────────────────── */

test('Oito famílias com composições diferentes (estrutura, não só cor)', () => {
  assert.equal(families.length, 8);
  const structures = new Map();
  for (const s of model.segments) {
    const e = model.normalizeProject({ ...model.exampleProject(s.id), palette: 'azul', direction: 'essencial', custom: null });
    const html = render(e);
    // Estrutura = sequência de classes do topo e dos serviços, sem textos nem cores.
    const hero = (html.match(/<section class="hero [^"]+"/) || [''])[0];
    const services = (html.match(/data-section="servicos"[\s\S]*?<(ul|ol) class="([^"]+)"/) || [, , ''])[2];
    structures.set(model.familyOf(e).id, `${hero}|${services}`);
  }
  assert.equal(structures.size, 8);
  assert.equal(new Set(structures.values()).size, 8, 'topo + serviços diferentes em cada família, com as mesmas cores');
  for (const f of families) {
    assert.equal(f.variants.length, 2);
    for (const [pkg, list] of Object.entries(f.structure)) {
      const p = model.normalizeProject({ ...model.initialProject(), pkg, sections: ['apresentacao', ...list, 'contato'] });
      assert.equal(model.requiredPackage(p), pkg === 'essencial' ? 'essencial' : model.requiredPackage(p), `${f.id}/${pkg}`);
      assert(pk.packages.find((x) => x.id === pkg).maxSections >= list.length + 2, `${f.id}/${pkg}: dentro do limite`);
    }
  }
});

test('Pacotes: Essencial com acabamento completo e nada de outro pacote; preço inalterado', () => {
  for (const s of model.segments) {
    for (const pkgId of ['essencial', 'profissional', 'completo']) {
      const fam = model.familyOf(model.exampleProject(s.id));
      const p = model.normalizeProject({ ...model.exampleProject(s.id), pkg: pkgId, sections: ['apresentacao', ...fam.structure[pkgId], 'contato'], form: pkgId !== 'essencial', gallery: pk.packageById(pkgId).galleryImages || 8 });
      assert.equal(p.pkg, pkgId, `${s.id}/${pkgId}: o pacote não muda sozinho`);
      const html = render(p);
      const text = visible(html);
      assert(!/Sua foto|Foto do produto|Foto do item|Item \d/.test(text), `${s.id}/${pkgId}: sem espaços vazios reservados`);
      if (pkgId === 'essencial') {
        for (const sec of ['galeria', 'faq', 'depoimentos', 'vitrine']) assert(!html.includes(`data-section="${sec}"`), `${s.id}: ${sec} fora do Essencial`);
        assert(!html.includes('Enviar pelo WhatsApp'), `${s.id}: sem formulário no Essencial`);
      }
      assert(model.projectMessage(p).includes(`${pk.packageById(pkgId).name} — ${pk.brl(pk.packageById(pkgId).price)}`));
      // Mesmo HTML no topo da miniatura e da prévia completa: o mesmo estado.
      const thumb = render(p, { compact: true, demo: true });
      const full = render(p, { demo: true });
      const heroOf = (h) => h.match(/<section class="hero[\s\S]*?<\/section>/)[0];
      assert.equal(heroOf(thumb), heroOf(full), `${s.id}/${pkgId}: miniatura e prévia iguais`);
    }
  }
  assert.deepEqual(pk.packages.map((x) => x.price), [500, 750, 1000]);
});

test('Troca de pacote: subir é escolha explícita; descer guarda o que sai e mantém a ordem', () => {
  const p = model.normalizeProject({ ...model.exampleProject('pet') });
  assert.equal(p.pkg, 'profissional');
  const down = model.switchPackage(p, 'essencial');
  assert(down.removed.length, 'lista o que sai');
  const up = model.restoreParked(model.switchPackage(down.project, 'profissional').project).project;
  assert.deepEqual(up.sections, p.sections, 'volta na mesma ordem');
  assert.equal(model.familyOf(up).id, 'pet'); assert.equal(model.variantOf(up).id, model.variantOf(p).id, 'a composição continua a mesma');
  const r = model.checkChange(model.normalizeProject({ ...p, pkg: 'essencial', sections: ['apresentacao', 'servicos', 'contato'] }), { sections: ['apresentacao', 'servicos', 'faq', 'contato'] });
  assert.equal(r.kind, 'upgrade', 'recurso de outro pacote pede escolha');
});

test('Estilo, cor e fonte mudam só tokens: textos, seções e composição ficam', () => {
  const p = fromCase(casos[3]);
  const html = render(p);
  for (const d of model.directions) {
    const q = model.normalizeProject({ ...p, direction: d.id, palette: 'vinho', font: 'forte' });
    const h = render(q);
    assert.equal(visible(h), visible(html), `${d.id}: mesmo conteúdo`);
    assert(h.includes('data-layout="mesa"') && h.includes(`d_${d.id}`));
  }
});

test('Imagens: catálogo com metadados, só arquivos locais e sem repetir a do topo', () => {
  for (const x of assets) {
    assert(x.alt && x.caption && x.category && x.crops.length && x.focal, x.id);
    assert(fs.existsSync(path.join(__dirname, `../public/demo/${x.id}.svg`)), x.id);
    const svg = fs.readFileSync(path.join(__dirname, `../public/demo/${x.id}.svg`), 'utf8');
    assert(!/<script|href=|xlink:href|<image/i.test(svg), `${x.id}: SVG sem script nem imagem externa`);
  }
  assert(/Origem|origem/.test(fs.readFileSync(path.join(__dirname, '../public/demo/README.md'), 'utf8')));
  for (const s of model.segments) {
    const plan = previewPlan(model.exampleProject(s.id));
    assert(!plan.gallery.includes(plan.heroAsset) || plan.gallery.length === 2, `${s.id}: topo não se repete na galeria`);
    assert.equal(new Set(plan.gallery.map((x) => x.id)).size, plan.gallery.length, `${s.id}: galeria sem repetição`);
    assert([0, 3, 5, 6].includes(plan.gallery.length) || plan.gallery.length < 3, `${s.id}: grade sem buraco (${plan.gallery.length})`);
    const html = render(model.exampleProject(s.id));
    for (const src of html.match(/src="[^"]+"/g) ?? []) assert(/src="\/?[^":]*\/demo\/[a-z0-9-]+\.svg"/.test(src), `${s.id}: só imagens locais do catálogo (${src})`);
  }
});

test('Moldura de navegador ilustrativa, sem domínio que pareça comprado', () => {
  const html = render(fromCase(casos[0]));
  assert(html.includes('prévia ilustrativa'));
  assert(!/\.com\.br|www\./.test(visible(html)));
});

/* ── Compatibilidade ───────────────────────────────────────────────────── */

test('Projetos salvos antes das famílias abrem com tudo automático, sem perder nada', () => {
  const old = { version: 4, flow: 'guiado-v2', name: 'Pet Feliz', segment: 'outro', segmentOther: 'Clínica veterinária', service: 'Consultas', headline: 'Meu título', edited: ['headline'], direction: 'elegante', palette: 'verde', sections: ['apresentacao', 'servicos', 'sobre', 'contato'], step: 9, pkg: 'essencial' };
  const p = model.normalizeProject(old);
  assert.equal(p.rev, 2); assert.equal(p.subsegment, ''); assert.equal(p.family, ''); assert.equal(p.nameLater, false);
  assert.equal(p.headline, 'Meu título'); assert.deepEqual(p.edited, ['headline']); assert.equal(p.direction, 'elegante'); assert.equal(p.step, 9);
  const plan = previewPlan(p);
  assert.equal(plan.subsegment.id, 'clinica-veterinaria', 'o tipo de negócio sai do que já estava escrito');
  assert.equal(plan.family.id, 'pet'); assert.equal(plan.heroAsset.id, 'pet-clinica');
  const junk = model.normalizeProject({ ...old, family: 'xyz', layout: 'zzz', hero: 'video', imagery: 'http://x', subsegment: 'nada', nameLater: 'sim', textSource: 'hack' });
  for (const k of ['family', 'layout', 'hero', 'imagery', 'subsegment', 'textSource']) assert.equal(junk[k], '', k);
  assert.equal(junk.nameLater, false);
  // Arquivo exportado continua na versão 1 do formato e volta igual.
  const back = model.importProject(JSON.stringify(model.exportProject(p)));
  assert.equal(back.name, 'Pet Feliz'); assert.equal(previewPlan(back).family.id, 'pet');
  const link = model.shareLink({ ...p, family: 'institucional', layout: 'tipografico' });
  const shared = model.fromShare(link.slice(link.indexOf('#')));
  assert.equal(shared.family, 'institucional'); assert.equal(shared.layout, 'tipografico'); assert.equal(shared.name, '', 'link sem dados pessoais');
});

test('Origem dos textos: da pessoa, da IA ou demonstrativo — nunca atribuído à pessoa sem ela escrever', () => {
  const p = fromCase(casos[4]);
  assert.equal(model.provenanceOf(p, 'headline'), 'ia');
  assert.equal(model.provenanceOf({ ...p, edited: ['headline'] }, 'headline'), 'usuario');
  assert.equal(model.provenanceOf(model.initialProject(), 'about'), 'demonstrativo');
  assert.equal(model.provenanceOf(model.exampleProject('beleza'), 'headline'), 'demonstrativo');
  assert.equal(model.provenanceOf(p, 'region'), 'nao-informado');
  assert.equal(model.exportProject(p).resumo.textos.origem.headline, 'ia');
});

test('WhatsApp: resumo legível, com composição e tipo de negócio, codificado uma vez só', () => {
  const p = fromCase(casos[1]);
  const msg = model.projectMessage(p);
  assert(msg.includes('Tipo de negócio: Banho e tosa'));
  assert(msg.includes('Composição: Veterinária e cuidados pet · Cuidados em destaque'));
  const url = new URL(whatsappLink(msg));
  assert.equal(url.searchParams.get('text'), msg);
  assert(!/%25[0-9A-F]{2}/.test(url.search), 'sem codificação dupla');
});

test('Aviso de falha ao iniciar: script em ES5, escondido por padrão, contato por link comum', () => {
  const { startWatch, AppFallback } = require('../src/components/AppFallback.tsx');
  const acorn = require('next/dist/compiled/acorn');
  // Precisa rodar mesmo onde o restante do código não roda.
  assert.doesNotThrow(() => acorn.parse(startWatch, { ecmaVersion: 5 }), 'sintaxe ES5');
  assert(!/=>|`|\blet\b|\bconst\b|\?\.|\?\?/.test(startWatch));
  const html = renderToStaticMarkup(React.createElement(AppFallback));
  assert(/id="app-fallback"[^>]*hidden/.test(html), 'escondido até a verificação');
  assert(/href="https:\/\/wa\.me\/\d+\?text=/.test(html) && /\/pacotes\//.test(html), 'WhatsApp e pacotes sem depender de script');
  assert(!/position:\s*fixed/.test(fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8').split('.app-fallback')[1] ?? ''), 'no fluxo da página, sem cobrir botões');
});

Promise.all(pending).then(() => console.log(`${count} testes de prévias passaram.`)).catch((e) => {
  console.error(e);
  process.exit(1);
});
