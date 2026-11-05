const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[899, 800], [900, 700], [1100, 800], [1280, 800], [1440, 900], [1280, 540]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); await use(ctx, 'local'); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///home/user/domina-guia/guia.html'); await p.waitForTimeout(1500);
    const pin = await p.evaluate(() => { const s = ScrollTrigger.getAll().find(s => s.pin); return s ? [s.start, s.end] : null; });
    const on = await p.evaluate(() => document.querySelector('.v-timeline').classList.contains('is-horizontal'));
    const seen = new Set(); let maxW = 0, coveredByHeader = 0;
    if (pin) for (let f = 0; f <= 1.0001; f += 0.05) { await p.evaluate(y => scrollTo(0, y), pin[0] + (pin[1] - pin[0]) * f); await p.waitForTimeout(60);
      const r = await p.evaluate(() => { const fig = document.querySelector('.v-timeline'); const fr = fig.getBoundingClientRect(); const cs = getComputedStyle(fig);
        const L = fr.left + parseFloat(cs.paddingLeft) - 1, R = fr.right - parseFloat(cs.paddingRight) + 1;
        return { full: [...document.querySelectorAll('.tl-item')].map((it, i) => { const rc = it.getBoundingClientRect(); return rc.left >= L && rc.right <= R ? i : -1; }).filter(i => i >= 0), sw: document.documentElement.scrollWidth, top: fr.top, hdr: document.querySelector('.site-header').offsetHeight, bottom: fr.bottom, ih: innerHeight }; });
      r.full.forEach(i => seen.add(i)); maxW = Math.max(maxW, r.sw); if (r.top < r.hdr || r.bottom > r.ih) coveredByHeader++; }
    console.log(`${w}x${h} horizontal ${on} pin ${pin ? Math.round(pin[1] - pin[0]) + 'px' : 'no'} semanas vistas completas ${[...seen].sort().join(',') || '-'} anchoMax ${maxW} tapada/cortada ${coveredByHeader} errores ${errs.length}`);
    await ctx.close(); }
  // cambio de tamaño en vivo: 1280 -> 800 -> 1280
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'local'); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/domina-guia/guia.html'); await p.waitForTimeout(1200);
  await p.setViewportSize({ width: 800, height: 800 }); await p.waitForTimeout(800);
  const a = await p.evaluate(() => [document.querySelector('.v-timeline').className, getComputedStyle(document.querySelector('.timeline')).transform, !!document.querySelector('.pin-spacer'), document.documentElement.scrollWidth]);
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(800);
  const c = await p.evaluate(() => [document.querySelector('.v-timeline').className, !!document.querySelector('.pin-spacer')]);
  console.log('en vivo 1280->800:', JSON.stringify(a), '-> 1280:', JSON.stringify(c), 'errores', errs);
  await b.close(); })();
