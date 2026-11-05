const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'local');
  const p = await ctx.newPage(); await p.goto('file:///home/user/domina-guia/guia.html'); await p.waitForTimeout(1200);
  const sels = await p.evaluate(() => [...document.querySelectorAll('[data-simulacro] button, [data-simulacro] label, [data-diagnostico] button, [data-diagnostico] label, [data-planificador] button')].filter(e => e.offsetParent).map((e, i) => (e.dataset.t = i, '[data-t="' + i + '"]')));
  let moved = 0;
  for (const s of sels) { const el = await p.$(s); await el.scrollIntoViewIfNeeded(); const bb = await el.boundingBox(); if (!bb) continue;
    await p.mouse.move(bb.x + bb.width * 0.85, bb.y + bb.height / 2, { steps: 4 }); await p.waitForTimeout(80);
    const t = await p.evaluate(s => { const e = document.querySelector(s); const cs = getComputedStyle(e); return [cs.translate, cs.transform, e.style.translate]; }, s);
    if (t[0] !== 'none' || t[2]) moved++; }
  const dot = await p.evaluate(() => [document.querySelectorAll('.cursor-dot').length, getComputedStyle(document.querySelector('.cursor-dot')).pointerEvents, document.querySelector('.cursor-dot').getAttribute('aria-hidden'), getComputedStyle(document.body).cursor]);
  // clic real a través del punto: empieza el simulacro
  const begin = await p.$('[data-sim-begin]'); await begin.scrollIntoViewIfNeeded(); const bb = await begin.boundingBox(); await p.mouse.move(bb.x + 20, bb.y + 10); await p.waitForTimeout(300); await p.mouse.click(bb.x + 20, bb.y + 10); await p.waitForTimeout(300);
  const started = await p.evaluate(() => !document.querySelector('[data-sim-begin]').offsetParent || document.activeElement.id);
  console.log('controles revisados', sels.length, 'movidos', moved, '| punto', JSON.stringify(dot), '| clic sobre el punto inicia simulacro:', started);
  await b.close(); })();
