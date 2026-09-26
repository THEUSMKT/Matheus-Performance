// Cenários de navegador. Requer o Playwright (npm i -D playwright) e dois builds servidos:
//   BASE: build normal (modo WhatsApp) em http://localhost:4190/Matheus-Performance/configurador/
//   BASE_R: build com NEXT_PUBLIC_LEAD_ENDPOINT=https://receptor.test/leads (o teste intercepta essa URL)
// Rode: BASE=... BASE_R=... node tests/e2e.browser.mjs   (CHROMIUM=/caminho opcional)
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const URL = process.env.BASE ?? 'http://localhost:4190/Matheus-Performance/configurador/';
const URL_R = process.env.BASE_R ?? 'http://localhost:4191/Matheus-Performance/configurador/';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let passed = 0;
const errors = [];
async function scenario(name, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  await ctx.addInitScript(() => { window.__ev = []; window.addEventListener('mb:configurator', (e) => window.__ev.push(e.detail)); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  try { await fn(page, ctx); passed++; console.log('PASS', name); }
  catch (e) { console.log('FAIL', name, e.message); process.exitCode = 1; }
  await ctx.close();
}
const cfg = (page) => page.locator('#configurador');
const next = (page) => cfg(page).locator('[class*=stepActions] button', { hasText: '→' });
const est = (page) => page.getByTestId('estimate');
const events = (page) => page.evaluate(() => window.__ev.map((e) => e.event));

await scenario('Hero, CTA e ordem das seções', async (page) => {
  await page.goto(URL);
  assert.equal(await page.locator('h1').innerText(), 'Um site profissional para apresentar sua empresa e facilitar novos pedidos de orçamento.');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((x) => x.id));
  assert.deepEqual(ids, ['exemplos', 'como-funciona', 'configurador', 'opcoes', 'quem-atende', 'perguntas']);
  const wa = page.getByRole('link', { name: 'Tirar uma dúvida no WhatsApp' }).first();
  assert.equal(await wa.getAttribute('target'), '_blank'); assert.equal(await wa.getAttribute('rel'), 'noopener noreferrer');
  assert((await wa.getAttribute('href')).startsWith('https://wa.me/5551981947979?text='));
  assert.equal(await page.locator('text=R$ 500').first().isVisible(), true);
  assert.equal(await page.locator('img[alt=""][src*="simbolo.png"]').count() >= 2, true);
  const html = await page.content();
  for (const bad of ['seudominio', 'seuinstagram', '99999-9999', 'Mais vendido']) assert(!html.includes(bad), bad);
  const square = page.getByRole('link', { name: 'Estruture seu próprio site em até 3 minutos — abrir o configurador' });
  assert.equal(await square.getAttribute('href'), '#configurador');
  await square.click({ force: true }); // flutua sem parar; o clique real funciona em movimento
  assert((await events(page)).includes('configurator_start'));
  assert.equal(await page.locator('#exemplos [class*=segmentTabs], main > section:first-of-type [data-testid=estimate]').count(), 0, 'topo sem prévia');
});

await scenario('Fluxo completo nos 4 momentos, com orçamento preservado após recarregar', async (page) => {
  await page.goto(URL);
  await cfg(page).getByRole('radio', { name: 'Beleza e bem-estar' }).click();
  await cfg(page).getByLabel(/Serviço ou produto principal/).fill('Design de sobrancelhas');
  await cfg(page).getByRole('radio', { name: /Facilitar solicitações de horário/ }).click();
  await cfg(page).getByLabel(/Nome do negócio/).fill('Studio Lua');
  await next(page).click();
  await cfg(page).getByRole('button', { name: 'Usar esta recomendação' }).click();
  await next(page).click();
  const before = await est(page).innerText();
  await cfg(page).getByRole('radio', { name: /Elegante/ }).click();
  assert.notEqual(await est(page).innerText(), before, 'identidade recalcula');
  await cfg(page).getByText('Quero comparar com um limite de orçamento').click();
  await cfg(page).getByLabel('Meu limite para o desenvolvimento (R$)').fill('1.000');
  await page.reload();
  await page.locator('#configurador').scrollIntoViewIfNeeded();
  assert.equal(await cfg(page).getByLabel('Meu limite para o desenvolvimento (R$)').inputValue(), '1.000');
  await next(page).click();
  const summary = await cfg(page).locator('dl').first().innerText();
  for (const s of ['Studio Lua', 'Beleza e bem-estar', 'Design de sobrancelhas', 'R$ 1.000']) assert(summary.includes(s), s);
  const href = decodeURIComponent(await cfg(page).getByRole('link', { name: 'Preparar conversa no WhatsApp' }).getAttribute('href'));
  for (const s of ['Negócio: Studio Lua', 'Meu limite de orçamento: R$ 1.000', 'Ref.: bp-']) assert(href.includes(s), s);
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')));
  assert.equal(stored.budget, '1.000'); assert.equal(stored.version, 3); assert.equal(stored.flow, 'assistido-4m-v1');
  await cfg(page).getByRole('link', { name: 'Preparar conversa no WhatsApp' }).click({ modifiers: [] }).catch(() => {});
  const ev = await events(page);
  assert(ev.includes('whatsapp_open')); assert(ev.includes('summary_view')); assert(!ev.includes('generate_lead'));
  assert.equal(await page.locator('text=Pedido recebido').count(), 0);
  const composition = await cfg(page).locator('table').innerText();
  assert(composition.includes('Valor calculado'));
});

const dlg = (page) => page.locator('dialog[open]');
const openExample = (page, name) => page.getByRole('button', { name: `Abrir exemplo de ${name}` }).click();
const useModel = (page) => dlg(page).getByRole('button', { name: 'Usar este modelo como ponto de partida' }).click();

await scenario('Exemplo: aplica direto sem escolhas; pede confirmação dentro da demonstração', async (page) => {
  await page.goto(URL);
  await openExample(page, 'Portfólio criativo');
  await useModel(page);
  assert.equal(await dlg(page).count(), 0);
  assert(await cfg(page).getByRole('radio', { name: 'Portfólio criativo' }).getAttribute('aria-checked') === 'true');
  await cfg(page).getByLabel(/Nome do negócio/).fill('Ateliê X');
  await openExample(page, 'Alimentação');
  await useModel(page);
  const box = dlg(page).locator('[role=alertdialog]');
  assert(await box.isVisible(), 'confirmação dentro da demonstração');
  assert((await box.innerText()).includes('segmento'));
  await box.getByRole('button', { name: 'Manter minhas escolhas' }).click();
  assert.equal(await dlg(page).count(), 1, 'continua aberta');
  await page.keyboard.press('Escape');
  assert(await cfg(page).getByRole('radio', { name: 'Portfólio criativo' }).getAttribute('aria-checked') === 'true');
  await openExample(page, 'Alimentação');
  await useModel(page);
  await dlg(page).locator('[role=alertdialog]').getByRole('button', { name: 'Usar este modelo' }).click();
  assert.equal(await dlg(page).count(), 0, 'fecha só depois de confirmar');
  assert(await cfg(page).getByRole('radio', { name: 'Alimentação' }).getAttribute('aria-checked') === 'true');
  assert.equal(await cfg(page).getByLabel(/Nome do negócio/).inputValue(), 'Ateliê X');
});

await scenario('Demonstração: computador/celular, anterior/próximo, Esc e foco no card', async (page) => {
  await page.goto(URL);
  assert.equal(await page.locator('#exemplos button[aria-label^="Abrir exemplo de"]').count(), 5);
  assert.equal(await page.getByRole('button', { name: /^Ampliar/ }).count(), 0);
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
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Abrir exemplo de Portfólio criativo');
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
});

await scenario('Caminho escolhido na seção aplica estrutura e leva à recomendação', async (page) => {
  await page.goto(URL);
  const before = await est(page).innerText();
  await page.locator('#opcoes article', { hasText: 'Projeto empresarial' }).getByRole('button', { name: 'Escolher este caminho' }).click();
  assert.notEqual(await est(page).innerText(), before);
  assert((await cfg(page).locator('[class*=editorTop]').innerText()).includes('2 de 4'));
  assert.equal(await page.locator('#opcoes article', { hasText: 'Projeto empresarial' }).getByRole('button', { name: /Caminho em uso/ }).count(), 1);
  assert((await events(page)).includes('plan_selected'));
});

await scenario('Necessidade complexa vai para diagnóstico, sem valor automático', async (page) => {
  await page.goto(URL);
  await cfg(page).getByText('O projeto precisa de algo mais complexo?').click();
  await cfg(page).getByText('Loja virtual com carrinho e pagamento online').click();
  assert.equal(await est(page).innerText(), 'Sob diagnóstico');
  await next(page).click();
  assert((await cfg(page).innerText()).includes('Projeto empresarial'));
  await cfg(page).getByRole('button', { name: 'Pular para o resumo' }).click();
  assert.equal(await cfg(page).locator('table').count(), 0, 'sem tabela de preço');
  const href = decodeURIComponent(await cfg(page).getByRole('link', { name: 'Preparar conversa no WhatsApp' }).getAttribute('href'));
  assert(href.includes('Investimento: sob diagnóstico'));
});

await scenario('Estado da versão anterior (v2) é migrado e mantido', async (page, ctx) => {
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('mb.configurador.v2', JSON.stringify({ version: 2, name: 'Oficina Antiga', segment: 'local', objective: 'orcamento', sections: ['apresentacao', 'galeria', 'contato'], direction: 'essencial', palette: 'azul', features: ['whatsapp', 'redes', 'galeria', 'catalogo'], type: 'landing', step: 5 })); } });
  await page.goto(URL);
  await cfg(page).locator('[role=status]', { hasText: 'versão anterior' }).waitFor();
  assert((await cfg(page).locator('[class*=editorTop]').innerText()).includes('4 de 4'));
  assert((await cfg(page).locator('dl').first().innerText()).includes('Oficina Antiga'));
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v2')), 'antigo preservado');
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')));
});

