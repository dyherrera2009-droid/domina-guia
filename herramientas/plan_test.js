const { chromium } = require('playwright');
const root = process.argv[2], shots = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await require(__dirname + '/gsap_route.js')(p, process.env.GSAP || 'local');
  await p.goto('file://' + root + '/guia.html');
  const hoy = await p.evaluate(() => { const d = new Date(); return [d.getFullYear(), d.getMonth(), d.getDate()]; });
  console.log('Hoy (navegador):', hoy.join('-'));
  for (const n of [40, 28, 27, 10, 4, 3, 1, 0, -5]) {
    const val = await p.evaluate(n => { const d = new Date(); const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
      return e.getFullYear() + '-' + String(e.getMonth() + 1).padStart(2, '0') + '-' + String(e.getDate()).padStart(2, '0'); }, n);
    await p.fill('#plan-fecha', val);
    await p.focus('.plan-form button'); await p.keyboard.press('Enter');
    const r = await p.evaluate(() => ({
      msg: document.querySelector('[data-plan-msg]').hidden ? '' : document.querySelector('[data-plan-msg]').textContent,
      cards: [...document.querySelectorAll('.plan-card')].map(c => (c.querySelector('.plan-stage')?.textContent || '') + ' | ' + c.querySelector('.plan-dates').textContent + ' | ' + c.querySelector('.plan-act').textContent.slice(0, 28)),
      focus: document.activeElement.className }));
    console.log(`\n${n} días (examen ${val}) -> ${r.msg || '(sin mensaje)'}  [foco: ${r.focus}]`);
    r.cards.forEach(c => console.log('   ' + c));
    if (n === 10) await p.locator('.v-plan').screenshot({ path: shots + '/plan-10.png' });
    if (n === 40) await p.locator('.v-plan').screenshot({ path: shots + '/plan-40.png' });
  }
  await p.fill('#plan-fecha', ''); await p.click('.plan-form button');
  console.log('\nvacío ->', await p.textContent('[data-plan-msg]'));
  console.log('errores', errs); await b.close();
})();
