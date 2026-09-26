// Cenários de navegador. Requer o Playwright (npm i -D playwright) e dois builds servidos:
//   BASE: build normal (modo WhatsApp) em http://localhost:4190/Matheus-Performance/configurador/
//   BASE_R: build com NEXT_PUBLIC_LEAD_ENDPOINT=https://receptor.test/leads (o teste intercepta essa URL)
// Rode: BASE=... BASE_R=... node tests/e2e.browser.mjs   (CHROMIUM=/caminho opcional)
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const URL = process.env.BASE ?? 'http://localhost:4190/Matheus-Performance/configurador/';
const URL_R = process.env.BASE_R ?? 'http://localhost:4191/Matheus-Performance/configurador/';
const B = URL + 'criar/';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let passed = 0;
const errors = [];
async function scenario(name, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  // Os eventos ficam na sessão da aba: sobrevivem à ida da apresentação para a página de criação.
  await ctx.addInitScript(() => {
    window.addEventListener('mb:configurator', (e) => {
      const all = JSON.parse(sessionStorage.getItem('__ev') || '[]');
      all.push(e.detail);
      sessionStorage.setItem('__ev', JSON.stringify(all));
    });
  });
  await ctx.route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'whatsapp' }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  try { await fn(page, ctx); passed++; console.log('PASS', name); }
  catch (e) { console.log('FAIL', name, e.message); process.exitCode = 1; }
  await ctx.close();
}
const allEvents = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('__ev') || '[]'));
const events = async (page) => (await allEvents(page)).map((e) => e.event);
const heroCta = (page) => page.locator('[class*=heroCopy] a[class*=shine]');
const floatCta = (page) => page.locator('a[class*=floatCta]');
/** Abre a criação pelo cartão flutuante (os botões principais só levam até ele). */
async function openBuilder(page) {
  // O cartão só aparece depois que o botão do topo sai da tela.
  if ((await floatCta(page).getAttribute('data-shown')) === null) {
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('exemplos').offsetTop + 200, behavior: 'instant' }));
    await page.locator('a[class*=floatCta][data-shown]').waitFor();
  }
  await floatCta(page).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
}
const stepText = (page) => page.getByText(/^Etapa \d de 4$/).innerText();
const preview = (page) => page.getByRole('complementary', { name: 'Prévia do seu site' });
const est = (page) => page.getByTestId('estimate');
const summary = (page) => page.locator('main dl').first().innerText();
const quoteLink = (page) => page.locator('[class*=desktopOnly] a', { hasText: 'Solicitar orçamento' });
const scrollWidth = (page) => page.evaluate(() => document.documentElement.scrollWidth);
const h1 = (page) => page.getByRole('heading', { level: 1 }).innerText();
const editor = (page) => page.locator('section[aria-labelledby=etapa-titulo]');
/** Página de criação pronta (hidratada, com o projeto carregado). */
async function ready(page) {
  await page.locator('#etapa-titulo').waitFor();
  await page.waitForFunction(() => !document.querySelector('[data-bar=configurador] button:disabled, [class*=desktopActions] button:disabled'));
}
/** "Continuar" / "Ver minha prévia" visível (barra do celular ou fim da coluna no computador). */
async function next(page) {
  const btn = page.locator('[data-bar=configurador] button, [class*=desktopActions] button').filter({ hasText: /^(Continuar|Ver minha prévia)$/ }).filter({ visible: true }).first();
  await btn.click();
}
async function toSummary(page, name) {
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill(name);
  for (let i = 0; i < 3; i++) await next(page);
  assert.equal(await stepText(page), 'Etapa 4 de 4');
}

/* ── Página de apresentação ─────────────────────────────────────────────── */