await scenario('Link compartilhado carrega opções sem dados privados; link inválido avisa', async (page) => {
  const hash = '#projeto=' + encodeURIComponent(JSON.stringify({ version: 3, segment: 'criativo', name: 'Não deveria', budget: '999', budgetOn: true, features: ['whatsapp', 'redes', 'galeria'], sections: ['galeria'], step: 3 }));
  await page.goto(URL + hash);
  assert((await cfg(page).locator('dl').first().innerText()).includes('Portfólio criativo'));
  assert(!(await cfg(page).locator('dl').first().innerText()).includes('Não deveria'));
  assert((await cfg(page).locator('dl').first().innerText()).includes('Não informado'));
  await page.goto(URL + '#projeto=%ZZ');
  await page.waitForTimeout(300);
  assert((await cfg(page).locator('[role=status]').first().innerText()).match(/inválido|não é válido/));
});

await scenario('Copiar link: sucesso e falha com alternativa; PDF', async (page) => {
  await page.goto(URL);
  await cfg(page).getByRole('button', { name: /Momento 4/ }).click();
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('negado')); window.print = () => { window.__printed = true; }; });
  await cfg(page).getByRole('button', { name: 'Copiar link das opções' }).click();
  assert((await cfg(page).locator('[class*=statusError]').innerText()).includes('Não foi possível copiar'));
  const link = await cfg(page).getByLabel('Link das opções').inputValue();
  assert(link.startsWith('https://theusmkt.github.io/Matheus-Performance/configurador/#projeto='));
  await cfg(page).getByRole('button', { name: 'Salvar resumo em PDF' }).click();
  assert(await page.evaluate(() => window.__printed));
  await page.emulateMedia({ media: 'print' });
  assert(await page.locator('[class*=printOnly]').isVisible());
  assert(!(await page.locator('header').first().isVisible()));
  assert(!(await page.locator('[class*=printOnly]').innerText()).includes('5551981947979'));
});

