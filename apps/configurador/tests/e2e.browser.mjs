// Cenários de navegador. Requer o Playwright (npm i -D playwright) e dois builds servidos:
//   BASE: build normal (modo WhatsApp) em http://localhost:4190/Matheus-Performance/configurador/
//   BASE_R: build com NEXT_PUBLIC_LEAD_ENDPOINT=https://receptor.test/leads (o teste intercepta essa URL)
//   BASE_AI: build com NEXT_PUBLIC_AI_ENDPOINT=https://ia.test/preview (o teste simula o servidor da IA)
// Rode: BASE=... BASE_R=... BASE_AI=... node tests/e2e.browser.mjs   (CHROMIUM=/caminho opcional)
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
const heroCta = (page) => page.locator('a[data-main-cta][class*=shine]');
/** Botão flutuante "Gerar minha prévia gratuita" (aparece quando o botão do topo sai da tela). */
const floating = (page) => page.locator('[data-floating-cta]');
const floatShown = (page) => floating(page).evaluate((e) => e.hasAttribute('data-show') && getComputedStyle(e).visibility === 'visible');
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
  if ((await title(page)) === Q.pronta) await visible(page.getByRole('button', { name: /^Personalizar( meu site)?$/ })).click();
  for (let i = 0; i < 7 && (await title(page)) !== question; i++) await next(page);
  assert.equal(await title(page), question);
}

/* ── Página inicial ────────────────────────────────────────────────────── */

const EX = URL + 'exemplos/';
const PK = URL + 'pacotes/';
/** Cartões de modelo (sem o cartão "Outro segmento"). */
const modelCards = (page) => page.locator('#modelos li[class*=exampleCard]:not([class*=otherCard])');
const modelCard = (page, name) => modelCards(page).filter({ has: page.getByRole('heading', { name, exact: true }) });

await scenario('Início: título curto, projeto real, uma ação principal, preço em uma linha, projetos, benefícios, como funciona, pacotes e sob medida, Matheus, dúvidas e chamada final', async (page) => {
  await page.goto(URL);
  assert.equal((await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ').trim(), 'Um site à altura da sua empresa.');
  const hero = page.locator('main > section').first();
  const text = (await hero.innerText()).replace(/\s+/g, ' ');
  for (const s of [
    'Apresente seus serviços com clareza e facilite os pedidos de orçamento. Veja uma prévia grátis ou converse sobre o seu projeto.',
    'Sem cadastro. Sem compromisso.',
    'Sites de página única: R$ 500 a R$ 1.000.',
    'Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.',
    'Outras necessidades: orçamento sob medida',
  ])
    assert(text.includes(s), s);
  assert.equal((await heroCta(page).innerText()).trim(), 'Gerar minha prévia gratuita');
  assert((await heroCta(page).getAttribute('href')).endsWith('/configurador/criar/'), 'botão principal abre a criação');
  assert((await hero.getByRole('link', { name: 'Ver pacotes e condições' }).getAttribute('href')).endsWith('/configurador/pacotes/'));
  assert.equal(await hero.getByRole('link', { name: 'Outras necessidades: orçamento sob medida' }).getAttribute('href'), '#contratar');
  // Conversa direta, sem passar pelo configurador: link leve, não um segundo botão.
  const talk = hero.getByRole('link', { name: /Conversar sobre meu projeto/ });
  const href = await talk.getAttribute('href');
  assert(href.startsWith('https://wa.me/') && decodeURIComponent(href).includes('quero conversar sobre o site da minha empresa'));
  assert.equal(await talk.getAttribute('target'), '_blank');
  assert.equal(await hero.locator('a[class*=primary], a[class*=secondary]').count(), 1, 'uma só ação principal no topo');
  // Destaque visual: captura real publicada, carregada de imediato, com legenda que não fica coberta.
  const fig = page.locator('main figure').first();
  const shot = fig.locator('img').first();
  assert((await shot.getAttribute('alt')).includes('Schay Corretora'));
  assert.equal(await shot.getAttribute('fetchpriority'), 'high');
  assert.notEqual(await shot.getAttribute('loading'), 'lazy');
  assert.equal((await fig.locator('figcaption').innerText()).replace(/\s+/g, ' ').trim(), 'Projeto publicado · Schay Corretora');
  const cap = await fig.locator('figcaption').boundingBox();
  const phone = await fig.locator('[class*=phone]').boundingBox();
  assert(cap.y >= phone.y + phone.height - 1 || cap.x + cap.width <= phone.x + 1, 'legenda fora do celular');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((x) => x.id));
  assert.deepEqual(ids, ['projetos', 'beneficios', 'como-funciona', 'contratar', 'quem-atende', 'perguntas']);
  // Projetos reais: captura estática, selo, segmento, nome, necessidade, o que foi feito e duas ações.
  const projects = page.locator('#projetos');
  assert.equal((await projects.getByRole('heading', { level: 2 }).innerText()).replace(/\s+/g, ' ').trim(), 'Da ideia ao ar: conheça sites que criamos.');
  assert.deepEqual(await projects.locator('h3').allInnerTexts(), ['Schay Corretora', 'Matheus Beck — Gestão de Tráfego e Posicionamento Digital']);
  const cards = projects.locator('li');
  const c0 = await cards.nth(0).innerText();
  for (const s of ['Projeto publicado', 'Mercado imobiliário', 'Site imobiliário com apresentação profissional', 'Ver detalhes']) assert(c0.includes(s), s);
  // A necessidade atendida fica em "Ver detalhes", inteira.
  await cards.nth(0).locator('summary').click();
  assert((await cards.nth(0).innerText()).includes('Necessidade: Apresentar a corretora e os imóveis com credibilidade'));
  // Lado a lado no computador: sem controles de carrossel.
  assert.equal(await projects.locator('[class*=carouselNav]').isVisible(), false, 'sem setas no computador');
  assert(!c0.includes('Projeto da própria marca'), 'cliente não aparece como marca própria');
  assert((await cards.nth(1).innerText()).includes('Marketing e serviços profissionais') && (await cards.nth(1).innerText()).includes('Projeto da própria marca'));
  for (const [name, url] of [['Schay Corretora', 'https://schaycorretora.com.br/'], ['Matheus Beck — Gestão de Tráfego e Posicionamento Digital', 'https://theusmkt.github.io/Matheus-Performance/']]) {
    const link = projects.getByRole('link', { name: `Visitar site: ${name} (abre em nova aba)` });
    assert.equal(await link.getAttribute('href'), url);
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
    const chat = projects.getByRole('link', { name: `Conversar sobre um projeto assim: ${name} (abre o WhatsApp em nova aba)` });
    assert(decodeURIComponent(await chat.getAttribute('href')).includes(`“${name}”`), `mensagem cita ${name}`);
  }
  assert.equal(await page.locator('iframe').count(), 0, 'sem iframes');
  const imgs = await projects.locator('img').evaluateAll((els) => els.map((e) => [e.getAttribute('width'), e.getAttribute('height'), e.loading, e.getAttribute('srcset')?.includes('1280w'), e.alt]));
  for (const [w, h, loading, srcset, alt] of imgs) assert(w && h && loading === 'lazy' && srcset && alt.length > 10, 'imagem responsiva, adiada e com texto alternativo');
  assert(!/R\$/.test(await projects.innerText()), 'projeto sem preço ou pacote');
  // Benefícios e como funciona (demonstração identificada como ilustrativa).
  assert.deepEqual(await page.locator('#beneficios h3').allInnerTexts(), ['Serviços bem apresentados', 'A identidade do seu negócio', 'Contato em poucos toques']);
  assert.deepEqual(await page.locator('#como-funciona ol h3').allInnerTexts(), ['Conte sobre o negócio', 'Veja e ajuste a prévia', 'Converse e confirme']);
  assert((await page.locator('#como-funciona').innerText()).includes('Exemplo ilustrativo do configurador'));
  // Dois caminhos: pacotes (valores de packages.ts) e sob medida.
  const paths = page.locator('#contratar');
  const pt = (await paths.innerText()).replace(/\s+/g, ' ');
  for (const s of ['Essencial', 'R$ 500', 'Apresentar a empresa e os serviços.', 'Profissional', 'R$ 750', 'Completo', 'R$ 1.000', 'Domínio e hospedagem à parte.', 'Seu projeto precisa ir além de uma página?', 'Conte o que sua empresa precisa. Definimos o escopo e preparamos uma proposta de acordo com o projeto.']) assert(pt.includes(s), s);
  assert(!/sistema|integraç|loja virtual|login/i.test(pt), 'sob medida sem prometer sistemas ou integrações');
  assert(decodeURIComponent(await paths.getByRole('link', { name: /Conversar sobre um projeto sob medida/ }).getAttribute('href')).includes('ir além de uma página'));
  assert((await page.getByRole('link', { name: 'Explorar exemplos de sites' }).getAttribute('href')).endsWith('/configurador/exemplos/'));
  assert((await page.getByRole('link', { name: 'Ver pacotes e valores' }).getAttribute('href')).endsWith('/configurador/pacotes/'));
  // Sem galeria nem comparação extensa na página inicial.
  assert.equal(await page.locator('main [class*=exampleCard], main table, main [class*=compareBlocks]').count(), 0);
  assert.equal(await page.getByRole('link', { name: /Criar prévia com/ }).count(), 0);
  // Matheus, com foto e atendimento direto.
  assert((await page.locator('#quem-atende img').getAttribute('alt')).includes('Matheus Beck'));
  assert(await page.locator('#quem-atende').getByRole('link', { name: /Conversar com o Matheus/ }).isVisible());
  // No computador nada flutua sobre o conteúdo (o botão flutuante é só do celular); decoração não recebe toques.
  const fixed = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 0).length);
  assert.equal(fixed, 0, 'sem elementos fixos sobre o conteúdo');
  assert.equal(await page.locator('[class*=halo]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).pointerEvents !== 'none').length), 0, 'halo não intercepta toques');
  const body = await page.locator('body').innerText();
  for (const bad of [/minutos/, /\+ ?R\$/, /a partir de R/i, /garant/i, /mais vendido/i, /restam|últimas vagas|apenas hoje/i, /depoimento aqui/i, /aument\w* (as |suas )?vendas/i]) assert(!bad.test(body), bad);
  // Clique no WhatsApp é registrado como clique, com a origem.
  await page.evaluate(() => (window.open = () => null));
  await talk.click({ modifiers: [] }).catch(() => {});
  let ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'whatsapp_open' && e.context === 'inicio'), 'origem do contato: início');
  await heroCta(page).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  ev = await allEvents(page);
  assert.equal(ev.find((e) => e.event === 'start_click').context, 'hero');
});