await scenario('Apresentação: primeira dobra curta, ação principal e seções', async (page) => {
  await page.goto(URL);
  assert.equal(await h1(page), 'Seu próximo site começa aqui.');
  const copy = page.locator('[class*=heroCopy]');
  assert.deepEqual(await copy.locator('p').allInnerTexts(), ['Sites para empresas de todos os portes', 'Monte uma prévia personalizada em poucos passos.', 'Sem cadastro.']);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia');
  assert.equal(await heroCta(page).getAttribute('href'), '#exemplos');
  assert.equal(await page.locator('header nav a[class*=navCta]').getAttribute('href'), '#exemplos');
  assert.equal((await floatCta(page).textContent()).trim(), 'Estruturar meu site profissional');
  assert((await floatCta(page).getAttribute('href')).endsWith('/configurador/criar/'));
  assert.equal(await floatCta(page).evaluate((e) => getComputedStyle(e).position), 'fixed');
  await page.waitForTimeout(400);
  assert.equal(await floatCta(page).getAttribute('data-shown'), null, 'cartão escondido enquanto o botão do topo aparece');
  assert(!(await floatCta(page).isVisible()));
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((x) => x.id));
  assert.deepEqual(ids, ['exemplos', 'como-funciona', 'investimento', 'quem-atende', 'perguntas']);
  const wa = copy.getByRole('link', { name: 'Tirar uma dúvida no WhatsApp' });
  assert.equal(await wa.getAttribute('target'), '_blank'); assert.equal(await wa.getAttribute('rel'), 'noopener noreferrer');
  assert((await wa.getAttribute('href')).startsWith('https://wa.me/5551981947979?text='));
  const invest = await page.locator('#investimento').innerText();
  for (const s of ['Projetos a partir de', 'R$ 500', 'Após levantamento', 'contratados à parte']) assert(invest.includes(s), s);
  assert(await page.locator('img[alt=""][src*="simbolo.png"]').count() >= 2);
  const text = await page.locator('body').innerText();
  for (const bad of [/pequenas e médias/i, /pequenos negócios/i, /3 minutos|três minutos|site pronto em/i, /seudominio/, /99999-9999/, /Mais vendido/]) assert(!bad.test(text), String(bad));
  // Brilho: faixa animada atrás do texto, sem mudar o botão nem receber cliques.
  const shine = await heroCta(page).evaluate((el) => {
    const cs = getComputedStyle(el, '::after');
    return { name: cs.animationName, duration: cs.animationDuration, events: cs.pointerEvents, overflow: getComputedStyle(el).overflow, textZ: getComputedStyle(el.firstElementChild).zIndex };
  });
  assert(shine.name.includes('lightSweep')); assert.equal(shine.duration, '7s'); assert.equal(shine.events, 'none');
  assert.equal(shine.overflow, 'hidden'); assert.equal(shine.textZ, '1');
  const before = await heroCta(page).boundingBox();
  await page.waitForTimeout(2200);
  assert.deepEqual(await heroCta(page).boundingBox(), before, 'o brilho não mexe no botão');
  // O botão principal rola até os exemplos e destaca o cartão, sem abrir a criação.
  await heroCta(page).click();
  await page.waitForFunction(() => document.getElementById('exemplos').getBoundingClientRect().top < 120);
  assert(page.url().endsWith('/configurador/'), 'continua na apresentação');
  assert.equal(await page.evaluate(() => document.activeElement?.className.includes('floatCta')), true, 'foco no cartão');
  assert.equal(await floatCta(page).getAttribute('data-spot'), 'a');
  const box = await floatCta(page).boundingBox();
  assert(box.y + box.height <= 900 && box.x + box.width <= 1280, 'cartão à vista');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  assert(await floatCta(page).isVisible(), 'visível até o fim da página');
  await openBuilder(page);
  assert.equal(await h1(page), 'Crie a prévia do seu site');
  assert.equal(await stepText(page), 'Etapa 1 de 4');
  assert((await events(page)).includes('configurator_start'));
});

