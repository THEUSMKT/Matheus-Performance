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
// Microfone simulado (tom de teste) para a descrição por áudio.
const browser = await chromium.launch({
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
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
const title = (page) => page.locator('#etapa-titulo').innerText();
const Q = {
  negocio: 'Conte sobre seu negócio', objetivo: 'O que as pessoas devem fazer no seu site?', pronta: 'Sua prévia está pronta',
  pacote: 'Escolha o pacote do seu site', estilo: 'Qual estilo combina com sua empresa?', cores: 'Quais cores você prefere?', titulos: 'Como você quer os títulos do seu site?',
  conteudo: 'O que você quer mostrar aos seus clientes?', secoes: 'Quais seções seu site vai ter?', revisao: 'Revise e solicite o desenvolvimento',
};
const preview = (page) => page.getByRole('complementary', { name: 'Prévia do seu site' });
const price = (page) => page.getByTestId('preco').innerText();
const invest = (page) => page.getByTestId('investimento').innerText();
const requestLink = (page) => page.locator('[class*=desktopOnly] a', { hasText: /Solicitar desenvolvimento|Pedir orçamento personalizado/ });
const waHref = async (page) => new globalThis.URL(await requestLink(page).getAttribute('href'));
const waMessage = async (page) => (await waHref(page)).searchParams.get('text');
/** Escolha de pacote (seletor compacto: rádios com nome e preço). */
const pkgRadio = (scope, name) => scope.getByRole('radiogroup', { name: 'Pacote' }).getByRole('radio', { name: new RegExp(`^${name}`) });
/** Ferramentas da revisão ficam em "Salvar ou compartilhar projeto". */
async function openSave(page) {
  const d = page.locator('#salvar-compartilhar');
  if (!(await d.evaluate((e) => e.open))) await d.locator('summary').click();
}
const scrollWidth = (page) => page.evaluate(() => document.documentElement.scrollWidth);
const visible = (loc) => loc.filter({ visible: true }).first();
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('mb.configurador.v4') || 'null'));
/** Página de criação pronta (hidratada, com o projeto carregado). */
async function ready(page) {
  await page.locator('#etapa-titulo').waitFor();
  await page.waitForFunction(() => !document.querySelector('[data-bar=configurador] button:disabled, [class*=desktopActions] button:disabled'));
}
/** Ação de avançar visível (barra do celular ou fim da coluna no computador). */
async function next(page) {
  // No celular a barra some com o teclado aberto: fecha o teclado (tira o foco do campo) antes.
  const typing = await page.evaluate(() => document.activeElement?.matches('input, textarea, select') ?? false);
  if (typing) {
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForTimeout(350);
  }
  await visible(page.locator('[data-bar=configurador] button, [class*=desktopActions] button').filter({ hasText: /^(Continuar|Manter sugestão|Ver minha prévia|Revisar e solicitar)/ })).click();
}
async function business(page, { name = 'Clima Sul', segment = 'Serviços locais', service = 'Instalação de ar-condicionado' } = {}) {
  await page.locator('#nome-empresa').fill(name);
  await page.getByRole('radio', { name: segment, exact: true }).click();
  if (service) await page.locator('#servico-principal').fill(service);
}
/** Passo a passo até "Sua prévia está pronta". */
async function toReady(page, opts) {
  await page.goto(B);
  await ready(page);
  await business(page, opts);
  await next(page);
  await next(page);
  assert.equal(await title(page), Q.pronta);
}
async function toSite(page, opts) {
  await toReady(page, opts);
  await visible(page.getByRole('button', { name: 'Gostei assim — revisar e solicitar' })).click();
  assert.equal(await title(page), Q.revisao);
}
/** Vai até uma escolha da personalização (a partir da prévia pronta ou da revisão). */
async function toChoice(page, question) {
  if ((await title(page)) === Q.revisao) await page.getByRole('button', { name: 'Voltar a personalizar' }).click();
  if ((await title(page)) === Q.pronta) await visible(page.getByRole('button', { name: 'Personalizar meu site' })).click();
  for (let i = 0; i < 7 && (await title(page)) !== question; i++) await next(page);
  assert.equal(await title(page), question);
}

/* ── Página de apresentação ─────────────────────────────────────────────── */

await scenario('Apresentação: dois diferenciais, preço, botão que abre a criação e seções na ordem', async (page) => {
  await page.goto(URL);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Um site profissional para apresentar sua empresa e facilitar novos contatos.');
  const copy = page.locator('[class*=heroCopy]');
  const text = await copy.innerText();
  for (const s of ['Veja uma prévia grátis. Depois, a Beck Performance desenvolve seu site com a identidade e as informações do seu negócio.', 'Desenvolvimento de R$ 500 a R$ 1.000.', 'Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.', 'Sem cadastro. Sem compromisso.']) assert(text.includes(s), s);
  assert(!/minutos/.test(await page.locator('main').innerText()), 'sem promessa de tempo');
  assert(await page.getByRole('heading', { name: 'O que a Beck Performance faz no seu site' }).isVisible(), 'faixa de valor');
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia grátis');
  assert((await heroCta(page).getAttribute('href')).endsWith('/configurador/criar/'), 'botão principal abre a criação');
  assert.equal(await copy.getByRole('link', { name: 'Ver exemplos de sites' }).getAttribute('href'), '#exemplos');
  assert((await page.locator('header nav a[class*=navCta]').getAttribute('href')).endsWith('/criar/'));
  assert.equal(await page.locator('[data-float][data-shown]').count(), 0, 'com o botão principal à vista, o flutuante fica escondido');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((x) => x.id));
  assert.deepEqual(ids, ['exemplos', 'como-funciona', 'investimento', 'quem-atende', 'perguntas'], 'projetos reais ficam ocultos sem material');
  const steps = await page.locator('#como-funciona ol h3').allInnerTexts();
  assert.deepEqual(steps, ['Crie sua prévia', 'Ajuste e escolha o pacote', 'Converse e confirme']);
  assert((await page.locator('#como-funciona').innerText()).includes('O resumo abre no WhatsApp. Escopo, prazo e valor são confirmados por escrito'));
  const pk = await page.locator('#investimento').innerText();
  for (const s of ['Essencial', 'R$ 500', 'Profissional', 'R$ 750', 'Completo', 'R$ 1.000', 'Valor total do site, em pagamento único. Domínio e hospedagem à parte.', 'Em todos os pacotes:', 'Para apresentar trabalhos e organizar pedidos', 'Falar sobre um projeto personalizado']) assert(pk.includes(s), s);
  for (const n of ['Essencial', 'Profissional', 'Completo']) assert((await page.getByRole('link', { name: `Criar prévia com o ${n}` }).getAttribute('href')).endsWith(`/criar/?pacote=${n.toLowerCase()}`), n);
  assert(!/mais vendido|mais escolhido|preferido/i.test(pk), 'sem selo sem dados');
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
  for (const s of ['Exemplo ilustrativo', 'Estúdio Forma', 'Prévia grátis em poucos passos']) assert(txt.includes(s), s);
  assert.equal(await sc.locator('a, button, input, form').count(), 0);
  // Imagens abaixo do recorte da vitrine ficam com carregamento adiado (nunca aparecem).
  const imgs = await sc.locator('img').evaluateAll((els) => els.map((e) => [e.getAttribute('width'), e.getAttribute('height'), (e.complete && e.naturalWidth > 0) || e.loading === 'lazy']));
  for (const [w, h, ok] of imgs) assert(w && h && ok, 'imagem com dimensões reservadas e carregada (ou adiada)');
  assert.equal(await sc.locator('img:not([loading=lazy])').evaluateAll((els) => els.filter((e) => !(e.complete && e.naturalWidth > 0)).length), 0, 'imagem do topo carregada');
}, { viewport: { width: 1280, height: 800 } });

