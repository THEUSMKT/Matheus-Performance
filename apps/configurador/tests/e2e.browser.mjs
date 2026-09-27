// Cenários de navegador. Requer o Playwright (npm i -D playwright) e dois builds servidos:
//   BASE: build normal (modo WhatsApp) em http://localhost:4190/Matheus-Performance/configurador/
//   BASE_R: build com NEXT_PUBLIC_LEAD_ENDPOINT=https://receptor.test/leads (o teste intercepta essa URL)
//   BASE_AI: build com NEXT_PUBLIC_AI_ENDPOINT=https://ia.test/preview (o teste simula o servidor da IA)
// Rode: BASE=... BASE_R=... BASE_AI=... node tests/e2e.browser.mjs   (CHROMIUM=/caminho opcional)
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const URL = process.env.BASE ?? 'http://localhost:4190/Matheus-Performance/configurador/';
const URL_R = process.env.BASE_R ?? 'http://localhost:4191/Matheus-Performance/configurador/';
const URL_AI = process.env.BASE_AI ?? 'http://localhost:4192/Matheus-Performance/configurador/';
const B = URL + 'criar/';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let passed = 0;
const errors = [];
const timings = [];
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
const heroCta = (page) => page.locator('[class*=heroCopy] a[class*=shine]');
const stepText = (page) => page.getByText(/^Etapa \d de 4$/).innerText();
const title = (page) => page.locator('#etapa-titulo').innerText();
const preview = (page) => page.getByRole('complementary', { name: 'Prévia do seu site' });
const price = (page) => page.getByTestId('preco').innerText();
const invest = (page) => page.getByTestId('investimento').innerText();
const requestLink = (page) => page.locator('[class*=desktopOnly] a', { hasText: /Solicitar desenvolvimento|Pedir orçamento personalizado/ });
const waHref = async (page) => new globalThis.URL(await requestLink(page).getAttribute('href'));
const waMessage = async (page) => (await waHref(page)).searchParams.get('text');
const scrollWidth = (page) => page.evaluate(() => document.documentElement.scrollWidth);
const visible = (loc) => loc.filter({ visible: true }).first();
/** Página de criação pronta (hidratada, com o projeto carregado). */
async function ready(page) {
  await page.locator('#etapa-titulo').waitFor();
  await page.waitForFunction(() => !document.querySelector('[data-bar=configurador] button:disabled, [class*=desktopActions] button:disabled'));
}
/** "Continuar" / "Ver meu site" visível (barra do celular ou fim da coluna no computador). */
async function next(page) {
  await visible(page.locator('[data-bar=configurador] button, [class*=desktopActions] button').filter({ hasText: /^(Continuar|Ver meu site)$/ })).click();
}
async function business(page, { name = 'Clima Sul', segment = 'Serviços locais', service = 'Instalação de ar-condicionado' } = {}) {
  await page.locator('#nome-empresa').fill(name);
  await page.getByRole('radio', { name: segment, exact: true }).click();
  if (service) await page.locator('#servico-principal').fill(service);
}
async function toSite(page, opts) {
  await page.goto(B);
  await ready(page);
  await business(page, opts);
  for (let i = 0; i < 3; i++) await next(page);
  assert.equal(await stepText(page), 'Etapa 4 de 4');
}
async function personalize(page) {
  if (await page.locator('#personalizar').count()) return;
  await visible(page.getByRole('button', { name: 'Personalizar meu site' })).click();
  await page.locator('#personalizar').waitFor();
}

/* ── Página de apresentação ─────────────────────────────────────────────── */

