// Run: node tests/project.test.cjs (after npm ci). Uses the installed TypeScript compiler.
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
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);

// Navegador mínimo para os módulos de medição.
const events = [];
const session = new Map();
global.sessionStorage = { getItem: (k) => session.get(k) ?? null, setItem: (k, v) => session.set(k, String(v)), removeItem: (k) => session.delete(k) };
global.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init.detail; } };
global.window = { dispatchEvent: (e) => events.push(e.detail), dataLayer: [] };

const model = require('../src/lib/project.ts');
const {pricing} = require('../src/config/pricing.ts');
const {plans} = require('../src/config/offer.ts');
const {estimate, breakdown} = require('../src/lib/estimate.ts');
const leads = require('../src/lib/leads.ts');
const analytics = require('../src/lib/analytics.ts');
const origin = require('../src/lib/origin.ts');
const {createReceiver, memoryAdapters} = require('../integrations/lead-receiver/receiver.ts');
const crm = require('../integrations/lead-receiver/crm.ts');

let count = 0;
const pending = [];
function test(name, fn) {
  const r = fn();
  if (r && typeof r.then === 'function') pending.push(r.then(() => { count++; console.log('PASS', name); }));
  else { count++; console.log('PASS', name); }
}
const withLead = (p, lead) => model.normalizeProject({ ...p, id: 'bp-abcdef1234', lead: { ...model.emptyLead, ...lead } });

/* ── Preço ─────────────────────────────────────────────────────────────── */

test('Projeto base continua em R$ 500 com faixa e prazo originais', () => {
  const e = model.projectEstimate(model.initialProject());
  assert.equal(e.total, 500); assert.equal(e.min, 500); assert.equal(e.max, 550); assert.equal(e.deadline, '3–5 dias úteis');
});

test('Composição soma exatamente o total em todas as combinações', () => {
  let n = 0;
  for (const segment of model.segments) for (const objective of model.objectives) for (const direction of model.directions) for (const plan of plans) {
    const p = model.applyPlan(model.normalizeProject({ ...model.initialProject(), segment: segment.id, objective: objective.id, direction: direction.id, custom: n % 2 ? '#123456' : null, features: ['whatsapp', 'redes', 'catalogo', 'agendamento'] }), plan.id);
    const e = model.projectEstimate(p);
    assert.equal(model.composition(p).reduce((s, l) => s + l.value, 0), e.total);
    assert.equal(breakdown(model.selectionFor(p)).reduce((s, l) => s + l.value, 0), e.total);
    assert.deepEqual(model.projectEstimate(model.normalizeProject(JSON.parse(JSON.stringify(p)))), e);
    const msg = model.projectMessage(p);
    assert(msg.includes(model.priceLabel(p)), 'mensagem usa a mesma faixa');
    n++;
  }
  assert.equal(n, 6 * 5 * 3 * 3);
});

test('Recurso repetido não é cobrado duas vezes', () => {
  const sel = { ...model.selectionFor(model.initialProject()), features: ['galeria', 'galeria', 'faq'] };
  const lines = breakdown(sel).filter((l) => l.kind === 'feature');
  assert.equal(lines.filter((l) => l.id === 'galeria').length, 1);
  assert.equal(estimate(sel).total, pricing.base + pricing.byFeature.galeria + pricing.byFeature.faq);
});

test('Identidade incluída no pacote zera só a identidade, sem mudar o resto', () => {
  const p = model.normalizeProject({ ...model.initialProject(), direction: 'marcante', custom: '#112233' });
  const before = model.projectEstimate(p).total;
  const identity = model.composition(p).find((l) => l.label.startsWith('Identidade')).value;
  pricing.identity.mode = 'incluida';
  try {
    assert.equal(model.projectEstimate(p).total, before - identity);
    assert.equal(model.composition(p).find((l) => l.label.startsWith('Adaptação')).value, pricing.customColors);
  } finally { pricing.identity.mode = 'vigente'; }
});