await scenario('Exemplos: composições diferentes, cartão fiel ao aberto, arrastar não abre, usar o modelo (A05, A07, A08)', async (page) => {
  await page.goto(URL);
  const cards = page.locator('#exemplos button[class*=exampleCard]');
  assert.equal(await cards.count(), 6);
  const names = await page.locator('#exemplos [class*=exampleName]').allInnerTexts();
  assert.deepEqual(names, ['Serviços locais', 'Beleza e estética', 'Consultoria e serviços profissionais', 'Alimentação', 'Arquitetura ou portfólio criativo', 'Imóveis e corretores']);
  assert(await page.getByRole('heading', { name: 'Outro segmento' }).isVisible());
  const classes = await page.locator('#exemplos [aria-roledescription=prévia]').evaluateAll((els) => els.map((e) => e.className));
  assert.equal(new Set(classes).size, 6, 'cada exemplo com uma composição');
  assert.equal(await page.locator('#exemplos [class*=exampleOpen]').first().innerText(), 'Ver este exemplo');
  // Cartão e exemplo aberto: mesma identidade (estilo, cor, nome, título) — para todos.
  const dialog = page.locator('dialog[open]');
  for (const [i, seg] of names.entries()) {
    const card = cards.nth(i).locator('[aria-roledescription=prévia]');
    const cardId = await card.evaluate((e) => [e.className, getComputedStyle(e).getPropertyValue('--acc'), e.getAttribute('aria-label'), e.querySelector('[class*=title]')?.textContent]);
    await cards.nth(i).evaluate((e) => e.click());
    const open = dialog.locator('[aria-roledescription=prévia]');
    const openId = await open.evaluate((e) => [e.className, getComputedStyle(e).getPropertyValue('--acc'), e.getAttribute('aria-label'), e.querySelector('[class*=title]')?.textContent]);
    assert.deepEqual(openId, cardId, `exemplo fiel: ${seg}`);
    await page.keyboard.press('Escape');
  }
  // Arrastar o cartão não abre o exemplo.
  await cards.nth(1).scrollIntoViewIfNeeded();
  const box = await cards.nth(1).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 60, box.y + 84, { steps: 5 });
  await page.mouse.up();
  assert.equal(await dialog.count(), 0, 'gesto lateral não abre');
  await page.getByRole('button', { name: 'Ver este exemplo: Beleza e estética' }).click();
  assert((await dialog.innerText()).includes('Exemplo fictício'));
  await dialog.getByRole('button', { name: 'Celular' }).click();
  assert.equal(await dialog.getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed'), 'true');
  await dialog.getByRole('button', { name: /Próximo/ }).click();
  assert.equal(await dialog.locator('#exemplo-titulo').innerText(), 'Consultoria e serviços profissionais');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Ver este exemplo: Consultoria e serviços profissionais');
  await page.getByRole('button', { name: 'Ver este exemplo: Beleza e estética' }).click();
  assert((await dialog.getByRole('button', { name: /^Usar este modelo/ }).innerText()).includes('Profissional · R$ 750'), 'pacote e preço no botão');
  const cardClass = await dialog.locator('[aria-roledescription=prévia]').getAttribute('class');
  await dialog.getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal(await title(page), Q.pronta, 'abre direto na prévia pronta');
  assert.equal(await price(page), 'R$ 750');
  const plain = (c) => c.replace(/\S*__(bare|forceMobile)\b/g, '').trim().replace(/\s+/g, ' ');
  assert.equal(plain(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class')), plain(cardClass), 'mesma composição do exemplo');
  const saved = await stored(page);
  assert.deepEqual([saved.segment, saved.direction, saved.palette, saved.pkg], ['beleza', 'elegante', 'terracota', 'profissional']);
  assert.equal(saved.name, '', 'nome fictício não vira o nome da empresa');
  assert((await preview(page).innerText()).includes('Seu negócio'));
  assert.equal(await page.getByText('Recuperar minha versão anterior').count(), 0, 'sem rascunho, nada para recuperar');
});

await scenario('Exemplo com rascunho: abrir não mexe no rascunho; usar pede confirmação e dá para recuperar (A06, A08)', async (page) => {
  await page.goto(B);
  await ready(page);
  await business(page, { name: 'Minha Loja', segment: 'Consultoria', service: 'Contabilidade' });
  await next(page);
  await page.getByRole('radio', { name: /^Ver meus serviços/ }).click();
  const before = await stored(page);
  await page.goto(URL);
  await page.getByRole('button', { name: 'Ver este exemplo: Alimentação' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Computador' }).click();
  await page.keyboard.press('Escape');
  assert.deepEqual(await stored(page), before, 'ver um exemplo não altera o rascunho');
  await page.getByRole('button', { name: 'Ver este exemplo: Alimentação' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Usar este modelo' }).click();
  const box = page.locator('dialog[open] [role=alertdialog]');
  await box.waitFor();
  assert((await box.innerText()).includes('substitui o seu rascunho'));
  assert((await box.innerText()).includes('fica guardada'));
  await box.getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  const used = await stored(page);
  assert.deepEqual([used.segment, used.pkg, used.name], ['alimentacao', 'completo', 'Minha Loja'], 'modelo inteiro, com o nome da empresa');
  await page.getByRole('button', { name: 'Recuperar minha versão anterior' }).click();
  const back = await stored(page);
  assert.deepEqual([back.segment, back.service, back.objective, back.name], ['consultoria', 'Contabilidade', 'servicos', 'Minha Loja']);
  assert.equal(await page.getByRole('button', { name: 'Recuperar minha versão anterior' }).count(), 0);
});

await scenario('Perguntas: 6 prioritárias primeiro e todas as 12', async (page) => {
  await page.goto(URL);
  const list = page.locator('#lista-perguntas summary');
  assert.equal(await list.count(), 6);
  assert.equal(await list.first().innerText(), 'A prévia grátis já é o meu site?');
  await page.getByRole('button', { name: /Ver todas as perguntas/ }).click();
  assert.equal(await list.count(), 12);
  const all = await page.locator('#lista-perguntas').textContent();
  for (const s of ['Existe mensalidade?', 'Quem fica com o domínio e os acessos?', '3 a 12 dias úteis', 'Domínio (endereço do site)']) assert(all.includes(s), s);
});

/* ── Acesso flutuante na apresentação ───────────────────────────────────── */

for (const width of [360, 1366]) {
  await scenario(`Apresentação ${width}px: botão flutuante aparece quando o principal sai da tela e não cobre o conteúdo`, async (page) => {
    await page.goto(URL);
    const float = page.locator('[data-float]');
    const btn = float.locator('a');
    assert.equal(await float.getAttribute('data-shown'), null, 'escondido com o botão principal à vista');
    assert.equal(await btn.getAttribute('tabindex'), '-1', 'escondido também para o teclado');
    await page.locator('#como-funciona').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-float]')?.hasAttribute('data-shown'));
    assert.equal((await btn.innerText()).trim(), 'Criar minha prévia');
    assert((await btn.getAttribute('href')).endsWith('/configurador/criar/'));
    const box = await btn.boundingBox();
    assert(box.height >= 48, `toque confortável (${box.height})`);
    assert(box.x >= 0 && box.x + box.width <= width, 'inteiro na tela');
    if (width < 760) assert(box.width >= width - 60, 'barra larga no celular');
    else assert(box.width < 400, 'pílula no computador');
    // Não cobre os controles do carrossel: sai da frente enquanto eles passam pela faixa de baixo (A22).
    const foot = page.locator('#exemplos [class*=carouselFoot]');
    const footY = await foot.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const vh = await page.evaluate(() => window.innerHeight);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), footY - vh + 60);
    await page.waitForFunction(() => !document.querySelector('[data-float]')?.hasAttribute('data-shown'));
    const fb = await foot.boundingBox();
    assert(fb.y + fb.height > vh - 110, 'controles na faixa de baixo');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), footY - vh / 2);
    await page.waitForFunction(() => document.querySelector('[data-float]')?.hasAttribute('data-shown'));
    // Com a chamada final à vista, não duplica.
    await page.locator('#final-titulo').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('[data-float]')?.hasAttribute('data-shown'));
    // No fim da página, o rodapé tem espaço: o último link não fica por baixo do botão.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(350);
    const shown = await float.getAttribute('data-shown');
    if (shown !== null) {
      const f = await btn.boundingBox();
      const last = await page.locator('footer [class*=footerBottom]').boundingBox();
      assert(last.y + last.height <= f.y + 1, 'o fim do rodapé fica acima do botão');
    }
    assert.equal(await scrollWidth(page), width);
    await page.locator('#como-funciona').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-float]')?.hasAttribute('data-shown'));
    await btn.click();
    await page.waitForURL(/\/criar\/$/);
    await ready(page);
    assert((await allEvents(page)).some((e) => e.event === 'start_click' && e.context === 'flutuante'));
  }, { viewport: { width, height: width < 760 ? 740 : 900 }, isMobile: width < 760, hasTouch: width < 760 });
}

await scenario('Apresentação: com prévia salva, o flutuante diz "Continuar minha prévia" e não apaga nada', async (page) => {
  await toReady(page);
  await page.goto(URL);
  await page.locator('#como-funciona').scrollIntoViewIfNeeded();
  const btn = page.locator('[data-float][data-shown] a');
  await btn.waitFor();
  assert.equal((await btn.innerText()).trim(), 'Continuar minha prévia');
  await btn.click();
  await ready(page);
  assert.equal(await title(page), Q.pronta, 'volta para onde parou');
  assert((await preview(page).innerText()).includes('Clima Sul'));
});

await scenario('Menos movimento: o flutuante aparece sem animação', async (page) => {
  await page.goto(URL);
  await page.locator('#como-funciona').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-float]')?.hasAttribute('data-shown'));
  const anim = await page.locator('[data-float] a').evaluate((e) => [getComputedStyle(e).animationName, getComputedStyle(e.parentElement).transitionDuration]);
  assert.equal(anim[0], 'none');
  assert(anim[1].split(',').every((d) => parseFloat(d) === 0), anim[1]);
}, { reducedMotion: 'reduce' });

/* ── Configurador: passo a passo (sem IA) ───────────────────────────────── */

await scenario('Serviços locais (ar-condicionado): obrigatórios, prévia pronta, uma escolha por vez, preço e mensagem coerentes', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await title(page), Q.negocio);
  assert.equal(await price(page), 'R$ 500');
  await next(page);
  assert.equal(await title(page), Q.negocio, 'não avança sem nome e segmento');
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
  assert.equal(await title(page), Q.objetivo);
  assert((await page.locator('[class*=suggestion]').innerText()).includes('Ver o Profissional — R$ 750 no total'));
  await page.getByRole('radio', { name: /^Pedir um orçamento/ }).click();
  await next(page);
  assert.equal(await title(page), Q.pronta);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'etapa-titulo', 'foco no resultado');
  await page.getByRole('button', { name: 'Personalizar meu site' }).click();
  assert.equal(await title(page), Q.pacote, 'a personalização começa pelo pacote');
  assert((await page.locator('[class*=where]').innerText()).includes('Escolha 1 de 6: Pacote'));
  assert.equal(await page.getByText('Selecionado', { exact: true }).count(), 1, 'o pacote atual marcado, em texto');
  assert((await page.locator('main').innerText()).includes('Sua prévia está no Essencial — R$ 500 no total.'), 'pacote inicial explícito');
  assert((await page.locator('[class*=priceBar]').innerText()).includes('Pacote inicial: você pode mudar, e nada é contratado agora.'));
  for (const n of ['Essencial', 'Profissional', 'Completo']) assert(await pkgRadio(page, n).isVisible(), n);
  assert.equal(await pkgRadio(page, 'Essencial').getAttribute('aria-checked'), 'true', 'sem upgrade pago pré-selecionado');
  assert.equal(await page.locator('[class*=pkgBenefits]').count(), 1, 'detalhes só do pacote selecionado');
  await next(page);
  assert.equal(await title(page), Q.estilo);
  assert.equal(await page.getByRole('radio', { name: /Sugerido|Moderno|Minimalista|Tecnológico/ }).count() >= 3, true);
  assert.equal(await page.getByText('Sugerido', { exact: true }).count(), 3, 'três sugeridos');
  assert(!(await page.locator('main').innerText()).match(/\+ ?R\$/), 'estilo e cor sem cobrança avulsa');
  for (const q of [Q.cores, Q.titulos, Q.conteudo, Q.secoes]) {
    await next(page);
    assert.equal(await title(page), q);
  }
  await next(page);
  assert.equal(await title(page), Q.revisao);
  assert.equal(await price(page), 'R$ 500');
  assert((await invest(page)).includes('R$ 500'));
  const msg = await waMessage(page);
  for (const s of ['Empresa: Clima Sul', 'Segmento: Serviços locais', 'Objetivo do site: Pedir um orçamento', 'Serviço principal: Instalação de ar-condicionado', 'Estilo: Moderno', 'PACOTE ESCOLHIDO\nEssencial — R$ 500', 'Seções, na ordem escolhida: Apresentação']) assert(msg.includes(s), s);
  for (const bad of ['%22', '{', 'identitySet', 'direction', '#projeto=']) assert(!msg.includes(bad), `sem dados internos: ${bad}`);
  const href = await waHref(page);
  assert.equal(href.origin + href.pathname, 'https://wa.me/5551981947979');
  assert.equal(await requestLink(page).getAttribute('target'), '_blank');
  await page.locator('#observacoes').fill('Já tenho domínio');
  assert((await waMessage(page)).includes('OBSERVAÇÕES\nJá tenho domínio'));
  await requestLink(page).click();
  const ev = await allEvents(page);
  const rc = ev.find((e) => e.event === 'request_click');
  assert.equal(rc.mode, 'whatsapp'); assert.equal(rc.package, 'essencial');
  assert(ev.some((e) => e.event === 'whatsapp_open' && e.context === 'pedido'));
  assert(!ev.some((e) => e.event === 'generate_lead'), 'abrir o WhatsApp não é lead recebido');
  assert.deepEqual(ev.filter((e) => e.event === 'step_complete').map((e) => e.step), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert(ev.some((e) => e.event === 'package_selected' && e.package === 'essencial' && e.source === 'etapa'), 'pacote confirmado na etapa');
  assert(!JSON.stringify(ev).match(/Clima|domínio/), 'eventos sem texto digitado');
  assert.equal(await page.getByText(/Pedido recebido/).count(), 0, 'nenhuma confirmação falsa');
  await page.reload();
  await ready(page);
  assert.equal(await title(page), Q.revisao, 'continua de onde parou');
  assert(await page.getByText('Salvo neste dispositivo').isVisible());
  assert.equal(await page.locator('#observacoes').inputValue(), 'Já tenho domínio');
});

