const { chromium } = require('playwright');
const fs = require('fs');
const useGsap = require(__dirname + '/gsap_route.js');
const root = process.argv[2];
const src = fs.readFileSync(__dirname + '/audit.js', 'utf8');
const scan = eval('(' + src.split('const scan = ')[1].split('\n};\n')[0] + '\n})');
const pages = ['index', 'conoce-domina', 'contenidos', 'guia', 'recomendaciones', 'conclusiones', 'referencias'];
(async () => {
  const b = await chromium.launch();
  // 1) Con movimiento: errores, scroll horizontal durante el recorrido y AA al terminar
  for (const t of ['light', 'dark']) for (const w of [360, 768, 1280]) {
    const ctx = await b.newContext({ colorScheme: t, viewport: { width: w, height: 800 } });
    await useGsap(ctx, 'local');
    let line = [];
    for (const f of pages) {
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await p.goto(`file://${root}/${f}.html`, { waitUntil: 'load' });
      let maxW = 0; const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= H; y += 400) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); maxW = Math.max(maxW, await p.evaluate(() => document.documentElement.scrollWidth)); }
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1300);
      const r = await p.evaluate(scan);
      const motion = await p.evaluate(() => document.documentElement.classList.contains('js-motion'));
      const left = await p.evaluate(() => document.querySelectorAll('.split-visual').length + [...document.querySelectorAll('.photo-frame')].filter(f => getComputedStyle(f).clipPath !== 'none').length);
      if (left) errs.push('quedan ' + left + ' títulos divididos o fotos recortadas');
      line.push(`${f}: AA ${r.bad.length ? 'FALLA ' + r.bad.slice(0, 3).join(' ; ') : 'ok'}${maxW > w ? ' OVERFLOW ' + maxW : ''}${errs.length ? ' ERRORES ' + errs.join('|') : ''}${motion ? '' : ' (sin js-motion)'}`);
      await p.close();
    }
    console.log(`con movimiento ${t} ${w}: ` + line.join(' · '));
    await ctx.close();
  }
  // 2) Movimiento reducido y 3) GSAP bloqueado: todo en su estado final de inmediato
  for (const [name, opts, mode] of [['movimiento reducido', { reducedMotion: 'reduce' }, 'local'], ['GSAP y Lenis bloqueados', {}, 'block'], ['solo GSAP bloqueado', {}, 'block-gsap'], ['solo Lenis bloqueado', {}, 'block-lenis']]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
    await useGsap(ctx, mode);
    const p = await ctx.newPage(); const jsErr = []; p.on('pageerror', e => jsErr.push(e.message));
    const netErr = []; p.on('console', m => { if (m.type() === 'error') netErr.push(m.text()); });
    await p.goto(`file://${root}/index.html`, { waitUntil: 'load' });
    const hero = await p.evaluate(() => ({ cls: document.documentElement.className, op: [...document.querySelectorAll('.hero-anim')].map(e => getComputedStyle(e).opacity).join(','), tr: getComputedStyle(document.querySelector('.hero-bg img')).transform }));
    await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(300);
    const heroTr = await p.evaluate(() => getComputedStyle(document.querySelector('.hero-bg img')).transform);
    await p.goto(`file://${root}/conoce-domina.html`, { waitUntil: 'load' });
    const info = await p.evaluate(() => { const bx = document.querySelector('.v-structure'); return { op: [...bx.querySelectorAll('.session, .seg, .legend li, .structure-total')].every(e => getComputedStyle(e).opacity === '1'), cnt: bx.querySelector('.structure-total .big').textContent, h2: [...document.querySelectorAll('.band-head h2')].every(h => getComputedStyle(h).opacity === '1') }; });
    await p.goto(`file://${root}/guia.html`, { waitUntil: 'load' });
    const ph = await p.evaluate(() => [...document.querySelectorAll('.photo-frame img')].map(i => getComputedStyle(i).transform + ' op ' + getComputedStyle(i).opacity + ' clip ' + getComputedStyle(i.parentNode).clipPath).join(' | ') + ' | divididos ' + document.querySelectorAll('.split-visual').length + ' | lenis ' + document.documentElement.classList.contains('lenis') + ' | horizontal ' + !!document.querySelector('.is-horizontal') + ' fijado ' + !!document.querySelector('.pin-spacer') + ' punto ' + !!document.querySelector('.cursor-dot'));
    await p.goto(`file://${root}/contenidos.html`, { waitUntil: 'load' });
    const stk = await p.evaluate(() => !!document.querySelector('.is-stacked') + ' sticky ' + [...document.querySelectorAll('.group-card')].some(c => getComputedStyle(c).position === 'sticky'));
    await p.goto(`file://${root}/conoce-domina.html`, { waitUntil: 'load' });
    const mq = await p.evaluate(() => { const t = document.querySelector('.marquee-track'); const vis = [...document.querySelectorAll('.marquee-list:not([aria-hidden]) li')].every(li => { const r = li.getBoundingClientRect(); return r.right <= innerWidth && r.left >= 0; }); return getComputedStyle(t).animationName + ' visibles-todos ' + vis; });
    console.log(`\n${name}: clases html "${hero.cls}" | entrada portada opacidades ${hero.op} | foto portada al bajar ${heroTr} | infografía visible ${info.op}, contador ${info.cnt}, títulos visibles ${info.h2} | foto guía ${ph} | cinta ${mq} | apilado ${stk} | errores JS ${jsErr.length} | errores de red: ${netErr.length ? netErr.length + ' (' + netErr[0].slice(0, 60) + ')' : 0}`);
    await ctx.close();
  }
  await b.close();
})();