await scenario('Menos movimento: botão e vitrine parados', async (page) => {
  await page.goto(URL);
  const names = await page.evaluate(() => [
    getComputedStyle(document.querySelector('a[data-main-cta][class*=shine]'), '::after').animationName,
    ...[...document.querySelectorAll('main figure *')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
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

await scenario('Perguntas: 6 prioritárias primeiro e todas as 12', async (page) => {
  await page.goto(URL);
  const list = page.locator('#lista-perguntas summary');
  assert.equal(await list.count(), 6);
  assert.equal(await list.first().innerText(), 'A prévia grátis já é o meu site?');
  await page.getByRole('button', { name: /Ver todas as perguntas/ }).click();
  assert.equal(await list.count(), 12);
  const all = await page.locator('#lista-perguntas').textContent();
  for (const s of ['Existe mensalidade?', 'Quem fica com o domínio e os acessos?', '3 a 12 dias úteis', 'O domínio (o endereço do site) e a hospedagem são pagos à parte']) assert(all.includes(s), s);
});

await scenario('Atalhos antigos: #exemplos e #investimento levam às páginas novas', async (page) => {
  const at = (re) => page.waitForFunction((src) => new RegExp(src).test(location.href), re.source);
  await page.goto(URL + '#exemplos');
  await at(/\/exemplos\/$/);
  await page.locator('#modelos').waitFor();
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Inspire-se no próximo site da sua empresa.');
  await page.goto(URL + '#investimento');
  await at(/\/pacotes\/$/);
  await page.locator('#detalhes').waitFor();
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Escolha como sua empresa vai se apresentar ao mundo.');
});

await scenario('Campanha de um segmento (?segmento=): os exemplos abrem filtrados', async (page) => {
  const at = (re) => page.waitForFunction((src) => new RegExp(src).test(location.href), re.source);
  // A primeira origem da sessão vale: o visitante de campanha chega por este link.
  await page.goto(URL + '?segmento=beleza');
  await page.waitForFunction(() => document.querySelector('#exemplos a')?.getAttribute('href')?.endsWith('?segmento=beleza'));
  await page.getByRole('link', { name: 'Explorar exemplos de sites' }).click();
  await at(/\/exemplos\/\?segmento=beleza$/);
  await page.waitForFunction(() => document.querySelector('[aria-label="Filtrar modelos por segmento"] [aria-pressed=true]')?.textContent === 'Beleza e estética');
  assert.equal(await modelCards(page).count(), 1);
});

await scenario('Menu, rodapé e página atual: links das páginas novas em todas as páginas', async (page) => {
  for (const [path, current] of [['', null], ['exemplos/', 'Exemplos'], ['pacotes/', 'Pacotes'], ['privacidade/', null]]) {
    await page.goto(URL + path);
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    assert((await nav.getByRole('link', { name: 'Exemplos' }).first().getAttribute('href')).endsWith('/configurador/exemplos/'));
    assert((await nav.getByRole('link', { name: 'Pacotes' }).first().getAttribute('href')).endsWith('/configurador/pacotes/'));
    const how = await nav.getByRole('link', { name: 'Como funciona' }).first().getAttribute('href');
    assert(path === '' ? how === '#como-funciona' : how.endsWith('/configurador/#como-funciona'), how);
    assert.equal(await nav.locator('a[aria-current=page]').first().innerText().catch(() => null), current);
    const footer = page.locator('footer');
    assert((await footer.getByRole('link', { name: 'Exemplos de sites' }).getAttribute('href')).endsWith('/configurador/exemplos/'));
    assert((await footer.getByRole('link', { name: 'Pacotes e valores' }).getAttribute('href')).endsWith('/configurador/pacotes/'));
    assert((await footer.getByRole('link', { name: 'Início', exact: true }).getAttribute('href')).endsWith('/configurador/'));
  }
  await page.goto(PK);
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Como funciona' }).first().click();
  await page.waitForFunction(() => location.href.endsWith('/configurador/#como-funciona'));
});

await scenario('Menu do celular: abre, fecha com Esc e ao escolher, sem rolagem lateral', async (page) => {
  await page.goto(URL);
  const summary = page.locator('header summary');
  assert.equal((await summary.innerText()).trim(), 'Menu');
  await summary.click();
  const menu = page.locator('#menu-celular');
  assert(await menu.isVisible());
  for (const name of ['Exemplos', 'Como funciona', 'Pacotes', 'Perguntas', 'Gerar minha prévia gratuita']) assert(await menu.getByRole('link', { name }).isVisible(), name);
  const heights = await menu.locator('a').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  assert(heights.every((h) => h >= 44), `toque confortável: ${heights}`);
  await page.keyboard.press('Escape');
  assert.equal(await menu.isVisible(), false, 'Esc fecha');
  await summary.click();
  await menu.getByRole('link', { name: 'Perguntas' }).click();
  await page.waitForFunction(() => !document.querySelector('header details')?.open);
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const phone390 = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const carouselPos = (page) => page.locator('#projetos [class*=carouselPos]').innerText();

await scenario('Celular: projetos reais em carrossel (Schay primeiro), próximo cartão aparecendo, "1 de 2", setas e teclado', async (page) => {
  await page.goto(URL);
  const projects = page.locator('#projetos');
  await projects.scrollIntoViewIfNeeded();
  assert.deepEqual(await projects.locator('h3').allInnerTexts(), ['Schay Corretora', 'Matheus Beck — Gestão de Tráfego e Posicionamento Digital']);
  const region = projects.getByRole('region', { name: 'Projetos reais' });
  assert.equal(await region.getAttribute('aria-roledescription'), 'carrossel');
  const boxes = await projects.locator('li').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.width]; }));
  assert(boxes[0][0] >= 0 && boxes[0][0] + boxes[0][1] < 390, 'primeiro cartão inteiro');
  assert(boxes[1][0] < 390 && boxes[1][0] + boxes[1][1] > 390, 'o próximo cartão aparece na borda');
  assert.equal(await scrollWidth(page), 390, 'sem rolagem lateral da página');
  assert(await projects.getByText('Arraste para ver outro projeto').isVisible());
  assert.equal(await carouselPos(page), '1 de 2');
  const prev = projects.getByRole('button', { name: 'Projeto anterior' });
  const nextBtn = projects.getByRole('button', { name: 'Próximo projeto' });
  assert(await prev.isDisabled() && !(await nextBtn.isDisabled()), 'anterior desativado no início');
  for (const b of [prev, nextBtn]) {
    const box = await b.boundingBox();
    assert(box.width >= 44 && box.height >= 44, 'setas com 44 px');
  }
  // Sem avanço automático.
  await page.waitForTimeout(2500);
  assert.equal(await carouselPos(page), '1 de 2');
  await nextBtn.click();
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '2 de 2');
  assert(await nextBtn.isDisabled(), 'próximo desativado no fim (sem loop)');
  // Teclado: volta com Enter no botão anterior.
  await prev.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '1 de 2');
  // Arrastar (rolagem nativa) também atualiza o indicador.
  await page.locator('[data-carousel]').evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '2 de 2');
  const snap = await page.locator('[data-carousel]').evaluate((el) => getComputedStyle(el).scrollSnapType);
  assert(snap.includes('x') && snap.includes('mandatory'), `scroll-snap: ${snap}`);
  // Gestos: este Chromium de teste não converte toque sintetizado em rolagem (nem da página),
  // então o arraste com o dedo é conferido no aparelho. Aqui: rolagem horizontal de trackpad/roda
  // começando em cima de "Visitar site" (não abre o link), volta, gesto vertical sobre o carrossel
  // e zoom por pinça.
  await page.locator('[data-carousel]').evaluate((el) => el.scrollTo({ left: 0, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '1 de 2');
  const opened = [];
  page.context().on('page', (p) => opened.push(p.url()));
  const visit = await projects.locator('li').first().getByRole('link', { name: /Visitar site/ }).boundingBox();
  await page.mouse.move(visit.x + visit.width / 2, visit.y + visit.height / 2);
  await page.mouse.wheel(300, 0);
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '2 de 2');
  await page.mouse.wheel(-300, 0);
  await page.waitForFunction(() => document.querySelector('#projetos [class*=carouselPos]')?.textContent === '1 de 2');
  assert.equal(page.url(), URL, 'rolar não navega');
  const cdp = await page.context().newCDPSession(page);
  await page.locator('[data-carousel] li').first().evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const box = await page.locator('[data-carousel] li').first().boundingBox();
  const y0 = await page.evaluate(() => scrollY);
  await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + 100), yDistance: -300, gestureSourceType: 'mouse', speed: 900 });
  await page.waitForFunction((y) => scrollY > y + 100, y0);
  assert.deepEqual(opened, [], 'nenhuma aba aberta durante os gestos');
  // Zoom por pinça continua permitido.
  const meta = await page.locator('meta[name=viewport]').getAttribute('content');
  assert(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(meta), `zoom permitido: ${meta}`);
  await cdp.send('Input.synthesizePinchGesture', { x: 195, y: 400, scaleFactor: 2, gestureSourceType: 'mouse' });
  await page.waitForFunction(() => (window.visualViewport?.scale ?? 1) > 1.2);
}, phone390);

