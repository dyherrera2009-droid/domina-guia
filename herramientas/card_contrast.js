// Contraste de la tarjeta del glosario y de la etiqueta del punto, en claro y oscuro
const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
function lum(c) { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
(async () => { const b = await chromium.launch();
  for (const theme of ['light', 'dark']) { const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: theme }); await use(ctx, 'local'); const p = await ctx.newPage();
    await p.goto('file:///home/user/domina-guia/guia.html'); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('.term').click()); await p.waitForTimeout(200);
    const c = await p.evaluate(() => { const card = document.querySelector('.gloss-card'); const g = e => getComputedStyle(e); return { bg: g(card).backgroundColor, t: g(card.querySelector('p')).color, h: g(card.querySelector('strong')).color, lb: g(document.querySelector('.term')).borderBottomColor }; });
    const l = await p.evaluate(() => { const l = document.createElement('span'); l.className = 'cursor-label'; document.body.appendChild(l); const g = getComputedStyle(l); return { bg: g.backgroundColor, fg: g.color }; });
    console.log(theme, 'tarjeta texto', ratio(c.t, c.bg), 'título', ratio(c.h, c.bg), '| etiqueta punto', ratio(l.fg, l.bg)); await ctx.close(); }
  await b.close(); })();
