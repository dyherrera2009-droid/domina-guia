const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
(async () => { const b = await chromium.launch();
  for (const w of [1280, 360]) { const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); await use(ctx, 'local');
  for (const f of ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias']) {
    const p = await ctx.newPage(); await p.goto('file:///home/user/domina-guia/' + f + '.html'); await p.waitForTimeout(400);
    let n = 0, off = [], noRing = [], seen = new Set(), marquee = false;
    for (let i = 0; i < 400; i++) {
      await p.keyboard.press('Tab'); await p.waitForTimeout(60);
      const r = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null;
        const rc = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        const vis = rc.bottom > 0 && rc.top < innerHeight && rc.right > 0 && rc.left < innerWidth;
        const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 || cs.boxShadow !== 'none';
        const id = e.dataset.kbd || (e.dataset.kbd = String(Math.random()));
        return { id, vis, ring, txt: (e.textContent || e.value || '').trim().slice(0, 30), mq: e.classList.contains('marquee-toggle'), hidden: e.offsetParent === null && cs.position !== 'fixed' };
      });
      if (!r) break; if (seen.has(r.id)) break; seen.add(r.id); n++;
      if (r.mq) marquee = true;
      if (!r.vis && !r.hidden) off.push(r.txt); if (!r.ring) noRing.push(r.txt);
    }
    console.log(w, f.padEnd(16), 'paradas', n, 'fuera de pantalla', off.length, off.slice(0, 3), 'sin anillo', noRing.length, noRing.slice(0, 3), f === 'conoce-domina' ? 'botón cinta ' + marquee : '');
    await p.close(); }
  await ctx.close(); }
  await b.close(); })();