await scenario('Menos movimento: sem brilho nem flutuação', async (page) => {
  await page.goto(URL);
  const names = await page.evaluate(() => [
    getComputedStyle(document.querySelector('[class*=heroCopy] a[class*=shine]'), '::after').animationName,
    ...[...document.querySelectorAll('[data-showcase] *')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
    getComputedStyle(document.querySelector('a[class*=floatCta]')).animationName,
  ]);
  assert.deepEqual(names, ['none', 'none'], 'nada anima');
  const w = page.locator('[data-showcase] [class*=window]').first();
  assert.equal(await w.evaluate((e) => getComputedStyle(e).opacity), '1', 'composição já montada');
  assert.match(await w.evaluate((e) => getComputedStyle(e).transform), /^matrix3d/, 'perspectiva continua');
}, { reducedMotion: 'reduce' });

await scenario('Vitrine do topo: janela, celular e selo, montada uma vez e sem cortar nada', async (page) => {
  await page.goto(URL);
  const sc = page.locator('[data-showcase]');
  assert.equal(await sc.getAttribute('role'), 'img');
  assert((await sc.getAttribute('aria-label')).includes('Exemplo ilustrativo'));
  const txt = await sc.textContent();
  for (const s of ['Exemplo ilustrativo', 'Atelier Norte', 'Espaços pensados para viver bem.', 'Residencial', 'Sua prévia em até 5 minutos']) assert(txt.includes(s), s);
  assert.equal(await sc.locator('a, button, input, form').count(), 0, 'nada clicável na ilustração');
  const imgs = await sc.locator('img').evaluateAll((els) => els.map((e) => [e.getAttribute('width'), e.getAttribute('height'), e.complete && e.naturalWidth > 0]));
  assert.equal(imgs.length, 2); for (const [w, h, ok] of imgs) assert(w && h && ok, 'imagem com dimensões reservadas e carregada');
  await page.waitForFunction(() => document.querySelector('[data-showcase]').hasAttribute('data-play'));
  const durations = await page.evaluate(() => [...document.querySelectorAll('[data-showcase] *')].map((e) => {
    const cs = getComputedStyle(e);
    if (cs.animationName === 'none') return null;
    const d = cs.animationDuration.split(',').map(parseFloat), l = cs.animationDelay.split(',').map(parseFloat), it = cs.animationIterationCount;
    return { end: d[0] + l[0], it };
  }).filter(Boolean));
  const assembly = durations.filter((x) => x.it !== 'infinite');
  const endAt = Math.max(...assembly.map((x) => x.end));
  assert(endAt >= 1.5 && endAt <= 2, `montagem em ${endAt}s`);
  const loop = durations.filter((x) => x.it === 'infinite');
  assert.equal(loop.length, 1, 'só a flutuação fica em loop');
  await page.waitForTimeout(2100);
  const box = await sc.boundingBox();
  const copy = await page.locator('[class*=heroCopy]').boundingBox();
  assert(box.x > copy.x + copy.width + 24, 'espaço entre texto e ilustração');
  for (const sel of ['[class*=window]', '[class*=phone]', '[class*=badge]']) {
    const b = await sc.locator(sel).first().boundingBox();
    assert(b.x >= box.x - 2 && b.x + b.width <= box.x + box.width + 12 && b.y >= box.y - 12 && b.y + b.height <= box.y + box.height + 6, `${sel} dentro da vitrine`);
  }
  const badge = await sc.locator('[class*=badge]').boundingBox();
  const phone = await sc.locator('[class*=phone]').first().boundingBox();
  assert(badge.x + badge.width <= phone.x, 'selo não encosta no celular');
}, { viewport: { width: 1280, height: 800 } });

for (const width of [320, 375, 390, 430]) {
  await scenario(`Vitrine no celular ${width}px: abaixo do texto, inteira e legível`, async (page) => {
    await page.goto(URL);
    await page.waitForTimeout(2200);
    assert.equal(await scrollWidth(page), width);
    const sc = page.locator('[data-showcase]');
    const box = await sc.boundingBox();
    const cta = await heroCta(page).boundingBox();
    assert(box.y > cta.y + cta.height, 'ilustração depois do botão');
    assert(box.height < 0.5 * 844, 'não ocupa a tela inteira');
    const phone = await sc.locator('[class*=phone]').first().boundingBox();
    assert(phone.x + phone.width <= width, 'celular inteiro na tela');
    const badge = await sc.locator('[class*=badge]').boundingBox();
    assert(badge.x >= 0 && badge.x + badge.width <= phone.x + 1, 'selo sem encostar no celular');
    const sizes = await sc.locator('[class*=badge], [class*=title], [class*=tag]').evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    for (const s of sizes) assert(s >= 9.5, `texto legível (${s}px)`);
  }, { viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
}

await scenario('Sem nada salvo o botão é "Criar minha prévia"; abrir a criação sem escolher nada não muda isso', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.goto(URL);
  await page.waitForTimeout(400);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia');
});

/* ── Página de criação ──────────────────────────────────────────────────── */

await scenario('Criação em 4 etapas: nome obrigatório, prévia fiel às escolhas e progresso salvo', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await stepText(page), 'Etapa 1 de 4');
  await next(page);
  const name = page.locator('#nome-empresa');
  assert.equal(await page.locator('#erro-nome-empresa').innerText(), 'Informe o nome da empresa.');
  assert.equal(await name.getAttribute('aria-invalid'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'nome-empresa');
  assert.equal(await stepText(page), 'Etapa 1 de 4');
  await name.fill('Studio Lua');
  assert.equal(await page.locator('#erro-nome-empresa').count(), 0);
  await page.getByRole('radio', { name: 'Beleza e bem-estar' }).click();
  await page.getByRole('radio', { name: 'Mostrar serviços' }).click();
  const pv = preview(page);
  assert((await pv.innerText()).includes('Studio Lua'));
  assert((await pv.innerText()).includes('Ver serviços'), 'o botão da prévia segue o objetivo');
  assert(/Prévia/.test(await pv.innerText()), 'prévia marcada como prévia');
  assert.equal(await pv.locator('a[href], form, input, button[type=submit]').count(), 0, 'botões demonstrativos não disparam contato');

  await next(page);
  assert.equal(await stepText(page), 'Etapa 2 de 4');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'etapa-titulo');
  assert.equal(await page.locator('#etapa-titulo').innerText(), 'Aparência');
  assert.deepEqual(await page.locator('[aria-labelledby=rotulo-estilo] [role=radio]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').split(',')[0])), ['Moderno', 'Elegante', 'Minimalista', 'Tecnológico', 'Sofisticado', 'Escuro']);
  const other = page.getByRole('link', { name: 'Escolher um estilo diferente (entrar em contato no WhatsApp)' });
  const otherHref = await other.getAttribute('href');
  assert(otherHref.startsWith('https://wa.me/5551981947979?text='));
  assert.equal(new globalThis.URL(otherHref).searchParams.get('text'), 'Olá! Gostaria de um estilo diferente dos disponíveis no configurador para o meu site.');
  assert.equal(await other.getAttribute('target'), '_blank');
  const checkedBefore = await page.locator('[aria-labelledby=rotulo-estilo] [aria-checked=true]').getAttribute('aria-label');
  const waTab = page.waitForEvent('popup');
  await other.click();
  await (await waTab).close();
  assert.equal(await page.locator('[aria-labelledby=rotulo-estilo] [aria-checked=true]').getAttribute('aria-label'), checkedBefore, 'não muda o estilo escolhido');
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  assert.equal(await pv.locator('[aria-roledescription="prévia"][class*=escuro]').count(), 1, 'estilo novo aplicado na prévia');
  await page.getByRole('radio', { name: /^Elegante/ }).click();
  await page.getByRole('radio', { name: 'Argila' }).click();
  assert.equal(await pv.locator('[aria-roledescription="prévia"][class*=elegante]').count(), 1, 'estilo aplicado na prévia');

  await next(page);
  assert.equal(await stepText(page), 'Etapa 3 de 4');
  assert.equal(await page.locator('#etapa-titulo').innerText(), 'Conteúdo');
  const plan = page.getByRole('radiogroup', { name: 'Estrutura' });
  assert.equal(await plan.locator('[aria-checked=true]').count(), 1, 'estrutura sugerida já aplicada');
  assert((await plan.innerText()).includes('Sugerido para seu objetivo'));
  const phrase = page.locator('[class*=suggestions] button').first();
  const text = await phrase.innerText();
  await phrase.click();
  assert((await pv.innerText()).includes(text), 'frase escolhida aparece na prévia');
  await page.getByText('Galeria', { exact: true }).click();
  assert((await pv.innerText()).includes('Galeria'));
  assert.equal(await page.locator('[class*=desktopActions] button', { hasText: 'Ver minha prévia' }).count(), 1);

  await next(page);
  assert.equal(await stepText(page), 'Etapa 4 de 4');
  assert.equal(await page.locator('#etapa-titulo').innerText(), 'Sua prévia');
  const rows = await summary(page);
  for (const s of ['Studio Lua', 'Beleza e bem-estar', 'Mostrar serviços', 'Elegante · Argila', 'Galeria']) assert(rows.includes(s), s);
  const current = await est(page).innerText();
  assert.match(current, /^R\$ [\d.]+ – R\$ [\d.]+$/);
  const ev = await allEvents(page);
  const names = ev.map((e) => e.event);
  for (const n of ['configurator_start', 'summary_view', 'preview_view']) assert(names.includes(n), n);
  assert.deepEqual(ev.filter((e) => e.event === 'step_complete').map((e) => e.step), [1, 2, 3]);
  assert(!JSON.stringify(ev).includes('Studio Lua'), 'eventos sem o que foi digitado');

  // Orçamento comparado sobrevive a recarregar.
  await page.getByText('Comparar com meu orçamento').click();
  await page.getByText('Quero comparar com um limite').click();
  await page.getByLabel('Meu limite para o desenvolvimento (R$)').fill('1.000');
  await page.reload();
  await ready(page);
  assert.equal(await stepText(page), 'Etapa 4 de 4');
  assert((await summary(page)).includes('Studio Lua'));
  const href = await quoteLink(page).getAttribute('href');
  assert(href.startsWith('https://wa.me/5551981947979?text='));
  assert.equal(await quoteLink(page).getAttribute('target'), '_blank');
  assert.equal(await quoteLink(page).getAttribute('rel'), 'noopener noreferrer');
  const msg = new globalThis.URL(href).searchParams.get('text');
  for (const s of ['Negócio: Studio Lua', current, 'Meu limite de orçamento: R$ 1.000', 'Ref.: bp-']) assert(msg.includes(s), s);
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')));
  assert.equal(stored.version, 3); assert.equal(stored.flow, 'etapas-4-v2'); assert.equal(stored.budget, '1.000');

  const popup = page.waitForEvent('popup');
  await quoteLink(page).click();
  await (await popup).close();
  const after = await allEvents(page);
  assert.equal(after.find((e) => e.event === 'quote_request').mode, 'whatsapp');
  assert(after.some((e) => e.event === 'whatsapp_open'));
  assert(!after.some((e) => e.event === 'generate_lead'), 'WhatsApp não gera lead');
  assert.equal(await page.locator('text=Pedido recebido').count(), 0);

  // "Editar prévia" volta ao começo sem perder nada.
  await page.locator('[class*=desktopActions] button', { hasText: 'Editar prévia' }).click();
  assert.equal(await stepText(page), 'Etapa 1 de 4');
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Studio Lua');

  // De volta à apresentação: o botão principal retoma a prévia.
  await page.goto(URL);
  await heroCta(page).filter({ hasText: 'Continuar minha prévia' }).waitFor();
  await heroCta(page).click();
  await page.waitForTimeout(300);
  assert(page.url().endsWith('/configurador/'), '"Continuar minha prévia" não pula para a criação');
  await openBuilder(page);
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Studio Lua');
});

