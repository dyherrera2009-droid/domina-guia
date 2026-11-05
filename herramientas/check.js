const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const root = process.argv[2], shots = process.argv[3];
const md = fs.readFileSync(path.join(root,'contenido.md'),'utf8');
const pages = ['index.html','conoce-domina.html','contenidos.html','guia.html','recomendaciones.html','conclusiones.html','referencias.html'];
// split md into page blocks
const blocks = md.split(/^## PÁGINA \d+: /m).slice(1);
const norm = s => s.replace(/\*/g,'').replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
const skip = l => /^(VISUAL|Nota para el diseño|Formato:|Botón:|Título del sitio:|Subtítulo:|Datos del autor:|Respuesta correcta:|---|\|---)/.test(l) || l==='';
(async () => {
  const b = await chromium.launch();
  for (let i=0;i<pages.length;i++){
    const p = await b.newPage();
    if (process.env.GSAP) await require(__dirname + '/gsap_route.js')(p, process.env.GSAP);
    const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+path.join(root,pages[i]));
    const txt = norm(await p.evaluate(()=>{document.querySelectorAll('[hidden]').forEach(e=>e.hidden=false);return document.body.innerText}));
    const lines = blocks[i].split('\n').slice(1).map(l=>l.trim());
    const missing=[];
    for (let l of lines){
      if (skip(l)) continue;
      l = l.replace(/^#+\s*/,'').replace(/^- /,'').replace(/^\d+\. /,'');
      if (l.startsWith('|')) { l.split('|').map(c=>c.trim()).filter(Boolean).forEach(c=>{ if(!txt.includes(norm(c))) missing.push(c)}); continue; }
      l = l.replace(/^Explicación: /,'Explicación: ').replace(/^([ABC])\) /,'');
      if (!txt.includes(norm(l))) missing.push(l);
    }
    console.log(pages[i], 'errores:', errs.length?errs:'0', 'faltan:', missing.length? missing : 0);
    for (const w of [360,768,1280]) { await p.setViewportSize({width:w,height:900}); const sw = await p.evaluate(()=>document.documentElement.scrollWidth); if (sw>w) console.log('  overflow', w, sw); if (shots) await p.screenshot({path:`${shots}/${pages[i].replace('.html','')}-${w}.png`, fullPage:true}); }
    await p.close();
  }
  await b.close();
})();