test('Caminhos aplicam estrutura e recalculam; empresarial exige levantamento', () => {
  for (const plan of plans) {
    const p = model.applyPlan(model.initialProject(), plan.id);
    assert.equal(p.plan, plan.id);
    for (const f of plan.config.features) assert(p.features.includes(f));
    for (const s of plan.config.sections) assert(p.sections.includes(s));
  }
  assert(plans.find((x) => x.id === 'empresarial').needsAssessment);
  assert(model.projectEstimate(model.applyPlan(model.initialProject(), 'captacao')).total > model.projectEstimate(model.applyPlan(model.initialProject(), 'presenca')).total);
});

test('Recomendação por regra e diagnóstico sem valor automático', () => {
  const p = model.initialProject();
  assert.equal(model.recommendedPlan(p), 'captacao');
  assert.equal(model.recommendedPlan({ ...p, guidance: true }), 'presenca');
  const complex = model.normalizeProject({ ...p, complex: ['loja'] });
  assert.equal(model.recommendedPlan(complex), 'empresarial');
  assert.equal(model.investmentLabel(complex), 'Sob diagnóstico');
  assert(model.projectMessage(complex).includes('Investimento: sob diagnóstico'));
  assert(!model.projectMessage(complex).includes('Desenvolvimento estimado'));
  assert.equal(model.deadlineText(complex), 'Definido após o diagnóstico');
});

test('Caminho não escolhido aparece como recomendação, não como escolha', () => {
  const p = model.initialProject();
  assert(model.projectMessage(p).includes('Caminho: ainda não escolhido (recomendado: Captação de orçamentos)'));
  assert(model.projectMessage(model.applyPlan(p, 'presenca')).includes('Caminho: Presença profissional\n'));
});

/* ── Orçamento ─────────────────────────────────────────────────────────── */

test('Orçamento: ausente, zero, inválido, abaixo e comparação com a faixa', () => {
  const p = model.initialProject();
  assert.equal(model.budgetInfo(p).status, 'ausente');
  assert.equal(model.budgetInfo({ ...p, budgetOn: true, budget: '' }).status, 'ausente');
  assert.equal(model.budgetInfo({ ...p, budgetOn: true, budget: '0' }).status, 'invalido');
  assert.equal(model.budgetInfo({ ...p, budgetOn: true, budget: 'mil' }).status, 'invalido');
  assert.equal(model.budgetInfo({ ...p, budgetOn: true, budget: '300' }).status, 'abaixo');
  assert.deepEqual(model.budgetInfo({ ...p, budgetOn: true, budget: 'R$ 1.500,00' }), { status: 'valido', value: 1500, fit: 'cabe' });
  assert.equal(model.budgetInfo({ ...p, budgetOn: true, budget: '520' }).fit, 'pode_ultrapassar');
  const big = model.normalizeProject({ ...p, features: ['whatsapp', 'redes', 'catalogo', 'paginaExtra'], budgetOn: true, budget: '600' });
  assert.equal(model.budgetInfo(big).fit, 'excede');
  assert.equal(model.budgetInfo({ ...big, complex: ['loja'] }).fit, 'diagnostico');
  assert.equal(model.budgetInfo({ ...p, budgetOn: false, budget: '1500' }).status, 'ausente');
});

test('Orçamento sobrevive a salvar, recarregar, resumo, mensagem e pedido', () => {
  const p = model.normalizeProject({ ...model.initialProject(), budgetOn: true, budget: '1.200' });
  const saved = model.normalizeProject(JSON.parse(JSON.stringify(p)));
  assert.equal(saved.budget, '1.200'); assert.equal(saved.budgetOn, true);
  assert(model.projectMessage(saved).includes('Meu limite de orçamento: R$ 1.200'));
  const payload = leads.buildPayload(withLead(saved, { name: 'Ana', contact: '51999990000' }), {});
  assert.deepEqual(payload.qualification.budget, { status: 'valido', value: 1200, fit: 'cabe' });
  assert(model.projectMessage(model.initialProject()).includes('Meu limite de orçamento: Não informado'));
});

/* ── Migração, links e privacidade ─────────────────────────────────────── */