await scenario('Apresentação: dois diferenciais, preço, botão que abre a criação e seções na ordem', async (page) => {
  await page.goto(URL);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Veja como o site da sua empresa pode ficar em até 5 minutos.');
  const copy = page.locator('[class*=heroCopy]');
  const text = await copy.innerText();
  for (const s of ['Crie sua prévia gratuitamente. Desenvolvimento profissional de R$ 500 a R$ 1.000.', 'Valor do desenvolvimento. Domínio e hospedagem à parte.', 'Sem cadastro. Sem compromisso.']) assert(text.includes(s), s);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia grátis');
  assert((await heroCta(page).getAttribute('href')).endsWith('/configurador/criar/'), 'botão principal abre a criação');
  assert.equal(await copy.getByRole('link', { name: 'Ver exemplos de sites' }).getAttribute('href'), '#exemplos');
  assert((await page.locator('header nav a[class*=navCta]').getAttribute('href')).endsWith('/criar/'));
  assert.equal(await page.locator('[class*=floatCta]').count(), 0, 'sem cartão flutuante');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((x) => x.id));
  assert.deepEqual(ids, ['exemplos', 'como-funciona', 'investimento', 'quem-atende', 'perguntas'], 'projetos reais ficam ocultos sem material');
  const steps = await page.locator('#como-funciona ol h3').allInnerTexts();
  assert.deepEqual(steps, ['Conte sobre sua empresa.', 'Personalize e veja seu investimento.', 'Solicite o desenvolvimento.']);
  const pk = await page.locator('#investimento').innerText();
  for (const s of ['Essencial', 'R$ 500', 'Profissional', 'R$ 750', 'Completo', 'R$ 1.000', 'Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.', 'Preciso de um projeto personalizado']) assert(pk.includes(s), s);
  const body = await page.locator('body').innerText();
  for (const bad of [/\+ ?R\$/, /a partir de/i, /garant/i, /mais barato/i, /restam|últimas vagas|apenas hoje/i, /depoimento aqui/i]) assert(!bad.test(body), bad);
  await heroCta(page).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  const ev = await allEvents(page);
  assert.equal(ev.find((e) => e.event === 'start_click').context, 'hero');
  assert(ev.some((e) => e.event === 'configurator_start'));
});

