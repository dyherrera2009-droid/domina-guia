const { chromium } = require('playwright');
const root = process.argv[2], shots = process.argv[3];
const url = 'file://' + root + '/guia.html';
(async () => {
  const b = await chromium.launch();
  const errs = [], dialogs = [];
  const watch = p => { p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); }); };

  // ---- 1) Terminar con reactivos sin responder ----
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); await require(__dirname + '/gsap_route.js')(ctx, process.env.GSAP || 'local'); let p = await ctx.newPage(); watch(p);
  await p.goto(url);
  console.log('Pantalla inicial:', (await p.textContent('.sim-total')).trim(), '| reloj:', await p.textContent('[data-sim-time]'));
  await p.focus('[data-sim-begin]'); await p.keyboard.press('Enter');
  console.log('Tras empezar -> foco:', await p.evaluate(() => document.activeElement.id), '|', await p.textContent('#sim-item-1 .sim-count'));
  await p.click('label[for=sim-1-A]');           // 1 correcta
  await p.click('[data-sim-mark]');              // marcar 1
  await p.click('[data-sim-next]');
  await p.click('label[for=sim-2-A]');           // 2 incorrecta
  await p.click('label[for=sim-2-B]');           // cambia a correcta
  await p.click('.sim-nav-btn[data-go="16"]');
  console.log('Ir a 16 ->', await p.textContent('#sim-item-16 .sim-count'), '| Siguiente desactivado:', await p.getAttribute('[data-sim-next]', 'aria-disabled'));
  await p.click('label[for=sim-16-A]');          // 16 incorrecta
  console.log('Navegación:', await p.evaluate(() => [...document.querySelectorAll('.sim-nav-btn')].slice(0, 3).concat([...document.querySelectorAll('.sim-nav-btn')].slice(15)).map(b => b.textContent.replace(/\s+/g, ' ').trim()).join(' / ')));
  console.log('¿Muestra correctas antes de terminar?', await p.evaluate(() => [...document.querySelectorAll('.sim-item:not([hidden]) .sim-expl')].some(e => !e.hidden)));
  await p.locator('.sim-exam').screenshot({ path: shots + '/sim-exam.png' });
  await p.click('[data-sim-finish]');
  console.log('Confirmación:', await p.textContent('[data-sim-confirm-txt]'), '| foco:', await p.evaluate(() => document.activeElement.id));
  await p.keyboard.press('Escape');
  console.log('Escape -> oculta:', await p.isHidden('[data-sim-confirm]'), '| foco:', await p.evaluate(() => document.activeElement.textContent.trim()));
  await p.click('[data-sim-finish]'); await p.click('[data-sim-confirm-yes]');
  await p.waitForTimeout(1200);
  console.log('Resultado:', await p.textContent('[data-sim-score]'), '|', await p.textContent('[data-sim-msg]'));
  console.log('Tiempo usado:', await p.textContent('[data-sim-used]'));
  console.log('Por área:', await p.evaluate(() => [...document.querySelectorAll('[data-sim-areas] li')].map(li => li.querySelector('.rb-label').textContent + ' ' + li.querySelector('.sim-area-val').textContent).join(' | ')));
  console.log('Revisión #2:', await p.evaluate(() => document.querySelectorAll('[data-sim-review] li')[1].innerText.replace(/\n+/g, ' / ')));
  console.log('Revisión #3:', await p.evaluate(() => document.querySelectorAll('[data-sim-review] li')[2].innerText.replace(/\n+/g, ' / ').slice(0, 120)));
  await p.locator('.sim-results').screenshot({ path: shots + '/sim-results.png' });
  // recargar con resultados -> siguen
  await p.reload(); console.log('Recarga con resultados -> visibles:', await p.isVisible('[data-sim-results]'), await p.textContent('[data-sim-score]'));
  // reiniciar
  await p.click('[data-sim-restart]');
  console.log('Reiniciar -> inicio visible:', await p.isVisible('[data-sim-start]'), '| guardado:', await p.evaluate(() => localStorage.getItem('domina-simulacro')), '| foco:', await p.evaluate(() => document.activeElement.textContent.trim()));
  await ctx.close();

  // ---- 2) Recargar a la mitad ----
  ctx = await b.newContext({ viewport: { width: 360, height: 800 } }); await require(__dirname + '/gsap_route.js')(ctx, process.env.GSAP || 'local'); p = await ctx.newPage(); watch(p);
  await p.clock.install();
  await p.goto(url);
  await p.click('[data-sim-begin]');
  for (const [n, l] of [[1, 'A'], [2, 'B'], [3, 'C'], [4, 'B'], [5, 'B'], [6, 'A'], [7, 'A'], [8, 'B']]) { await p.click('.sim-nav-btn[data-go="' + n + '"]'); await p.click(`label[for=sim-${n}-${l}]`); }
  await p.click('.sim-nav-btn[data-go="5"]'); await p.click('[data-sim-mark]');
  await p.clock.fastForward(10 * 60 * 1000); await p.clock.runFor(1500);
  const before = await p.textContent('[data-sim-time]');
  await p.reload();
  console.log('\nRecarga a la mitad -> reloj antes', before, 'después', await p.textContent('[data-sim-time]'), '| reactivo actual:', await p.evaluate(() => document.querySelector('.sim-item:not([hidden]) .sim-count').textContent), '| marcado 5:', await p.getAttribute('[data-sim-mark]', 'aria-pressed'), '| respuesta 3:', await p.evaluate(() => document.querySelector('input[name=sim-3]:checked')?.value));
  console.log('360 scrollW:', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.locator('.sim-exam').screenshot({ path: shots + '/sim-360.png' });

  // ---- 3) Que se acabe el tiempo ----
  await p.clock.fastForward((38 * 60 + 34 - 10 * 60 - 301) * 1000); await p.clock.runFor(1500);
  console.log('\nFaltando ~5:01 ->', await p.textContent('[data-sim-time]'), '| aviso:', JSON.stringify(await p.textContent('[data-sim-warning]')));
  await p.clock.runFor(2000);
  console.log('Faltando <5:00 ->', await p.textContent('[data-sim-time]'), '| aviso:', JSON.stringify(await p.textContent('[data-sim-warning]')), '| clase:', await p.getAttribute('.sim-top', 'class'));
  await p.locator('.sim-top').screenshot({ path: shots + '/sim-5min.png' });
  await p.clock.fastForward(300 * 1000); await p.clock.runFor(1500);
  console.log('Tiempo agotado -> resultados:', await p.isVisible('[data-sim-results]'), '|', await p.textContent('[data-sim-score]'), '|', await p.textContent('[data-sim-msg]'), '| usado:', await p.textContent('[data-sim-used]'));
  await ctx.close();

  // ---- 4) Tiempo agotado con la página cerrada ----
  ctx = await b.newContext(); await require(__dirname + '/gsap_route.js')(ctx, process.env.GSAP || 'local'); p = await ctx.newPage(); watch(p);
  await p.goto(url);
  await p.evaluate(() => localStorage.setItem('domina-simulacro', JSON.stringify({ v: 1, status: 'running', startedAt: Date.now() - 3000e3, endAt: Date.now() - 600e3, answers: { 1: 'A' }, marked: [], current: 3 })));
  await p.reload();
  console.log('\nVencido al volver -> resultados:', await p.isVisible('[data-sim-results]'), '|', await p.textContent('[data-sim-score]'), '| usado:', await p.textContent('[data-sim-used]'));
  await ctx.close();

  console.log('\nerrores:', errs, '| diálogos del navegador:', dialogs);
  await b.close();
})();
