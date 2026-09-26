// Revisão visual: percorre a página no computador e no celular, confere o essencial
// e salva prints em ../../../../review. Requer o Playwright e a prévia servida.
// Rode: PREVIEW_URL=... node tests/browser.cjs   (PLAYWRIGHT_MODULE e CHROMIUM opcionais)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/Matheus-Performance/configurador/';
const artifacts = path.resolve(__dirname, '../../../../review');
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const errors = [];

  // Computador
  const desk = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  let page = await desk.newPage();
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(base);
  await page.locator('[data-testid=estimate]').waitFor();
  await page.screenshot({ path: path.join(artifacts, 'desktop-top.png') });
  await page.screenshot({ path: path.join(artifacts, 'desktop.png'), fullPage: true });
  assert.deepEqual(
    await page.locator('#exemplos [class*="inspirationNav"] strong').allTextContents(),
    ['SERVIÇOS LOCAIS', 'BELEZA E BEM-ESTAR', 'CONSULTORIA', 'PORTFÓLIO CRIATIVO', 'ALIMENTAÇÃO'],
  );
  assert.equal(await page.locator('[data-testid=estimate]').innerText(), 'R$ 500 – R$ 550');
  await page.getByRole('button', { name: 'Abrir exemplo de Beleza e bem-estar' }).click();
  await page.screenshot({ path: path.join(artifacts, 'desktop-demo.png') });
  await page.locator('dialog[open]').getByRole('button', { name: 'Celular' }).click();
  await page.screenshot({ path: path.join(artifacts, 'desktop-demo-celular.png') });
  await page.locator('dialog[open]').getByRole('button', { name: 'Usar este modelo como ponto de partida' }).click();
  const cfg = page.locator('#configurador');
  await cfg.getByLabel(/Nome do negócio/).fill('Aurora Teste');
  await cfg.getByRole('button', { name: /Momento 3/ }).click();
  await cfg.getByRole('radio', { name: /Elegante/ }).click();
  await cfg.screenshot({ path: path.join(artifacts, 'desktop-ajustes.png') });
  await cfg.getByRole('button', { name: /Momento 4/ }).click();
  const current = await page.locator('[data-testid=estimate]').innerText();
  const wa = await cfg.getByRole('link', { name: 'Preparar conversa no WhatsApp' }).getAttribute('href');
  const message = new URL(wa).searchParams.get('text');
  assert(message.includes('Aurora Teste'));
  assert(message.includes(current));
  assert(wa.startsWith('https://wa.me/5551981947979'));
  await cfg.screenshot({ path: path.join(artifacts, 'desktop-resumo.png') });
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Rolagem lateral em ${width}px`);
  }
  await desk.close();

  // Celular
  for (const width of [360, 390, 430]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    page = await ctx.newPage();
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(base);
    await page.locator('[data-testid=estimate]').waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Rolagem lateral em ${width}px`);
    if (width === 390) {
      await page.screenshot({ path: path.join(artifacts, 'mobile-top.png') });
      await page.screenshot({ path: path.join(artifacts, 'mobile.png'), fullPage: true });
      await page.locator('#configurador').getByRole('button', { name: /Momento 3/ }).click();
      await page.locator('#configurador').screenshot({ path: path.join(artifacts, 'mobile-ajustes.png') });
    }
    await ctx.close();
  }

  assert.deepEqual(errors, []);
  console.log('PASS computador e celular (360/390/430): exemplos, demonstração, ajustes, resumo, WhatsApp e sem rolagem lateral; prints em review/.');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