await scenario('Cores, títulos e estilo atualizam a prévia; voltar e avançar não apagam escolhas; manter a sugestão', async (page) => {
  await toReady(page);
  await toChoice(page, Q.estilo);
  const site = () => preview(page).locator('[aria-roledescription=prévia]');
  const suggestedStyle = await page.locator('[role=radio][aria-checked=true]').getAttribute('aria-label');
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  assert.match(await site().getAttribute('class'), /escuro/, 'estilo na hora');
  assert.equal(await title(page), Q.estilo, 'não avança sozinho no clique');
  await page.getByRole('radio', { name: /^Elegante/ }).click();
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  assert.notEqual(suggestedStyle, await page.locator('[role=radio][aria-checked=true]').getAttribute('aria-label'));
  await next(page);
  assert.equal(await title(page), Q.cores);
  const accentBefore = await site().evaluate((e) => getComputedStyle(e).getPropertyValue('--acc'));
  await page.getByRole('radio', { name: /Violeta/ }).click();
  const accent = await site().evaluate((e) => getComputedStyle(e).getPropertyValue('--acc'));
  assert.notEqual(accent, accentBefore, 'cor na hora');
  assert.equal(accent.trim(), '#6650b5');
  await next(page);
  assert.equal(await title(page), Q.titulos);
  const samples = await page.locator('[class*=fontSample]').allInnerTexts();
  assert.equal(new Set(samples).size, 1, 'o mesmo título em todas as opções');
  await page.getByRole('radio', { name: /Clássica/ }).click();
  assert.match(await site().evaluate((e) => getComputedStyle(e).getPropertyValue('--head')), /Georgia/, 'fonte na hora');
  await page.locator('[class*=backLink]').click();
  assert.equal(await title(page), Q.cores);
  assert.equal(await page.getByRole('radio', { name: /Violeta/ }).getAttribute('aria-checked'), 'true', 'escolha preservada ao voltar');
  await next(page);
  assert.equal(await page.getByRole('radio', { name: /Clássica/ }).getAttribute('aria-checked'), 'true', 'e ao avançar de novo');
  await next(page);
  assert.equal(await title(page), Q.conteudo);
  await page.getByLabel('Título', { exact: true }).fill('Ar gelado em casa');
  await page.getByPlaceholder('Manutenção preventiva').fill('PMOC para empresas');
  await page.reload();
  await ready(page);
  assert.equal(await title(page), Q.conteudo, 'recarregar mantém a etapa');
  const pv = await preview(page).innerText();
  assert(pv.includes('Ar gelado em casa')); assert(pv.includes('PMOC para empresas'));
  assert.match(await site().getAttribute('class'), /escuro/);
  const saved = await stored(page);
  assert.deepEqual([saved.direction, saved.palette, saved.font], ['escuro', 'roxo', 'serif']);
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
  await next(page);
  await toChoice(page, Q.secoes);
  await page.getByRole('checkbox', { name: /Galeria de fotos/ }).click();
  const box = page.locator('main [role=alertdialog]');
  await box.waitFor();
  assert.equal(await box.locator('#confirmar-titulo').innerText(), 'Disponível no Profissional — R$ 750 no total.');
  assert.equal(await price(page), 'R$ 500', 'nada muda antes da escolha');
  await box.getByRole('button', { name: 'Continuar no Essencial' }).click();
  assert.equal(await page.getByRole('checkbox', { name: /Galeria de fotos/ }).isChecked(), false);
  await page.getByRole('checkbox', { name: /Galeria de fotos/ }).click();
  await box.getByRole('button', { name: 'Mudar para o Profissional' }).click();
  assert.equal(await price(page), 'R$ 750');
  assert(await page.getByRole('checkbox', { name: /Galeria de fotos/ }).isChecked());
  assert((await preview(page).innerText()).includes('até 8 fotos'));
  await next(page);
  assert((await waMessage(page)).includes('Profissional — R$ 750'));
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
  await next(page);
  await toChoice(page, Q.secoes);
  await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).check();
  assert((await preview(page).innerText()).includes('Pedir pelo WhatsApp'));
  await page.getByRole('button', { name: 'Alterar pacote' }).first().click();
  const dlg = page.locator('dialog[open]');
  assert.equal(await dlg.getByText('Selecionado', { exact: true }).count(), 1);
  await pkgRadio(dlg, 'Essencial').click();
  const confirm = dlg.locator('[role=alertdialog]');
  assert((await confirm.innerText()).includes('Vitrine de produtos'));
  assert((await confirm.innerText()).includes('Trocar para o Essencial — R$ 500 no total?'), 'novo preço antes de confirmar');
  assert.equal(await price(page), 'R$ 1.000', 'ainda não trocou');
  await confirm.getByRole('button', { name: 'Trocar para o Essencial' }).click();
  assert.equal(await page.locator('dialog[open]').count(), 0, 'a janela fecha depois da escolha');
  assert.equal(await price(page), 'R$ 500');
  assert.equal(await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).isChecked(), false);
  assert(!(await preview(page).innerText()).includes('Pedir pelo WhatsApp'));
  // Guardado, não apagado: aparece e volta num pacote que comporte (A03).
  assert((await page.locator('main').innerText()).includes('Guardados no rascunho, fora do pacote atual: Vitrine de produtos'));
  await page.getByRole('button', { name: 'Desfazer' }).click();
  assert.equal(await price(page), 'R$ 1.000', 'desfazer a troca de pacote');
  assert(await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).isChecked());
  await page.getByRole('button', { name: 'Alterar pacote' }).first().click();
  await pkgRadio(dlg, 'Essencial').click();
  await dlg.locator('[role=alertdialog]').getByRole('button', { name: 'Trocar para o Essencial' }).click();
  await page.getByRole('button', { name: 'Alterar pacote' }).first().click();
  await pkgRadio(dlg, 'Completo').click();
  assert.equal(await price(page), 'R$ 1.000');
  await page.getByRole('button', { name: 'Restaurar no Completo' }).click();
  assert(await page.getByRole('checkbox', { name: /Vitrine de produtos/ }).isChecked(), 'restaurado sem preencher de novo');
});

await scenario('Outro segmento, sem logo e sem textos: conclui só com o essencial', async (page) => {
  const t0 = Date.now();
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill('Fala Idiomas');
  await page.getByRole('radio', { name: 'Outro', exact: true }).click();
  await next(page);
  assert.equal(await title(page), Q.negocio, 'Outro pede o nome do segmento');
  assert.equal(await page.locator('#segmento-outro').getAttribute('aria-invalid'), 'true');
  await page.locator('#segmento-outro').fill('escola de idiomas');
  await page.getByRole('button', { name: 'Definir depois' }).click();
  assert(await page.locator('#servico-principal').isDisabled());
  await next(page); await next(page);
  await page.getByRole('button', { name: 'Gostei assim — revisar e solicitar' }).click();
  assert.equal(await title(page), Q.revisao);
  assert((await preview(page).innerText()).toLowerCase().includes('escola de idiomas'));
  const msg = await waMessage(page);
  assert(msg.includes('Segmento: Outro: escola de idiomas')); assert(!msg.includes('Serviço principal'), 'campo vazio não aparece'); assert(msg.includes('Logo: usar o nome da empresa'));
  timings.push(['percurso mínimo automatizado (Outro, sem logo nem textos)', Date.now() - t0]);
});

await scenario('Revisão: "Editar" volta para a escolha certa; objetivo muda sem apagar textos', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Editar estilo' }).click();
  assert.equal(await title(page), Q.estilo);
  await toChoice(page, Q.conteudo);
  await page.getByLabel('Título', { exact: true }).fill('Ar gelado em casa');
  await toChoice(page, Q.secoes);
  await next(page);
  await page.getByRole('button', { name: 'Editar objetivo' }).click();
  assert.equal(await title(page), Q.objetivo);
  await page.getByRole('radio', { name: /^Ver meus serviços/ }).click();
  const pv = (await preview(page).innerText()).toLowerCase();
  assert(pv.includes('ar gelado em casa'), 'título mantido (o estilo pode deixar em maiúsculas)'); assert(pv.includes('ver serviços'));
});

