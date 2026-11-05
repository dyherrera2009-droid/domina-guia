const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
const PAGES = ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias'];
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'local');
  const found = {};
  for (const f of PAGES) { const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///home/user/domina-guia/' + f + '.html'); await p.waitForTimeout(500);
    const r = await p.evaluate(() => [...document.querySelectorAll('.term')].map(t => { const d = document.getElementById(t.getAttribute('aria-describedby')); const blk = t.closest('p, li'); return { t: t.textContent, key: t.getAttribute('aria-describedby'), ctx: blk.textContent.replace(/\s+/g, ' ').slice(0, 110), defOnPage: document.body.innerText.includes(d.textContent.replace(/^./, c => c)) }; }));
    console.log('\n' + f, errs.length ? 'ERRORES ' + errs : '');
    r.forEach(x => { console.log('  ' + x.key.padEnd(18), JSON.stringify(x.t), '←', x.ctx); found[x.key] = (found[x.key] || 0) + 1; });
    await p.close(); }
  console.log('\npáginas por término', found);
  await b.close(); })();