await scenario('Celular: botão flutuante "Gerar minha prévia gratuita" aparece quando o do topo sai da tela e some perto da chamada final', async (page) => {
  await page.goto(URL);
  const f = floating(page);
  assert.equal(await floatShown(page), false, 'escondido no topo');
  assert.equal(await f.getAttribute('aria-hidden'), 'true');
  assert.equal(await f.locator('a').getAttribute('tabindex'), '-1', 'fora da ordem do teclado quando escondido');
  await page.locator('#beneficios').evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('[data-floating-cta]')?.hasAttribute('data-show'));
  assert(await floatShown(page));
  await page.waitForTimeout(400); // entrada curta (sobe 0,28 s)
  const link = f.getByRole('link', { name: 'Gerar minha prévia gratuita' });
  assert((await link.getAttribute('href')).endsWith('/configurador/criar/'));
  const lb = await link.boundingBox();
  assert(lb.height >= 44 && lb.y + lb.height <= 844 && lb.x >= 0 && lb.x + lb.width <= 390, 'inteiro na tela, com toque confortável');
  // Menu aberto: o botão sai de cena.
  await page.locator('header summary').click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-floating-cta]')).visibility === 'hidden');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-floating-cta]')).visibility === 'visible');
  // Chamada final na tela: um botão só.
  await page.locator('#final-titulo').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForFunction(() => !document.querySelector('[data-floating-cta]')?.hasAttribute('data-show'));
  // Fim da página: o último link do rodapé não fica coberto.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const last = await page.locator('footer a').last().boundingBox();
  const fb = await f.boundingBox();
  assert(!(await floatShown(page)) || last.y + last.height <= fb.y, 'rodapé livre');
  // Sem pulsar sem fim.
  const infinite = await f.locator('a').evaluate((a) => [getComputedStyle(a), getComputedStyle(a, '::after')].some((c) => c.animationIterationCount === 'infinite'));
  assert.equal(infinite, false);
  // Clique registrado com a origem.
  await page.locator('#beneficios').evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('[data-floating-cta]')?.hasAttribute('data-show'));
  await link.click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  assert.equal((await allEvents(page)).find((e) => e.event === 'start_click').context, 'flutuante');
  assert.equal(await floating(page).count(), 0, 'nunca sobre a navegação do configurador');
  await page.goto(PK);
  assert.equal(await floating(page).count(), 0, 'pacotes: cada cartão já tem o seu botão');
  await page.goto(EX);
  assert.equal(await floating(page).count(), 1, 'exemplos: presente');
}, phone390);

await scenario('Contingência: aviso com contato só quando a página não inicia; carregamento normal não mostra nada (§15.5)', async (page, ctx) => {
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(4600);
  assert.equal(await page.locator('#app-fallback').isVisible(), false, 'carregamento normal: sem aviso');
  assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-app')), 'ok');
  // Parte interativa bloqueada: o aviso aparece, com links comuns e detalhes recolhidos.
  const broken = await ctx.newPage();
  await broken.route(/_next\/static\/chunks\/.*\.js$/, (r) => r.abort());
  await broken.goto(B, { waitUntil: 'load' });
  await broken.locator('#app-fallback').waitFor({ state: 'visible', timeout: 9000 });
  assert((await broken.locator('#app-fallback-wa').getAttribute('href')).startsWith('https://wa.me/'));
  assert((await broken.locator('#app-fallback').getByRole('link', { name: 'Ver pacotes e valores' }).getAttribute('href')).endsWith('/configurador/pacotes/'));
  assert.equal(await broken.locator('#app-fallback-tech').evaluate((d) => d.open), false, 'detalhes técnicos recolhidos');
  await broken.close();
});

await scenario('Compartilhamento: imagem .png de verdade, 1200×630, nos metadados das páginas públicas (§15.4)', async (page) => {
  for (const path of ['', 'exemplos/', 'pacotes/']) {
    await page.goto(URL + path);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    assert(og.endsWith('/configurador/compartilhar.png'), `${path}: ${og}`);
    assert.equal(await page.locator('meta[property="og:image:width"]').getAttribute('content'), '1200');
    assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute('content'), og);
  }
  const res = await page.request.get(URL + 'compartilhar.png');
  assert.equal(res.status(), 200);
  assert.equal(res.headers()['content-type'], 'image/png');
  const png = await res.body();
  assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
});

await scenario('Sem JavaScript: menu, páginas novas e links de pacote e modelo continuam funcionando', async (page) => {
  await page.goto(URL);
  await page.locator('header summary').click();
  await page.locator('#menu-celular').getByRole('link', { name: 'Pacotes' }).click();
  await page.waitForURL(/\/pacotes\/$/);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Escolha como sua empresa vai se apresentar ao mundo.');
  assert((await page.getByRole('link', { name: 'Criar prévia com este pacote: Profissional' }).getAttribute('href')).endsWith('/criar/?pacote=profissional'));
  assert(await page.locator('#comparar').isVisible(), 'comparação no HTML');
  await page.goto(EX);
  assert.equal(await page.getByRole('link', { name: 'Criar minha prévia com este modelo' }).count(), 8, 'um modelo por família visual');
  assert((await page.getByRole('link', { name: 'Criar minha prévia com este modelo' }).first().getAttribute('href')).endsWith('/criar/?modelo=local'));
  assert.equal(await page.getByRole('link', { name: /Visitar site/ }).count(), 2);
  // Atalho antigo sem script: a âncora cai no acesso aos exemplos.
  await page.goto(URL + '#exemplos');
  assert(await page.locator('#exemplos').getByRole('link', { name: 'Explorar exemplos de sites' }).isVisible());
}, { javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('Prévia salva: "Continuar minha prévia" em todas as páginas e nada é apagado ao navegar', async (page) => {
  await toReady(page);
  const before = await stored(page);
  for (const path of ['', 'exemplos/', 'pacotes/']) {
    await page.goto(URL + path);
    await page.waitForFunction(() => document.querySelector('header nav a[class*=navCta]')?.textContent === 'Continuar minha prévia');
  }
  await page.goto(URL);
  await page.waitForFunction(() => document.querySelector('a[data-main-cta][class*=shine]')?.textContent === 'Continuar minha prévia');
  assert(await page.getByRole('link', { name: 'Começar uma nova prévia' }).isVisible());
  assert.deepEqual(await stored(page), before, 'navegar não mexe no rascunho');
  await heroCta(page).click();
  await ready(page);
  assert.equal(await title(page), Q.pronta, 'volta para onde parou');
  assert((await preview(page).innerText()).includes('Clima Sul'));
});

await scenario('Teclado: foco visível e ordem lógica na página inicial e nas páginas novas', async (page) => {
  for (const path of ['', 'exemplos/', 'pacotes/']) {
    await page.goto(URL + path);
    const seen = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const e = document.activeElement;
        const cs = getComputedStyle(e);
        return { tag: e.tagName, text: (e.textContent || '').trim().slice(0, 40), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 };
      });
      if (info.tag === 'BODY') continue;
      assert(info.outline, `foco visível em ${info.tag} "${info.text}" (${path || 'início'})`);
      seen.push(info.text);
    }
    assert(seen.length >= 8, `percorre a página (${path || 'início'})`);
  }
}, { viewport: { width: 1280, height: 900 } });

/* ── Página de exemplos ────────────────────────────────────────────────── */