await scenario('Segmento "Outro" pede só um texto simples e a logo é opcional', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.getByRole('radio', { name: 'Outro' }).click();
  await page.locator('#segmento-outro').fill('Escola de idiomas');
  await page.locator('#nome-empresa').fill('Fala Bem');
  await next(page);
  assert((await page.locator('[class*=upload]').innerText()).includes('Enviar logo'));
  assert((await preview(page).innerText()).includes('Fala Bem'), 'sem logo, a prévia usa o nome');
  await page.locator('[class*=upload] input[type=file]').setInputFiles({ name: 'logo.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await page.locator('#erro-logo').waitFor();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  await page.locator('[class*=upload] input[type=file]').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await preview(page).locator('img').first().waitFor();
  assert(await page.evaluate(() => (localStorage.getItem('bp.logo.v1') || '').startsWith('data:image/png')));
  for (let i = 0; i < 2; i++) await next(page);
  const href = decodeURIComponent(await quoteLink(page).getAttribute('href'));
  assert(href.includes('Logo: tenho a logo e envio por aqui'));
  assert(!href.includes('data:image'), 'a imagem não vai na mensagem');
  assert((await summary(page)).includes('Escola de idiomas'));
});

await scenario('Necessidade complexa vai para levantamento, sem valor automático', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill('Loja Z');
  await next(page);
  await next(page);
  await page.getByText('Precisa de algo mais complexo?').click();
  await page.getByText('Loja virtual com carrinho e pagamento online').click();
  const plan = page.getByRole('radiogroup', { name: 'Estrutura' });
  assert.equal((await plan.innerText()).match(/Valor após levantamento/g).length, 3);
  assert((await plan.locator('[role=radio]', { hasText: 'Projeto empresarial' }).innerText()).includes('Sugerido para seu objetivo'));
  await next(page);
  assert.equal(await est(page).innerText(), 'Sob diagnóstico');
  assert.equal(await page.locator('[class*=estimate] table').count(), 0, 'sem tabela de preço');
  assert(decodeURIComponent(await quoteLink(page).getAttribute('href')).includes('Investimento: sob diagnóstico'));
});

