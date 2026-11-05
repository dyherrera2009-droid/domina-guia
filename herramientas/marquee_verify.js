const { chromium } = require('playwright');
const PAGES = ['index','conoce-domina','contenidos','guia','recomendaciones','conclusiones','referencias'];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ reducedMotion: 'reduce' }); let site = '';
  const items = {};
  for (const f of PAGES) { await p.goto('file:///home/user/domina-guia/' + f + '.html');
    items[f] = await p.evaluate(() => [...document.querySelectorAll('.marquee-list:not([aria-hidden]) li')].map(l => l.textContent.trim()));
    site += ' ' + await p.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll('.marquee, .glossary-defs, script').forEach(n => n.remove()); return c.textContent.replace(/\s+/g, ' '); }); }
  await p.goto('file:///home/user/domina-guia/referencias.html');
  const refs = await p.evaluate(() => { const li = [...document.querySelectorAll('.refs li')]; return { total: li.length, doi: li.filter(l => /doi\.org/.test(l.innerHTML)).length, fotos: li.filter(l => /\[Fotografía\]/.test(l.textContent) && /Unsplash/.test(l.textContent)).length }; });
  const low = site.toLowerCase();
  for (const f of PAGES) { console.log(f); items[f].forEach(t => console.log('  ' + (low.includes(t.toLowerCase()) ? 'literal   ' : 'NO LITERAL') + '  ' + t)); }
  console.log('referencias:', JSON.stringify(refs));
  await b.close(); })();