await scenario('Menos movimento: botão e vitrine parados', async (page) => {
  await page.goto(URL);
  const names = await page.evaluate(() => [
    getComputedStyle(document.querySelector('[class*=heroCopy] a[class*=shine]'), '::after').animationName,
    ...[...document.querySelectorAll('[data-showcase] *')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
  ]);
  assert.deepEqual(names, ['none'], 'nada anima');
  const w = page.locator('[data-showcase] [class*=window]').first();
  assert.equal(await w.evaluate((e) => getComputedStyle(e).opacity), '1', 'composição já montada');
}, { reducedMotion: 'reduce' });

await scenario('Brilho só no botão principal (sem brilhos permanentes espalhados)', async (page) => {
  await page.goto(URL);
  await page.waitForTimeout(2500);
  const infinite = await page.evaluate(() => [...document.querySelectorAll('body *')].flatMap((e) => [getComputedStyle(e), getComputedStyle(e, '::after')])
    .filter((cs) => cs.animationName !== 'none' && cs.animationIterationCount === 'infinite').map((cs) => cs.animationName));
  assert(infinite.length <= 2, `animações contínuas: ${infinite}`);
});

await scenario('Vitrine do topo: exemplo fictício identificado, nada clicável', async (page) => {
  await page.goto(URL);
  const sc = page.locator('[data-showcase]');
  assert.equal(await sc.getAttribute('role'), 'img');
  const txt = await sc.textContent();
  for (const s of ['Exemplo ilustrativo', 'Atelier Norte', 'Sua prévia em até 5 minutos']) assert(txt.includes(s), s);
  assert.equal(await sc.locator('a, button, input, form').count(), 0);
  const imgs = await sc.locator('img').evaluateAll((els) => els.map((e) => [e.getAttribute('width'), e.getAttribute('height'), e.complete && e.naturalWidth > 0]));
  for (const [w, h, ok] of imgs) assert(w && h && ok, 'imagem com dimensões reservadas e carregada');
}, { viewport: { width: 1280, height: 800 } });

await scenario('Exemplos: composições diferentes, pacote indicado, abrir, alternar, fechar e usar o modelo', async (page) => {
  await page.goto(URL);
  const cards = page.locator('#exemplos button[class*=exampleCard]');
  assert.equal(await cards.count(), 5);
  const names = await page.locator('#exemplos [class*=exampleName]').allInnerTexts();
  assert.deepEqual(names, ['Serviços locais', 'Beleza e estética', 'Consultoria e serviços profissionais', 'Alimentação', 'Arquitetura ou portfólio criativo']);
  assert(await page.getByRole('heading', { name: 'Outro segmento' }).isVisible());
  const classes = await page.locator('#exemplos [aria-roledescription=prévia]').evaluateAll((els) => els.map((e) => e.className.split(' ')[1]));
  assert.equal(new Set(classes).size, 5, 'cada exemplo com um estilo');
  await page.getByRole('button', { name: 'Abrir exemplo de Beleza e estética' }).click();
  const dialog = page.locator('dialog[open]');
  assert((await dialog.innerText()).includes('Exemplo fictício'));
  await dialog.getByRole('button', { name: 'Celular' }).click();
  assert.equal(await dialog.getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed'), 'true');
  await dialog.getByRole('button', { name: /Próximo/ }).click();
  assert.equal(await dialog.locator('#exemplo-titulo').innerText(), 'Consultoria e serviços profissionais');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Abrir exemplo de Consultoria e serviços profissionais');
  await page.getByRole('button', { name: 'Abrir exemplo de Beleza e estética' }).click();
  assert((await dialog.innerText()).includes('Começa no Pacote Profissional · R$ 750'));
  await dialog.getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await page.getByRole('radio', { name: 'Beleza e estética', exact: true }).getAttribute('aria-checked'), 'true');
  assert.equal(await price(page), 'R$ 750');
  assert.match(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class'), /elegante/);
});

await scenario('Exemplo com projeto em andamento: preserva o que foi digitado e pede confirmação', async (page) => {
  await page.goto(B);
  await ready(page);
  await business(page, { name: 'Minha Loja', segment: 'Consultoria', service: 'Contabilidade' });
  await next(page);
  await page.getByRole('radio', { name: /^Ver meus serviços/ }).click();
  await page.goto(URL);
  await page.getByRole('button', { name: 'Abrir exemplo de Alimentação' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Usar este modelo' }).click();
  const box = page.locator('dialog[open] [role=alertdialog]');
  await box.waitFor();
  assert((await box.innerText()).includes('segmento'));
  await box.getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Minha Loja');
  assert.equal(await page.locator('#servico-principal').inputValue(), 'Contabilidade');
});

await scenario('Perguntas: 5 primeiras e todas as 14 pedidas', async (page) => {
  await page.goto(URL);
  const list = page.locator('#lista-perguntas summary');
  assert.equal(await list.count(), 5);
  await page.getByRole('button', { name: /Ver todas as perguntas/ }).click();
  assert.equal(await list.count(), 14);
  const all = await page.locator('#lista-perguntas').textContent();
  for (const s of ['Existe mensalidade?', 'Quem fica com o domínio e os acessos?', '3 a 12 dias úteis', 'Domínio (endereço do site)']) assert(all.includes(s), s);
});

/* ── Configurador ───────────────────────────────────────────────────────── */

await scenario('Serviços locais (ar-condicionado): obrigatórios, prévia personalizada, preço e mensagem coerentes', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await title(page), 'Seu negócio');
  assert.equal(await price(page), 'R$ 500');
  await next(page);
  assert.equal(await stepText(page), 'Etapa 1 de 4', 'não avança sem nome e segmento');
  assert.equal(await page.locator('#nome-empresa').getAttribute('aria-invalid'), 'true');
  assert((await page.locator('#erro-segmento').innerText()).includes('segmento'));
  await page.locator('#nome-empresa').fill('Clima Sul');
  assert((await preview(page).innerText()).includes('Clima Sul'), 'nome aparece na hora');
  await page.getByRole('radio', { name: 'Serviços locais', exact: true }).click();
  await page.getByRole('button', { name: 'Instalação de ar-condicionado' }).click();
  const pv = (await preview(page).innerText()).toLowerCase();
  assert(pv.includes('instalação de ar-condicionado com orçamento pelo whatsapp.'));
  assert(pv.includes('manutenção preventiva'));
  assert((await preview(page).locator('img').first().getAttribute('src')).endsWith('/demo/clima.svg'));
  await next(page);
  assert.equal(await title(page), 'Seu objetivo');
  assert(await page.getByText('O que você quer que as pessoas façam no seu site?').isVisible());
  assert((await page.locator('[class*=suggestion]').innerText()).includes('Ver o Profissional — R$ 750 no total'));
  await page.getByRole('radio', { name: /^Pedir um orçamento/ }).click();
  await next(page);
  assert.equal(await title(page), 'Sua identidade');
  assert.equal(await page.locator('[aria-labelledby=rotulo-estilo] [role=radio]').count(), 3, 'três sugestões');
  assert(!(await page.locator('main').innerText()).match(/\+ ?R\$/), 'estilo e cor sem cobrança avulsa');
  await next(page);
  assert.equal(await title(page), 'Seu site');
  assert.equal(await price(page), 'R$ 500');
  assert((await invest(page)).includes('R$ 500'));
  const msg = await waMessage(page);
  for (const s of ['Empresa: Clima Sul', 'Segmento: Serviços locais', 'Objetivo: Pedir um orçamento', 'Serviço ou produto principal: Instalação de ar-condicionado', 'Estilo e cores: Moderno', 'Pacote: Essencial', 'Valor do desenvolvimento: R$ 500', 'Seções (5 de até 5)']) assert(msg.includes(s), s);
  const href = await waHref(page);
  assert.equal(href.origin + href.pathname, 'https://wa.me/5551981947979');
  assert.equal(await requestLink(page).getAttribute('target'), '_blank');
  await page.locator('#observacoes').fill('Já tenho domínio');
  assert((await waMessage(page)).includes('Observações: Já tenho domínio'));
  await requestLink(page).click();
  const ev = await allEvents(page);
  const rc = ev.find((e) => e.event === 'request_click');
  assert.equal(rc.mode, 'whatsapp'); assert.equal(rc.package, 'essencial');
  assert(ev.some((e) => e.event === 'whatsapp_open' && e.context === 'pedido'));
  assert(!ev.some((e) => e.event === 'generate_lead'), 'abrir o WhatsApp não é lead recebido');
  assert.deepEqual(ev.filter((e) => e.event === 'step_complete').map((e) => e.step), [1, 2, 3]);
  assert(!JSON.stringify(ev).match(/Clima|domínio/), 'eventos sem texto digitado');
  assert.equal(await page.getByText(/Pedido recebido/).count(), 0, 'nenhuma confirmação falsa');
  await page.reload();
  await ready(page);
  assert.equal(await title(page), 'Seu site', 'continua de onde parou');
  assert(await page.getByText('Salvo neste dispositivo').isVisible());
  assert.equal(await page.locator('#observacoes').inputValue(), 'Já tenho domínio');
});

await scenario('Beleza: agendamento, galeria pede o Profissional antes de mudar e dá para continuar no atual', async (page) => {
  await page.goto(B);
  await ready(page);
  await business(page, { name: 'Ateliê Rosa', segment: 'Beleza e estética', service: '' });
  await next(page);
  const agenda = page.getByRole('radio', { name: /^Solicitar um agendamento/ });
  assert((await agenda.innerText()).includes('Comum no seu segmento'));
  await agenda.click();
  assert((await page.locator('[aria-live=polite][class*=outcome]').innerText()).includes('Não é uma agenda com horários em tempo real'));
  assert((await preview(page).innerText()).includes('Pedir um horário'));
  await next(page); await next(page);
  await personalize(page);
  await page.getByRole('checkbox', { name: /Galeria de fotos/ }).click();
  const box = page.locator('#personalizar [role=alertdialog]');
  await box.waitFor();
  assert.equal(await box.locator('#confirmar-titulo').innerText(), 'Disponível no Profissional — R$ 750 no total.');
  assert.equal(await price(page), 'R$ 500', 'nada muda antes da escolha');
  await box.getByRole('button', { name: 'Continuar no Essencial' }).click();
  assert.equal(await page.getByRole('checkbox', { name: /Galeria de fotos/ }).isChecked(), false);
  await page.getByRole('checkbox', { name: /Galeria de fotos/ }).click();
  await box.getByRole('button', { name: 'Mudar para o Profissional' }).click();
  assert.equal(await price(page), 'R$ 750');
  assert(await page.getByRole('checkbox', { name: /Galeria de fotos/ }).isChecked());
  assert((await preview(page).innerText()).includes('até 8 imagens'));
  assert((await waMessage(page)).includes('Valor do desenvolvimento: R$ 750'));
  const ch = (await allEvents(page)).find((e) => e.event === 'package_changed');
  assert.deepEqual([ch.from, ch.to], ['essencial', 'profissional']);
});

await scenario('Produtos: recomendação do Completo só com escolha; trocar para menor mostra o que sai', async (page) => {
  await page.goto(B);
  await ready(page);
  await business(page, { name: 'Doces da Lu', segment: 'Alimentação', service: 'Bolos e doces' });
  await next(page);
  await page.getByRole('radio', { name: /^Conhecer meus produtos/ }).click();
  assert.equal(await price(page), 'R$ 500');
  await page.getByRole('button', { name: 'Ver o Completo — R$ 1.000 no total' }).click();
  const box = page.locator('[role=alertdialog]').filter({ hasText: 'Disponível no Completo — R$ 1.000 no total.' });
  await box.getByRole('button', { name: 'Mudar para o Completo' }).click();
  assert.equal(await price(page), 'R$ 1.000');
  await next(page); await next(page);
  await personalize(page);
  await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).check();
  assert((await preview(page).innerText()).includes('Pedir pelo WhatsApp'));
  await page.getByRole('button', { name: 'Ver o que está incluído' }).first().click();
  const dlg = page.locator('dialog[open]');
  assert((await dlg.innerText()).includes('Seu pacote'));
  await dlg.getByRole('button', { name: 'Escolher o Essencial — R$ 500 no total' }).click();
  const confirm = dlg.locator('[role=alertdialog]');
  assert((await confirm.innerText()).includes('Vitrine de produtos'));
  assert.equal(await price(page), 'R$ 1.000', 'ainda não trocou');
  await confirm.getByRole('button', { name: 'Trocar para o Essencial' }).click();
  assert.equal(await price(page), 'R$ 500');
  assert.equal(await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).isChecked(), false);
  assert(!(await preview(page).innerText()).includes('Pedir pelo WhatsApp'));
});

