const { chromium } = require('playwright');
const root = process.argv[2];
const pages = (process.env.PAGES || 'index,conoce-domina,contenidos,guia,recomendaciones,conclusiones,referencias').split(',');

// Mide contraste de cada nodo de texto visible contra el primer fondo opaco de sus ancestros.
const scan = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const mix = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = el => {
    const layers = []; let e = el;
    while (e && e.nodeType === 1) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient') && !e.matches('.seg')) {
        const cols = cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []; if (cols.length) { layers.push({ grad: cols.map(parse) }); break; }
      }
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      e = e.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 }; const out = [];
    const last = layers[layers.length - 1];
    const bases = last && last.grad ? last.grad : [last && last.a >= 1 ? last : base];
    for (const b0 of bases) { let b = b0; for (let i = layers.length - (last && (last.grad || last.a >= 1) ? 2 : 1); i >= 0; i--) b = mix(layers[i], b); out.push(b); }
    return out;
  };
  const bad = []; let n = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (!el || el.closest('svg,template,[hidden],.sr-only,script,style,noscript')) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    // Controles desactivados: exentos por WCAG
    if (el.closest('.is-disabled,[disabled]')) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    let fg = parse(cs.color); fg.a *= op;
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const min = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    for (const bg of bgOf(el)) {
      const f = mix(fg, bg); const L1 = lum(f), L2 = lum(bg); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); n++;
      if (cr < min) bad.push(`${cr.toFixed(2)} <${min} "${t.textContent.trim().slice(0, 40)}" (${el.className || el.tagName})`);
    }
  }
  return { n, bad: [...new Set(bad)] };
};

async function openStates(p, f) {
  if (f === 'contenidos') for (let i = 1; i <= 7; i++) await p.click(`#reactivo-${i} .quiz-option[data-option=${i % 2 ? 'A' : 'B'}]`);
  if (f === 'recomendaciones') { await p.click('label[for=chk-pase]'); await p.click('label[for=chk-agua]'); }
  if (f === 'guia') {
    await p.click('.diag-form button[type=submit]');
    for (let i = 1; i <= 8; i++) await p.click(`label[for=diag-${i}-${(i % 4) + 1}]`);
    await p.click('.diag-form button[type=submit]');
    const v = await p.evaluate(() => { const d = new Date(); const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 40); return e.getFullYear() + '-' + String(e.getMonth() + 1).padStart(2, '0') + '-' + String(e.getDate()).padStart(2, '0'); });
    await p.fill('#plan-fecha', v); await p.click('.plan-form button');
  }
}

(async () => {
  const b = await chromium.launch(); let total = 0, fails = 0;
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ colorScheme: theme, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.removeItem('domina-tema'); localStorage.removeItem('domina-simulacro'); } catch (e) {} });
    if (process.env.GSAP) await require(__dirname + '/gsap_route.js')(ctx, process.env.GSAP);
    for (const f of pages) {
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('dialog', d => { errs.push('DIALOG ' + d.type()); d.dismiss(); });
      await p.clock.install();
      await p.setViewportSize({ width: 1280, height: 900 });
      await p.goto('file://' + root + '/' + f + '.html');
      await openStates(p, f);
      const states = [['normal', null]];
      if (f === 'guia') states.push(['simulacro en curso', async () => { await p.click('[data-sim-begin]'); await p.click('label[for=sim-1-A]'); await p.click('[data-sim-mark]'); await p.click('[data-sim-next]'); await p.click('[data-sim-finish]'); }],
        ['últimos 5 min', async () => { await p.click('[data-sim-confirm-no]'); await p.clock.fastForward((2314 - 200) * 1000); await p.clock.runFor(2000); }],
        ['resultados', async () => { await p.click('[data-sim-finish]'); await p.click('[data-sim-confirm-yes]'); }]);
      for (const [name, act] of states) {
        if (act) await act();
        const ov = [];
        for (const w of [360, 768, 1280]) { await p.setViewportSize({ width: w, height: 900 }); const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > w) ov.push(w + '→' + sw); }
        await p.setViewportSize({ width: 1280, height: 900 });
        const r = await p.evaluate(scan);
        total += r.n; fails += r.bad.length;
        console.log(`${theme.padEnd(5)} ${f.padEnd(16)} ${name.padEnd(19)} textos:${String(r.n).padStart(4)}  bajo AA:${r.bad.length}  overflow:${ov.length ? ov.join(',') : 0}  errores:${errs.length}`);
        r.bad.slice(0, 8).forEach(x => console.log('     ' + x));
      }
      await p.close();
    }
    await ctx.close();
  }
  console.log(`\nTotal de mediciones: ${total}, por debajo de AA: ${fails}`);
  await b.close();
})();