await scenario('Exemplos: dois grupos, projetos reais com "Visitar site" e modelos fiéis ao que abre', async (page) => {
  await page.goto(EX);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Inspire-se no próximo site da sua empresa.');
  assert.deepEqual(await page.locator('main h2').allInnerTexts(), ['Projetos reais', 'Modelos para imaginar o seu', 'Já sabe o que quer mostrar?']);
  const real = page.locator('#projetos-reais');
  assert.equal(await real.getByRole('link', { name: /^Visitar site: .*\(abre em nova aba\)$/ }).count(), 2);
  assert.equal(await real.locator('img').count(), 4, 'computador e celular de cada projeto');
  assert(!(await real.innerText()).includes('Criar minha prévia'), 'projeto real não vira modelo');
  const names = await modelCards(page).locator('h3').allInnerTexts();
  assert.deepEqual(names, ['Serviços locais', 'Beleza e estética', 'Consultoria e serviços profissionais', 'Alimentação', 'Arquitetura ou portfólio criativo', 'Imóveis e corretores', 'Veterinária e cuidados pet', 'Outro segmento']);
  assert(await page.getByRole('heading', { name: 'Outro segmento' }).isVisible());
  for (let i = 0; i < names.length; i++) {
    const t = await modelCards(page).nth(i).innerText();
    assert(t.includes('Modelo demonstrativo') && /Nome fictício: .+\. Montado no pacote (Essencial|Profissional|Completo) \(R\$ [\d.]+\)\./.test(t), `cartão identificado: ${names[i]}`);
  }
  const fams = await page.locator('#modelos [aria-roledescription=prévia]').evaluateAll((els) => els.map((e) => e.dataset.family));
  assert.equal(new Set(fams).size, 8, 'cada modelo com a sua família visual');
  const dialog = page.locator('dialog[open]');
  for (const [i, seg] of names.entries()) {
    const card = modelCards(page).nth(i);
    const id = (el) => el.evaluate((e) => [e.className, getComputedStyle(e).getPropertyValue('--acc'), e.getAttribute('aria-label'), e.querySelector('[class*=title]')?.textContent]);
    const cardId = await id(card.locator('[aria-roledescription=prévia]'));
    await card.getByRole('button', { name: 'Ver no computador e no celular' }).click();
    assert.deepEqual(await id(dialog.locator('[aria-roledescription=prévia]')), cardId, `modelo fiel: ${seg}`);
    await page.keyboard.press('Escape');
  }
  await modelCard(page, 'Beleza e estética').getByRole('button', { name: 'Ver no computador e no celular' }).click();
  assert((await dialog.innerText()).includes('Modelo demonstrativo'));
  await dialog.getByRole('button', { name: 'Celular' }).click();
  assert.equal(await dialog.getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed'), 'true');
  await dialog.getByRole('button', { name: /Próximo/ }).click();
  assert.equal(await dialog.locator('#exemplo-titulo').innerText(), 'Consultoria e serviços profissionais');
  assert((await dialog.getByRole('link', { name: 'Criar minha prévia com este modelo' }).getAttribute('href')).endsWith('/criar/?modelo=consultoria'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.textContent === 'Ver no computador e no celular' && document.activeElement.closest('li')?.textContent.includes('Consultoria'));
  assert((await page.getByRole('link', { name: 'Voltar ao início' }).getAttribute('href')).endsWith('/configurador/'));
  assert((await page.locator('main').getByRole('link', { name: 'Ver pacotes e valores' }).getAttribute('href')).endsWith('/configurador/pacotes/'));
});

await scenario('Modelo sem rascunho: "Criar minha prévia com este modelo" abre a prévia pronta com o modelo', async (page) => {
  await page.goto(EX);
  const cardClass = await modelCard(page, 'Beleza e estética').locator('[aria-roledescription=prévia]').getAttribute('class');
  await modelCard(page, 'Beleza e estética').getByRole('link', { name: 'Criar minha prévia com este modelo' }).click();
  await page.waitForURL(/\/criar\//);
  await ready(page);
  assert.equal(await title(page), Q.pronta, 'abre direto na prévia pronta');
  assert(!page.url().includes('modelo='), 'endereço limpo');
  assert.equal(await price(page), 'R$ 750');
  const plain = (c) => c.replace(/\S*__(bare|forceMobile|compact)\b/g, '').trim().replace(/\s+/g, ' ');
  assert.equal(plain(await preview(page).locator('[aria-roledescription=prévia]').getAttribute('class')), plain(cardClass), 'mesma composição do modelo');
  const saved = await stored(page);
  assert.deepEqual([saved.segment, saved.direction, saved.palette, saved.pkg], ['beleza', 'elegante', 'terracota', 'profissional']);
  assert.equal(saved.name, '', 'nome fictício não vira o nome da empresa');
  assert((await page.locator('[class*=notice][role=status]').innerText()).includes('Sua prévia começa com o modelo de Beleza e estética, no pacote Profissional — R$ 750.'));
  assert.equal(await page.getByText('Recuperar minha versão anterior').count(), 0, 'sem rascunho, nada para recuperar');
  const ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'start_click' && e.context === 'exemplo') && ev.some((e) => e.event === 'example_applied' && e.segment === 'beleza'));
});

await scenario('Modelo com rascunho: ver não mexe, usar pergunta antes, "Manter" preserva e dá para recuperar', async (page) => {
  await page.goto(B);
  await ready(page);
  await business(page, { name: 'Minha Loja', segment: 'Consultoria', service: 'Contabilidade' });
  await next(page);
  await page.getByRole('radio', { name: /^Ver meus serviços/ }).click();
  const before = await stored(page);
  await page.goto(EX);
  await modelCard(page, 'Alimentação').getByRole('button', { name: 'Ver no computador e no celular' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Computador' }).click();
  await page.keyboard.press('Escape');
  assert.deepEqual(await stored(page), before, 'ver um modelo não altera o rascunho');
  await modelCard(page, 'Alimentação').getByRole('link', { name: 'Criar minha prévia com este modelo' }).click();
  await ready(page);
  const box = page.locator('main [role=alertdialog]');
  await box.waitFor();
  assert((await box.innerText()).includes('substitui o seu rascunho') && (await box.innerText()).includes('fica guardada'));
  await box.getByRole('button', { name: 'Manter meu rascunho' }).click();
  const kept = await stored(page);
  assert.deepEqual([kept.segment, kept.service, kept.name], ['consultoria', 'Contabilidade', 'Minha Loja'], 'nada muda sem confirmar');
  await page.goto(EX);
  await modelCard(page, 'Alimentação').getByRole('link', { name: 'Criar minha prévia com este modelo' }).click();
  await ready(page);
  await page.locator('main [role=alertdialog]').getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('mb.configurador.v4') || '{}').segment === 'alimentacao');
  const used = await stored(page);
  assert.deepEqual([used.segment, used.pkg, used.name], ['alimentacao', 'completo', 'Minha Loja'], 'modelo inteiro, com o nome da empresa');
  await page.getByRole('button', { name: 'Recuperar minha versão anterior' }).click();
  const back = await stored(page);
  assert.deepEqual([back.segment, back.service, back.objective, back.name], ['consultoria', 'Contabilidade', 'servicos', 'Minha Loja']);
});

/* ── Página de pacotes ─────────────────────────────────────────────────── */

await scenario('Pacotes: abertura do maior para o menor, cartões enxutos, detalhes recolhíveis, selo e diferenças de R$ 250', async (page) => {
  await page.goto(PK);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Escolha como sua empresa vai se apresentar ao mundo.');
  assert((await page.locator('[class*=pageHead]').innerText()).includes('Compare o que cada pacote entrega e encontre a opção adequada para o seu negócio.'));
  assert.deepEqual(await page.locator('[class*=ladderName]').allInnerTexts(), ['Completo — R$ 1.000', 'Profissional — R$ 750', 'Essencial — R$ 500']);
  const card = (id) => page.locator(`#pacote-${id}`);
  const xs = await Promise.all(['essencial', 'profissional', 'completo'].map(async (id) => (await card(id).boundingBox()).x));
  assert(xs[0] < xs[1] && xs[1] < xs[2], 'computador: Essencial, Profissional e Completo lado a lado');
  assert.equal(await page.getByText('Equilíbrio entre apresentação e recursos').count(), 1);
  assert(await card('profissional').getByText('Equilíbrio entre apresentação e recursos').isVisible());
  for (const [id, name, purpose, deadline, step] of [
    ['essencial', 'Essencial', 'Apresentar a empresa e os serviços.', '3–5 dias úteis', ''],
    ['profissional', 'Profissional', 'Mostrar trabalhos e organizar solicitações.', '5–8 dias úteis', 'R$ 250 a mais que o Essencial'],
    ['completo', 'Completo', 'Apresentar produtos ou serviços com mais detalhe.', '7–12 dias úteis', 'R$ 250 a mais que o Profissional'],
  ]) {
    // textContent: o rótulo "Indicado para" aparece em caixa alta só pelo CSS.
    const t = (await card(id).evaluate((e) => e.textContent)).replace(/\s+/g, ' ');
    // Parte principal: sem abrir nada.
    for (const s of ['Pagamento único · domínio e hospedagem à parte', 'Indicado para', purpose, `Prazo: ${deadline} após o envio dos materiais`, step].filter(Boolean)) assert(t.includes(s), `${id}: ${s}`);
    for (const s of ['Pagamento único · domínio e hospedagem à parte', purpose]) assert(await card(id).getByText(s, { exact: false }).first().isVisible(), `${id}: ${s} visível sem abrir`);
    const points = await card(id).locator('[class*=tierKey] li').count();
    assert(points >= 3 && points <= 4, `${id}: 3 ou 4 diferenças (${points})`);
    const link = card(id).getByRole('link', { name: `Criar prévia com este pacote: ${name}` });
    assert((await link.getAttribute('href')).endsWith(`/criar/?pacote=${id}`));
    const talk = card(id).getByRole('link', { name: `Conversar sobre este pacote: ${name} (abre o WhatsApp em nova aba)` });
    assert(decodeURIComponent(await talk.getAttribute('href')).includes(`pacote ${name} (R$`), `${id}: mensagem com o pacote`);
    // Detalhamento recolhido, abre por clique/toque.
    const more = card(id).locator('details[class*=tierMore]');
    assert.equal(await more.evaluate((d) => d.open), false, `${id}: detalhes começam recolhidos`);
    assert.equal(await card(id).getByText('Recursos incluídos').isVisible(), false);
    await more.locator('summary').click();
    const full = await card(id).innerText();
    for (const s of ['Recursos incluídos', 'Página única e responsiva', 'Botão de WhatsApp', '2 rodadas de ajustes', `Prazo: ${deadline}, contados após o recebimento de textos, imagens e logo.`]) assert(full.includes(s), `${id} aberto: ${s}`);
  }
  const pro = await card('profissional').innerText();
  assert(pro.includes('R$ 250 a mais que o Essencial:') && pro.includes('galeria com até 8 fotos') && pro.includes('formulário que organiza a solicitação'));
  const com = await card('completo').innerText();
  assert(com.includes('R$ 250 a mais que o Profissional:') && com.includes('vitrine com até 10 produtos ou serviços') && com.includes('galeria com até 15 fotos'));
  assert.equal(await card('essencial').locator('li[data-extra]').count(), 0);
  assert.equal(await card('profissional').locator('li[data-extra]').count(), 4);
  // Teclado: Enter no resumo abre e fecha.
  const sum = card('essencial').locator('summary');
  await sum.focus();
  await page.keyboard.press('Enter');
  assert.equal(await card('essencial').locator('details[class*=tierMore]').evaluate((d) => d.open), false, 'Enter fecha');
  await page.keyboard.press('Enter');
  assert.equal(await card('essencial').locator('details[class*=tierMore]').evaluate((d) => d.open), true, 'Enter abre');
  // Preço em destaque, sem letras pequenas.
  const priceSize = await card('profissional').locator('[class*=tierPrice] strong').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  assert(priceSize >= 36, `preço em destaque (${priceSize}px)`);
  const small = await page.locator('main').evaluate((m) => [...m.querySelectorAll('p, li, td, th, dt, dd, a, span')].filter((e) => e.offsetParent && e.textContent.trim() && getComputedStyle(e).fontSize && parseFloat(getComputedStyle(e).fontSize) < 13).map((e) => e.textContent.trim().slice(0, 30)));
  assert.deepEqual(small, [], 'nada comercial abaixo de 13px');
  const cond = (await page.locator('#condicoes').innerText()).replace(/\s+/g, ' ');
  for (const s of ['Domínio e hospedagem', 'pagos à parte, direto aos fornecedores', 'Textos sugeridos pela IA', 'revisados com você', 'Produção de conteúdo', 'não está incluída nos pacotes', '2 rodadas de ajustes antes da publicação', 'orçadas à parte', 'Não há mensalidade de desenvolvimento', 'Seu projeto precisa ir além de uma página?']) assert(cond.includes(s), s);
  assert(await page.locator('#condicoes').getByRole('link', { name: /Conversar sobre um projeto sob medida/ }).isVisible());
  // No computador, a comparação completa já aparece aberta.
  assert.equal(await page.locator('#comparar details').evaluate((d) => d.open), true);
  assert((await page.locator('#comparar').innerText()).includes('Valor total'));
  const body = await page.locator('main').innerText();
  for (const bad of [/mais vendido/i, /desconto/i, /promo/i, /restam|últimas|apenas hoje|só hoje/i, /mensal/i]) assert(!bad.test(body.replace('Não há mensalidade de desenvolvimento', '')), bad);
  assert.equal(await page.locator('main s, main del').count(), 0, 'sem preço riscado');
  await card('profissional').getByRole('link', { name: /Conversar sobre este pacote/ }).click().catch(() => {});
  const ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'whatsapp_open' && e.context === 'pacote' && e.package === 'profissional'), 'origem do contato: pacote');
});