await scenario('Prévia da versão anterior (v2) é recuperada na página de criação', async (page, ctx) => {
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('mb.configurador.v2', JSON.stringify({ version: 2, name: 'Oficina Antiga', segment: 'local', objective: 'orcamento', sections: ['apresentacao', 'galeria', 'contato'], direction: 'essencial', palette: 'azul', features: ['whatsapp', 'redes', 'galeria', 'catalogo'], type: 'landing', step: 5 })); } });
  await page.goto(B);
  await ready(page);
  await page.locator('[role=status]', { hasText: 'versão anterior' }).waitFor();
  assert.equal(await stepText(page), 'Etapa 4 de 4');
  assert((await summary(page)).includes('Oficina Antiga'));
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v2')), 'antigo preservado');
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')));
  await page.goto(URL);
  await heroCta(page).filter({ hasText: 'Continuar minha prévia' }).waitFor();
});

await scenario('Links: antigo redireciona, opções sem dados privados, link inválido avisa', async (page) => {
  const hash = '#projeto=' + encodeURIComponent(JSON.stringify({ version: 3, segment: 'criativo', name: 'Não deveria', budget: '999', budgetOn: true, features: ['whatsapp', 'redes', 'galeria'], sections: ['galeria'], step: 3 }));
  await page.goto(URL + hash);
  await page.waitForURL(/\/criar\/#projeto=/);
  await ready(page);
  const rows = await summary(page);
  assert(rows.includes('Portfólio criativo')); assert(!rows.includes('Não deveria'));
  await page.goto(URL + '#configurador');
  await page.waitForURL(/\/criar\/$/);
  await page.goto(B + '#projeto=%ZZ');
  await page.locator('[role=status]').filter({ hasText: /não é válido|inválido/ }).first().waitFor();
});

await scenario('Copiar link: falha com alternativa; PDF com o resumo', async (page) => {
  await toSummary(page, 'Empresa PDF');
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('negado')); window.print = () => { window.__printed = true; }; });
  await page.getByRole('button', { name: 'Copiar link' }).click();
  assert((await page.locator('[class*=statusError]').innerText()).includes('Não foi possível copiar'));
  const link = await page.getByLabel('Link das opções').inputValue();
  assert(link.startsWith('https://theusmkt.github.io/Matheus-Performance/configurador/criar/#projeto='));
  assert(!decodeURIComponent(link).includes('Empresa PDF'));
  await page.getByRole('button', { name: 'Salvar em PDF' }).click();
  assert(await page.evaluate(() => window.__printed));
  await page.emulateMedia({ media: 'print' });
  assert(await page.locator('[class*=printOnly]').isVisible());
  assert(!(await page.locator('header').first().isVisible()));
  const printed = await page.locator('[class*=printOnly]').innerText();
  assert(printed.includes('Empresa PDF')); assert(!printed.includes('5551981947979'));
});

await scenario('Começar novamente pede confirmação e apaga o salvo', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await page.getByRole('button', { name: 'Começar novamente' }).count(), 0, 'nada para apagar ainda');
  await page.locator('#nome-empresa').fill('Apagar');
  await page.getByRole('button', { name: 'Começar novamente' }).click();
  const box = page.getByRole('alertdialog');
  assert((await box.innerText()).includes('Apagar suas respostas e começar de novo?'));
  await box.getByRole('button', { name: 'Manter' }).click();
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Apagar');
  await page.getByRole('button', { name: 'Começar novamente' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Sim, apagar' }).click();
  assert.equal(await page.locator('#nome-empresa').inputValue(), '');
  assert.equal(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')), null);
  await page.goto(URL);
  await page.waitForTimeout(400);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia');
});

await scenario('Teclado: setas no grupo de opções e foco no título ao avançar', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.getByRole('radio', { name: 'Consultoria e autônomos' }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio', { name: 'Portfólio criativo' }).getAttribute('aria-checked'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Portfólio criativo');
  await page.locator('#nome-empresa').fill('Teclado');
  await next(page);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'etapa-titulo');
  const style = page.locator('[aria-labelledby=rotulo-estilo] [role=radio][aria-checked=true]');
  await style.focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-checked')), 'true');
});