test('Estado inválido é seguro e não cria preço desconhecido', () => {
  for (const input of [null, [], 42, 'bad', {}, { version: 999 }]) assert.deepEqual(model.normalizeProject(input), model.initialProject());
  const n = model.normalizeProject({ version: 3, name: {}, segment: 'x', direction: '__proto__', custom: 'url(javascript:bad)', features: ['galeria', 'galeria', 'bad'], sections: ['galeria', 'bad'], step: 999, type: '__proto__', legacyTemplate: 'constructor', id: 'bp-../../x', complex: ['loja', 'loja', 'hack'], budget: 12345678901234567890 });
  assert.equal(n.step, 3); assert.equal(n.custom, null); assert.equal(n.type, 'landing'); assert.equal(n.legacyTemplate, undefined);
  assert.equal(n.id, ''); assert.deepEqual(n.complex, ['loja']); assert.equal(n.budget, '');
  assert.equal(n.features.filter((f) => f === 'galeria').length, 1);
});

test('Migra v2 (seis etapas) e v1 sem perder escolhas nem apagar o antigo', () => {
  const v2 = { version: 2, name: 'Oficina', description: 'desc', segment: 'local', objective: 'agenda', sections: ['apresentacao', 'servicos', 'galeria', 'contato'], direction: 'elegante', palette: 'verde', custom: null, font: 'auto', features: ['whatsapp', 'redes', 'galeria', 'catalogo'], type: 'local', step: 4 };
  const storage = { [model.LEGACY_KEYS.v2]: JSON.stringify(v2) };
  const read = model.readStored((k) => storage[k] ?? null);
  assert.equal(read.source, 'v2');
  assert.equal(read.project.name, 'Oficina'); assert.equal(read.project.step, 2); assert(read.project.features.includes('catalogo'));
  assert.equal(model.projectEstimate(read.project).total, model.projectEstimate(model.normalizeProject({ ...v2, version: 3 })).total);
  assert(storage[model.LEGACY_KEYS.v2], 'leitura não apaga a versão anterior');
  const v1 = model.migrateLegacy({ selection: { company: 'Empresa', type: 'local', template: 'premium', style: 'premium', features: ['galeria', 'formulario'], customColor: { accent: '#ffffff' } } });
  assert.equal(v1.name, 'Empresa'); assert.equal(v1.legacyTemplate, 'premium'); assert(v1.sections.includes('galeria')); assert(!v1.features.includes('formulario'));
  assert.equal(model.readStored((k) => (k === model.LEGACY_KEYS.v1 ? JSON.stringify({ selection: { company: 'X' } }) : null)).source, 'v1');
  assert.equal(model.readStored(() => null), null);
});

test('Links v2 e v3 funcionam; links públicos não levam dados pessoais', () => {
  const p = model.normalizeProject({ ...model.initialProject(), id: 'bp-abcdef1234', name: 'Nome Privado', description: 'Texto privado', service: 'Serviço privado', segment: 'outro', segmentOther: 'Segmento privado', budgetOn: true, budget: '9.999', lead: { name: 'Fulano', channel: 'email', contact: 'fulano@x.com', deadline: 'mes', decision: 'eu', marketing: true } });
  const link = decodeURIComponent(model.shareLink(p));
  for (const s of ['Privado', 'privado', '9.999', 'Fulano', 'fulano@', 'bp-abcdef1234']) assert(!link.includes(s), s);
  const back = model.fromShare(new URL(model.shareLink(p)).hash);
  assert.equal(back.name, ''); assert.equal(back.budget, ''); assert.equal(back.lead.name, '');
  assert.equal(model.projectEstimate(back).total, model.projectEstimate(p).total);
  const v2link = '#projeto=' + encodeURIComponent(JSON.stringify({ version: 2, segment: 'beleza', name: 'Vazou', features: ['whatsapp', 'redes', 'galeria'], sections: ['galeria'], step: 5 }));
  const fromV2 = model.fromShare(v2link);
  assert.equal(fromV2.name, ''); assert(fromV2.features.includes('galeria')); assert.equal(fromV2.step, 3);
  assert.throws(() => model.fromShare('#projeto=%ZZ'));
  assert.throws(() => model.fromShare('#projeto=' + encodeURIComponent('{"version":6}')));
  assert.equal(model.fromShare('#configurador'), null);
});