await scenario('Pacotes no celular: Profissional primeiro, cartões enxutos, comparação recolhida e nada cortado', async (page) => {
  await page.goto(PK);
  const ys = await Promise.all(['profissional', 'essencial', 'completo'].map(async (id) => (await page.locator(`#pacote-${id}`).boundingBox()).y));
  assert(ys[0] < ys[1] && ys[1] < ys[2], 'Profissional, Essencial e Completo');
  for (const id of ['profissional', 'essencial', 'completo']) {
    const b = await page.locator(`#pacote-${id}`).boundingBox();
    assert(b.x >= 0 && b.x + b.width <= 390, `cartão inteiro na tela: ${id}`);
    assert(b.height < 900, `cartão enxuto no celular: ${id} (${Math.round(b.height)}px)`);
  }
  const cmp = page.locator('#comparar details');
  assert.equal(await cmp.evaluate((d) => d.open), false, 'comparação completa recolhida no celular');
  await cmp.locator('summary').tap();
  assert(await page.locator('#comparar [class*=compareBlocks]').isVisible(), 'comparação em blocos');
  assert.equal(await page.locator('#comparar table').isVisible(), false);
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const width of [320, 360, 390, 430]) {
  await scenario(`Toque e leitura em ${width}px: sem rolagem lateral, alvos de 44px e texto de 15px ou mais nas páginas`, async (page) => {
    for (const path of ['', 'exemplos/', 'pacotes/']) {
      await page.goto(URL + path);
      assert.equal(await scrollWidth(page), width, `sem rolagem lateral (${path || 'início'})`);
      const tiny = await page.evaluate(() => [...document.querySelectorAll('main a, main button, main summary, header a, header summary, footer a')]
        .filter((e) => e.offsetParent && getComputedStyle(e).display !== 'inline' && !e.closest('[aria-hidden=true], [data-showcase], [class*=exampleThumb], p'))
        .map((e) => [e.textContent.trim().slice(0, 30), e.getBoundingClientRect().height]).filter(([, h]) => h < 43.9));
      assert.deepEqual(tiny, [], `alvos de toque (${path || 'início'})`);
      // Primeiro parágrafo de texto (selos e microtexto não contam).
      const body = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main p:not([class*=micro]):not([class*=pill])')).fontSize));
      assert(body >= 15, `texto principal (${body}px)`);
    }
  }, { viewport: { width, height: 740 }, isMobile: true, hasTouch: true });
}

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
  const styles = page.getByRole('radiogroup', { name: 'Estilo' });
  const suggestedStyle = await styles.locator('[role=radio][aria-checked=true]').getAttribute('aria-label');
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  assert.match(await site().getAttribute('class'), /escuro/, 'estilo na hora');
  assert.equal(await title(page), Q.estilo, 'não avança sozinho no clique');
  await page.getByRole('radio', { name: /^Elegante/ }).click();
  await page.getByRole('radio', { name: /^Escuro/ }).click();
  assert.notEqual(suggestedStyle, await styles.locator('[role=radio][aria-checked=true]').getAttribute('aria-label'));
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
  assert((await preview(page).innerText()).includes('Agendar horário'), 'botão de beleza: pedido de horário');
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
  assert.equal(await preview(page).locator('[data-section=vitrine]').count(), 1, 'vitrine na prévia');
  assert((await preview(page).locator('[data-section=vitrine]').innerText()).includes('sem pagamento online'), 'pedido pelo WhatsApp, sem pagamento online');
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
  assert.equal(await preview(page).locator('[data-section=vitrine]').count(), 0, 'a vitrine saiu da prévia');
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
  await page.goto(EX);
  const filter = page.getByRole('group', { name: 'Filtrar modelos por segmento' });
  assert.equal(await filter.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed'), 'true');
  // Filtros quebram linha: nenhum escondido para o lado.
  const fb = await filter.boundingBox();
  const chips = await filter.getByRole('button').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.right, r.height]; }));
  assert(chips.every(([right, h]) => right <= fb.x + fb.width + 1 && h >= 44), 'filtros visíveis e tocáveis');
  await filter.getByRole('button', { name: 'Imóveis e corretores' }).click();
  const cards = modelCards(page);
  assert.equal(await cards.count(), 1); assert.equal(await page.getByRole('heading', { name: 'Outro segmento' }).count(), 0);
  assert.equal(await filter.getByRole('button', { name: 'Imóveis e corretores' }).getAttribute('aria-pressed'), 'true', 'filtro ativo marcado');
  await cards.first().getByRole('button', { name: 'Ver no computador e no celular' }).click();
  assert.equal(await page.locator('#exemplo-titulo').innerText(), 'Imóveis e corretores');
  await page.keyboard.press('Escape');
  await filter.getByRole('button', { name: 'Todos' }).click();
  assert.equal(await cards.count(), 8);
  // Alimentação (Completo, com vitrine): cardápio por categorias, pedido pelo WhatsApp.
  await modelCard(page, 'Alimentação').getByRole('button', { name: 'Ver no computador e no celular' }).click();
  const food = await page.locator('dialog[open] [aria-roledescription=prévia]').innerText();
  assert(food.includes('Cardápio') && food.includes('pelo WhatsApp') && food.includes('sem pagamento online'));
  await page.keyboard.press('Escape');
  // Topo da página inicial: a vitrine usa o mesmo desenho das prévias (sem mockup à parte).
  await page.goto(URL);
  assert.equal(await page.locator('[data-showcase] [aria-roledescription=prévia]').count(), 2);
  // Imóveis com vitrine: imóveis demonstrativos, sem preço nem endereço inventados.
  await page.goto(B);
  await page.evaluate(() => localStorage.setItem('mb.configurador.v4', JSON.stringify({ version: 4, flow: 'guiado-v2', name: 'Casa Certa', segment: 'imoveis', objective: 'agendamento', pkg: 'completo', sections: ['apresentacao', 'vitrine', 'galeria', 'contato'], step: 9 })));
  await page.reload();
  await ready(page);
  const pv = (await preview(page).innerText()).toLowerCase();
  assert(pv.includes('imóveis em destaque') && pv.includes('casa com quintal') && pv.includes('agendar uma visita'), 'o estilo pode deixar títulos em maiúsculas');
  assert(pv.includes('imóveis ilustrativos') && pv.includes('sem preço, endereço ou disponibilidade'), 'vitrine marcada como ilustrativa');
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

const resetDialog = (page) => page.getByRole('dialog', { name: 'Começar uma nova prévia?' });

await scenario('Começar novamente: diálogo que não apaga ao abrir; cancelar, fechar e Esc preservam tudo; confirmar apaga só a prévia', async (page) => {
  await toSite(page);
  await page.evaluate(() => {
    localStorage.setItem('outro.site.dado', 'fica');
    sessionStorage.setItem('bp.descricao.v1', 'Rascunho da descrição da Clima Sul');
  });
  const before = await stored(page);
  const trigger = page.getByRole('button', { name: 'Começar novamente' });
  await trigger.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  for (const close of ['Continuar editando', 'Fechar e continuar editando', 'Escape']) {
    await trigger.click();
    const dialog = resetDialog(page);
    await dialog.waitFor();
    assert.deepEqual(await stored(page), before, 'abrir não apaga nada');
    assert.equal(await dialog.getAttribute('aria-describedby'), 'recomecar-texto');
    assert((await dialog.innerText()).includes('Não dá para desfazer'));
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Continuar editando', 'foco inicial no botão seguro');
    assert.equal(await page.evaluate(() => document.querySelector('main')?.matches(':modal') ?? false), false);
    if (close === 'Escape') await page.keyboard.press('Escape');
    else await dialog.getByRole('button', { name: close, exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await title(page), Q.revisao, `${close}: mesma etapa`);
    assert.deepEqual(await stored(page), before, `${close}: dados preservados`);
    assert.equal(await page.evaluate(() => scrollY), y, `${close}: mesma rolagem`);
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Começar novamente');
  }
  // Confirmar (com duplo toque): apaga só a prévia, volta à primeira etapa com foco no título e um aviso.
  await trigger.click();
  await resetDialog(page).getByRole('button', { name: 'Apagar escolhas e recomeçar' }).dblclick();
  await resetDialog(page).waitFor({ state: 'hidden' });
  assert.equal(await title(page), Q.negocio);
  assert.equal(await page.locator('#nome-empresa').inputValue(), '');
  await page.waitForFunction(() => document.activeElement?.id === 'etapa-titulo');
  assert((await page.locator('[class*=notice]').innerText()).includes('Prévia apagada'));
  assert.equal(await page.evaluate(() => localStorage.getItem('outro.site.dado')), 'fica', 'o resto do armazenamento fica');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('bp.descricao.v1')), null, 'rascunho da descrição apagado');
  assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-modal-open')), false, 'rolagem liberada');
});