await scenario('Começar novamente pede confirmação e apaga o salvo', async (page) => {
  await page.goto(URL);
  await cfg(page).getByLabel(/Nome do negócio/).fill('Apagar');
  await cfg(page).getByRole('button', { name: 'Começar novamente' }).click();
  await cfg(page).getByRole('button', { name: 'Manter meu projeto' }).click();
  assert.equal(await cfg(page).getByLabel(/Nome do negócio/).inputValue(), 'Apagar');
  await cfg(page).getByRole('button', { name: 'Começar novamente' }).click();
  await cfg(page).getByRole('button', { name: 'Sim, começar novamente' }).click();
  assert.equal(await cfg(page).getByLabel(/Nome do negócio/).inputValue(), '');
  assert.equal(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')), null);
});

await scenario('Teclado: setas no grupo de opções e foco no título ao avançar', async (page) => {
  await page.goto(URL);
  const checked = cfg(page).getByRole('radio', { name: 'Consultoria e autônomos' });
  await checked.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await cfg(page).getByRole('radio', { name: 'Portfólio criativo' }).getAttribute('aria-checked'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Portfólio criativo');
  await next(page).click();
  assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H3');
});

await scenario('Ajuda durante o fluxo e campanha por segmento', async (page) => {
  await page.goto(URL + '?utm_source=Meta&utm_campaign=Beleza_Set&segmento=beleza');
  await cfg(page).locator('[role=radio][aria-checked=true]', { hasText: 'Beleza' }).waitFor();
  assert.equal(await cfg(page).getByRole('radio', { name: 'Beleza e bem-estar' }).getAttribute('aria-checked'), 'true');
  await cfg(page).getByRole('button', { name: 'Precisa de ajuda?' }).click();
  const help = cfg(page).getByRole('link', { name: /Tirar uma dúvida no WhatsApp/ });
  assert(decodeURIComponent(await help.getAttribute('href')).includes('etapa: Negócio e objetivo'));
  await cfg(page).getByLabel(/Nome do negócio/).fill('X');
  const ev = await page.evaluate(() => window.__ev);
  const start = ev.find((e) => e.event === 'configurator_start');
  assert.equal(start.utm_source, 'meta'); assert.equal(start.utm_campaign, 'beleza_set'); assert.equal(start.campaign_segment, 'beleza');
  assert(!JSON.stringify(ev).includes('http'));
});

for (const width of [360, 390, 430]) {
  await scenario(`Celular ${width}px: sem rolagem lateral e uma barra de próximo passo por vez`, async (page) => {
    await page.goto(URL);
    await page.waitForTimeout(700);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    const pageBar = page.locator('[data-bar=pagina]');
    const configBar = page.locator('[class*=mobileBar]:not([class*=Spacer]):not([data-bar])');
    assert.equal(await pageBar.count(), 0, 'sem barra enquanto o botão do topo aparece');
    await page.evaluate(() => document.querySelector('#exemplos').scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(400);
    assert(await pageBar.isVisible());
    assert.equal(await configBar.count(), 0);
    assert((await pageBar.getByRole('link').first().getAttribute('href')) === '#configurador');
    assert((await pageBar.getByRole('link', { name: 'Tirar uma dúvida no WhatsApp' }).getAttribute('href')).startsWith('https://wa.me/5551981947979'));
    await page.evaluate(() => document.querySelector('#configurador h3[tabindex]').scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(400);
    assert(await configBar.isVisible());
    assert.equal(await pageBar.count(), 0, 'nunca as duas juntas');
    await cfg(page).getByLabel(/Nome do negócio/).focus();
    await page.waitForTimeout(100);
    assert.equal(await configBar.count() + (await pageBar.count()), 0, 'teclado aberto: nenhuma barra');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  }, { viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
}

await scenario('Celular: momento 3 em sanfona, uma aberta por vez, com a escolha no cabeçalho', async (page) => {
  await page.goto(URL);
  await cfg(page).getByRole('button', { name: /Momento 3/ }).click();
  const regions = cfg(page).locator('[class*=foldBody]');
  assert.equal(await regions.count(), 6);
  assert.equal(await cfg(page).locator('[class*=foldBody]:not([hidden])').count(), 1);
  const cores = cfg(page).getByRole('button', { name: /^Cores · Oceano/ });
  await cores.click();
  assert.equal(await cores.getAttribute('aria-expanded'), 'true');
  assert.equal(await cfg(page).locator('[class*=foldBody]:not([hidden])').count(), 1);
  await cfg(page).getByRole('button', { name: /Argila/ }).click();
  await cfg(page).getByRole('button', { name: /^Cores · Argila/ }).click();
  assert.equal(await cfg(page).locator('[class*=foldBody]:not([hidden])').count(), 0);
  assert(await cfg(page).getByRole('button', { name: /^Orçamento · Não informado/ }).isVisible());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('Celular: opções em carrossel começando no recomendado; "fica à parte" recolhido', async (page) => {
  await page.goto(URL);
  await cfg(page).getByLabel(/Nome do negócio/).fill('Loja X');
  await page.evaluate(() => document.querySelector('#opcoes').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(600);
  await page.waitForFunction(() => !document.querySelector('#opcoes [class*=nudging]'));
  assert.equal(await page.locator('#carrossel-opcoes').getAttribute('aria-roledescription'), 'carrossel');
  assert.equal(await page.locator('#opcoes [class*=dots] button[aria-current=true]').getAttribute('aria-label'), 'Ir para opção 2 de 3');
  assert.equal(await page.locator('#opcoes details[open]').count(), 0);
  await page.locator('#opcoes article', { hasText: 'Captação' }).getByText('Ver o que fica à parte').click();
  await page.locator('#opcoes details[open]').first().waitFor({ timeout: 3000 });
  assert.equal(await page.locator('#opcoes details[open]').count(), 1);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('Computador 1280px: sem rolagem lateral, quadrado e carrosséis', async (page) => {
  await page.goto(URL);
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 1280);
  assert(await page.locator('#exemplos').getByRole('button', { name: 'Próximo' }).isVisible(), 'setas no computador');
  assert.equal(await page.locator('#opcoes [class*=dots]').count(), 0, 'opções em grade');
  assert.equal(await page.locator('[class*=foldBody]').count(), 0, 'sem sanfona no computador');
});

console.log(`${passed} cenários passaram.`, errors.length ? errors : 'sem erros de página');
await browser.close();