await scenario('Revisão: copiar resumo, baixar o projeto e abrir o arquivo de volta (A20, A21)', async (page) => {
  await toSite(page);
  const msg = await waMessage(page);
  await openSave(page);
  await page.getByRole('button', { name: 'Copiar resumo' }).click();
  await page.getByRole('status').filter({ hasText: 'Resumo copiado' }).waitFor({ timeout: 3000 }).catch(async () => {
    throw Error(`status: ${await page.getByRole('status').allInnerTexts()}`);
  });
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), msg, 'o mesmo texto do WhatsApp');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Baixar meu projeto' }).first().click()]);
  assert.equal(download.suggestedFilename(), 'projeto-site-clima-sul.json');
  const file = await download.path();
  const data = JSON.parse((await import('node:fs')).readFileSync(file, 'utf8'));
  assert.equal(data.formato, 'beck-performance/projeto-de-site'); assert.equal(data.versaoDoFormato, 1);
  assert.equal(data.resumo.pacote.nome, 'Essencial'); assert.equal(data.resumo.empresa, 'Clima Sul');
  assert(Array.isArray(data.resumo.secoes) && data.resumo.secoes[0] === 'Apresentação');
  const ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'summary_copy') && ev.some((e) => e.event === 'project_export'));
  assert(!JSON.stringify(ev).includes('Clima'), 'eventos sem conteúdo');
  // Muda algo e abre o arquivo: volta ao que foi exportado, com a versão atual guardada.
  await page.getByRole('button', { name: 'Editar cores' }).click();
  await page.getByRole('radio', { name: /Violeta/ }).click();
  await toChoice(page, Q.revisao);
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByText('Projeto aberto a partir do arquivo.').waitFor();
  assert.equal((await stored(page)).palette, data.projeto.palette);
  await page.getByRole('button', { name: 'Recuperar minha versão anterior' }).click();
  assert.equal((await stored(page)).palette, 'roxo');
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"formato":"outro"}') });
  await page.getByText('Este arquivo não é um projeto do configurador').waitFor();
  assert.equal((await stored(page)).palette, 'roxo', 'arquivo inválido não altera nada');
}, { permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });

await scenario('Seções: limite explicado; textos por seção e detalhes editáveis e preservados (A04, A13, A14)', async (page) => {
  await toSite(page);
  await toChoice(page, Q.secoes);
  assert((await page.locator('main').innerText()).includes('5 de 5 seções'));
  assert(await page.getByText('Incluído no seu pacote').first().isVisible());
  assert(await page.getByText('Disponível no Profissional').first().isVisible());
  await page.getByRole('checkbox', { name: /^Como funciona/ }).click();
  const box = page.locator('main [role=alertdialog]');
  await box.waitFor();
  assert.equal(await box.locator('#confirmar-titulo').innerText(), 'Você já selecionou 5 de 5 seções do Essencial.');
  await box.getByRole('button', { name: 'Manter o Essencial' }).click();
  assert.equal(await price(page), 'R$ 500'); assert.equal(await page.getByRole('checkbox', { name: /^Como funciona/ }).isChecked(), false);
  await page.getByRole('button', { name: 'Ver pacote Profissional' }).click();
  assert(await page.locator('dialog[open]').isVisible()); await page.keyboard.press('Escape');
  await page.locator('[class*=backLink]').click();
  assert.equal(await title(page), Q.conteudo);
  await page.getByText('Editar os textos das seções').click();
  const dif = page.getByRole('textbox', { name: 'Diferenciais 1' });
  await dif.fill('Visita técnica sem custo na região');
  assert((await preview(page).innerText()).includes('Visita técnica sem custo na região'));
  await page.getByText('Deixar minha prévia mais específica').click();
  await page.getByLabel('Onde você atende').fill('Porto Alegre');
  await page.reload();
  await ready(page);
  assert((await preview(page).innerText()).includes('Visita técnica sem custo na região'), 'texto editado salvo');
  const saved = await stored(page);
  assert(saved.edited.includes('differentials')); assert.equal(saved.details.region, 'Porto Alegre');
  await toChoice(page, Q.revisao);
  const msg = await waMessage(page);
  assert(msg.includes('Onde atendo: Porto Alegre')); assert(msg.includes('Diferenciais: Visita técnica sem custo na região'));
});

await scenario('Progresso clicável, "Manter sugestão" e escolhas numeradas (§10)', async (page) => {
  await toSite(page);
  const choices = page.getByRole('list', { name: 'Escolhas da personalização' });
  assert.equal(await choices.getByRole('button').count(), 6);
  await choices.getByRole('button', { name: 'Escolha 3: Cores' }).click();
  assert.equal(await title(page), Q.cores, 'volta direto à escolha');
  assert.equal(await choices.getByRole('button', { name: 'Escolha 3: Cores' }).getAttribute('aria-current'), 'step');
  const nextBtn = visible(page.locator('[class*=desktopActions] button').filter({ hasText: /^(Continuar|Manter sugestão)/ }));
  assert.equal((await nextBtn.innerText()).trim(), 'Manter sugestão', 'sem mudança, mantém a sugestão');
  await page.getByRole('radio', { name: /Oliva/ }).click();
  assert.equal((await nextBtn.innerText()).trim(), 'Continuar', 'depois de escolher, continua');
  assert.equal(await title(page), Q.cores, 'nada avança sozinho');
  await page.getByRole('button', { name: 'Voltar para Sua prévia (concluída)' }).click();
  assert.equal(await title(page), Q.pronta);
  await page.getByRole('button', { name: 'Voltar para Seu negócio (concluída)' }).click();
  assert.equal(await title(page), Q.negocio);
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Clima Sul', 'voltar não apaga nada');
});

await scenario('Exemplos: filtro por segmento e composições próprias (imóveis, alimentação) (§14, §15)', async (page) => {
  await page.goto(URL);
  const filter = page.getByRole('group', { name: 'Filtrar exemplos por segmento' });
  assert.equal(await filter.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed'), 'true');
  await filter.getByRole('button', { name: 'Imóveis e corretores' }).click();
  const cards = page.locator('#exemplos button[class*=exampleCard]');
  assert.equal(await cards.count(), 1); assert.equal(await page.getByRole('heading', { name: 'Outro segmento' }).count(), 0);
  assert.equal(await filter.getByRole('button', { name: 'Imóveis e corretores' }).getAttribute('aria-pressed'), 'true', 'filtro ativo marcado');
  await cards.first().click();
  assert.equal(await page.locator('#exemplo-titulo').innerText(), 'Imóveis e corretores');
  await page.keyboard.press('Escape');
  await filter.getByRole('button', { name: 'Todos' }).click();
  assert.equal(await cards.count(), 6);
  // Alimentação (Completo, com vitrine): cardápio por categorias, pedido pelo WhatsApp.
  await page.getByRole('button', { name: 'Ver este exemplo: Alimentação' }).click();
  const food = await page.locator('dialog[open] [aria-roledescription=prévia]').innerText();
  assert(food.includes('Cardápio') && food.includes('Pedir pelo WhatsApp') && food.includes('sem pagamento online'));
  await page.keyboard.press('Escape');
  // Topo: a vitrine usa o mesmo desenho das prévias (sem mockup à parte).
  assert.equal(await page.locator('[data-showcase] [aria-roledescription=prévia]').count(), 2);
  // Imóveis com vitrine: imóveis demonstrativos, sem preço nem endereço inventados.
  await page.goto(B);
  await page.evaluate(() => localStorage.setItem('mb.configurador.v4', JSON.stringify({ version: 4, flow: 'guiado-v2', name: 'Casa Certa', segment: 'imoveis', objective: 'agendamento', pkg: 'completo', sections: ['apresentacao', 'vitrine', 'galeria', 'contato'], step: 9 })));
  await page.reload();
  await ready(page);
  const pv = (await preview(page).innerText()).toLowerCase();
  assert(pv.includes('imóveis em destaque') && pv.includes('casa com quintal') && pv.includes('agendar visita pelo whatsapp'), 'o estilo pode deixar títulos em maiúsculas');
  assert(pv.includes('imóveis ilustrativos') && pv.includes('sem preços nem disponibilidade'), 'vitrine marcada como ilustrativa');
  assert(!/R\$\s?\d/.test(pv), 'sem preço de imóvel');
  for (const t of ['foto do imóvel', 'sua foto 1', 'item 1', 'foto do item']) assert(!pv.includes(t), `sem espaço vazio no exemplo: ${t}`);
  assert(pv.includes('imagens ilustrativas') && pv.includes('até 8 fotos'), 'galeria ilustrativa com o tamanho escolhido no projeto');
});

await scenario('Projeto personalizado: orçamento separado e a prévia continua', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Alterar pacote' }).first().click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Preciso de um projeto personalizado' }).click();
  assert.equal(await title(page), Q.secoes, 'leva à escolha de seções');
  await page.getByRole('checkbox', { name: 'Loja virtual com carrinho e pagamento online' }).check();
  assert.equal(await price(page), 'Orçamento personalizado');
  await next(page);
  assert.equal((await requestLink(page).innerText()).trim(), 'Pedir orçamento personalizado');
  const msg = await waMessage(page);
  assert(msg.includes('PROJETO PERSONALIZADO\nPreciso de: Loja virtual')); assert(!msg.includes('PACOTE ESCOLHIDO'));
  assert((await preview(page).innerText()).includes('Clima Sul'), 'prévia preservada');
  await toChoice(page, Q.secoes);
  await page.getByRole('checkbox', { name: 'Loja virtual com carrinho e pagamento online' }).uncheck();
  assert.equal(await price(page), 'R$ 500');
});

await scenario('Oito seções é o teto: a nona pede projeto personalizado, nunca passa de R$ 1.000', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Alterar pacote' }).first().click();
  await pkgRadio(page.locator('dialog[open]'), 'Completo').click();
  await toChoice(page, Q.secoes);
  for (const n of ['Informações de atendimento', 'Como funciona', 'Perguntas frequentes']) await page.getByRole('checkbox', { name: new RegExp(`^${n}`) }).check();
  assert.equal(await page.locator('main [role=alertdialog]').count(), 0);
  await page.getByRole('checkbox', { name: /^Galeria de fotos/ }).click();
  const box = page.locator('main [role=alertdialog]');
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
  assert.equal(await title(page), Q.objetivo);
});