await scenario('Outro segmento, sem logo e sem textos: conclui só com o essencial', async (page) => {
  const t0 = Date.now();
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill('Fala Idiomas');
  await page.getByRole('radio', { name: 'Outro', exact: true }).click();
  await next(page);
  assert.equal(await stepText(page), 'Etapa 1 de 4', 'Outro pede o nome do segmento');
  assert.equal(await page.locator('#segmento-outro').getAttribute('aria-invalid'), 'true');
  await page.locator('#segmento-outro').fill('escola de idiomas');
  await page.getByRole('button', { name: 'Definir depois' }).click();
  assert(await page.locator('#servico-principal').isDisabled());
  await next(page); await next(page); await next(page);
  assert.equal(await title(page), 'Seu site');
  assert((await preview(page).innerText()).toLowerCase().includes('escola de idiomas'));
  const msg = await waMessage(page);
  assert(msg.includes('Segmento: Outro: escola de idiomas')); assert(msg.includes('Serviço ou produto principal: A definir')); assert(msg.includes('Logo: usar o nome da empresa'));
  timings.push(['percurso mínimo automatizado (Outro, sem logo nem textos)', Date.now() - t0]);
});

await scenario('Mudar estilo, objetivo e cor não apaga textos nem serviços', async (page) => {
  await toSite(page);
  await personalize(page);
  await page.getByLabel('Título', { exact: true }).fill('Ar gelado em casa');
  await page.getByPlaceholder('Manutenção preventiva').fill('PMOC para empresas');
  await page.getByRole('button', { name: 'Trocar estilo e cores' }).click();
  assert.equal(await title(page), 'Sua identidade');
  await page.getByText('Ver outros estilos').click();
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  await page.getByRole('radio', { name: 'Argila' }).click();
  await visible(page.getByRole('button', { name: 'Voltar', exact: true })).click();
  await page.getByRole('radio', { name: /^Ver meus serviços/ }).click();
  const pv = await preview(page).innerText();
  assert(pv.includes('Ar gelado em casa')); assert(pv.includes('PMOC para empresas')); assert(pv.includes('Ver serviços'));
  assert.match(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class'), /escuro/);
});

await scenario('Projeto personalizado: orçamento separado e a prévia continua', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Ver o que está incluído' }).first().click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Preciso de um projeto personalizado' }).click();
  await page.getByRole('checkbox', { name: 'Loja virtual com carrinho e pagamento online' }).check();
  assert.equal(await price(page), 'Orçamento personalizado');
  assert.equal((await requestLink(page).innerText()).trim(), 'Pedir orçamento personalizado');
  const msg = await waMessage(page);
  assert(msg.includes('Pacote: projeto personalizado (orçamento separado)')); assert(!msg.includes('Valor do desenvolvimento'));
  assert((await preview(page).innerText()).includes('Clima Sul'), 'prévia preservada');
  await page.getByRole('checkbox', { name: 'Loja virtual com carrinho e pagamento online' }).uncheck();
  assert.equal(await price(page), 'R$ 500');
});

