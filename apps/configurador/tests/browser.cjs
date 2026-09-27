// Revisão visual: percorre a apresentação e a página de criação no computador e no
// celular, confere o essencial e salva prints em ../../../../review. Requer o
// Playwright e a prévia servida.
// Rode: PREVIEW_URL=... node tests/browser.cjs   (PLAYWRIGHT_MODULE e CHROMIUM opcionais)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/Matheus-Performance/configurador/';
const artifacts = path.resolve(__dirname, '../../../../review');
fs.mkdirSync(artifacts, { recursive: true });

const shot = (page, name, full = false) => page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: full });
const noSideScroll = async (page, label) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Rolagem lateral: ${label}`);
async function ready(page) {
  await page.locator('#etapa-titulo').waitFor();
  await page.waitForFunction(() => !document.querySelector('[data-bar=configurador] button:disabled, [class*=desktopActions] button:disabled'));
}
async function next(page) {
  await page.locator('[data-bar=configurador] button, [class*=desktopActions] button').filter({ hasText: /^(Continuar|Ver meu site)$/ }).filter({ visible: true }).first().click();
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const errors = [];

  // Computador
  const desk = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  let page = await desk.newPage();
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(base);
  await shot(page, 'desktop-top');
  await shot(page, 'desktop', true);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Veja como o site da sua empresa pode ficar em até 5 minutos.');
  assert.deepEqual(
    await page.locator('#exemplos [class*=exampleName]').allTextContents(),
    ['Serviços locais', 'Beleza e estética', 'Consultoria e serviços profissionais', 'Alimentação', 'Arquitetura ou portfólio criativo'],
  );
  await page.getByRole('button', { name: 'Abrir exemplo de Beleza e estética' }).click();
  await shot(page, 'desktop-demo');
  await page.locator('dialog[open]').getByRole('button', { name: 'Celular' }).click();
  await shot(page, 'desktop-demo-celular');
  await page.locator('dialog[open]').getByRole('button', { name: 'Usar este modelo' }).click();
  await page.waitForURL(/\/criar\/$/);
  await ready(page);
  await page.locator('#nome-empresa').fill('Aurora Teste');
  await shot(page, 'desktop-etapa1');
  await next(page);
  await shot(page, 'desktop-etapa2');
  await next(page);
  await page.getByRole('radio', { name: /^Sofisticado/ }).click();
  await shot(page, 'desktop-etapa3');
  await next(page);
  const current = await page.getByTestId('preco').innerText();
  const wa = await page.locator('[class*=desktopOnly] a', { hasText: 'Solicitar desenvolvimento' }).getAttribute('href');
  const message = new URL(wa).searchParams.get('text');
  assert(message.includes('Aurora Teste'));
  assert(message.includes(`Valor do desenvolvimento: ${current}`));
  assert(wa.startsWith('https://wa.me/5551981947979'));
  await shot(page, 'desktop-etapa4', true);
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noSideScroll(page, `${width}px`);
  }
  await desk.close();

  // Celular
  for (const width of [360, 390, 430]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    page = await ctx.newPage();
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(base);
    await noSideScroll(page, `início ${width}px`);
    await shot(page, `mobile-${width}-top`);
    if (width === 390) await shot(page, 'mobile', true);
    await page.locator('[class*=heroCopy] a[class*=shine]').click();
    await page.waitForURL(/\/criar\/$/);
    await ready(page);
    await page.locator('#nome-empresa').fill('Loja Azul');
    await page.getByRole('radio', { name: 'Serviços locais', exact: true }).click();
    await page.waitForTimeout(400);
    await shot(page, `mobile-${width}-etapa1`);
    await page.getByRole('button', { name: 'Ver meu site' }).first().click();
    await shot(page, `mobile-${width}-etapa1-previa`);
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    for (let step = 2; step <= 4; step++) {
      await next(page);
      await noSideScroll(page, `etapa ${step} em ${width}px`);
      await shot(page, `mobile-${width}-etapa${step}`);
    }
    await ctx.close();
  }

  assert.deepEqual(errors, []);
  console.log('PASS computador e celular (360/390/430): apresentação, exemplos, as 4 etapas, WhatsApp e sem rolagem lateral; prints em review/.');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