test('Exemplo como ponto de partida mantém o que foi digitado', () => {
  const mine = model.normalizeProject({ ...model.initialProject(), name: 'Minha', service: 'Corte', budgetOn: true, budget: '800', direction: 'marcante', lead: { ...model.emptyLead, name: 'Eu' } });
  const merged = model.mergeStartingPoint(mine, model.exampleProject('beleza'));
  assert.equal(merged.name, 'Minha'); assert.equal(merged.service, 'Corte'); assert.equal(merged.budget, '800'); assert.equal(merged.lead.name, 'Eu');
  assert.equal(merged.segment, 'beleza');
  assert(model.choiceChanges(mine, merged).includes('identidade visual'));
  assert(model.hasOwnChoices(mine)); assert(!model.hasOwnChoices(model.initialProject()));
  for (const s of model.segments) assert.deepEqual(model.exampleProject(s.id).sections, model.recommendations(model.exampleProject(s.id)));
});

test('Ajuste manual pede confirmação antes de um caminho substituí-lo', () => {
  const p = model.applyPlan(model.initialProject(), 'presenca');
  assert.deepEqual(model.customStructure(p), []);
  const tweaked = model.normalizeProject({ ...p, features: [...p.features, 'animacoes'] });
  assert.deepEqual(model.customStructure(tweaked), ['recursos']);
});