await scenario('Oito seções é o teto: a nona pede projeto personalizado, nunca passa de R$ 1.000', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Ver o que está incluído' }).first().click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Escolher o Completo — R$ 1.000 no total' }).click();
  await personalize(page);
  for (const n of ['Informações de atendimento', 'Como funciona', 'Perguntas frequentes']) await page.getByRole('checkbox', { name: new RegExp(`^${n}`) }).check();
  assert.equal(await page.locator('#personalizar [role=alertdialog]').count(), 0);
  await page.getByRole('checkbox', { name: /^Galeria de fotos/ }).click();
  const box = page.locator('#personalizar [role=alertdialog]');
  await box.waitFor();
  assert((await box.innerText()).includes('até 8 seções'));
  assert.equal(await price(page), 'R$ 1.000');
  assert.equal(await page.getByRole('checkbox', { name: /^Galeria de fotos/ }).isChecked(), false);
});

await scenario('Falha ao salvar: sem "Salvo neste dispositivo", aviso claro e segue funcionando', async (page, ctx) => {
  await ctx.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (this === window.localStorage) throw new DOMException('cheio', 'QuotaExceededError');
      return original.call(this, k, v);
    };
  });
  await page.goto(B);
  await ready(page);
  await business(page);
  await page.waitForTimeout(200);
  assert.equal(await page.getByText('Salvo neste dispositivo').count(), 0);
  assert((await page.locator('[class*=notice]').innerText()).includes('não permitiu salvar'));
  await next(page);
  assert.equal(await title(page), 'Seu objetivo');
});

