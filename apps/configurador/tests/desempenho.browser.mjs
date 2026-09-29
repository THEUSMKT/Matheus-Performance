// Medição de desempenho em laboratório: compara dois builds (ex.: main e este branch) nas mesmas condições.
// Requer o Playwright (npm i -D playwright) e os dois builds servidos com compressão gzip, com o mesmo caminho base:
//   NEXT_PUBLIC_BASE_PATH=/Matheus-Performance/configurador npm run build
//   mkdir -p /tmp/site/Matheus-Performance/configurador && cp -r out/. /tmp/site/Matheus-Performance/configurador/
//   npx serve -l 4186 /tmp/site          (serve comprime com gzip; repita com o build da main na porta 4185)
// Rode: MAIN=http://localhost:4185/Matheus-Performance/configurador/ BRANCH=http://localhost:4186/Matheus-Performance/configurador/ \
//       node tests/desempenho.browser.mjs   (RUNS=5 por padrão; CHROMIUM=/caminho opcional)
// Celular 390x844 com rede "Slow 4G" (RTT 150 ms, 1,6 Mbps, 750 kbps) e CPU 4x mais lenta; computador 1440x900 sem
// limitação. Contexto novo (sem cache) a cada execução; imprime a mediana de RUNS execuções de cada página.
import { chromium } from 'playwright';
const RUNS = Number(process.env.RUNS || 5);
const targets = { main: process.env.MAIN, branch: process.env.BRANCH };
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const cases = [['início', '', 390, 844, true], ['criação', 'criar/', 390, 844, true], ['criação com modelo (beleza)', 'criar/?modelo=beleza', 390, 844, true], ['exemplos', 'exemplos/', 390, 844, true], ['início', '', 1440, 900, false], ['exemplos', 'exemplos/', 1440, 900, false]];
for (const [label, path, W, H, throttle] of cases) {
  for (const [name, base] of Object.entries(targets)) {

    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 760, hasTouch: W < 760, deviceScaleFactor: W < 760 ? 3 : 1 });
      const p = await ctx.newPage();
      const cdp = await ctx.newCDPSession(p);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (throttle) {
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      }
      await p.addInitScript(() => {
        window.__m = { lcp: 0, cls: 0, tbt: 0 };
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
      });
      await p.goto(base + path, { waitUntil: 'load', timeout: 120000 });
      await p.waitForTimeout(throttle ? 5000 : 1500);
      const r = await p.evaluate(() => {
        const res = performance.getEntriesByType('resource');
        const nav = performance.getEntriesByType('navigation')[0];
        const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
        const bytes = res.reduce((a, e) => a + (e.encodedBodySize || 0), 0) + (nav.encodedBodySize || 0);
        return { fcp, lcp: window.__m.lcp, cls: window.__m.cls, tbt: window.__m.tbt, load: nav.loadEventEnd, kb: bytes / 1024, req: res.length + 1, dom: document.getElementsByTagName('*').length };
      });
      runs.push(r);
      await ctx.close();
    }
    const m = Object.fromEntries(Object.keys(runs[0]).map((k) => [k, median(runs.map((r) => r[k]))]));
    const key = `${label} ${W}px${throttle ? ' (Slow 4G + CPU 4x)' : ''}`;
    console.log(key, name, JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, k === 'cls' ? Number(v.toFixed(3)) : Math.round(v)]))));
  }
}
await b.close();