await scenario('"Começar uma nova prévia" na apresentação abre o mesmo diálogo', async (page) => {
  await toSite(page);
  await page.goto(URL);
  // O rótulo muda depois que a página lê o projeto salvo (após carregar).
  await page.getByRole('link', { name: 'Começar uma nova prévia' }).waitFor();
  assert.equal((await heroCta(page).innerText()).trim(), 'Continuar minha prévia');
  await page.getByRole('link', { name: 'Começar uma nova prévia' }).click();
  await ready(page);
  await resetDialog(page).waitFor();
  await resetDialog(page).getByRole('button', { name: 'Apagar escolhas e recomeçar' }).click();
  assert.equal(await title(page), Q.negocio);
  assert.equal(await page.locator('#nome-empresa').inputValue(), '');
  await page.goto(URL);
  assert.equal((await heroCta(page).innerText()).trim(), 'Gerar minha prévia gratuita');
});

await scenario('Celular 390px: "Começar novamente" abre um painel na parte de baixo, sem pular a página', async (page) => {
  await page.goto(B);
  await ready(page);
  await page.locator('#nome-empresa').fill('Clima Sul');
  await page.evaluate(() => document.activeElement.blur());
  const trigger = page.getByRole('button', { name: 'Começar novamente' });
  await trigger.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  await trigger.click();
  await resetDialog(page).waitFor();
  await page.waitForTimeout(350); // o painel sobe em 0,22 s
  const box = await resetDialog(page).boundingBox();
  assert(Math.abs(box.y + box.height - 844) <= 1 && box.width >= 389, `painel preso ao pé da tela (${JSON.stringify(box)})`);
  for (const name of ['Continuar editando', 'Apagar escolhas e recomeçar', 'Fechar e continuar editando']) {
    const b = await resetDialog(page).getByRole('button', { name, exact: true }).boundingBox();
    assert(b.height >= 44 && b.width >= 44, `${name}: toque confortável`);
  }
  assert.equal(await page.evaluate(() => scrollY), y, 'abrir não rola a página');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => scrollY), y);
  assert.equal(await page.locator('#nome-empresa').inputValue(), 'Clima Sul');
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

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
    // Próximo passo evidente: conversar sobre a prévia (com o resumo); personalizar continua à mão.
    assert.deepEqual((await bar.getByRole('button').allInnerTexts()).map((t) => t.trim()), ['Personalizar']);
    const talk = bar.getByRole('link', { name: /Conversar sobre esta prévia/ });
    assert(await talk.isVisible() && (await talk.getAttribute('target')) === '_blank');
    const tb = await talk.boundingBox();
    assert(tb.height >= 44 && tb.x + tb.width <= width, 'botão inteiro e confortável na barra');
    await bar.getByRole('button', { name: 'Personalizar' }).click();
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
  // O campo já está aberto para digitar; gravar é alternativa à vista, e o exemplo não vem preenchido.
  const box = page.locator('#descricao-ia');
  assert(await box.isVisible() && (await box.inputValue()) === '', 'campo aberto e vazio');
  assert((await page.locator('#guia-descricao').innerText()).includes('Tenho uma empresa de reformas.'));
  assert(await page.getByRole('button', { name: 'Gravar minha ideia' }).isVisible());
  await box.fill('Meu WhatsApp é 51 99999-0000 e faço instalação de ar-condicionado.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  assert((await page.locator('#erro-descricao').innerText()).includes('Tire telefone'));
  await box.fill('curto');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  assert((await page.locator('#erro-descricao').innerText()).includes('pelo menos 20'));
  assert.equal(calls, 0, 'nada vazio ou com telefone é enviado');
  const desc = 'A Clima Sul faz instalação e manutenção de ar-condicionado. Quero receber pedidos de orçamento, com visual moderno.';
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
  assert(await page.getByText('A gravação de áudio não está disponível neste navegador — a descrição por texto funciona normalmente.').isVisible());
  assert.equal(await page.getByRole('button', { name: /Gravar/ }).count(), 0);
});