await scenario('Compartilhar opções de layout: rótulo honesto, sem dados pessoais; PDF com o mesmo valor', async (page, ctx) => {
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) } });
    window.print = () => { window.__printed = true; };
  });
  await toSite(page);
  await openSave(page);
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
  assert.equal(await shared.locator('#etapa-titulo').innerText(), Q.revisao);
  assert((await shared.locator('[class*=notice]').innerText()).includes('Nome, textos e logo não viajam'));
});

await scenario('Começar novamente pede confirmação; "Começar uma nova prévia" na apresentação também', async (page) => {
  await toSite(page);
  await page.getByRole('button', { name: 'Começar novamente' }).click();
  await page.getByRole('button', { name: 'Manter minha prévia' }).click();
  assert.equal(await title(page), Q.revisao);
  await page.goto(URL);
  // O rótulo muda depois que a página lê o projeto salvo (após carregar).
  await page.getByRole('link', { name: 'Começar uma nova prévia' }).waitFor();
  assert.equal((await heroCta(page).innerText()).trim(), 'Continuar minha prévia');
  await page.getByRole('link', { name: 'Começar uma nova prévia' }).click();
  await ready(page);
  await page.getByRole('button', { name: 'Sim, apagar' }).click();
  assert.equal(await title(page), Q.negocio);
  assert.equal(await page.locator('#nome-empresa').inputValue(), '');
  await page.goto(URL);
  assert.equal((await heroCta(page).innerText()).trim(), 'Criar minha prévia grátis');
});

await scenario('Projetos antigos: v3 e o fluxo de 4 etapas são recuperados na etapa certa, com pacote coerente', async (page) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('mb.configurador.v3', JSON.stringify({ version: 3, name: 'Oficina Antiga', segment: 'local', objective: 'agenda', sections: ['apresentacao', 'servicos', 'faq', 'contato'], features: ['whatsapp', 'redes', 'faq'], direction: 'elegante', palette: 'verde', step: 3, budget: '900', budgetOn: true })));
  await page.goto(B);
  await ready(page);
  assert((await page.locator('[class*=notice]').innerText()).includes('versão anterior'));
  assert.equal(await title(page), Q.revisao);
  assert.equal(await price(page), 'R$ 750');
  assert((await preview(page).innerText()).includes('Oficina Antiga'));
  assert(await page.evaluate(() => localStorage.getItem('mb.configurador.v3')), 'versão antiga preservada');
  // Fluxo publicado antes desta versão (4 etapas): "Sua identidade" vira a escolha de estilo.
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('mb.configurador.v4'));
    localStorage.setItem('mb.configurador.v4', JSON.stringify({ ...p, flow: 'etapas-4-v3', step: 2, name: 'Oficina Quatro' }));
  });
  await page.reload();
  await ready(page);
  assert.equal(await title(page), Q.estilo);
  assert((await preview(page).innerText()).includes('Oficina Quatro'));
  assert.equal(await price(page), 'R$ 750');
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
  await next(page);
  await page.getByRole('button', { name: 'Personalizar meu site' }).click();
  assert.equal(await title(page), Q.pacote);
  await pkgRadio(page, 'Essencial').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await price(page), 'R$ 750', 'pacote escolhido pelo teclado (setas)');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-checked')), 'true');
  await next(page);
  await next(page);
  assert.equal(await title(page), Q.cores);
  const first = page.getByRole('radio', { name: /Oceano/ });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio', { name: /Oliva/ }).getAttribute('aria-checked'), 'true', 'setas também nas cores');
});

await scenario('Computador 1366px: opções à esquerda, prévia à direita, tela cheia e alternância de aparelho', async (page) => {
  await toReady(page);
  await toChoice(page, Q.cores);
  const ed = await page.locator('section[aria-labelledby=etapa-titulo]').boundingBox();
  const pv = await preview(page).boundingBox();
  assert(pv.x > ed.x + ed.width - 1, 'prévia ao lado');
  assert(pv.width >= 600, `prévia com largura útil (${pv.width})`);
  const area = preview(page).locator('[class*=previewArea]');
  await area.evaluate((e) => (e.scrollTop = 400));
  await page.getByRole('radio', { name: /Oliva/ }).click();
  assert(await area.evaluate((e) => e.scrollTop) > 300, 'a prévia não volta ao topo a cada escolha');
  await preview(page).getByRole('button', { name: 'Ver em tela cheia' }).click();
  const full = page.locator('dialog[open]');
  assert.equal(await full.locator('h2').innerText(), 'Seu site');
  await full.getByRole('button', { name: /Celular/ }).click();
  const w = await full.locator('[aria-roledescription=prévia]').boundingBox();
  assert(w.width <= 432 && w.width >= 300, `celular em largura real (${w.width})`);
  await full.getByRole('button', { name: 'Fechar tela cheia' }).click();
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert((await allEvents(page)).some((e) => e.event === 'preview_view' && e.source === 'tela_cheia'));
  assert.equal(await scrollWidth(page), 1366);
}, { viewport: { width: 1366, height: 900 } });

