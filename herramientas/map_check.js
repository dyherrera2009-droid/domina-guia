const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
(async () => { const b = await chromium.launch();
  for (const [mode, opts] of [['local', {}], ['block', {}], ['local', { reducedMotion: 'reduce' }]]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts }); await use(ctx, mode); const p = await ctx.newPage();
    await p.goto('file:///home/user/domina-guia/contenidos.html'); await p.waitForTimeout(500);
    const before = await p.evaluate(() => [...document.querySelectorAll('.group-card')].map(c => getComputedStyle(c).opacity).join(','));
    await p.evaluate(() => document.querySelector('.v-map').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const cs = [...document.querySelectorAll('.group-card')]; const gaps = cs.slice(1).map((c, i) => Math.round(c.getBoundingClientRect().top - cs[i].getBoundingClientRect().bottom)); const br = [...document.querySelectorAll('.map-branch')].map(x => Math.round(x.querySelector('.map-node').getBoundingClientRect().top)); return { op: cs.map(c => getComputedStyle(c).opacity).join(','), pos: cs.map(c => getComputedStyle(c).position).join(','), gaps, nodosRama: br, terminos: document.querySelectorAll('.term').length }; });
    console.log(mode + (opts.reducedMotion ? ' reducido' : ''), 'antes de bajar', before, '|', JSON.stringify(r)); await ctx.close(); }
  await b.close(); })();
