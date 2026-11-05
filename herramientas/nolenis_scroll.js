const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'block-lenis');
  for (const f of ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias']) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///home/user/domina-guia/' + f + '.html'); const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(50); }
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({ split: document.querySelectorAll('.split-visual').length, clip: [...document.querySelectorAll('.photo-frame')].filter(x => getComputedStyle(x).clipPath !== 'none').length, hidden: [...document.querySelectorAll('.hero-anim, .band-head h2, .h2-icon, .session, .structure-total')].filter(e => getComputedStyle(e).opacity !== '1').length, cnt: (document.querySelector('.structure-total .big') || {}).textContent }));
    console.log(f, JSON.stringify(r), 'errores', errs.length); await p.close(); }
  await b.close(); })();