await scenario('Compartilhar opções de layout: rótulo honesto, sem dados pessoais; PDF com o mesmo valor', async (page, ctx) => {
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) } });
    window.print = () => { window.__printed = true; };
  });
  await toSite(page);
  await page.getByRole('button', { name: 'Compartilhar opções de layout' }).click();
  assert((await page.getByRole('status').filter({ hasText: 'copiar' }).innerText()).includes('Não foi possível copiar'));
  const link = await page.getByLabel('Link das opções de layout').inputValue();
  assert(link.includes('/criar/#projeto=')); assert(!decodeURIComponent(link).includes('Clima'));
  await page.getByRole('button', { name: 'Salvar resumo em PDF' }).click();
  assert(await page.evaluate(() => window.__printed));
  const printed = await page.locator('[class*=printOnly]').textContent();
  for (const s of ['Clima Sul', 'Essencial', 'R$ 500', 'Pagamento único pelo desenvolvimento']) assert(printed.includes(s), s);
  const shared = await ctx.newPage();
  await shared.goto(link.replace('https://theusmkt.github.io/Matheus-Performance/configurador/', URL));
  await ready(shared);
  assert.equal(await shared.locator('#etapa-titulo').innerText(), 'Seu site');
  assert((await shared.locator('[class*=notice]').innerText()).includes('Nome, textos e logo não viajam'));
});

await scenario('Começar novamente pede confirmação; "Começar uma nova prévia" na apresentação também', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Começar novamente' }).click();
  await page.getByRole('button', { name: 'Manter minha prévia' }).click();
  assert.equal(await title(page), 'Seu site');
  await page.goto(URL);
  assert.equal((await heroCta(page).innerText()).trim(), 'Continuar minha prévia');
  await page.getByRole('link', { name: 'Começar uma nova prévia' }).click();
  await ready(page);
  await page.getByRole('button', { name: 'Sim, apagar' }).click();
  assert.equal(await title(page), 'Seu negócio');
  assert.equal(await page.locator('#nome-empresa').inputValue(), '');
  await page.goto(URL);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia grátis');
});

await scenario('Prévia da versão anterior (v3) é recuperada com aviso e pacote coerente', async (page) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('mb.configurador.v3', JSON.stringify({ version: 3, name: 'Oficina Antiga', segment: 'local', objective: 'agenda', sections: ['apresentacao', 'servicos', 'faq', 'contato'], features: ['whatsapp', 'redes', 'faq'], direction: 'elegante', palette: 'verde', step: 3, budget: '900', budgetOn: true })));
  await page.goto(B);
  await ready(page);
  assert((await page.locator('[class*=notice]').innerText()).includes('versão anterior'));
  assert.equal(await title(page), 'Seu site');
  assert.equal(await price(page), 'R$ 750');
  assert((await preview(page).innerText()).includes('Oficina Antiga'));
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')), 'versão antiga preservada');
});

await scenario('Teclado: setas no grupo de opções e foco no título ao avançar', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill('Teclado');
  await page.getByRole('radio', { name: 'Serviços locais', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio', { name: 'Beleza e estética', exact: true }).getAttribute('aria-checked'), 'true');
  await next(page);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'etapa-titulo');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  assert.notEqual(outline, 'none', 'foco visível');
});

await scenario('Computador 1280px: editor e prévia lado a lado, tela cheia e alternância de aparelho', async (page) => {
  await toSite(page);
  const ed = await page.locator('section[aria-labelledby=etapa-titulo]').boundingBox();
  const pv = await preview(page).boundingBox();
  assert(pv.x > ed.x + ed.width - 1, 'prévia ao lado');
  await preview(page).getByRole('button', { name: 'Ver em tela cheia' }).click();
  const full = page.locator('dialog[open]');
  assert.equal(await full.locator('h2').innerText(), 'Seu site');
  await full.getByRole('button', { name: /Celular/ }).click();
  const w = await full.locator('[aria-roledescription=prévia]').boundingBox();
  assert(w.width <= 432 && w.width >= 300, `celular em largura real (${w.width})`);
  await full.getByRole('button', { name: 'Fechar tela cheia' }).click();
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert((await allEvents(page)).some((e) => e.event === 'preview_view' && e.source === 'tela_cheia'));
  assert.equal(await scrollWidth(page), 1280);
});

