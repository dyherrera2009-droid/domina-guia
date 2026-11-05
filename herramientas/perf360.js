const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
const root = process.argv[2];
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await use(ctx, 'local');
  for (const f of ['index', 'conoce-domina', 'guia', 'recomendaciones']) {
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.goto('file://' + root + '/' + f + '.html'); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => { const H = document.documentElement.scrollHeight - innerHeight; const ts = []; let y = 0;
      await new Promise(res => { function step(t) { ts.push(t); y += 18; scrollTo(0, y); if (y < H) requestAnimationFrame(step); else res(); } requestAnimationFrame(step); });
      const d = ts.slice(1).map((t, i) => t - ts[i]); d.sort((a, b) => a - b);
      return { frames: d.length, p50: d[Math.floor(d.length * .5)].toFixed(1), p95: d[Math.floor(d.length * .95)].toFixed(1), largos: d.filter(x => x > 50).length };
    });
    console.log(f.padEnd(16), JSON.stringify(r)); await p.close(); }
  await b.close(); })();