test('Contraste do texto dos botões com cor própria (WCAG AA)', () => {
  const lum = (h) => { const c = h.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722; };
  for (let i = 0; i < 0xffffff; i += 3571) { const hex = '#' + i.toString(16).padStart(6, '0'), a = lum(hex), b = lum(model.contrastInk(hex)); assert((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5); }
});

/* ── Pedido de proposta ───────────────────────────────────────────────── */

test('Validação: nome e um canal, com o dado do canal escolhido', () => {
  const p = model.initialProject();
  assert.deepEqual(Object.keys(leads.validateLead(p)).sort(), ['contact', 'name']);
  assert.deepEqual(leads.validateLead(withLead(p, { name: 'Ana', channel: 'whatsapp', contact: '(51) 99999-0000' })), {});
  assert.deepEqual(leads.validateLead(withLead(p, { name: 'Ana', channel: 'telefone', contact: '+55 51 3333-4444' })), {});
  assert(leads.validateLead(withLead(p, { name: 'Ana', channel: 'email', contact: '51999990000' })).contact);
  assert.deepEqual(leads.validateLead(withLead(p, { name: 'Ana', channel: 'email', contact: 'ana@empresa.com.br' })), {});
  assert(leads.validateLead(withLead(p, { name: ' A ', contact: '51999990000' })).name);
  assert.equal(leads.normalizePhone('+55 (51) 98194-7979'), '51981947979');
});

test('Mesmos dados geram a mesma chave; dados diferentes, outra', () => {
  const a = withLead(model.initialProject(), { name: 'Ana', contact: '51999990000' });
  const k1 = leads.buildPayload(a, {}).idempotencyKey;
  assert.equal(leads.buildPayload(JSON.parse(JSON.stringify(a)), { utm_source: 'x' }).idempotencyKey, k1);
  assert.equal(leads.buildPayload({ ...a, step: 1 }, {}).idempotencyKey, k1);
  assert.notEqual(leads.buildPayload(withLead(a, { name: 'Ana', contact: '51999990001' }), {}).idempotencyKey, k1);
  assert(k1.startsWith('bp-abcdef1234:'));
});

test('Envio: só há sucesso com confirmação do receptor', async () => {
  const payload = leads.buildPayload(withLead(model.initialProject(), { name: 'Ana', contact: '51999990000' }), {});
  const res = (status, body) => async () => ({ ok: status < 300, status, json: async () => body });
  assert.deepEqual(await leads.submitLead(payload, ''), { ok: false, reason: 'sem-receptor' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', res(201, { ok: true, leadId: 'L1' })), { ok: true, leadRef: 'L1', duplicate: false });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', res(200, { ok: true })), { ok: false, reason: 'servidor' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', res(200, 'OK')), { ok: false, reason: 'servidor' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', res(422, {})), { ok: false, reason: 'validacao' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', res(500, {})), { ok: false, reason: 'servidor' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', async () => { throw new TypeError('offline'); }), { ok: false, reason: 'rede' });
  assert.deepEqual(await leads.submitLead(payload, 'https://x', (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' })))), 20), { ok: false, reason: 'tempo' });
  let headers;
  await leads.submitLead(payload, 'https://x', async (u, init) => { headers = init.headers; return { ok: true, status: 201, json: async () => ({ ok: true, leadId: 'L' }) }; });
  assert.equal(headers['Idempotency-Key'], payload.idempotencyKey);
});

test('Clique duplo não dispara dois envios', async () => {
  let calls = 0;
  const submit = leads.createSubmitter(async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return { ok: true, leadRef: 'L', duplicate: false }; });
  const payload = leads.buildPayload(withLead(model.initialProject(), { name: 'Ana', contact: '51999990000' }), {});
  const [a, b] = await Promise.all([submit(payload), submit(payload)]);
  assert.equal(calls, 1); assert.deepEqual(a, b);
  await submit(payload); assert.equal(calls, 2, 'nova tentativa depois de terminar é permitida');
});

test('Receptor: recalcula, salva antes de confirmar e deduplica', async () => {
  const mem = memoryAdapters();
  let n = 0;
  const handle = createReceiver({ ...mem, allowedOrigin: 'https://theusmkt.github.io', newId: () => `L${++n}`, now: () => new Date('2026-09-25T12:00:00Z') });
  const p = withLead(model.applyPlan(model.initialProject(), 'captacao'), { name: 'Ana', contact: '51999990000' });
  const payload = leads.buildPayload(p, { utm_source: 'google' });
  payload.clientEstimate.total = 1; // navegador adulterado
  const req = { method: 'POST', headers: { origin: 'https://theusmkt.github.io', 'idempotency-key': payload.idempotencyKey }, body: JSON.stringify(payload) };
  const first = await handle(req);
  assert.equal(first.status, 201); assert.deepEqual(JSON.parse(first.body), { ok: true, leadId: 'L1', duplicate: false });
  const row = mem.rows.get(payload.idempotencyKey).record;
  assert.equal(row.estimate.total, model.projectEstimate(p).total); assert.equal(row.estimateMismatch, true);
  assert.equal(row.stage, 'novo_contato'); assert.equal(row.consent.marketing, false);
  const again = await handle(req);
  assert.deepEqual(JSON.parse(again.body), { ok: true, leadId: 'L1', duplicate: true });
  assert.equal(mem.rows.size, 1); assert.equal(mem.crmRows.length, 1);
  assert.equal((await handle({ ...req, headers: { ...req.headers, origin: 'https://evil.example' } })).status, 403);
  assert.equal((await handle({ ...req, headers: { ...req.headers, 'idempotency-key': 'outra' } })).status, 422);
  assert.equal((await handle({ ...req, body: JSON.stringify({ ...payload, project: { ...payload.project, lead: { name: '' } } }) })).status, 422);
  assert.equal((await handle({ ...req, method: 'GET' })).status, 405);
});

test('Receptor: CRM fora do ar não perde o pedido; falha ao salvar não confirma', async () => {
  const mem = memoryAdapters();
  const handle = createReceiver({ ...mem, crm: { upsert: async () => { throw new Error('503'); } }, allowedOrigin: 'o', newId: () => 'L9' });
  const payload = leads.buildPayload(withLead(model.initialProject(), { name: 'Ana', contact: '51999990000' }), {});
  const req = { method: 'POST', headers: { 'idempotency-key': payload.idempotencyKey }, body: JSON.stringify(payload) };
  const r = await handle(req);
  assert.equal(r.status, 201); assert.equal(mem.rows.size, 1); assert.deepEqual(mem.jobs, [{ kind: 'crm_upsert', leadId: 'L9', attempt: 1 }]);
  const broken = createReceiver({ ...memoryAdapters(), store: { get: async () => null, put: async () => { throw new Error('disk'); } }, allowedOrigin: 'o' });
  const b = await broken(req);
  assert.equal(b.status, 503); assert.equal(JSON.parse(b.body).ok, false);
});

test('CRM: etapas em ordem, perda só com motivo', () => {
  assert(crm.canMove('novo_contato', 'qualificacao'));
  assert(!crm.canMove('novo_contato', 'desenvolvimento'), 'pré-venda não vira produção direto');
  assert(!crm.canMove('proposta', 'perdido'));
  assert(crm.canMove('proposta', 'perdido', 'preco'));
  assert(crm.canMove('revisao', 'desenvolvimento'));
});

/* ── Medição ───────────────────────────────────────────────────────────── */

test('Eventos: sem dados pessoais, sem duplicar, lead só com confirmação', () => {
  analytics._resetForTests(); session.clear(); events.length = 0; window.dataLayer.length = 0;
  analytics.setContext({ utm_source: 'google', utm_campaign: 'lancamento' }, { hero: 'a' });
  assert(analytics.track('configurator_start'));
  assert(!analytics.track('configurator_start'), 'uma vez por sessão');
  analytics.track('step_complete', { step: 1 }); analytics.track('step_complete', { step: 1 }); analytics.track('step_complete', { step: 2 });
  analytics.track('whatsapp_open', { context: 'resumo', name: 'Ana', phone: '51999990000', email: 'a@b.com' });
  analytics.track('not_an_event');
  assert.equal(events.filter((e) => e.event === 'step_complete').length, 2);
  const wa = events.find((e) => e.event === 'whatsapp_open');
  assert.deepEqual(Object.keys(wa).sort(), ['context', 'event', 'flow_version', 'utm_campaign', 'utm_source', 'var_hero']);
  assert(!JSON.stringify(events).match(/Ana|5199999|@/));
  assert.equal(window.dataLayer.length, events.length);
  assert(!events.some((e) => e.event === 'generate_lead'), 'WhatsApp não gera lead');
  analytics.track('generate_lead', { lead_ref: 'L1' }); analytics.track('generate_lead', { lead_ref: 'L1' });
  assert.equal(events.filter((e) => e.event === 'generate_lead').length, 1);
  for (const e of analytics.SERVER_ONLY_EVENTS) assert(!(e in analytics.EVENTS));
});

test('Origem: só UTMs permitidas, normalizadas, sem dado pessoal nem URL completa', () => {
  const o = origin.parseOrigin('?utm_source=Google%20Ads&utm_medium=CPC&utm_campaign=ana@x.com&utm_term=51999990000&fbclid=abc&segmento=beleza&email=a@b', 'https://www.instagram.com/p/123?x=1', 'theusmkt.github.io');
  assert.deepEqual(o, { utm_source: 'google_ads', utm_medium: 'cpc', segment: 'beleza', referrer: 'instagram.com' });
  assert.deepEqual(origin.parseOrigin('?segmento=../../hack', '', 'h'), {});
  assert.equal(origin.originTag(o), 'google_ads/cpc');
  assert.equal(analytics.variantFor('hero', ''), 'a', 'teste inativo mostra o controle');
  assert.equal(analytics.variantFor('hero', '?v_hero=b'), 'b');
  assert.equal(analytics.variantFor('hero', '?v_hero=zzz'), 'a');
});

test('Mensagem do WhatsApp é legível e referencia projeto e origem', () => {
  const p = withLead(model.applyPlan(model.initialProject(), 'captacao'), { name: 'Ana', deadline: 'mes', decision: 'junto' });
  const msg = model.projectMessage(p, 'google/cpc');
  for (const s of ['Meu nome: Ana', 'Caminho: Captação de orçamentos', 'Seções:', 'Desenvolvimento estimado:', 'Prazo estimado:', 'Quando quero começar: No próximo mês', 'Ref.: bp-abcdef1234 · google/cpc', 'Custos externos à parte']) assert(msg.includes(s), s);
  assert(!msg.includes('undefined'));
});

Promise.all(pending).then(() => console.log(`${count} testes passaram.`)).catch((e) => { console.error(e); process.exit(1); });