await scenario('Ajuda na criação e campanha por segmento', async (page) => {
  await page.goto(URL + '?utm_source=Meta&utm_campaign=Beleza_Set&segmento=beleza');
  await openBuilder(page);
  assert.equal(await page.getByRole('radio', { name: 'Beleza e bem-estar' }).getAttribute('aria-checked'), 'true');
  const help = page.getByRole('link', { name: /Dúvidas\? Fale no WhatsApp/ });
  assert(decodeURIComponent(await help.getAttribute('href')).includes('etapa: Seu negócio'));
  assert.equal(await help.getAttribute('rel'), 'noopener noreferrer');
  const ev = await allEvents(page);
  const start = ev.find((e) => e.event === 'configurator_start');
  assert.equal(start.utm_source, 'meta'); assert.equal(start.utm_campaign, 'beleza_set'); assert.equal(start.campaign_segment, 'beleza');
  assert(!JSON.stringify(ev).includes('http'));
});

await scenario('Computador 1280px: opções à esquerda, prévia ao lado e "Continuar" sempre à vista', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await scrollWidth(page), 1280);
  const left = await editor(page).boundingBox();
  const pane = await preview(page).boundingBox();
  assert(pane.x > left.x + left.width - 1, 'prévia à direita');
  assert(!(await page.getByRole('button', { name: 'Ver prévia' }).isVisible()), 'sem alternância no computador');
  assert(!(await page.locator('[data-bar=configurador]').isVisible()), 'sem barra de celular');
  const cont = page.locator('[class*=desktopActions] button', { hasText: 'Continuar' });
  const box = await cont.boundingBox();
  assert(box.y + box.height <= 900, '"Continuar" dentro da tela');
  await preview(page).getByRole('button', { name: 'Celular' }).click();
  assert(await preview(page).locator('[class*=phoneFrame]').isVisible());
  await preview(page).getByRole('button', { name: 'Computador' }).click();
  assert(await preview(page).locator('[class*=desktopFrame]').isVisible());
  await page.locator('#nome-empresa').fill('Largura');
  for (let i = 0; i < 3; i++) {
    await next(page);
    assert.equal(await scrollWidth(page), 1280, `etapa ${i + 2}`);
  }
});

/* ── Exemplos, perguntas e investimento ─────────────────────────────────── */

const dlg = (page) => page.locator('dialog[open]');
const openExample = (page, name) => page.getByRole('button', { name: `Abrir exemplo de ${name}` }).click();
const useModel = (page) => dlg(page).getByRole('button', { name: 'Usar este modelo como ponto de partida' }).click();

await scenario('Exemplo como ponto de partida abre a criação; com escolhas, confirma antes', async (page) => {
  await page.goto(URL);
  await openExample(page, 'Portfólio criativo');
  await useModel(page);
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await page.getByRole('radio', { name: 'Portfólio criativo' }).getAttribute('aria-checked'), 'true');
  await page.locator('#nome-empresa').fill('Ateliê X');
  await page.goto(URL);
  await heroCta(page).filter({ hasText: 'Continuar minha prévia' }).waitFor();
  await openExample(page, 'Alimentação');
  await useModel(page);
  const box = dlg(page).locator('[role=alertdialog]');
  assert(await box.isVisible(), 'confirmação dentro da demonstração');
  assert((await box.innerText()).includes('segmento'));
  await box.getByRole('button', { name: 'Manter minhas escolhas' }).click();
  assert.equal(await dlg(page).count(), 1, 'continua aberta');
  await useModel(page);
  await dlg(page).locator('[role=alertdialog]').getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await page.getByRole('radio', { name: 'Alimentação' }).getAttribute('aria-checked'), 'true');
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Ateliê X');
  assert((await events(page)).includes('example_applied'));
});

await scenario('Demonstração: computador/celular, anterior/próximo, Esc e foco no card', async (page) => {
  await page.goto(URL);
  assert.equal(await page.locator('#exemplos button[aria-label^="Abrir exemplo de"]').count(), 5);
  await openExample(page, 'Consultoria e autônomos');
  assert((await dlg(page).locator('#exemplo-titulo').innerText()).includes('Consultoria'));
  assert(await dlg(page).locator('[class*=desktopFrame]').isVisible(), 'computador em moldura');
  const scale = await dlg(page).locator('[class*=desktopCanvas]').evaluate((e) => [e.style.width, e.style.transform]);
  assert.equal(scale[0], '1100px'); assert(scale[1].startsWith('scale('));
  await dlg(page).getByRole('button', { name: 'Celular' }).click();
  assert(await dlg(page).locator('[class*=phoneFrame]').isVisible(), 'moldura de celular');
  assert((await events(page)).includes('example_view_mode'));
  await dlg(page).getByRole('button', { name: /Próximo/ }).click();
  assert((await dlg(page).innerText()).includes('4 de 5'));
  assert((await dlg(page).locator('#exemplo-titulo').innerText()).includes('Portfólio criativo'));
  await page.keyboard.press('Escape');
  assert.equal(await dlg(page).count(), 0);
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Abrir exemplo de Portfólio criativo', null, { timeout: 2000 });
  await page.waitForTimeout(200);
  const visible = await page.locator('#carrossel-exemplos').evaluate((track) => {
    const card = track.querySelector('[aria-label="Abrir exemplo de Portfólio criativo"]').getBoundingClientRect();
    const box = track.getBoundingClientRect();
    return card.left >= box.left - 1 && card.right <= box.right + 1;
  });
  assert(visible, 'carrossel rola até o exemplo aberto');
  await openExample(page, 'Serviços locais');
  await page.mouse.click(5, 5);
  assert.equal(await dlg(page).count(), 0, 'toque fora fecha');
});