await scenario('Celular 390px com IA: gerar abre a prévia direto, com "Sua prévia está pronta" e as duas ações', async (page) => {
  await page.route('https://ia.test/preview', async (route) => {
    await new Promise((r) => setTimeout(r, 300));
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.locator('#descricao-ia').fill('A Clima Sul faz instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.getByRole('heading', { name: 'Sua prévia está pronta' }).filter({ visible: true }).waitFor();
  assert(await preview(page).isVisible(), 'a prévia aparece sem procurar');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'pronta-titulo', 'foco no aviso da prévia');
  const top = await preview(page).locator('[aria-roledescription=prévia]').boundingBox();
  assert(top.y < 844, 'o início do site aparece na tela');
  const bar = page.locator('[data-bar=configurador]');
  assert.deepEqual((await bar.getByRole('button').allInnerTexts()).map((t) => t.trim()), ['Personalizar']);
  const talk = bar.getByRole('link', { name: /Conversar sobre esta prévia/ });
  const msg = decodeURIComponent(await talk.getAttribute('href'));
  assert(msg.includes('Criei uma prévia do site da minha empresa') && msg.includes('Empresa: Clima Sul') && msg.includes('PACOTE ESCOLHIDO'), 'conversa com o resumo do projeto');
  await bar.getByRole('button', { name: 'Personalizar' }).click();
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
  await page.locator('#descricao-ia').fill('A Clima Sul faz instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
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

await scenario('IA: nome já informado vai no pedido, a pergunta sobre ele não aparece e jardinagem usa imagem de jardim (§15.1, §15.2)', async (page) => {
  const bodies = [];
  const garden = {
    ...aiAnswer, name: '', nameOrigin: 'nenhum', segment: 'local', subsegment: 'jardinagem', service: 'Manutenção de jardins', headline: 'Jardins bem cuidados o ano todo',
    question: 'Qual é o nome da sua empresa?',
  };
  await page.route('https://ia.test/preview', (route) => {
    bodies.push(JSON.parse(route.request().postData() || '{}'));
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: garden }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByLabel('Como se chama seu negócio?').fill('Jardim Exemplo');
  await page.locator('#descricao-ia').fill('Cuido de jardins residenciais: corte de grama, poda e limpeza de canteiros. Quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  assert(bodies[0].description.includes('Nome da empresa: Jardim Exemplo.'), 'o nome acompanha a descrição');
  assert.equal(await page.getByText('Qual é o nome da sua empresa?').count(), 0, 'não pergunta de novo');
  assert((await preview(page).innerText()).includes('Jardim Exemplo'), 'o nome digitado vale');
  const imgs = await preview(page).locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
  assert(imgs.some((src) => /demo\/jardim/.test(src)), `imagem de jardim: ${imgs}`);
  assert(!imgs.some((src) => /demo\/reparos/.test(src)), 'nunca a bancada de ferramentas');
});

await scenario('IA: resposta que chega depois de "Começar novamente" não traz a prévia apagada de volta', async (page) => {
  let answer;
  const gate = new Promise((r) => (answer = r));
  await page.route('https://ia.test/preview', async (route) => {
    await gate;
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion: aiAnswer }) });
  });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.locator('#descricao-ia').fill('A Clima Sul faz instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.getByRole('button', { name: 'Montando sua prévia…' }).waitFor();
  // Sai da geração para o passo a passo e, com a resposta ainda pendente, apaga tudo.
  await page.getByRole('button', { name: 'Prefiro escolher tudo passo a passo' }).click();
  await business(page, { name: 'Outra Empresa', segment: 'Consultoria', service: '' });
  await page.getByRole('button', { name: 'Começar novamente' }).click();
  await resetDialog(page).getByRole('button', { name: 'Apagar escolhas e recomeçar' }).click();
  assert.equal(await title(page), Q.negocio);
  answer();
  await page.waitForTimeout(600);
  assert.equal(await title(page), Q.negocio, 'continua na primeira etapa');
  assert.equal(await page.locator('[class*=lateBox]').count(), 0, 'sem aviso de prévia pronta');
  assert.equal(await page.locator('#descricao-ia').inputValue(), '', 'descrição vazia');
  const saved = await stored(page);
  assert(!saved || !saved.name, 'nada da prévia antiga foi salvo de novo');
  assert(!(await preview(page).innerText()).includes('Ar-condicionado instalado do jeito certo'));
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
  await page.locator('#descricao-ia').fill('A Clima Sul faz instalação e manutenção de ar-condicionado e quero receber pedidos de orçamento.');
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

await scenario('Pacote escolhido na página de pacotes: sem rascunho começa nele; com rascunho pergunta e não troca sozinho', async (page) => {
  await page.goto(PK);
  await page.getByRole('link', { name: 'Criar prévia com este pacote: Completo' }).click();
  await page.waitForURL(/\/criar\//);
  await ready(page);
  const note = page.locator('[class*=notice][role=status]');
  await note.waitFor();
  assert((await note.innerText()).includes('Sua prévia começa no Completo — R$ 1.000. Nada é contratado agora'));
  assert(!page.url().includes('pacote='), 'o endereço fica limpo (recarregar não repete)');
  assert.equal((await stored(page)).pkg, 'completo');
  let ev = await allEvents(page);
  assert(ev.some((e) => e.event === 'start_click' && e.context === 'pacotes' && e.package === 'completo'));
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
  await page.goto(EX);
  const cards = modelCards(page);
  const dialog = page.locator('dialog[open]');
  const bad = ['sua foto', 'item 1', 'foto do item', 'foto do imóvel', 'imóvel demonstrativo'];
  for (let i = 0; i < (await cards.count()); i++) {
    const card = await cards.nth(i).innerText();
    assert(/pacote (Essencial|Profissional|Completo) \(R\$/.test(card) && card.includes('Criar minha prévia com este modelo'), 'cartão com pacote, preço e ação');
    assert((await cards.nth(i).locator('[class*=examplePurpose]').innerText()).length > 10, 'cartão com a finalidade');
    await cards.nth(i).getByRole('button', { name: 'Ver no computador e no celular' }).click();
    for (const device of ['Computador', 'Celular']) {
      await dialog.getByRole('group', { name: 'Ver o exemplo no' }).getByRole('button', { name: device }).click();
      const t = (await dialog.locator('[aria-roledescription=prévia]').innerText()).toLowerCase();
      for (const b of bad) assert(!t.includes(b), `${card.split('\n')[0]} (${device}): sem "${b}"`);
    }
    await page.keyboard.press('Escape');
  }
  await modelCard(page, 'Alimentação').getByRole('button', { name: 'Ver no computador e no celular' }).click();
  const food = (await dialog.innerText()).toLowerCase();
  assert(food.includes('pacote completo (r$ 1.000)') && food.includes('até 15 fotos') && !food.includes('até 8'), 'Completo com a galeria do Completo');
  assert((await dialog.getByRole('link', { name: 'Criar minha prévia com este modelo' }).getAttribute('href')).endsWith('/criar/?modelo=alimentacao'));
});

await scenario('Celular 390px: exemplo abre na versão de celular de verdade, sem moldura nem rolagem lateral', async (page) => {
  await page.goto(EX);
  await modelCard(page, 'Imóveis e corretores').getByRole('button', { name: 'Ver no computador e no celular' }).click();
  const dialog = page.locator('dialog[open]');
  assert.equal(await dialog.getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed'), 'true', 'no celular abre a versão de celular');
  const mob = dialog.locator('[class*=demoMobile] [aria-roledescription=prévia]');
  await mob.waitFor();
  const box = await mob.boundingBox();
  assert(box.width >= 300 && box.width <= 390, `ocupa a largura da tela (${box.width})`);
  assert.equal(await dialog.locator('[class*=phoneFrame], [class*=PhoneFrame]').count(), 0, 'sem moldura de celular dentro do celular');
  assert.equal(await dialog.evaluate((d) => d.scrollWidth <= d.clientWidth + 1), true, 'sem rolagem lateral no exemplo');
  assert(await dialog.getByRole('link', { name: 'Criar minha prévia com este modelo' }).isVisible());
  assert.equal(await scrollWidth(page), 390);
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const [width, height] of [[320, 568], [360, 740], [375, 667], [390, 700], [390, 844], [430, 932]]) {
  await scenario(`Apresentação ${width}×${height}: título, captura real e botão principal na primeira tela`, async (page) => {
    await page.goto(URL);
    const h1 = await page.getByRole('heading', { level: 1 }).boundingBox();
    assert(h1.y >= 0 && h1.y + h1.height <= height, 'título inteiro');
    const cta = await heroCta(page).boundingBox();
    const img = await page.locator('main figure img').first().boundingBox();
    assert(img.y > h1.y + h1.height && img.y + img.height <= cta.y, 'imagem entre o título e o botão');
    // Nas telas de referência (360×740 em diante), título, imagem inteira e botão sem rolar.
    if (height >= 700) assert(cta.y + cta.height <= height, `botão principal visível sem rolar (${Math.round(cta.y + cta.height)} de ${height})`);
    else assert(img.y < height, 'a imagem começa na primeira tela');
    assert(cta.height >= 44, 'toque confortável');
    const talk = await page.locator('main > section').first().getByRole('link', { name: /Conversar sobre meu projeto/ }).boundingBox();
    assert(talk.height >= 44, 'toque confortável na conversa direta');
    assert(talk.y >= cta.y + cta.height, 'botões sem sobreposição');
    assert(await page.getByText('Sites de página única:').isVisible());
    // A imagem aparece de imediato (sem esperar animação).
    assert.equal(await page.locator('main figure img').first().evaluate((e) => getComputedStyle(e).opacity), '1');
    // Título com quebras naturais: nenhuma palavra partida.
    const hw = await page.getByRole('heading', { level: 1 }).evaluate((e) => ({ w: e.scrollWidth, cw: e.clientWidth }));
    assert(hw.w <= hw.cw + 1, 'título sem estourar a largura');
    assert.equal(await scrollWidth(page), width);
    const ev = await allEvents(page);
    assert(ev.every((e) => e.device === 'celular'), 'eventos com a categoria do aparelho');
    // Projetos reais logo depois, em carrossel: o primeiro inteiro, o segundo aparecendo.
    const boxes = await page.locator('#projetos li').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.width]; }));
    assert.equal(boxes.length, 2);
    assert(boxes[0][0] >= 0 && boxes[0][0] + boxes[0][1] <= width && boxes[1][0] < width, 'primeiro inteiro, próximo à vista');
  }, { viewport: { width, height }, isMobile: true, hasTouch: true });
}

for (const [width, height, label] of [[768, 1024, 'tablet'], [1024, 768, 'computador'], [1440, 900, 'computador'], [844, 390, 'celular deitado']]) {
  await scenario(`${width}×${height} (${label}): apresentação e criação sem rolagem lateral`, async (page) => {
    await page.goto(URL);
    assert(await page.getByRole('heading', { level: 1 }).isVisible());
    assert.equal(await scrollWidth(page), width);
    await page.goto(EX);
    assert.equal(await scrollWidth(page), width);
    await page.goto(PK);
    assert.equal(await scrollWidth(page), width);
    assert.equal(await page.getByRole('link', { name: /^Criar prévia com este pacote/ }).count(), 3);
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
  await visible(page.getByRole('button', { name: /^Personalizar( meu site)?$/ })).click();
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
  await page.goto(URL_AI + 'exemplos/');
  await modelCard(page, 'Beleza e estética').getByRole('link', { name: 'Criar minha prévia com este modelo' }).click();
  await page.waitForURL(/criar/);
  await ready(page);
  await visible(page.getByRole('button', { name: 'Editar minha descrição' })).click();
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
  assert(await page.locator('#descricao-ia').isVisible(), 'digitar continua disponível');
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0' });

/* ── Prévias por família (casos de negócio com respostas simuladas) ─────── */

const { casos } = JSON.parse(readFileSync(new globalThis.URL('./fixtures/casos-de-negocio.json', import.meta.url), 'utf8'));
const caso = (id) => casos.find((c) => c.id === id);
const livePreview = (page) => page.locator('aside [aria-roledescription=prévia]').first();
/** Servidor simulado: responde no formato pedido (v2) com o caso; conta as chamadas. */
async function mockAi(page, answer, { oldServer = false } = {}) {
  const calls = [];
  await page.route('https://ia.test/preview', (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    calls.push(body.schema);
    if (oldServer && body.schema !== 1) return route.fulfill({ status: 422, contentType: 'application/json', headers: cors, body: '{"ok":false,"error":"versao"}' });
    const suggestion = typeof answer === 'function' ? answer(body) : answer;
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, suggestion }) });
  });
  return calls;
}
async function describeAndGenerate(page, text) {
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.locator('#descricao-ia').fill(text);
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
}

await scenario('Nome antes da prévia: campo, sugestão tirada da descrição e "Ainda não defini o nome"', async (page) => {
  const c = caso('clinica-veterinaria');
  await mockAi(page, { ...c.resposta, name: '', nameOrigin: 'nenhum' });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  const field = page.getByLabel('Como se chama seu negócio?');
  assert(await field.isVisible(), 'o nome vem junto com a ideia, antes de gravar ou digitar');
  assert(await page.getByText('Esse nome aparece na prévia.').isVisible());
  await page.locator('#descricao-ia').fill(c.descricao);
  const found = page.getByText(/Encontramos “Clínica Vila Pet” na sua descrição/);
  await found.waitFor();
  await page.getByRole('button', { name: 'Usar este nome' }).click();
  assert.equal(await field.inputValue(), 'Clínica Vila Pet');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  const pv = livePreview(page);
  assert.equal(await pv.getAttribute('aria-label'), 'Prévia do site de Clínica Vila Pet');
  assert.equal(await pv.getAttribute('data-image'), 'pet-clinica');
  // Recomeçar e seguir sem nome: provisório identificado, sem bloquear.
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(URL_AI + 'criar/');
  await ready(page);
  await page.getByText('Ainda não defini o nome.').click();
  assert(await page.getByText('A prévia usa “Seu negócio” como nome provisório.', { exact: false }).isVisible());
  await page.locator('#descricao-ia').fill(c.descricao);
  assert.equal(await page.getByRole('button', { name: 'Usar este nome' }).count(), 0, 'sem sugestão quando a pessoa ainda não definiu');
  await page.getByRole('button', { name: 'Gerar minha prévia' }).click();
  await page.waitForFunction(() => document.querySelector('#etapa-titulo')?.textContent?.includes('Sua prévia está pronta'));
  assert.equal(await livePreview(page).getAttribute('aria-label'), 'Prévia do site de Sua clínica (nome provisório)');
  assert((await livePreview(page).innerText()).includes('Sua clínica'));
  assert.equal((await stored(page)).nameLater, true);
});

await scenario('Clínica veterinária x banho e tosa: imagens, botões e textos de cada um; nada de banho na clínica', async (page) => {
  for (const id of ['clinica-veterinaria', 'banho-e-tosa']) {
    const c = caso(id);
    await page.unroute('https://ia.test/preview').catch(() => {});
    await mockAi(page, c.resposta);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {});
    await describeAndGenerate(page, c.descricao);
    const pv = livePreview(page);
    assert.equal(await pv.getAttribute('data-subsegment'), c.espera.subsegmento);
    assert.equal(await pv.getAttribute('data-image'), c.espera.imagem);
    const text = await pv.innerText();
    assert(text.includes(c.espera.botao), `${id}: botão "${c.espera.botao}"`);
    for (const bad of c.espera.semTexto) assert(!text.toLowerCase().includes(bad.toLowerCase()), `${id}: sem "${bad}"`);
    const imgs = await pv.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
    for (const img of c.espera.semImagem) assert(!imgs.some((src) => src.endsWith(`/demo/${img}.svg`)), `${id}: sem ${img}`);
  }
});

await scenario('Servidor ainda antigo: a página repete no formato 1 e monta a família certa', async (page) => {
  const c = caso('clinica-veterinaria');
  const old = { ...c.resposta, segment: 'outro', segmentOther: 'Clínica veterinária' };
  for (const k of ['subsegment', 'familyId', 'layoutVariantId', 'heroVariantId', 'assetCategory', 'typography', 'nameOrigin']) delete old[k];
  const calls = await mockAi(page, old, { oldServer: true });
  await describeAndGenerate(page, c.descricao);
  assert.deepEqual(calls, [2, 1], 'uma recusa de versão e uma chamada válida');
  const pv = livePreview(page);
  assert.equal(await pv.getAttribute('data-family'), 'pet');
  assert.equal(await pv.getAttribute('data-image'), 'pet-clinica');
  assert.equal((await stored(page)).segment, 'pet');
});

await scenario('Descrição ambígua: uma pergunta, respondida com um toque e sem nova chamada à IA', async (page) => {
  const vague = { ...caso('clinica-veterinaria').resposta, name: '', nameOrigin: 'nenhum', subsegment: 'pet', services: ['Atendimento'], headline: 'Cuidado para o seu pet', assetCategory: 'automatica' };
  const calls = await mockAi(page, vague);
  await describeAndGenerate(page, 'Cuido de pets com carinho e quero receber pedidos de horário pelo WhatsApp.');
  const pv = livePreview(page);
  assert.equal(await pv.getAttribute('data-image'), '', 'sem saber o tipo, sem imagem de banho ou de consulta');
  const q = page.getByRole('group', { name: /Uma pergunta para acertar a prévia/ });
  assert((await q.innerText()).includes('Você oferece consultas veterinárias, banho e tosa ou os dois?'));
  await q.getByRole('button', { name: 'Banho e tosa' }).click();
  await page.waitForFunction(() => document.querySelector('aside [aria-roledescription=prévia]')?.dataset.image === 'pet');
  assert.equal(calls.length, 1, 'responder não chama a IA de novo');
  assert.equal(await page.getByRole('group', { name: /Uma pergunta/ }).count(), 0);
  assert(await page.getByRole('button', { name: 'Desfazer' }).isVisible(), 'dá para desfazer');
});

await scenario('Celular: a pergunta única e o nome provisório aparecem logo acima da prévia, sem procurar', async (page) => {
  const vague = { ...caso('clinica-veterinaria').resposta, name: '', nameOrigin: 'nenhum', subsegment: 'pet', services: ['Atendimento'], headline: 'Cuidado para o seu pet', assetCategory: 'automatica' };
  await mockAi(page, vague);
  await describeAndGenerate(page, 'Cuido de pets com carinho e quero receber pedidos de horário pelo WhatsApp.');
  const pv = livePreview(page);
  assert(await pv.isVisible(), 'a prévia abre sozinha');
  const q = page.getByRole('group', { name: /Uma pergunta para acertar a prévia/ });
  assert(await q.isVisible(), 'pergunta visível na tela da prévia');
  const qBox = await q.boundingBox(); const pvBox = await pv.boundingBox();
  assert(qBox.y < pvBox.y, 'a pergunta fica acima do site');
  assert(await page.getByText(/Nome provisório: “Seu negócio pet”/).isVisible());
  await q.getByRole('button', { name: 'Consultas veterinárias' }).click();
  await page.waitForFunction(() => document.querySelector('aside [aria-roledescription=prévia]')?.dataset.image === 'pet-clinica');
  await page.getByRole('button', { name: 'Informar o nome' }).click();
  await page.locator('#nome-pronta').fill('Clínica Bem Cuidar');
  await page.locator('#nome-pronta').blur();
  await visible(page.locator('[data-bar=configurador] button', { hasText: 'Ver minha prévia' })).click();
  assert.equal(await livePreview(page).getAttribute('aria-label'), 'Prévia do site de Clínica Bem Cuidar');
}, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

await scenario('Composição e estilo mudam na hora, sem perder textos e sem chamar a IA; recarregar mantém tudo', async (page) => {
  const c = caso('confeitaria');
  const calls = await mockAi(page, c.resposta);
  await describeAndGenerate(page, c.descricao);
  const pv = livePreview(page);
  const words = (await pv.innerText()).includes('Bolos decorados e doces finos por encomenda');
  assert(words);
  await visible(page.getByRole('button', { name: /^Personalizar( meu site)?$/ })).click();
  await toChoice(page, Q.estilo);
  const comp = page.getByRole('radiogroup', { name: 'Composição' });
  assert.equal(await comp.getByRole('radio').count(), 4, 'duas variantes, topo sem imagem e institucional');
  await comp.getByRole('radio', { name: /^Cardápio/ }).click();
  assert.equal(await pv.getAttribute('data-layout'), 'cardapio');
  await comp.getByRole('radio', { name: /^Topo sem imagem/ }).click();
  assert.equal(await pv.getAttribute('data-hero'), 'tipografico');
  await page.getByRole('radiogroup', { name: 'Estilo' }).getByRole('radio', { name: /^Escuro/ }).click();
  assert((await pv.innerText()).includes('Bolos decorados e doces finos por encomenda'), 'textos preservados');
  assert.equal(calls.length, 1, 'mudar composição e estilo não chama a IA');
  await page.reload();
  await ready(page);
  const again = livePreview(page);
  assert.equal(await again.getAttribute('data-layout'), 'cardapio');
  assert.equal(await again.getAttribute('data-hero'), 'tipografico');
  assert.equal(await title(page), Q.estilo, 'volta para onde parou');
});

await scenario('Trocar o nome atualiza cabeçalho, rodapé, apresentação, resumo e WhatsApp', async (page) => {
  const c = caso('arquitetura');
  await mockAi(page, c.resposta);
  await describeAndGenerate(page, c.descricao);
  await visible(page.getByRole('button', { name: /^Personalizar( meu site)?$/ })).click();
  await toChoice(page, Q.conteudo);
  const field = page.locator('#nome-conteudo');
  await field.fill('Ateliê Traço Fino');
  await field.blur();
  const pv = livePreview(page);
  await page.waitForFunction(() => document.querySelector('aside [aria-roledescription=prévia]')?.getAttribute('aria-label') === 'Prévia do site de Ateliê Traço Fino');
  const text = await pv.innerText();
  assert(!text.includes('Estúdio Linha'), 'o nome antigo sai de todo o site (inclusive dos textos da IA)');
  assert(text.includes('Sobre Ateliê Traço Fino') && text.includes('© Ateliê Traço Fino'));
  await toChoice(page, Q.secoes);
  await next(page);
  assert.equal(await title(page), Q.revisao);
  assert((await page.locator('main').innerText()).includes('Site de Ateliê Traço Fino'));
  const msg = await waMessage(page);
  assert(msg.includes('Empresa: Ateliê Traço Fino') && !msg.includes('Estúdio Linha'));
  assert(msg.includes('Tipo de negócio: Arquitetura') && msg.includes('Composição: Arquitetura e portfólio'));
});

await scenario('Modelo da página de exemplos = prévia aberta = prévia criada (mesma família, variante e imagem)', async (page) => {
  await page.goto(EX);
  for (const name of ['Veterinária e cuidados pet', 'Imóveis e corretores']) {
    const card = modelCard(page, name);
    const thumb = card.locator('[aria-roledescription=prévia]');
    const sig = async (loc) => [await loc.getAttribute('data-family'), await loc.getAttribute('data-layout'), await loc.getAttribute('data-image')].join('|');
    const t = await sig(thumb);
    await card.getByRole('button', { name: 'Ver no computador e no celular' }).click();
    assert.equal(await sig(page.locator('dialog[open] [aria-roledescription=prévia]').first()), t, `${name}: miniatura = exemplo aberto`);
    await page.keyboard.press('Escape');
  }
  const card = modelCard(page, 'Veterinária e cuidados pet');
  const t = await card.locator('[aria-roledescription=prévia]').getAttribute('data-image');
  await card.getByRole('link', { name: 'Criar minha prévia com este modelo' }).click();
  await page.waitForURL(/criar/);
  await ready(page);
  const pv = livePreview(page);
  assert.equal(await pv.getAttribute('data-image'), t);
  assert.equal(await pv.getAttribute('data-family'), 'pet');
  assert(!(await pv.innerText()).includes('Clínica Vila Pet'), 'a marca fictícia do exemplo não vem para o projeto');
  assert.equal((await stored(page)).name, '');
  await page.goto(EX);
});

for (const [w, h] of [[360, 740], [390, 844], [430, 932]]) {
  await scenario(`Celular ${w}px: gerar abre a prévia na largura útil, legível, e volta para editar`, async (page) => {
    const c = caso('limpeza');
    await mockAi(page, c.resposta);
    await describeAndGenerate(page, c.descricao);
    const pv = livePreview(page);
    await pv.waitFor();
    const box = await pv.boundingBox();
    assert(box.width >= w - 2, `prévia ocupa a largura útil (${box.width} de ${w})`);
    assert(await page.getByRole('heading', { name: 'Sua prévia está pronta' }).isVisible(), 'confirmação junto da prévia');
    assert.equal(await scrollWidth(page), w, 'sem rolagem lateral');
    const title = await pv.locator('[class*=title]').first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    assert(title >= 26, 'título legível, sem miniatura');
    const tap = await visible(page.locator('[data-bar=configurador] button')).boundingBox();
    assert(tap.height >= 44, 'botões da barra com área de toque');
    await visible(page.getByRole('button', { name: 'Editar minha descrição' })).click();
    assert.equal(await page.locator('#descricao-ia').inputValue(), c.descricao, 'descrição preservada');
  }, { viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
}

await scenario('Oito famílias em 360, 390, 430, 768 e 1440 px: sem rolagem lateral nem texto cortado', async (page) => {
  for (const id of ['local', 'beleza', 'consultoria', 'alimentacao', 'criativo', 'imoveis', 'pet', 'outro']) {
    for (const w of [360, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(B + `?modelo=${id}`);
      await ready(page);
      const pv = livePreview(page);
      if (!(await pv.isVisible())) await visible(page.locator('[data-bar=configurador] button', { hasText: /Ver minha prévia|Ver meu site/ })).click().catch(() => {});
      assert.equal(await scrollWidth(page), w, `${id} ${w}: sem rolagem lateral`);
      const over = await page.locator('aside [aria-roledescription=prévia]').first().evaluate((root) =>
        [...root.querySelectorAll('span, b, li, p')].filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'hidden' && getComputedStyle(e).textOverflow !== 'ellipsis').length,
      );
      assert.equal(over, 0, `${id} ${w}: nenhum texto vaza da caixa`);
      await page.evaluate(() => localStorage.clear());
    }
  }
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
