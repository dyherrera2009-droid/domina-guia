// Detecta palabras partidas en h1/h2/h3/títulos de las 7 páginas a varios anchos.
const { chromium } = require('playwright');
const PAGES = ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias'];
const WIDTHS = (process.env.W || '360,768,1100,1280,1440').split(',').map(Number);
(async () => {
  const b = await chromium.launch();
  let total = 0;
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const pg = await ctx.newPage();
    for (const p of PAGES) {
      await pg.goto('file:///home/user/domina-guia/' + p + '.html');
      await pg.evaluate(() => document.fonts.ready);
      const r = await pg.evaluate(() => {
        const out = []; const fontOk = document.fonts.check('800 20px "Plus Jakarta Sans"');
        const sel = 'h1, h2, h3, .team-label, .pager-title, .group-name';
        document.querySelectorAll(sel).forEach(h => {
          if (!h.offsetParent && getComputedStyle(h).position !== 'fixed') return;
          const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
          let n; while ((n = walker.nextNode())) {
            if (n.parentElement.closest('svg, [aria-hidden="true"], .sr-only')) continue;
            const re = /\S+/g; let m;
            while ((m = re.exec(n.data))) {
              const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
              const tops = new Set([...rg.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top)));
              if (tops.size > 1) out.push(h.tagName + ' "' + h.textContent.trim().slice(0, 70) + '" -> ' + m[0]);
            }
          }
          if (h.scrollWidth > h.clientWidth + 1) out.push('DESBORDA ' + h.tagName + ' "' + h.textContent.trim().slice(0,60) + '"');
        });
        return { fontOk, out };
      });
      if (!r.fontOk) console.log('  (sin fuente Plus Jakarta Sans)', w, p);
      r.out.forEach(x => console.log(w, p, x)); total += r.out.length;
    }
    await ctx.close();
  }
  console.log('TOTAL palabras partidas/desbordes:', total);
  await b.close();
})();