await scenario('Carrossel: bolinhas, setas e começo no segmento da campanha', async (page) => {
  await page.goto(URL + '?segmento=alimentacao');
  const dots = page.locator('#exemplos [class*=dots] button');
  assert.equal(await dots.count(), 6);
  await page.locator('#exemplos [class*=dots] button[aria-current=true][aria-label="Ir para exemplo 5 de 6"]').waitFor({ timeout: 5000 });
  const seen = await page.locator('#carrossel-exemplos').evaluate((track) => {
    const card = track.querySelector('[aria-label="Abrir exemplo de Alimentação"]').getBoundingClientRect();
    const box = track.getBoundingClientRect();
    return card.left >= box.left - 1 && card.right <= box.right + 1;
  });
  assert(seen, 'exemplo da campanha visível');
  await dots.nth(0).click();
  await page.waitForTimeout(700);
  assert.equal(await dots.nth(0).getAttribute('aria-current'), 'true');
  await page.locator('#exemplos').getByRole('button', { name: 'Próximo' }).click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator('#carrossel-exemplos').getAttribute('aria-roledescription'), 'carrossel');
  assert(await page.locator('#carrossel-exemplos').evaluate((t) => t.scrollLeft > 0));
});

await scenario('Perguntas: 5 primeiras e botão para ver todas', async (page) => {
  await page.goto(URL);
  assert.equal(await page.locator('#perguntas details').count(), 5);
  const more = page.getByRole('button', { name: /Ver todas as perguntas \(\d+\)/ });
  const total = Number((await more.innerText()).match(/\d+/)[0]);
  await more.click();
  assert.equal(await page.locator('#perguntas details').count(), total);
  assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SUMMARY');
  const all = await page.locator('#perguntas').textContent();
  assert(/domínio/i.test(all) && /hospedagem/i.test(all), 'custos à parte explicados nas perguntas');
});

