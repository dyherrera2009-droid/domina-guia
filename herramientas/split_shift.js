// Compara la caja de cada título dividido contra el original (sin animación)
const { chromium } = require('playwright');
const use = require(__dirname + '/gsap_route.js');
const PAGES = ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias'];
(async () => { const b = await chromium.launch(); let worst = 0, n = 0;
  for (const w of [360, 768, 1100, 1280, 1440]) {
    const a = await b.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    const m = await b.newContext({ viewport: { width: w, height: 800 } }); await use(m, 'local');
    const pa = await a.newPage(), pm = await m.newPage();
    for (const p of PAGES) {
      await pa.goto('file:///home/user/domina-guia/' + p + '.html'); await pa.evaluate(() => document.fonts.ready);
      await pm.goto('file:///home/user/domina-guia/' + p + '.html'); await pm.evaluate(() => document.fonts.ready); await pm.waitForTimeout(300);
      const box = pg => pg.evaluate(() => [...document.querySelectorAll('.band-head h2')].map(h => [h.id, h.getBoundingClientRect().height, !!h.querySelector('.split-line'), h.querySelectorAll('.split-line').length]));
      const A = await box(pa), M = await box(pm);
      M.forEach((r, i) => { if (!r[2]) return; n++; const d = Math.abs(r[1] - A[i][1]); worst = Math.max(worst, d); if (d > 1) console.log('DESPLAZA', w, p, r[0], A[i][1].toFixed(1), '->', r[1].toFixed(1)); });
      // líneas: cada línea dividida no debe ser más ancha que el título
      const over = await pm.evaluate(() => [...document.querySelectorAll('.split-line-inner')].filter(s => s.scrollWidth > s.parentNode.parentNode.parentNode.clientWidth + 1).length);
      if (over) console.log('LINEA ANCHA', w, p, over);
    }
    await a.close(); await m.close(); }
  console.log('títulos divididos medidos:', n, ' mayor diferencia de alto (px):', worst.toFixed(2)); await b.close(); })();