for (const width of [360, 390, 430, 768]) {
  await scenario(`Celular ${width}px: Personalizar x Ver meu site, volta na mesma escolha e rolagem, barra sem cobrir`, async (page) => {
    await page.goto(URL);
    assert.equal(await scrollWidth(page), width);
    await heroCta(page).click();
    await ready(page);
    await business(page);
    await next(page);
    assert.equal(await title(page), Q.objetivo);
    await next(page);
    // Prévia pronta: abre direto a visualização do site.
    assert(await preview(page).isVisible(), 'a prévia aparece sozinha');
    assert(await page.getByRole('heading', { name: 'Sua prévia está pronta' }).filter({ visible: true }).isVisible());
    const bar = page.locator('[data-bar=configurador]');
    assert.deepEqual((await bar.getByRole('button').allInnerTexts()).map((t) => t.trim()), ['Voltar ao objetivo', 'Personalizar meu site']);
    await bar.getByRole('button', { name: 'Personalizar meu site' }).click();
    assert.equal(await title(page), Q.pacote);
    assert(!(await preview(page).isVisible()), 'nas escolhas, a prévia só abre quando a pessoa pede');
    // Os três nomes e preços à vista, sem rolagem lateral escondida.
    for (const [n, v] of [['Essencial', 'R$ 500'], ['Profissional', 'R$ 750'], ['Completo', 'R$ 1.000']]) {
      const card = pkgRadio(page, n);
      assert((await card.innerText()).includes(v), n);
      const cb = await card.boundingBox();
      assert(cb.x >= 0 && cb.x + cb.width <= width && cb.height >= 44, `${n} inteiro na largura e fácil de tocar`);
    }
    await page.locator('main summary', { hasText: 'Comparar pacotes' }).click();
    const cmp = await page.locator(width < 560 ? 'main dl[class*=compareBlocks]' : 'main table').boundingBox();
    assert(cmp.x + cmp.width <= width + 1, 'comparação cabe na tela (em blocos no celular)');
    await next(page);
    assert.equal(await title(page), Q.estilo);
    await next(page);
    assert.equal(await title(page), Q.cores);
    await page.getByRole('radio', { name: /Argila/ }).click();
    await page.getByRole('status').filter({ hasText: 'Prévia atualizada' }).waitFor();
    await page.evaluate(() => window.scrollTo({ top: 260, behavior: 'instant' }));
    const y = await page.evaluate(() => window.scrollY);
    await bar.getByRole('button', { name: 'Ver meu site' }).click();
    assert(await preview(page).isVisible());
    assert(!(await page.locator('#etapa-titulo').isVisible()));
    await bar.getByRole('button', { name: 'Voltar para “Cores”' }).click();
    assert.equal(await title(page), Q.cores, 'volta na mesma escolha');
    assert.equal(await page.getByRole('radio', { name: /Argila/ }).getAttribute('aria-checked'), 'true');
    assert(Math.abs((await page.evaluate(() => window.scrollY)) - y) <= 2, 'e na mesma rolagem');
    for (const q of [Q.titulos, Q.conteudo, Q.secoes, Q.revisao]) {
      await next(page);
      assert.equal(await title(page), q);
      assert.equal(await scrollWidth(page), width, q);
    }
    const req = bar.locator('a');
    assert.equal((await req.innerText()).trim(), 'Solicitar desenvolvimento');
    const btn = await req.boundingBox();
    assert(btn.x + btn.width <= width, 'botão inteiro na barra');
    assert(await req.evaluate((e) => e.scrollWidth <= e.clientWidth + 1), 'texto do botão sem corte');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    const barBox = await bar.boundingBox();
    const last = await page.getByRole('button', { name: 'Começar novamente' }).boundingBox();
    assert(last.y + last.height <= barBox.y + 1, 'a barra não cobre o fim da página');
    assert.equal(await page.locator('[data-bar]').count(), 1, 'uma barra fixa só');
    const small = await page.evaluate(() => [...document.querySelectorAll('#conteudo button, #conteudo summary, [data-bar] a, [data-bar] button')]
      .filter((el) => el.offsetParent !== null && !el.closest('[aria-roledescription=prévia]'))
      .map((el) => [el.textContent.trim().slice(0, 30), el.getBoundingClientRect()]).filter(([, r]) => r.width > 0 && (r.height < 43.9 || r.width < 43.9)) // tolerância de arredondamento de subpixel
      .map(([t, r]) => `${t} ${r.width.toFixed(2)}x${r.height.toFixed(2)}`));
    assert.deepEqual(small, [], 'alvos de toque com pelo menos 44px');
    const fonts = await page.evaluate(() => [...document.querySelectorAll('#conteudo input, #conteudo textarea')].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    for (const f of fonts) assert(f >= 16, 'campos sem zoom automático');
  }, { viewport: { width, height: 844 }, isMobile: width < 760, hasTouch: true });
}

await scenario('Menos movimento: troca de etapa e seleção sem animação', async (page) => {
  await toReady(page);
  await page.getByRole('button', { name: 'Personalizar meu site' }).click();
  const names = await page.evaluate(() => [...document.querySelectorAll('#conteudo *')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'));
  assert.deepEqual(names, [], 'nada anima');
}, { reducedMotion: 'reduce' });

/* ── Prévia por descrição (IA simulada) ─────────────────────────────────── */

const aiAnswer = {
  name: 'Clima Sul', segment: 'local', segmentOther: '', service: 'Instalação de ar-condicionado', objective: 'orcamento',
  headline: 'Ar-condicionado instalado do jeito certo', description: 'Peça seu orçamento pelo WhatsApp.', services: ['Instalação', 'Manutenção', 'Higienização'],
  // Mesmo formato que o servidor devolve depois de validar (previewCopy e extraSections).
  sections: ['servicos', 'diferenciais', 'sobre'], extraSections: ['galeria'], direction: 'tecnologico', palette: 'azul', brandColor: null, needs: ['loja'],
  previewCopy: {
    about: 'Instalação e manutenção para casas e empresas, com visita combinada antes.',
    serviceDetails: ['Detalhe um da IA', 'Detalhe dois da IA', 'Detalhe três da IA'],
    differentials: [], processSteps: [], faqQuestions: [],
  },
};
const cors = { 'Access-Control-Allow-Origin': '*' };

await scenario('Sem servidor de IA configurado, a criação começa pelo passo a passo', async (page) => {
  await page.goto(B);
  await ready(page);
  assert.equal(await page.locator('#descricao-ia').count(), 0);
  assert.equal(await page.locator('#gravar-audio').count(), 0, 'sem servidor, sem gravação');
  assert(await page.locator('#nome-empresa').isVisible());
  await page.goto(URL + 'privacidade/');
  assert(!(await page.locator('main').innerText()).includes('Gemini'));
});

await scenario('IA digitando: gera direto do texto; falha preserva a descrição; resultado com ações claras', async (page) => {
  const bodies = [];
  let calls = 0;
  await page.route('https://ia.test/preview', async (route) => {
    calls++; bodies.push(route.request().postData());
    if (calls === 1) return route.fulfill({ status: 502, contentType: 'application/json', headers: cors, body: '{"ok":false,"error":"ia"}' });
    await new Promise((r) => setTimeout(r, 400));
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  assert(await page.getByRole('button', { name: 'Gravar minha ideia' }).isVisible());
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  const box = page.locator('#descricao-ia');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'descricao-ia', 'foco no campo');
  await box.fill('Meu WhatsApp é 51 99999-0000 e faço instalação de ar-condicionado.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  assert((await page.locator('#erro-descricao').innerText()).includes('Tire telefone'));
  await box.fill('curto');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  assert((await page.locator('#erro-descricao').innerText()).includes('pelo menos 20'));
  assert.equal(calls, 0, 'nada vazio ou com telefone é enviado');
  const desc = 'Faço instalação e manutenção de ar-condicionado. Quero receber pedidos de orçamento, com visual moderno.';
  await box.fill(desc);
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.locator('#erro-descricao').waitFor();
  assert((await page.locator('#erro-descricao').innerText()).includes('não respondeu'));
  assert.equal(await box.inputValue(), desc, 'texto preservado na falha');
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  const busy = page.getByRole('button', { name: 'Montando sua prévia…' });
  await busy.waitFor();
  assert(await busy.isDisabled(), 'sem clique duplo');
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  assert.equal(calls, 2, 'uma chamada por clique útil');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'etapa-titulo', 'foco no resultado');
  const sent = JSON.parse(bodies[1]);
  assert.deepEqual(Object.keys(sent).sort(), ['description', 'pkg', 'schema']);
  const pv = await preview(page).innerText();
  assert(pv.includes('Clima Sul')); assert(pv.includes('Ar-condicionado instalado do jeito certo')); assert(pv.includes('Higienização'));
  assert.match(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class'), /tecnologico/);
  assert.equal(await price(page), 'R$ 500', 'a IA não troca o pacote');
  const notes = await page.locator('[class*=readyNotes]').innerText();
  for (const s of ['Galeria de fotos', 'loja virtual com carrinho']) assert(notes.includes(s), s);
  assert(pv.includes('Detalhe dois da IA') && pv.includes('visita combinada antes'), 'textos de apoio da IA na prévia');
  await page.getByRole('button', { name: 'Editar minha descrição' }).click();
  assert.equal(await title(page), Q.negocio);
  assert.equal(await page.locator('#descricao-ia').inputValue(), desc, 'descrição preservada ao voltar');
  await visible(page.getByRole('button', { name: 'Voltar para minha prévia' })).click();
  assert.equal(await title(page), Q.pronta);
  await page.getByRole('button', { name: 'Personalizar meu site' }).click();
  await toChoice(page, Q.conteudo);
  await page.getByLabel('Item 2').fill('PMOC');
  const edited = await preview(page).innerText();
  assert(!edited.includes('Detalhe dois da IA') && edited.includes('Detalhe um da IA'), 'descrição do serviço editado sai; as outras ficam');
  const ev = await allEvents(page);
  assert.deepEqual(ev.filter((e) => e.event === 'ai_generate').map((e) => e.result), ['iniciada', 'erro', 'iniciada', 'ok']);
  assert(!JSON.stringify(ev).match(/ar-condicionado|Clima/), 'eventos sem texto');
  await page.goto(URL_AI + 'privacidade/');
  assert((await page.locator('main').innerText()).includes('Google Gemini'));
});

await scenario('Áudio: gravar, encerrar, revisar e gerar; nada de gerar durante gravação ou transcrição', async (page) => {
  const bodies = [];
  const said = 'Faço instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento pelo WhatsApp.';
  let releaseTranscript;
  const gate = new Promise((r) => (releaseTranscript = r));
  await page.route('https://ia.test/preview/transcricao', async (route) => {
    bodies.push(route.request().postData());
    await gate;
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, text: said }) });
  });
  await page.route('https://ia.test/preview', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) }));
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  assert((await page.locator('#dica-descricao').innerText()).includes('áudio'), 'aviso de privacidade cita o áudio');
  assert(await page.getByText('O microfone só é usado depois que você tocar em gravar.').isVisible());

  // Gravação curta demais: nada é enviado; o texto continua disponível.
  await page.getByRole('button', { name: 'Gravar minha ideia' }).click();
  await page.getByRole('button', { name: 'Parar gravação' }).click();
  await page.locator('#erro-descricao').waitFor();
  assert((await page.locator('#erro-descricao').innerText()).includes('pelo menos 2 segundos'));
  assert.equal(bodies.length, 0);

  // Cancelar: descarta e volta, sem enviar.
  await page.locator('#descricao-ia').fill('Empresa Clima Sul.');
  await page.getByRole('button', { name: 'Gravar minha ideia' }).click();
  await page.getByRole('button', { name: 'Parar gravação' }).waitFor();
  await page.getByRole('button', { name: 'Cancelar gravação' }).click();
  assert.equal(await page.locator('#descricao-ia').inputValue(), 'Empresa Clima Sul.', 'texto anterior preservado');
  assert.equal(bodies.length, 0, 'cancelar não envia');

  await page.getByRole('button', { name: 'Gravar minha ideia' }).click();
  const stop = page.getByRole('button', { name: 'Parar gravação' });
  await page.getByText('Gravando sua ideia…').waitFor();
  const waitGen = page.getByRole('button', { name: /Gerar minha prévia/ });
  assert(await waitGen.isDisabled(), '"Gerar" desabilitado durante a gravação');
  assert((await page.locator('#motivo-gerar').innerText()).includes('depois que você parar a gravação'), 'motivo ao lado do botão');
  assert.equal(await page.locator('#descricao-ia').count(), 0, 'um estado de cada vez');
  assert.equal(await page.locator('[data-bar=configurador]').count(), 0, 'nenhuma barra competindo');
  await page.waitForTimeout(2600);
  assert(/0:0[2-3]/.test(await page.locator('[class*=recClock]').innerText()), 'cronômetro');
  await stop.click();
  await page.getByText('Transcrevendo seu áudio…').waitFor();
  assert(await page.getByRole('button', { name: /Gerar minha prévia/ }).isDisabled(), '"Gerar" desabilitado durante a transcrição');
  const micOn = await page.evaluate(() => window.__micLive ?? null);
  releaseTranscript();
  await page.waitForFunction(() => document.querySelector('#descricao-ia')?.value.includes('ar-condicionado'));
  assert.equal(await page.locator('#descricao-ia').inputValue(), `Empresa Clima Sul. ${said}`, 'transcrição entra depois do que já estava escrito');
  assert(await page.getByText('Confira o texto antes de gerar.').isVisible());
  assert(await page.getByRole('button', { name: 'Gravar novamente' }).isVisible());
  assert.equal(bodies.length, 1);
  const sent = JSON.parse(bodies[0]);
  assert.deepEqual(Object.keys(sent).sort(), ['audio', 'mime', 'schema']);
  assert.equal(sent.mime, 'audio/wav');
  assert(sent.audio.startsWith('UklGR') && sent.audio.length > 50000, 'WAV de verdade, em base64');
  assert.equal(micOn, null);
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  const ev = await allEvents(page);
  assert.deepEqual(ev.filter((e) => e.event === 'ai_audio').map((e) => e.result), ['erro', 'ok']);
  assert(!JSON.stringify(ev).includes('ar-condicionado'), 'eventos sem texto');
});

await scenario('Áudio: microfone negado leva ao texto, sem travar em "Gravando"', async (page, ctx) => {
  await ctx.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('negado', 'NotAllowedError'));
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Gravar minha ideia' }).click();
  await page.locator('#erro-descricao').waitFor();
  assert((await page.locator('#erro-descricao').innerText()).includes('microfone'));
  assert(await page.locator('#descricao-ia').isVisible(), 'segue pelo texto');
  assert.equal(await page.getByText('Gravando sua ideia…').count(), 0);
  assert(await page.getByRole('button', { name: 'Gerar minha prévia' }).isEnabled());
});