for (const width of [360, 390, 430]) {
  await scenario(`Celular ${width}px: sem rolagem lateral, Editar/Ver meu site, prévia primeiro e legível`, async (page) => {
    await page.goto(URL);
    assert.equal(await scrollWidth(page), width);
    await heroCta(page).click();
    await ready(page);
    await business(page);
    await page.getByRole('button', { name: 'Ver meu site' }).first().click();
    assert(await preview(page).isVisible());
    assert(!(await page.locator('#nome-empresa').isVisible()));
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    for (let step = 2; step <= 4; step++) {
      await next(page);
      assert.equal(await scrollWidth(page), width, `etapa ${step}`);
    }
    const pv = await preview(page).boundingBox();
    const ed = await page.locator('#etapa-titulo').boundingBox();
    assert(pv.y < ed.y, 'prévia primeiro na última etapa');
    const site = await preview(page).locator('[aria-roledescription=prévia]').boundingBox();
    assert(site.width >= width - 90, `prévia em largura legível (${site.width}px)`);
    const bar = page.locator('[data-bar=configurador]');
    assert.equal(await bar.getByRole('button', { name: 'Personalizar meu site' }).count(), 1);
    const btn = await bar.locator('a').boundingBox();
    assert.equal((await bar.locator('a').innerText()).trim(), 'Solicitar desenvolvimento');
    assert(btn.x + btn.width <= width, 'botão inteiro na barra');
    const fits = await bar.locator('a').evaluate((e) => e.scrollWidth <= e.clientWidth + 1);
    assert(fits, 'texto do botão sem corte');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    const barBox = await bar.boundingBox();
    const last = await page.getByRole('button', { name: 'Começar novamente' }).boundingBox();
    assert(last.y + last.height <= barBox.y + 1, 'a barra não cobre o fim da página');
    const small = await page.evaluate(() => [...document.querySelectorAll('#conteudo button, #conteudo summary, [data-bar] a, [data-bar] button')]
      .filter((el) => el.offsetParent !== null && !el.closest('[aria-roledescription=prévia]'))
      .map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && (r.height < 44 || r.width < 44)).length);
    assert.equal(small, 0, 'alvos de toque com pelo menos 44px');
    const fonts = await page.evaluate(() => [...document.querySelectorAll('#conteudo input, #conteudo textarea')].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    for (const f of fonts) assert(f >= 16, 'campos sem zoom automático');
  }, { viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
}


/* ── Prévia por descrição (IA simulada) ─────────────────────────────────── */

await scenario('Sem servidor de IA configurado, a criação fica igual à publicada', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await page.locator('#descricao-ia').count(), 0);
  await page.goto(URL + 'privacidade/');
  assert(!(await page.locator('main').innerText()).includes('Gemini'));
});

