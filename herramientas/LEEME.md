# Herramientas del sitio

No forman parte del sitio publicado. Sirven para regenerar las páginas y revisarlas.

- `build.py`: genera las 7 páginas. Uso: `python3 build.py <carpeta del repositorio>`. Necesita `contenido.md` en esa carpeta (no está en el repositorio a propósito).
- `convert_photos.py`: convierte las fotos originales a WebP 800/1600 px y crea `og-portada.jpg`.
- Scripts `.js` (Playwright): contraste AA, scroll horizontal, teclado, textos contra `contenido.md` y `mejoras.md`, glosario, simulacro, planificador, movimiento y fluidez. `gsap_route.js` sirve GSAP y Lenis desde copias locales de npm (`gsap-pkg/` y `lenis-pkg/`, que no se guardan aquí).

Los scripts usan rutas de la sesión donde se crearon; hay que ajustarlas antes de volver a usarlos.
