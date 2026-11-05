const { chromium } = require('playwright'); const use = require(__dirname + '/gsap_route.js');
const card = p => p.evaluate(() => { const c = document.querySelector('.gloss-card'); const r = c.getBoundingClientRect(); return c.hidden ? 'oculta' : `visible "${c.textContent.slice(0, 50)}…" x${Math.round(r.left)} y${Math.round(r.top)} w${Math.round(r.width)} docW ${document.documentElement.scrollWidth}`; });
(async () => { const b = await chromium.launch(); const errs = [];
  // Mouse
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'local'); let p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/domina-guia/contenidos.html'); await p.waitForTimeout(600);
  const t = await p.$('.term'); await t.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); let bb = await t.boundingBox();
  await p.mouse.move(bb.x - 60, bb.y - 30); await p.waitForTimeout(200);
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 }); await p.waitForTimeout(400);
  console.log('mouse sobre término:', await card(p), '| punto escala', await p.evaluate(() => getComputedStyle(document.querySelector('.cursor-dot')).transform));
  await p.screenshot({ path: __dirname + '/tanda2/glosario-hover.png' });
  const cb = await (await p.$('.gloss-card')).boundingBox();
  await p.mouse.move(cb.x + 30, cb.y + 20, { steps: 8 }); await p.waitForTimeout(500);
  console.log('puntero pasa a la tarjeta:', await card(p));
  await p.mouse.move(5, 400, { steps: 5 }); await p.waitForTimeout(600);
  console.log('puntero fuera:', await card(p));
  // Etiquetas
  for (const [sel, url] of [['.quiz-option', 'contenidos'], ['a[href^="http"]', 'referencias'], ['.sim-options label', 'guia'], ['.v-timeline', 'guia']]) {
    await p.goto('file:///home/user/domina-guia/' + url + '.html'); await p.waitForTimeout(600);
    if (sel === '.sim-options label') { await p.click('[data-sim-begin]'); await p.waitForTimeout(300); }
    const el = (await p.$$(sel)).find(Boolean); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    if (sel === '.v-timeline') { const y = await p.evaluate(() => { const s = ScrollTrigger.getAll().find(s => s.pin); return (s.start + s.end) / 2; }); await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(400); }
    bb = await el.boundingBox(); await p.mouse.move(bb.x + 20, bb.y + bb.height / 2, { steps: 6 }); await p.waitForTimeout(400);
    console.log('etiqueta sobre', sel, '→', await p.evaluate(() => { const l = document.querySelector('.cursor-label'); return '"' + l.textContent + '" opacidad ' + getComputedStyle(l).opacity; }));
  }
  await ctx.close();
  // Teclado
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await use(ctx, 'local'); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/domina-guia/conoce-domina.html'); await p.waitForTimeout(600);
  let found = false; for (let i = 0; i < 60; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => document.activeElement.classList.contains('term'))) { found = true; break; } }
  await p.waitForTimeout(300);
  await p.evaluate(() => document.activeElement.setAttribute('data-ax', '1'));
  const cdp = await ctx.newCDPSession(p); const { root } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-ax]' });
  const ax = (await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })).nodes[0];
  const snap = { role: ax.role.value, name: ax.name.value, description: ax.description && ax.description.value };
  console.log('\nteclado: llega al término', found, '|', await card(p), '| nombre/desc', JSON.stringify([snap.role, snap.name, snap.description]));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150); console.log('Esc:', await card(p), '| foco sigue en término', await p.evaluate(() => document.activeElement.classList.contains('term')));
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  console.log('Enter:', await card(p), 'expandido', await p.evaluate(() => document.activeElement.getAttribute('aria-expanded')), '| anuncio:', JSON.stringify(await p.evaluate(() => document.querySelector('[role=status].sr-only').textContent.slice(0, 70))));
  await p.keyboard.press('Tab'); await p.waitForTimeout(150); console.log('Tab al siguiente:', await card(p));
  await ctx.close();
  // Celular (toque)
  ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }); await use(ctx, 'local'); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/domina-guia/conoce-domina.html'); await p.waitForTimeout(600);
  const tt = (await p.$$('.term'))[2]; await tt.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); bb = await tt.boundingBox();
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(300);
  console.log('\ncelular toque:', await card(p), '| punto existe', await p.evaluate(() => !!document.querySelector('.cursor')));
  await p.screenshot({ path: __dirname + '/tanda2/glosario-360.png' });
  await p.touchscreen.tap(20, 700); await p.waitForTimeout(300); console.log('toque fuera:', await card(p));
  console.log('errores', errs); await b.close(); })();