await scenario('IA: descrição vira prévia nos layouts existentes; falha não perde o texto; nada de dado pessoal', async (page) => {
  const bodies = [];
  let calls = 0;
  const answer = {
    name: 'Clima Sul', segment: 'local', segmentOther: '', service: 'Instalação de ar-condicionado', objective: 'orcamento',
    headline: 'Ar-condicionado instalado do jeito certo', description: 'Peça seu orçamento pelo WhatsApp.', services: ['Instalação', 'Manutenção', 'Higienização'],
    sections: ['servicos', 'diferenciais', 'galeria', 'sobre'], direction: 'tecnologico', palette: 'azul', brandColor: null, needs: ['loja'],
  };
  await page.route('https://ia.test/preview', async (route) => {
    calls++; bodies.push(route.request().postData());
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (calls === 1) return route.fulfill({ status: 502, contentType: 'application/json', headers: cors, body: '{"ok":false,"error":"ia"}' });
    await new Promise((r) => setTimeout(r, 300));
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: answer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  const box = page.locator('#descricao-ia');
  await box.fill('Meu WhatsApp é 51 99999-0000 e faço instalação de ar-condicionado.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  assert((await page.locator('#erro-descricao').innerText()).includes('Tire telefone'));
  assert.equal(calls, 0, 'com telefone, nada é enviado');
  const desc = 'Faço instalação e manutenção de ar-condicionado. Quero receber pedidos de orçamento, com visual moderno.';
  await box.fill(desc);
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.locator('#erro-descricao').waitFor();
  assert((await page.locator('#erro-descricao').innerText()).includes('não respondeu'));
  assert.equal(await box.inputValue(), desc, 'texto preservado na falha');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.getByRole('button', { name: 'Gerando sua prévia…' }).waitFor();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent === 'Seu site');
  assert.equal(calls, 2);
  const sent = JSON.parse(bodies[1]);
  assert.deepEqual(Object.keys(sent).sort(), ['description', 'pkg', 'schema']);
  assert.equal(sent.pkg, 'essencial');
  const pv = await preview(page).innerText();
  assert(pv.includes('Clima Sul')); assert(pv.includes('Ar-condicionado instalado do jeito certo')); assert(pv.includes('Higienização'));
  assert.match(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class'), /tecnologico/);
  assert.equal(await price(page), 'R$ 500', 'a IA não troca o pacote');
  const notice = await page.locator('[class*=notice]').innerText();
  for (const s of ['a partir da sua descrição', 'Galeria de fotos', 'loja virtual com carrinho']) assert(notice.includes(s), s);
  assert((await waMessage(page)).includes('Pacote: Essencial'));
  const ev = await allEvents(page);
  assert.deepEqual(ev.filter((e) => e.event === 'ai_generate').map((e) => e.result), ['erro', 'ok']);
  assert(!JSON.stringify(ev).match(/ar-condicionado|Clima/), 'eventos sem texto');
  await page.goto(URL_AI + 'privacidade/');
  assert((await page.locator('main').innerText()).includes('Google Gemini'));
});

/* ── Com receptor de pedidos ────────────────────────────────────────────── */

await scenario('Receptor: contato só ao avançar, falha sem perder dados, confirmação só com resposta real', async (page) => {
  let calls = 0; const keys = [];
  await page.route('https://receptor.test/leads', async (route) => {
    calls++; keys.push(route.request().headers()['idempotency-key']);
    if (calls === 1) return route.fulfill({ status: 500, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{}' });
    await new Promise((r) => setTimeout(r, 300));
    return route.fulfill({ status: 201, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, leadId: 'L-77' }) });
  });
  await page.goto(URL_R + 'criar/');
  await ready(page);
  await business(page, { name: 'Clínica Sol', segment: 'Beleza e estética', service: '' });
  for (let i = 0; i < 3; i++) await next(page);
  assert.equal(await page.locator('#formulario-pedido').count(), 0, 'contato só quando decidir avançar');
  await page.locator('[class*=desktopOnly] button', { hasText: 'Solicitar desenvolvimento' }).click();
  const form = page.locator('#formulario-pedido');
  await form.getByRole('button', { name: 'Enviar pedido' }).click();
  assert.equal(calls, 0, 'inválido não envia');
  assert.equal(await form.getByLabel('Seu nome').getAttribute('aria-invalid'), 'true');
  await form.getByLabel('Seu nome').fill('Ana Teste');
  await form.getByLabel('Seu WhatsApp com DDD').fill('(51) 99999-0000');
  await form.getByRole('button', { name: 'Enviar pedido' }).click();
  await form.locator('[role=alert]').waitFor();
  assert((await form.locator('[role=alert]').innerText()).includes('não foi confirmado'));
  assert.equal(await page.getByText('Pedido recebido').count(), 0, 'sem confirmação falsa');
  assert.equal(await form.getByLabel('Seu nome').inputValue(), 'Ana Teste');
  assert(await form.getByRole('link', { name: 'Abrir o WhatsApp' }).isVisible(), 'alternativa pelo WhatsApp');
  await form.getByRole('button', { name: 'Tentar novamente' }).dblclick();
  await page.locator('text=Pedido recebido').waitFor();
  assert.equal(calls, 2, 'clique duplo = um envio');
  assert.equal(keys[0], keys[1], 'mesma chave na nova tentativa');
  const ev = await allEvents(page);
  assert.equal(ev.filter((e) => e.event === 'generate_lead').length, 1);
  assert.equal(ev.find((e) => e.event === 'request_click').mode, 'formulario');
  assert(!JSON.stringify(ev).match(/Ana|99999|Clínica/), 'eventos sem dados pessoais');
});

console.log(`${passed} cenários passaram.`, errors.length ? errors : 'sem erros de página');
for (const [name, ms] of timings) console.log(`Tempo (${name}): ${(ms / 1000).toFixed(1)} s`);
await browser.close();