await scenario('Áudio: navegador sem gravação mostra o campo de texto com aviso curto', async (page, ctx) => {
  await ctx.addInitScript(() => { delete window.MediaRecorder; });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  assert(await page.locator('#descricao-ia').isVisible());
  assert(await page.getByText('A gravação de áudio não está disponível neste navegador.').isVisible());
  assert.equal(await page.getByRole('button', { name: /Gravar/ }).count(), 0);
});

await scenario('Celular 390px com IA: gerar abre a prévia direto, com "Sua prévia está pronta" e as duas ações', async (page) => {
  await page.route('https://ia.test/preview', async (route) => {
    await new Promise((r) => setTimeout(r, 300));
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  await page.locator('#descricao-ia').fill('Faço instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.getByRole('heading', { name: 'Sua prévia está pronta' }).filter({ visible: true }).waitFor();
  assert(await preview(page).isVisible(), 'a prévia aparece sem procurar');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'pronta-titulo', 'foco no aviso da prévia');
  const top = await preview(page).locator('[aria-roledescription=prévia]').boundingBox();
  assert(top.y < 844, 'o início do site aparece na tela');
  const bar = page.locator('[data-bar=configurador]');
  assert.deepEqual((await bar.getByRole('button').allInnerTexts()).map((t) => t.trim()), ['Editar minha descrição', 'Personalizar meu site']);
  await bar.getByRole('button', { name: 'Personalizar meu site' }).click();
  assert.equal(await title(page), Q.pacote);
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('IA: se a pessoa sai da etapa enquanto gera, nada muda sozinho; aviso com "Ver minha prévia"', async (page) => {
  let answer;
  const gate = new Promise((r) => (answer = r));
  await page.route('https://ia.test/preview', async (route) => {
    await gate;
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  await page.locator('#descricao-ia').fill('Faço instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.getByRole('button', { name: 'Montando sua prévia…' }).waitFor();
  // Enquanto gera, a pessoa prefere o passo a passo e segue.
  await page.getByRole('button', { name: 'Prefiro escolher tudo passo a passo' }).click();
  await business(page, { name: 'Outra Empresa', segment: 'Consultoria', service: '' });
  await next(page);
  assert.equal(await title(page), Q.objetivo);
  answer();
  const late = page.locator('[class*=lateBox]');
  await late.waitFor();
  assert.equal(await title(page), Q.objetivo, 'não muda de tela sozinho');
  assert((await preview(page).innerText()).includes('Outra Empresa'));
  await late.getByRole('button', { name: 'Ver minha prévia' }).click();
  assert.equal(await title(page), Q.pronta);
  assert((await preview(page).innerText()).includes('Ar-condicionado instalado do jeito certo'));
});

await scenario('IA: gerar outra sugestão só para uma seção; as outras ficam e dá para desfazer (§13, A14)', async (page) => {
  let calls = 0;
  await page.route('https://ia.test/preview', async (route) => {
    calls++;
    const copy = calls === 1
      ? { ...aiAnswer.previewCopy, differentials: ['Visita combinada', 'Orçamento por escrito', 'Contato direto'] }
      : { ...aiAnswer.previewCopy, about: 'Novo texto sobre a empresa, só desta seção.', differentials: ['Outro 1', 'Outro 2', 'Outro 3'] };
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: { ...aiAnswer, needs: [], previewCopy: copy } }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  await page.locator('#descricao-ia').fill('Faço instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  await toChoice(page, Q.conteudo);
  await page.getByText('Editar os textos das seções').click();
  await page.getByRole('button', { name: 'Gerar outra sugestão para esta seção' }).first().waitFor();
  const aboutGroup = page.locator('fieldset').filter({ has: page.getByText('Sobre Clima Sul', { exact: true }) });
  await aboutGroup.getByRole('button', { name: 'Gerar outra sugestão para esta seção' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('Novo texto sobre a empresa, só desta seção.'));
  const pv = await preview(page).innerText();
  assert(pv.includes('Novo texto sobre a empresa, só desta seção.'), 'a seção escolhida mudou');
  assert(pv.includes('Visita combinada') && !pv.includes('Outro 1'), 'as outras seções ficaram');
  assert(pv.includes('Detalhe um da IA'), 'serviços intactos');
  assert.equal(calls, 2);
  await page.getByRole('button', { name: 'Desfazer' }).click();
  const back = await preview(page).innerText();
  assert(back.includes('visita combinada antes') && !back.includes('Novo texto sobre a empresa'), 'versão anterior de volta');
});

await scenario('IA: gerar de novo troca o segmento que a IA sugeriu, mas não o escolhido à mão', async (page) => {
  const base = {
    name: '', segmentOther: '', service: '', objective: 'orcamento', headline: '', description: '', services: [],
    sections: [], extraSections: [], direction: 'essencial', palette: 'azul', brandColor: null, needs: [],
    previewCopy: { about: '', serviceDetails: [], differentials: [], processSteps: [], faqQuestions: [] },
  };
  const replies = [{ ...base, segment: 'consultoria' }, { ...base, segment: 'imoveis' }, { ...base, segment: 'consultoria' }];
  await page.route('https://ia.test/preview', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: replies.shift() }) }));
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  const generate = async () => {
    if ((await title(page)) !== Q.negocio) await page.getByRole('button', { name: 'Editar minha descrição' }).click();
    await page.locator('#descricao-ia').fill('Sou corretora de imóveis e quero mostrar imóveis e agendar visitas.');
    await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
    await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  };
  const savedSegment = (seg) => page.waitForFunction((x) => JSON.parse(localStorage.getItem('mb.configurador.v4') || '{}').segment === x, seg, { timeout: 5000 }).then(() => true, () => false);
  await generate();
  assert(await savedSegment('consultoria'));
  await generate();
  assert(await savedSegment('imoveis'), 'a segunda geração troca o segmento que a primeira sugeriu');
  await page.getByRole('button', { name: 'Editar minha descrição' }).click();
  await page.getByRole('button', { name: 'Prefiro escolher tudo passo a passo' }).click();
  await page.getByRole('radio', { name: 'Alimentação' }).click();
  await page.getByRole('button', { name: /Prefiro descrever/ }).click();
  await generate();
  assert.equal(replies.length, 0, 'a terceira resposta chegou');
  assert(await savedSegment('alimentacao'), 'segmento escolhido à mão continua');
});

/* ── Evolução comercial (landing mobile-first, exemplos preenchidos, correções) ── */

await scenario('Pacote na apresentação: sem rascunho começa nele; com rascunho pergunta e não troca sozinho', async (page) => {
  await page.goto(URL);
  await page.getByRole('link', { name: 'Criar prévia com o Completo' }).click();
  await page.waitForURL(/\/criar\//);
  await ready(page);
  const note = page.locator('[class*=notice][role=status]');
  await note.waitFor();
  assert((await note.innerText()).includes('Sua prévia começa no Completo — R$ 1.000. Nada é contratado agora'));
  assert(!page.url().includes('pacote='), 'o endereço fica limpo (recarregar não repete)');
  assert.equal((await stored(page)).pkg, 'completo');
  let ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'start_click' && e.context === 'pacote' && e.package === 'completo'));
  assert(ev.some((e) => e.event === 'package_selected' && e.package === 'completo' && e.source === 'apresentacao'));
  await business(page);
  await next(page); await next(page);
  assert.equal(await title(page), Q.pronta);
  const before = await stored(page);
  // Com uma prévia em andamento: pergunta; "Continuar no Completo" não muda nada.
  await page.goto(B + '?pacote=essencial');
  await ready(page);
  await page.getByRole('button', { name: 'Continuar no Completo' }).click();
  const kept = await stored(page);
  assert.equal(kept.pkg, 'completo'); assert.deepEqual(kept.sections, before.sections);
  assert.equal(kept.name, 'Clima Sul');
  // Aplicar o outro pacote só com confirmação.
  await page.goto(B + '?pacote=profissional');
  await ready(page);
  assert(await page.getByText('Você já tem uma prévia no Completo. Aplicar o Profissional (R$ 750) a ela?').isVisible());
  await page.getByRole('button', { name: 'Aplicar o Profissional' }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4') || '{}').pkg === 'profissional');
  assert.equal((await stored(page)).name, 'Clima Sul', 'nada do que foi feito se perde');
});

await scenario('Exemplos públicos preenchidos: sem "Sua foto", "Item 1" ou "Foto do item"; galeria no limite do pacote', async (page) => {
  await page.goto(URL);
  const cards = page.locator('#exemplos button[class*=exampleCard]');
  const dialog = page.locator('dialog[open]');
  const bad = ['sua foto', 'item 1', 'foto do item', 'foto do imóvel', 'imóvel demonstrativo'];
  for (let i = 0; i < (await cards.count()); i++) {
    const card = await cards.nth(i).innerText();
    assert(/Pacote (Essencial|Profissional|Completo)/.test(card) && card.includes('Ver este exemplo'), 'cartão com pacote e ação');
    assert((await cards.nth(i).locator('[class*=examplePurpose]').innerText()).length > 10, 'cartão com a finalidade');
    await cards.nth(i).evaluate((e) => e.click());
    for (const device of ['Computador', 'Celular']) {
      await dialog.getByRole('group', { name: 'Ver o exemplo no' }).getByRole('button', { name: device }).click();
      const t = (await dialog.locator('[aria-roledescription=prévia]').innerText()).toLowerCase();
      for (const b of bad) assert(!t.includes(b), `${card.split('\n')[0]} (${device}): sem "${b}"`);
    }
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Ver este exemplo: Alimentação' }).click();
  const food = (await dialog.innerText()).toLowerCase();
  assert(food.includes('pacote completo') && food.includes('até 15 fotos') && !food.includes('até 8'), 'Completo com a galeria do Completo');
  assert((await dialog.getByRole('button', { name: /^Usar este modelo/ }).innerText()).includes('Completo · R$ 1.000'));
});

await scenario('Celular 390px: exemplo abre na versão de celular de verdade, sem moldura nem rolagem lateral', async (page) => {
  await page.goto(URL);
  await page.getByRole('button', { name: 'Ver este exemplo: Imóveis e corretores' }).click();
  const dialog = page.locator('dialog[open]');
  assert.equal(await dialog.getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed'), 'true', 'no celular abre a versão de celular');
  const mob = dialog.locator('[class*=demoMobile] [aria-roledescription=prévia]');
  await mob.waitFor();
  const box = await mob.boundingBox();
  assert(box.width >= 300 && box.width <= 390, `ocupa a largura da tela (${box.width})`);
  assert.equal(await dialog.locator('[class*=phoneFrame], [class*=PhoneFrame]').count(), 0, 'sem moldura de celular dentro do celular');
  assert.equal(await dialog.evaluate((d) => d.scrollWidth <= d.clientWidth + 1), true, 'sem rolagem lateral no exemplo');
  assert(await dialog.getByRole('button', { name: /^Usar este modelo/ }).isVisible());
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const [width, height] of [[360, 740], [390, 844], [430, 932]]) {
  await scenario(`Apresentação ${width}px: título, preço e botão principal na primeira tela`, async (page) => {
    await page.goto(URL);
    const cta = await heroCta(page).boundingBox();
    assert(cta.y + cta.height <= height, `botão principal visível sem rolar (${Math.round(cta.y + cta.height)} de ${height})`);
    assert(cta.height >= 44, 'toque confortável');
    assert(await page.getByText('Desenvolvimento de R$ 500 a R$ 1.000.').isVisible());
    assert.equal(await scrollWidth(page), width);
    const ev = await allEvents(page);
    assert(ev.every((e) => e.device === 'celular'), 'eventos com a categoria do aparelho');
    // Com um "Criar prévia com o …" à vista, o botão flutuante não duplica nem cobre.
    await page.getByRole('link', { name: 'Criar prévia com o Profissional' }).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('[data-float]')?.hasAttribute('data-shown'));
  }, { viewport: { width, height }, isMobile: true, hasTouch: true });
}

for (const [width, height, label] of [[768, 1024, 'tablet'], [1024, 768, 'computador'], [1440, 900, 'computador'], [844, 390, 'celular deitado']]) {
  await scenario(`${width}×${height} (${label}): apresentação e criação sem rolagem lateral`, async (page) => {
    await page.goto(URL);
    assert(await page.getByRole('heading', { level: 1 }).isVisible());
    assert.equal(await scrollWidth(page), width);
    assert.equal(await page.getByRole('link', { name: /^Criar prévia com o/ }).count(), 3);
    await page.goto(B);
    await ready(page);
    assert.equal(await scrollWidth(page), width);
    await business(page);
    await next(page); await next(page);
    assert.equal(await title(page), Q.pronta);
    assert(await visible(page.getByRole('button', { name: 'Gostei assim — revisar e solicitar' })).isVisible());
    assert.equal(await scrollWidth(page), width);
  }, { viewport: { width, height }, isMobile: width === 844, hasTouch: width === 844 });
}

await scenario('Celular 390px: etapa em uma linha, pacote compacto e revisão com "Salvar ou compartilhar projeto"', async (page) => {
  await page.goto(B);
  await ready(page);
  const menu = page.locator('[class*=stepMenu] summary');
  assert(await menu.isVisible(), 'progresso compacto');
  assert((await menu.innerText()).startsWith('Etapa 1 de 4'));
  await business(page);
  await next(page); await next(page);
  await visible(page.getByRole('button', { name: 'Personalizar meu site' })).click();
  assert.equal(await title(page), Q.pacote);
  assert((await menu.innerText()).includes('Etapa 3 de 4'));
  assert(await page.getByText('Pacote inicial: você pode mudar, e nada é contratado agora.').first().isVisible());
  const group = page.getByRole('radiogroup', { name: 'Pacote' });
  const gb = await group.boundingBox();
  assert(gb.height < 200, `seletor compacto (${Math.round(gb.height)}px)`);
  // Continuar sem mudar confirma o pacote inicial.
  await next(page);
  assert.equal(await title(page), Q.estilo);
  assert.equal((await stored(page)).pkgChosen, true, 'continuar da etapa do pacote confirma a escolha');
  assert.equal(await page.getByText('Pacote inicial: você pode mudar').count(), 0, 'depois da escolha, sem o aviso de pacote inicial');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  assert.equal(await title(page), Q.pacote);
  await pkgRadio(page, 'Profissional').click();
  assert.equal(await pkgRadio(page, 'Profissional').getAttribute('aria-checked'), 'true');
  await menu.click();
  await page.locator('[class*=stepMenu] ol ol button', { hasText: 'Seções' }).click();
  await next(page);
  assert.equal(await title(page), Q.revisao);
  const save = page.locator('#salvar-compartilhar');
  assert.equal(await save.evaluate((e) => e.open), false, 'ferramentas agrupadas e recolhidas');
  await save.locator('summary').click();
  for (const n of ['Copiar resumo', 'Baixar meu projeto', 'Salvar resumo em PDF']) assert(await save.getByRole('button', { name: n }).isVisible(), n);
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('Reduzir e restaurar o pacote mantém a ordem das seções', async (page) => {
  await page.goto(B);
  const order = ['apresentacao', 'galeria', 'servicos', 'faq', 'vitrine', 'contato'];
  await page.evaluate((sections) => localStorage.setItem('mb.configurador.v4', JSON.stringify({ version: 4, flow: 'guiado-v2', name: 'Ordem', segment: 'local', pkg: 'completo', pkgChosen: true, structureEdited: true, sections, step: 3 })), order);
  await page.reload();
  await ready(page);
  await pkgRadio(page, 'Essencial').click();
  await page.getByRole('button', { name: /^Trocar para o Essencial/ }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4')).pkg === 'essencial');
  assert.deepEqual((await stored(page)).sections, ['apresentacao', 'servicos', 'contato']);
  await pkgRadio(page, 'Completo').click();
  const restoreBtn = page.getByRole('button', { name: 'Restaurar no Completo' });
  if (await restoreBtn.count()) await restoreBtn.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4')).sections.length === 6);
  assert.deepEqual((await stored(page)).sections, order, 'mesma ordem de antes');
});

await scenario('WhatsApp: textos gerados não aparecem como escritos pela pessoa; referência igual à do arquivo', async (page) => {
  await page.goto(B);
  await page.evaluate(() => localStorage.setItem('mb.configurador.v4', JSON.stringify({ version: 4, flow: 'guiado-v2', name: 'Clima', segment: 'local', headline: 'Título que veio da IA', description: 'Frase da IA', services: ['A', 'B'], aiFilled: { name: 'Clima', segment: 'local', segmentOther: '' }, step: 9 })));
  await page.reload();
  await ready(page);
  const msg = await waMessage(page);
  assert(msg.includes('TEXTOS ESCOLHIDOS PARA A PRÉVIA'));
  assert(!/QUE EU ESCREVI|EDITEI|Código do projeto/.test(msg));
  const id = (await stored(page)).id;
  assert(msg.includes(`Referência (a mesma do arquivo do projeto): ${id}`));
});

await scenario('Modelo de estética + descrição de imobiliária: o segmento acompanha a descrição', async (page) => {
  const answer = { name: 'Clara Imóveis', segment: 'imoveis', segmentOther: '', service: 'Compra e venda de imóveis', objective: 'agendamento', headline: 'Encontre seu imóvel com orientação', description: 'Converse sobre compra e venda de imóveis.', services: ['Compra', 'Venda', 'Avaliação'], sections: ['servicos', 'sobre', 'processo'], extraSections: [], direction: 'sofisticado', palette: 'azul', brandColor: null, needs: [], previewCopy: { about: 'Corretora com atendimento próximo.', serviceDetails: ['a', 'b', 'c'], differentials: [], processSteps: [], faqQuestions: [] } };
  await page.route('https://ia.test/preview', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: answer }) }));
  await page.goto(URL_AI);
  await page.getByRole('button', { name: 'Ver este exemplo: Beleza e estética' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: /^Usar este modelo/ }).click();
  await page.waitForURL(/criar/);
  await ready(page);
  await visible(page.getByRole('button', { name: 'Editar minha descrição' })).click();
  await page.getByRole('button', { name: 'Prefiro digitar' }).click();
  await page.locator('#descricao-ia').fill('Sou corretora de imóveis, ajudo famílias a comprar e vender imóveis e quero agendar visitas.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4') || '{}').segment === 'imoveis');
  assert((await preview(page).innerText()).toLowerCase().includes('imóveis'), 'selo da prévia coerente');
  assert(!(await waMessage(page).catch(() => '')).includes('Beleza e estética'));
});

await scenario('Segmento escolhido à mão diferente da descrição: a tela pergunta, sem trocar sozinha', async (page) => {
  const reply = { name: '', segment: 'consultoria', segmentOther: '', service: '', objective: 'orcamento', headline: '', description: '', services: [], sections: [], extraSections: [], direction: 'essencial', palette: 'azul', brandColor: null, needs: [], previewCopy: { about: '', serviceDetails: [], differentials: [], processSteps: [], faqQuestions: [] } };
  await page.route('https://ia.test/preview', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: reply }) }));
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByRole('button', { name: 'Prefiro escolher tudo passo a passo' }).click();
  await page.getByRole('radio', { name: 'Alimentação' }).click();
  await page.getByRole('button', { name: /Prefiro descrever/ }).click();
  await page.getByRole('button', { name: 'Prefiro digitar' }).click().catch(() => {});
  await page.locator('#descricao-ia').fill('Faço consultoria financeira para pequenas empresas e quero receber pedidos de diagnóstico.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  const box = page.getByText(/Sua descrição parece de Consultoria/);
  await box.waitFor();
  assert.equal((await stored(page)).segment, 'alimentacao', 'não troca sozinho');
  await page.getByRole('button', { name: 'Usar Consultoria' }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4') || '{}').segment === 'consultoria');
  assert.equal(await box.count(), 0);
});

await scenario('Navegador do Instagram: aviso sobre o microfone e opção de digitar', async (page) => {
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  assert(await page.getByText('No navegador do Instagram ou do Facebook, o microfone pode não funcionar.').isVisible());
  assert(await page.getByRole('button', { name: 'Prefiro digitar' }).isVisible());
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0' });

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
  await next(page); await next(page);
  await page.getByRole('button', { name: 'Gostei assim — revisar e solicitar' }).click();
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