await scenario('Investimento: caminho escolhido aplica a estrutura e abre a criação', async (page) => {
  await page.goto(URL);
  await page.locator('#investimento').getByRole('button', { name: 'Começar a prévia com Projeto empresarial' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await stepText(page), 'Etapa 1 de 4', 'sem nome, começa pelo negócio');
  await page.locator('#nome-empresa').fill('Grupo Y');
  await next(page);
  await next(page);
  assert.equal(await page.getByRole('radio', { name: /^Projeto empresarial/ }).getAttribute('aria-checked'), 'true');
  const ev = await allEvents(page);
  assert.equal(ev.find((e) => e.event === 'plan_selected').source, 'investimento');
});

/* ── Celular ────────────────────────────────────────────────────────────── */

for (const width of [360, 390, 430]) {
  await scenario(`Celular ${width}px: primeira dobra, cartão flutuante, Editar/Ver prévia e sem rolagem lateral`, async (page) => {
    await page.goto(URL);
    await page.waitForTimeout(600);
    assert.equal(await scrollWidth(page), width);
    const cta = await heroCta(page).boundingBox();
    assert(cta.y + cta.height < 420, `botão principal cedo (${Math.round(cta.y)}px)`);
    const lines = await page.locator('#hero-titulo').evaluate((h) => Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)));
    assert(lines <= 3, `título em ${lines} linhas`);
    assert((await page.locator('header').first().boundingBox()).height <= 60, 'cabeçalho baixo');
    assert(!(await floatCta(page).isVisible()), 'sem cartão enquanto o botão do topo aparece');
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('como-funciona').offsetTop, behavior: 'instant' }));
    await page.locator('a[class*=floatCta][data-shown]').waitFor();
    await page.waitForTimeout(400);
    const card = await floatCta(page).boundingBox();
    assert(card.x >= 0 && card.x + card.width <= width && card.y + card.height <= 844 - 8, 'cartão inteiro, acima da borda');
    assert(card.height <= 48, 'formato compacto no celular');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => !document.querySelector('a[class*=floatCta]').hasAttribute('data-shown'));
    await page.waitForTimeout(400);
    assert(!(await floatCta(page).isVisible()), 'volta a esconder no topo');
    await heroCta(page).click();
    await page.waitForFunction(() => document.getElementById('exemplos').getBoundingClientRect().top < 120);
    assert(page.url().endsWith('/configurador/'));
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(200);
    const last = await page.locator('footer [class*=footerBottom]').boundingBox();
    const fixed = await floatCta(page).boundingBox();
    assert(last.y + last.height <= fixed.y + 1, 'o fim da página rola acima do cartão');
    assert.equal(await scrollWidth(page), width);
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#menu-celular a[class*=primary]').click();
    await page.waitForTimeout(300);
    assert(page.url().endsWith('/configurador/'), 'botão do menu também não abre a criação');
    assert.equal(await page.locator('#menu-celular').count(), 0, 'menu fecha');
    assert.equal(await page.evaluate(() => document.activeElement?.className.includes('floatCta')), true);
    await openBuilder(page);
    const bar = page.locator('[data-bar=configurador]');
    assert(await bar.isVisible());
    const name = page.locator('#nome-empresa');
    await name.focus();
    await page.waitForTimeout(100);
    assert.equal(await bar.count(), 0, 'teclado aberto: sem barra');
    await name.fill('Loja Azul');
    await page.getByRole('radio', { name: 'Exibir produtos' }).click();
    assert.equal(await page.getByRole('radio', { name: 'Exibir produtos' }).getAttribute('aria-checked'), 'true', 'toque logo depois de digitar funciona');
    await page.waitForTimeout(500);
    assert(await bar.isVisible(), 'barra volta depois do toque');

    await page.getByRole('button', { name: 'Ver prévia' }).click();
    assert(await preview(page).isVisible());
    assert(!(await name.isVisible()));
    const pv = await preview(page).innerText();
    assert(pv.includes('Loja Azul') && pv.includes('Ver produtos'));
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    assert.equal(await name.inputValue(), 'Loja Azul');
    assert.equal(await stepText(page), 'Etapa 1 de 4');

    for (let step = 2; step <= 4; step++) {
      await next(page);
      await page.waitForTimeout(150);
      assert.equal(await stepText(page), `Etapa ${step} de 4`);
      assert.equal(await scrollWidth(page), width, `rolagem lateral na etapa ${step}`);
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForTimeout(200);
      }
      const barTop = (await bar.boundingBox()).y;
      const end = (await editor(page).boundingBox()).y + (await editor(page).boundingBox()).height;
      assert(end <= barTop + 1, `a barra cobre o fim da etapa ${step} (${Math.round(end)} > ${Math.round(barTop)})`);
    }
    assert.deepEqual((await bar.locator('a, button').allInnerTexts()).map((t) => t.trim()), ['Editar prévia', 'Solicitar orçamento']);
    const targets = await page.evaluate(() => [...document.querySelectorAll('#conteudo button, #conteudo summary, [data-bar] a, [data-bar] button')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && (r.height < 44 || r.width < 44)).length);
    assert.equal(targets, 0, 'alvos de toque com pelo menos 44px');
  }, { viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
}

/* ── Com receptor de pedidos ────────────────────────────────────────────── */

await scenario('Receptor: validação, falha sem perder dados, repetição sem duplicar, confirmação única', async (page) => {
  let calls = 0; const keys = [];
  await page.route('https://receptor.test/leads', async (route) => {
    calls++; keys.push(route.request().headers()['idempotency-key']);
    if (calls === 1) return route.fulfill({ status: 500, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{}' });
    await new Promise((r) => setTimeout(r, 300));
    return route.fulfill({ status: 201, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, leadId: 'L-77' }) });
  });
  await page.goto(URL_R + 'criar/');
  await ready(page);
  await page.locator('#nome-empresa').fill('Clínica Sol');
  for (let i = 0; i < 3; i++) await next(page);
  await page.locator('[class*=desktopOnly] button', { hasText: 'Solicitar orçamento' }).click();
  const form = page.locator('#formulario-pedido');
  await form.getByRole('button', { name: 'Enviar pedido' }).click();
  assert.equal(calls, 0, 'inválido não envia');
  assert.equal(await form.getByLabel('Seu nome').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('autocomplete')), 'name');
  await form.getByLabel('Seu nome').fill('Ana Teste');
  await form.getByLabel('Seu WhatsApp com DDD').fill('(51) 99999-0000');
  await form.getByRole('button', { name: 'Enviar pedido' }).click();
  await form.locator('[role=alert]').waitFor();
  assert((await form.locator('[role=alert]').innerText()).includes('não foi confirmado'));
  assert.equal(await form.getByLabel('Seu nome').inputValue(), 'Ana Teste');
  await form.getByRole('button', { name: 'Tentar novamente' }).dblclick();
  await page.locator('text=Pedido recebido').waitFor();
  assert.equal(calls, 2, 'clique duplo = um envio');
  assert.equal(keys[0], keys[1], 'mesma chave na nova tentativa');
  const ev = await allEvents(page);
  assert.equal(ev.filter((e) => e.event === 'generate_lead').length, 1);
  assert.equal(ev.filter((e) => e.event === 'lead_submit_error').length, 1);
  assert.equal(ev.find((e) => e.event === 'quote_request').mode, 'formulario');
  assert(!JSON.stringify(ev).match(/Ana|99999|Clínica/), 'eventos sem dados pessoais');
});

console.log(`${passed} cenários passaram.`, errors.length ? errors : 'sem erros de página');
await browser.close();
