// Sirve GSAP y Lenis desde las copias locales de npm (mismas versiones que los CDN) o los bloquea.
// mode: 'local' | 'block' (bloquea ambos) | 'block-gsap' | 'block-lenis'
const fs = require('fs');
const GSAP = __dirname + '/gsap-pkg/package/dist/';
const LENIS = __dirname + '/lenis-pkg/package/dist/';
module.exports = async function (ctx, mode) {
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/*', route => {
    if (mode === 'block' || mode === 'block-gsap') return route.abort();
    route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(GSAP + route.request().url().split('/').pop()) });
  });
  await ctx.route('https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/*', route => {
    if (mode === 'block' || mode === 'block-lenis') return route.abort();
    route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(LENIS + route.request().url().split('/').pop()) });
  });
};
