# Genera las 7 páginas HTML estáticas con cabecera, navegación y pie compartidos.
import os, re, sys

OUT = sys.argv[1]

ICONS = {
    "logo": '<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
    "building": '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>',
    "question": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "layers": '<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5 12 21l9-4.5"/>',
    "list": '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "clipboard": '<path d="M9 3h6v3H9z"/><path d="M7 4.5H5V21h14V4.5h-2"/><path d="M8.5 13.5l2.5 2.5 4.5-5"/>',
    "chart": '<path d="M3 20h18"/><path d="M6 20V11"/><path d="M11 20V5"/><path d="M16 20v-7"/>',
    "users": '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20v-1.5A3.5 3.5 0 0 1 7 15h6a3.5 3.5 0 0 1 3.5 3.5V20"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M20.5 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"/>',
    "grid": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    "bulb": '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    "pencil": '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
    "compass": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
    "check": '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    "bag": '<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    "star": '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z"/>',
    "flag": '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    "menu": '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>',
    "pause": '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    "play": '<path d="M7 5l12 7-12 7z"/>',
    "book": '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5v-15z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
}

ICON_TITLES = {
    "logo": "Birrete de graduación", "building": "Edificio", "question": "Signo de pregunta",
    "target": "Diana", "layers": "Capas", "list": "Lista", "clock": "Reloj",
    "clipboard": "Portapapeles", "chart": "Gráfica de barras", "users": "Personas",
    "grid": "Cuadrícula", "bulb": "Foco", "pencil": "Lápiz", "compass": "Brújula",
    "check": "Palomita", "calendar": "Calendario", "moon": "Luna", "bag": "Mochila",
    "star": "Estrella", "flag": "Bandera", "arrow-right": "Flecha a la derecha",
    "arrow-left": "Flecha a la izquierda", "menu": "Menú", "book": "Libro", "sun": "Sol",
    "pause": "Pausa", "play": "Reanudar",
}


def icon(name, cls="icon"):
    # Iconos decorativos: llevan title, pero se ocultan a lectores de pantalla.
    return (f'<svg class="{cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" '
            f'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
            f'aria-hidden="true" focusable="false"><title>{ICON_TITLES[name]}</title>{ICONS[name]}</svg>')


PAGES = [
    ("index.html", "Portada", "Portada"),
    ("conoce-domina.html", "Conoce el DOMINA", "Conoce el examen DOMINA"),
    ("contenidos.html", "Contenidos", "Contenidos del examen"),
    ("guia.html", "Guía práctica", "Guía práctica para aprobarlo"),
    ("recomendaciones.html", "Recomendaciones", "Recomendaciones previas al examen"),
    ("conclusiones.html", "Conclusiones", "Conclusiones"),
    ("referencias.html", "Referencias", "Referencias"),
]

TEAM = "Los Sustentantes"
SITE_URL = "https://dyherrera2009-droid.github.io/domina-guia/"  # solo para Open Graph, que exige URLs absolutas

FOOTER = (f"Equipo {TEAM} · 5°A · Fortalecimiento de Habilidades Académicas I · "
          "UVM Coyoacán · Otoño 2026")

# Integrante a cargo de cada página (por su h1)
SECCION_DE = {
    "Domina el DOMINA": "Dylan David Herrera Sánchez",
    "Conoce el examen DOMINA": "Antonio Israel Barragán Avilés",
    "Contenidos del examen": "Joseph Domínguez Manzo",
    "Guía práctica para aprobarlo": "Erick Emiliano Gómez Aguilar",
    "Recomendaciones previas al examen": "Brayan Bart Romero Rosas",
    "Conclusiones": "Jesús Antonio Tovar Ledesma",
    "Referencias": "Ángel Ricardo Velázquez Espino",
}

INTEGRANTES = [
    ("Dylan David Herrera Sánchez", "Portada"),
    ("Antonio Israel Barragán Avilés", "Conoce el examen DOMINA"),
    ("Joseph Domínguez Manzo", "Contenidos del examen"),
    ("Erick Emiliano Gómez Aguilar", "Guía práctica para aprobarlo"),
    ("Brayan Bart Romero Rosas", "Recomendaciones previas al examen"),
    ("Jesús Antonio Tovar Ledesma", "Conclusiones"),
    ("Ángel Ricardo Velázquez Espino", "Referencias"),
]


def longest_word(text):
    # Letras de la palabra más larga: styles.css ajusta el tamaño del título para que quepa completa.
    plain = re.sub(r"<[^>]+>", "", text)
    return max(len(w) for w in plain.split())


def section(sid, ico, title, body):
    # El tipo de franja (clara, alterna u oscura) lo asigna assign_bands() por página.
    return f'''
      <section class="band BANDKIND" id="{sid}" aria-labelledby="{sid}-titulo">
        <div class="band-inner container-wide">
          <div class="band-head">
            <h2 id="{sid}-titulo" style="--lw: {longest_word(title)}"><span class="h2-icon">{icon(ico)}</span>{title}</h2>
          </div>
          <div class="band-body">
{body}
          </div>
        </div>
      </section>'''


# Franja oscura destacada: la sección que lleva el visual principal de cada página
DARK_BANDS = {"estructura", "modulos-uvm", "tecnicas-de-repaso", "logistica"}


def assign_bands(body):
    import re
    count = [0]

    def kind(m):
        sid = m.group(1)
        k = "band-dark" if sid in DARK_BANDS else ("band-alt" if count[0] % 2 else "band-plain")
        count[0] += 1
        return f'<section class="band {k}" id="{sid}"'
    return re.sub(r'<section class="band BANDKIND" id="([^"]+)"', kind, body)


def nav(current):
    items = []
    for href, short, _ in PAGES:
        cur = ' aria-current="page"' if href == current else ""
        items.append(f'          <li><a href="{href}"{cur}>{short}</a></li>')
    return "\n".join(items)


def pager(current):
    i = [p[0] for p in PAGES].index(current)
    prev_html = next_html = '<span></span>'
    if i > 0:
        h, _, full = PAGES[i - 1]
        prev_html = (f'<a class="pager-link pager-prev" href="{h}">{icon("arrow-left")}'
                     f'<span><span class="pager-label">Anterior</span><span class="pager-title">{full}</span></span></a>')
    if i < len(PAGES) - 1:
        h, _, full = PAGES[i + 1]
        next_html = (f'<a class="pager-link pager-next" href="{h}">'
                     f'<span><span class="pager-label">Siguiente</span><span class="pager-title">{full}</span></span>{icon("arrow-right")}</a>')
    return f'''
    <nav class="pager container-wide" aria-label="Navegación entre páginas">
      {prev_html}
      {next_html}
    </nav>'''


def with_marquee(hero, filename):
    # La cinta va pegada a la cabecera; en la portada, antes de los datos del equipo
    cinta = marquee(*MARQUEES[filename])
    return hero.replace("<!-- CINTA -->", cinta) if "<!-- CINTA -->" in hero else hero + cinta


def page(filename, title, description, hero, body):
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Domina el DOMINA">
  <meta property="og:locale" content="es_MX">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{SITE_URL}{"" if filename == "index.html" else filename}">
  <meta property="og:image" content="{SITE_URL}img/og-portada.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Estudiante resolviendo una hoja de examen con lápiz sobre un pupitre.">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap">
  <link rel="stylesheet" href="styles.css">
  <noscript><style>.site-nav{{display:block}}.nav-toggle{{display:none}}</style></noscript>
  <script src="script.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header">
    <div class="header-inner container-wide">
      <a class="brand" href="index.html">{icon("logo", "brand-icon")}<span>Domina el DOMINA</span></a>
      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Cambiar a modo oscuro">
          {icon("moon", "icon icon-moon")}{icon("sun", "icon icon-sun")}
        </button>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-principal">
          {icon("menu")}<span>Menú</span>
        </button>
      </div>
      <nav class="site-nav" id="menu-principal" aria-label="Menú principal">
        <ul>
{nav(filename)}
        </ul>
      </nav>
    </div>
  </header>

  <main id="contenido" tabindex="-1">
{with_marquee(hero, filename)}
    <div class="bands">{assign_bands(body)}
    </div>
{pager(filename)}
  </main>

{glosario()}

  <footer class="site-footer">
    <div class="container">
      <p>{FOOTER}</p>
    </div>
  </footer>
</body>
</html>
'''


def hero(h1, extra="", bg=""):
    byline = f'\n        <p class="byline hero-anim">Sección elaborada por: <strong>{SECCION_DE[h1]}</strong></p>'
    rule = '\n        <span class="hero-rule hero-anim" aria-hidden="true"></span>'
    return f'''    <div class="hero hero-full{" has-bg" if bg else ""}">{bg}
      <div class="container-wide hero-inner">
        <h1 class="hero-anim" style="--lw: {longest_word(h1)}">{h1}</h1>{rule}{byline}{extra}
      </div>
    </div>'''


# Cinta de datos por página: solo datos que ya aparecen en el sitio
MARQUEES = {
    "index.html": ("Puntos clave de esta sección", [
        "150 reactivos", "Haz tu autodiagnóstico", "Arma tu plan con fechas", "Simulacro cronometrado"]),
    "conoce-domina.html": ("El examen en cifras", [
        "150 reactivos", "80 en la Sesión 1", "70 en la Sesión 2", "3 opciones por reactivo",
        "Inglés nivel B1", "2 sesiones de 3 horas"]),
    "contenidos.html": ("Puntos clave de esta sección", [
        "Grupo 1 BSFM", "Física", "Cálculo diferencial e integral", "Administración",
        "Historia universal", "Español e inglés"]),
    "guia.html": ("Puntos clave de esta sección", [
        "Autoevaluarte con preguntas", "Repasar en varios días", "Simular el examen",
        "Descarta primero las opciones que sabes que son falsas", "No dejes reactivos en blanco"]),
    "recomendaciones.html": ("Puntos clave de esta sección", [
        "Duerme bien varios días antes", "Desayuna antes de cada sesión", "Calculadora simple",
        "Pase de ingreso", "Llega con tiempo"]),
    "conclusiones.html": ("Puntos clave de esta sección", [
        "Autoevaluación", "Repaso en varios días", "Simulacros con tiempo"]),
    "referencias.html": ("Puntos clave de esta sección", [
        "14 referencias", "Usar la guía oficial", "8 fuentes con DOI", "3 fotografías de Unsplash"]),
}


def marquee(label, items):
    # La segunda copia solo cierra el ciclo visual; los lectores de pantalla leen la primera.
    def lista(hidden):
        attrs = ' aria-hidden="true"' if hidden else f' aria-label="{label}"'
        lis = "".join(f'<li>{t}<span class="marquee-dot" aria-hidden="true"></span></li>' for t in items)
        return f'<ul class="marquee-list"{attrs}>{lis}</ul>'
    return f'''
    <div class="marquee" data-marquee>
      <div class="marquee-viewport">
        <div class="marquee-track">{lista(False)}{lista(True)}</div>
      </div>
      <button class="marquee-toggle" type="button" aria-label="Pausar la cinta de datos">{icon("pause", "icon icon-pause")}{icon("play", "icon icon-play")}<span class="marquee-toggle-text">Pausar</span></button>
    </div>'''


# Glosario: cada definición es una cita literal del texto del sitio (contenido.md).
# script.js marca la primera aparición de cada término por página.
GLOSARIO = [
    ("ceneval", "Ceneval",
     "El Centro Nacional de Evaluación para la Educación Superior, conocido como Ceneval, es una asociación civil. "
     "No es una dependencia del gobierno, sino una organización sin fines de lucro que diseña y aplica exámenes."),
    ("propedeutico", "Componente propedéutico",
     "el componente propedéutico, la parte del bachillerato que prepara para la universidad con las materias del área de cada alumno."),
    ("disciplinares", "Módulos disciplinares",
     "Los módulos disciplinares miden los conocimientos específicos de cuatro asignaturas del componente propedéutico, "
     "que son las materias del área que eligió cada alumno."),
    ("transversales", "Módulos transversales",
     "Los módulos transversales miden comprensión lectora y redacción indirecta en español y en inglés, "
     "y los presentan todos los estudiantes sin importar su área."),
    ("redaccion", "Redacción indirecta",
     "La redacción indirecta mide qué tan bien escribes sin pedirte un texto propio: "
     "las preguntas te piden corregir, completar u ordenar un texto."),
    ("b1", "Nivel B1",
     "el nivel B1 del Marco Común Europeo significa poder entender las ideas principales de textos claros sobre temas conocidos."),
]
_FUENTE = open(os.path.join(OUT, "contenido.md"), encoding="utf-8").read()
for _k, _t, _d in GLOSARIO:
    assert _d in _FUENTE, f"Definición no literal: {_k}"


def glosario():
    defs = "\n".join(f'      <p id="def-{k}" data-term="{t}">{d}</p>' for k, t, d in GLOSARIO)
    return f'''  <div class="glossary-defs" hidden>
{defs}
  </div>'''


def ul(items, cls="list"):
    lis = "\n".join(f"          <li>{x}</li>" for x in items)
    return f'        <ul class="{cls}">\n{lis}\n        </ul>'


def ol(items, cls="olist"):
    lis = "\n".join(f"          <li>{x}</li>" for x in items)
    return f'        <ol class="{cls}">\n{lis}\n        </ol>'


def p(text, cls=None):
    c = f' class="{cls}"' if cls else ""
    return f"        <p{c}>{text}</p>"


def table(label, head, rows, highlight=None):
    th = "".join(f'<th scope="col">{h}</th>' for h in head)
    trs = []
    for r in rows:
        cls = ' class="row-highlight"' if highlight and r[0].startswith(highlight) else ""
        cells = f'<th scope="row">{r[0]}</th>' + "".join(f"<td>{c}</td>" for c in r[1:])
        trs.append(f"              <tr{cls}>{cells}</tr>")
    trs = "\n".join(trs)
    return f'''        <div class="table-wrap" role="region" aria-label="{label}" tabindex="0">
          <table>
            <thead><tr>{th}</tr></thead>
            <tbody>
{trs}
            </tbody>
          </table>
        </div>'''


def lead(term, rest):
    # Resalta la etiqueta antes de los dos puntos sin cambiar el texto.
    return f"<strong>{term}</strong>{rest}"


pages = {}

# ---------- PÁGINA 1 ----------
pages["index.html"] = page(
    "index.html", "Domina el DOMINA | Portada",
    "Guía práctica para entender y aprobar el examen DOMINA-BACH Avanzado.",
    hero("Domina el DOMINA", '''
        <p class="hero-subtitle hero-anim">Guía práctica para entender y aprobar el examen DOMINA-BACH Avanzado</p>
        <!-- FOTO a credito -->''', bg="\n        <!-- FOTO a fondo -->") + "<!-- CINTA -->" + f'''
    <section class="colophon" aria-labelledby="datos-equipo">
      <div class="container-wide">
        <div class="team-card">
          <p class="team-label" id="datos-equipo">Datos del equipo</p>
          <ul class="team-list">
            <li><strong>Equipo:</strong> {TEAM}</li>
            <li><strong>Líder del proyecto:</strong> Dylan David Herrera Sánchez</li>
            <li class="team-members">
              <strong id="integrantes">Integrantes y sección a su cargo:</strong>
              <ul class="member-list" aria-labelledby="integrantes">
{chr(10).join(f'                <li><span class="member-name">{n}:</span> <span class="member-sec">{s}</span></li>' for n, s in INTEGRANTES)}
              </ul>
            </li>
            <li><strong>Grupo:</strong> 5°A</li>
            <li><strong>Materia:</strong> Fortalecimiento de Habilidades Académicas I</li>
            <li><strong>Profesor:</strong> Mtro. José Luis González Pensamiento</li>
            <li>Universidad del Valle de México, campus Coyoacán</li>
            <li>Periodo Otoño 2026</li>
          </ul>
        </div>
      </div>
    </section>''',
    section("por-que-diagnosticar", "target", "¿Por qué diagnosticar nuestras habilidades académicas?", "\n".join([
        p("Un examen diagnóstico no sirve para reprobar a nadie, sirve para saber dónde estamos parados. Cuando conocemos qué temas dominamos y en cuáles fallamos, podemos estudiar con un objetivo claro en lugar de repasar todo al azar."),
        p("La evaluación funciona mejor cuando sus resultados se usan para mejorar. Black y Wiliam (1998) revisaron decenas de estudios y encontraron que la retroalimentación que recibe el estudiante sobre su desempeño es una de las formas más efectivas de elevar el aprendizaje. El DOMINA hace justo eso: le da a cada alumno y a su escuela un reporte por área que muestra fortalezas y puntos débiles antes de entrar a la universidad (Centro Nacional de Evaluación para la Educación Superior [Ceneval], 2023)."),
        p("En este sitio vas a encontrar cómo está armado el examen, qué contenidos evalúa, ejemplos de reactivos y estrategias respaldadas por investigación para prepararte."),
        f'        <p class="cta"><a class="btn" href="conoce-domina.html">Empezar la guía{icon("arrow-right")}</a></p>',
    ])),
)

# ---------- PÁGINA 2 ----------
p2 = "".join([
    section("quien-lo-elabora", "building", "¿Quién lo elabora?",
        p("El Centro Nacional de Evaluación para la Educación Superior, conocido como Ceneval, es una asociación civil. No es una dependencia del gobierno, sino una organización sin fines de lucro que diseña y aplica exámenes. Con ellos mide conocimientos, que es lo que una persona sabe; habilidades, que es lo que sabe hacer, como razonar o comprender un texto; y competencias, que es la capacidad de juntar ambas cosas para resolver una situación real.")),
    section("que-es", "question", "¿Qué es el DOMINA-BACH?", "\n".join([
        p("El DOMINA-BACH es un conjunto de exámenes diagnósticos del Ceneval para el bachillerato. Que sea diagnóstico significa que no sirve para aprobar o reprobar, sino para detectar qué dominan los alumnos y en qué tienen carencias. Tiene dos niveles (Ceneval, 2021, 2023):"),
        table("Niveles del DOMINA-BACH", ["Nivel", "Se aplica en", "Equivale a"], [
            ["Básico", "2.º año de bachillerato", "3.er y 4.º semestre"],
            ["Avanzado", "3.er año de bachillerato", "5.º y 6.º semestre"],
        ]),
        p("Esta guía se enfoca en el Nuevo DOMINA-BACH Avanzado, dirigido a quienes están por concluir el componente propedéutico, la parte del bachillerato que prepara para la universidad con las materias del área de cada alumno."),
    ])),
    section("para-que-sirven", "target", "¿Para qué sirven sus resultados?", ul([
        "A las escuelas les dan un indicador externo, porque la medición no la hace la misma escuela sino el Ceneval, y les ayudan a decidir qué reforzar.",
        "A los estudiantes, llamados sustentantes, les muestran su nivel de dominio de los conocimientos del bachillerato.",
        "A las autoridades educativas, como la Secretaría de Educación Pública y las autoridades de cada estado, les dan información sobre el rendimiento de las escuelas a nivel nacional, regional o estatal (Ceneval, 2023).",
    ])),
    section("estructura", "layers", "Estructura del examen", "\n".join([
        p("El examen se divide en dos sesiones."),
        p(lead("Sesión 1, conocimientos disciplinares:", " cuatro módulos de 20 reactivos cada uno, 80 reactivos en total. La escuela elige la combinación de módulos según el área de cada estudiante.")),
        p(lead("Sesión 2, habilidades de comunicación:", " 70 reactivos repartidos así:")),
        ul([
            "Comprensión lectora en español: 20 reactivos",
            "Redacción indirecta en español: 20 reactivos",
            "Comprensión lectora en inglés, nivel B1: 15 reactivos",
            "Redacción indirecta en inglés, nivel B1: 15 reactivos",
        ]),
        p("La redacción indirecta mide qué tan bien escribes sin pedirte un texto propio: las preguntas te piden corregir, completar u ordenar un texto."),
        p("En total son 150 reactivos que cuentan para la calificación. Además, el examen incluye algunos reactivos piloto y de control que no cuentan para el resultado (Ceneval, 2023)."),
        "        <!-- VISUAL 1 -->",
    ])),
    section("tipos-de-preguntas", "list", "Tipos de preguntas", "\n".join([
        p("Todos los reactivos son de opción múltiple con tres opciones de respuesta, y solo una es correcta. Tener tres opciones en lugar de cuatro reduce la carga de lectura. Dentro de ese formato aparecen distintos tipos de reactivos (Ceneval, 2021, 2023):"),
        ul([
            lead("Cuestionamiento directo:", " una pregunta con tres posibles respuestas."),
            lead("Completar espacios:", " un enunciado con huecos que se llenan con la opción correcta."),
            lead("Identificación de conceptos:", " reconocer una definición, estructura o ejemplo."),
            lead("Cálculo numérico:", " resolver un problema y elegir el resultado."),
            lead("Reactivos de comprensión:", " un texto seguido de varias preguntas sobre su contenido."),
        ]),
    ])),
    section("duracion-y-formato", "clock", "Duración y formato", ul([
        "Dos sesiones de 3 horas cada una. La guía del Ceneval marca un receso de 2 horas entre ellas, pero cada escuela decide las fechas de aplicación; en la UVM el examen se presenta en dos días (J. L. González Pensamiento, comunicación personal, 21 de octubre de 2026).",
        "Para presentar la Sesión 2 es obligatorio haber presentado la Sesión 1.",
        "Tiene dos modalidades: física, que se presenta en las aulas de la institución, y digital, que se presenta en línea desde casa. La escuela decide cuál aplica y lo avisa a los estudiantes (J. L. González Pensamiento, comunicación personal, 21 de octubre de 2026).",
        "Antes del examen se responde un cuestionario de contexto, de unos 30 minutos, que no afecta el resultado.",
        "Solo se permite una calculadora simple. No se permiten materiales de apoyo ni dispositivos electrónicos (Ceneval, 2023).",
    ])),
    section("criterios", "clipboard", "Criterios de evaluación", ul([
        "Se califica por área, no solo con un número general: cada módulo disciplinar y cada habilidad tiene su propio porcentaje de aciertos y nivel de desempeño.",
        "No existen respuestas parcialmente correctas: cada reactivo cuenta como acierto o error.",
        "Los reactivos piloto y de control no se toman en cuenta.",
        "Cada escuela recibe los resultados y los comunica a sus alumnos por sus propios medios (Ceneval, 2023).",
    ])),
    section("reporte-individual", "chart", "Reporte individual de resultados", "\n".join([
        p("Cada estudiante recibe un reporte con estos elementos (J. L. González Pensamiento, comunicación personal, 21 de octubre de 2026):"),
        ol([
            "Datos de identificación: institución donde cursa el bachillerato, nombre, folio y fecha de aplicación.",
            "Porcentaje de aciertos y nivel de desempeño en los cuatro módulos disciplinares que presentó.",
            "Porcentaje de aciertos y nivel de desempeño en comprensión lectora y redacción indirecta en español.",
            "Porcentaje de aciertos y nivel de desempeño en comprensión lectora y redacción indirecta en inglés, de acuerdo con el nivel B1 del Marco Común Europeo de Referencia para las lenguas.",
            "Un resumen del nivel de desempeño en cada área del examen.",
        ]),
    ])),
    section("reportes-institucionales", "users", "Reportes institucionales", "\n".join([
        p("La escuela recibe listados con todos sus sustentantes en tres tipos de reporte (J. L. González Pensamiento, comunicación personal, 21 de octubre de 2026):"),
        ul([
            "Distribución porcentual de los niveles de desempeño por área en cada combinación de módulos que se aplicó.",
            "Resultados en orden descendente.",
            "Resultados en orden alfabético.",
        ]),
        "        <!-- VISUAL 5 -->",
    ])),
])
pages["conoce-domina.html"] = page(
    "conoce-domina.html", "Conoce el examen DOMINA | Domina el DOMINA",
    "Quién elabora el DOMINA-BACH, para qué sirve, su estructura, duración, formato y reportes de resultados.",
    hero("Conoce el examen DOMINA"), p2)

# ---------- PÁGINA 3 ----------
QUIZ = [
    ("Cálculo diferencial e integral", None,
     "¿Cuál es la derivada de f(x) = (2x + 1) / (x − 3)?",
     ["7 / (x − 3)²", "−7 / (x − 3)²", "−7 / (x − 3)"], "B",
     "con la regla del cociente, f′(x) = [2(x − 3) − (2x + 1)(1)] / (x − 3)² = (2x − 6 − 2x − 1) / (x − 3)² = −7 / (x − 3)². La opción A tiene el signo equivocado y la C olvida elevar el denominador al cuadrado.", False),
    ("Física", None,
     "Un automóvil parte del reposo y alcanza una velocidad de 20 m/s en 5 segundos. ¿Cuál es su aceleración media?",
     ["4 m/s²", "100 m/s²", "0.25 m/s²"], "A",
     "a = (v final − v inicial) / t = (20 − 0) / 5 = 4 m/s². La opción B multiplica en lugar de dividir y la C divide el tiempo entre la velocidad.", False),
    ("Administración", None,
     "¿En qué etapa del proceso administrativo se fijan los objetivos y se decide cómo se van a alcanzar?",
     ["Planeación", "Organización", "Control"], "A",
     "la planeación es la primera etapa del proceso administrativo y consiste en definir qué se quiere lograr y cómo. La organización reparte tareas y recursos para cumplir ese plan, y el control compara los resultados con lo planeado.", False),
    ("Historia universal", None,
     "¿Qué acontecimiento se considera el detonante de la Primera Guerra Mundial en 1914?",
     ["La invasión de Alemania a Polonia", "El asesinato del archiduque Francisco Fernando de Austria en Sarajevo", "La caída del Muro de Berlín"], "B",
     "el asesinato del heredero al trono austrohúngaro en junio de 1914 llevó a Austria-Hungría a declararle la guerra a Serbia, y las alianzas entre potencias extendieron el conflicto. La invasión de Polonia ocurrió en 1939 e inició la Segunda Guerra Mundial, y la caída del Muro de Berlín fue en 1989.", False),
    ("Comprensión lectora en español",
     "Lee el texto: &quot;Muchos estudiantes creen que leer sus apuntes varias veces es la mejor forma de prepararse. Sin embargo, las investigaciones muestran que responder preguntas de práctica produce un aprendizaje más duradero, porque obliga al cerebro a recuperar la información en lugar de solo reconocerla.&quot;",
     "¿Cuál es la idea principal del texto?",
     ["Leer los apuntes varias veces es la mejor forma de estudiar.", "Practicar con preguntas ayuda a recordar mejor que solo releer.", "El cerebro no puede reconocer la información de los apuntes."], "B",
     "el texto presenta una creencia común y la contradice con evidencia. La opción A es la creencia que el texto rechaza y la C exagera algo que el texto no dice.", False),
    ("Redacción indirecta en español", None,
     "Elige la oración escrita correctamente.",
     ["Haber si mañana llegas temprano al examen.", "A ver si mañana llegas temprano al examen.", "Aver si mañana llegas temprano al examen."], "B",
     "&quot;a ver&quot; viene del verbo ver y expresa expectativa. &quot;Haber&quot; es un verbo distinto y &quot;aver&quot; no existe en español.", False),
    ("Redacción indirecta en inglés", None,
     "Choose the correct option: &quot;If I ______ more time, I would study for the exam every day.&quot;",
     ["have", "had", "will have"], "B",
     "es un condicional de segundo tipo, que habla de una situación hipotética. Se forma con if + pasado simple y would + verbo. Por eso va &quot;had&quot;.", True),
]


def quiz_card(n, q):
    module, stem, question, opts, correct, expl, english = q
    en = ' lang="en"' if english else ""
    stem_html = f'\n          <p class="quiz-stem">{stem}</p>' if stem else ""
    letters = "ABC"
    buttons = "\n".join(
        f'            <button type="button" class="quiz-option" data-option="{l}"{en}>'
        f'<span class="opt-letter" lang="es">{l})</span><span class="opt-text">{o}</span>'
        f'<span class="opt-status" lang="es"></span></button>'
        for l, o in zip(letters, opts))
    correct_text = opts[letters.index(correct)]
    return f'''
        <article class="quiz" id="reactivo-{n}" data-correct="{correct}" aria-labelledby="reactivo-{n}-pregunta">
          <p class="quiz-module">Reactivo {n}. {module}</p>{stem_html}
          <h3 class="quiz-question" id="reactivo-{n}-pregunta"{en}>{question}</h3>
          <div class="quiz-options" role="group" aria-label="Opciones del reactivo {n}">
{buttons}
          </div>
          <div class="quiz-feedback" aria-live="polite">
            <div class="quiz-feedback-body" hidden>
              <p class="quiz-result"></p>
              <p class="quiz-answer"><strong>Respuesta correcta: {correct}</strong> <span{en}>({correct_text})</span></p>
              <p class="quiz-explanation"><strong>Explicación:</strong> {expl}</p>
              <button type="button" class="btn btn-secondary quiz-retry">Intentar de nuevo</button>
            </div>
          </div>
        </article>'''


p3 = "".join([
    section("areas", "grid", "Áreas que evalúa", "\n".join([
        p("El examen evalúa dos tipos de módulos. Los módulos disciplinares miden los conocimientos específicos de cuatro asignaturas del componente propedéutico, que son las materias del área que eligió cada alumno. Los módulos transversales miden comprensión lectora y redacción indirecta en español y en inglés, y los presentan todos los estudiantes sin importar su área."),
        p("El Ceneval cuenta con 14 módulos disciplinares: Administración, Biología, Cálculo diferencial e integral, Ciencias de la comunicación, Ciencias de la salud, Derecho, Economía, Filosofía, Física, Historia universal, Matemáticas financieras, Probabilidad y estadística, Psicología y Química (Ceneval, 2023). Cada institución define qué cuatro módulos presenta cada grupo."),
    ])),
    section("modulos-uvm", "building", "Módulos que se aplican en la Preparatoria UVM", "\n".join([
        p("En la modalidad Semestral B6, cada grupo del componente propedéutico tiene una clave que sirve para identificar sus cuatro módulos disciplinares:"),
        table("Módulos por grupo en la Preparatoria UVM", ["Grupo", "Clave", "Módulos disciplinares"], [
            ["Grupo 1: Matemáticas-Experimentales-Sociales", "BSFM", "Física, Cálculo diferencial e integral, Administración e Historia universal"],
            ["Grupo 2: Experimentales-Sociales", "BSQM", "Química, Biología, Administración e Historia universal"],
            ["Grupo 3: Sociales-Matemáticas-Experimentales", "BSEA", "Matemáticas financieras, Administración, Ciencias de la salud e Historia universal"],
            ["Grupo 4: Sociales-Experimentales", "BSHS", "Derecho, Administración, Ciencias de la salud e Historia universal"],
        ], highlight="Grupo 1"),
        p("Los alumnos del área físico-matemática pertenecen al Grupo 1, con clave BSFM, así que presentan Física, Cálculo diferencial e integral, Administración e Historia universal, además de los módulos de español e inglés (J. L. González Pensamiento, comunicación personal, 21 de octubre de 2026)."),
        "        <!-- VISUAL 2 -->",
    ])),
    section("importancia", "bulb", "¿Por qué es importante cada área?", ul([
        lead("Cálculo diferencial e integral:", " es la base de cualquier ingeniería y de las ciencias exactas. Sirve para analizar cómo cambian las cosas, como la velocidad de un objeto o el crecimiento de una población."),
        lead("Física:", " entrena el razonamiento con modelos y unidades, y explica fenómenos de la vida diaria como el movimiento, la energía o el sonido."),
        lead("Administración:", " enseña a planear y organizar recursos, tiempo y personas. Sirve tanto para dirigir una empresa o un proyecto propio como para organizar los estudios."),
        lead("Historia universal:", " ayuda a entender cómo se formó el mundo actual y a analizar causas y consecuencias de los acontecimientos, algo útil para interpretar las noticias de hoy."),
        lead("Comprensión lectora y redacción en español:", " en la universidad casi todo se aprende leyendo y se evalúa escribiendo. Si no entiendes lo que lees, cualquier materia se vuelve más difícil."),
        lead("Inglés nivel B1:", " el nivel B1 del Marco Común Europeo significa poder entender las ideas principales de textos claros sobre temas conocidos. Mucha de la información técnica y científica está en inglés."),
    ])),
    section("ejemplos-de-reactivos", "pencil", "Ejemplos de reactivos", "\n".join([
        p("Reactivos de práctica elaborados para esta guía con el formato del examen. No son reactivos oficiales del Ceneval.", "notice"),
        '        <div class="quiz-list">' + "".join(quiz_card(i + 1, q) for i, q in enumerate(QUIZ)) + "\n        </div>",
    ])),
])
pages["contenidos.html"] = page(
    "contenidos.html", "Contenidos del examen | Domina el DOMINA",
    "Áreas que evalúa el DOMINA-BACH Avanzado, módulos de la Preparatoria UVM y reactivos de práctica.",
    hero("Contenidos del examen"), p3)

# ---------- PÁGINA 4 ----------
p4 = "".join([
    section("estrategias", "compass", "Estrategias de estudio previas", "\n".join([
        p("No todas las técnicas de estudio funcionan igual. Dunlosky et al. (2013) compararon diez técnicas comunes y concluyeron que las dos más efectivas son la práctica con preguntas y el estudio distribuido en el tiempo. En cambio, releer y subrayar tienen poca utilidad si se usan solas."),
        ol([
            lead("Autoevaluarte con preguntas.", " Cerrar los apuntes y tratar de responder obliga a recordar la información. Roediger y Karpicke (2006) encontraron que los estudiantes que practicaban con pruebas recordaban mucho más una semana después que quienes solo releían el material."),
            lead("Repasar en varios días.", " Estudiar un tema en varias sesiones cortas separadas por días funciona mejor que una sola sesión larga la noche anterior (Cepeda et al., 2006)."),
            lead("Simular el examen.", " Resolver reactivos con el mismo tiempo y formato del examen real te acostumbra al ritmo y reduce los nervios el día de la aplicación."),
            lead("Empezar por un diagnóstico.", " Antes de estudiar, resuelve algunos reactivos de cada módulo para saber cuál te cuesta más y dedicarle más tiempo."),
        ]),
        "        <!-- MEJORA 1 -->",
        '        <ol class="olist olist-cont" start="5">\n          <li>'
        + lead("Usar la guía oficial.", " El Ceneval publica una guía para el sustentante con los temas de cada módulo y ejemplos de reactivos (Ceneval, 2023).")
        + '</li>\n        </ol>',
    ])),
    section("opcion-multiple", "check", "Recomendaciones para responder preguntas de opción múltiple", "        <!-- FOTO b -->\n" + ul([
        "Lee la pregunta completa antes de ver las opciones y trata de pensar la respuesta por tu cuenta.",
        "Revisa las tres opciones aunque la primera parezca correcta, porque no hay respuestas parcialmente correctas (Ceneval, 2023).",
        "Descarta primero las opciones que sabes que son falsas. Con tres opciones, eliminar una ya te deja con 50 % de probabilidad.",
        "En comprensión lectora, lee todo el texto antes de las preguntas y regresa a él para confirmar tu respuesta (Ceneval, 2023).",
        "En problemas numéricos, resuelve en tu hoja y después busca tu resultado entre las opciones. Si no aparece, revisa signos y unidades.",
        "No te quedes atorado. Si un reactivo te toma demasiado, márcalo y regresa al final.",
        "Cambiar una respuesta no es malo si tienes una buena razón. Bauer et al. (2007) encontraron que, cuando los estudiantes cambiaban una respuesta, pasaban de incorrecta a correcta más veces que al revés.",
        "No dejes reactivos en blanco.",
    ])),
    section("tecnicas-de-repaso", "calendar", "Técnicas de repaso y organización del tiempo", "\n".join([
        ul([
            lead("Técnica Pomodoro:", " trabaja 25 minutos con total concentración y descansa 5. Después de cuatro bloques, toma un descanso más largo (Cirillo, 2018)."),
            lead("Resúmenes con palabras clave:", " al final de cada sesión, escribe en una hoja lo más importante del tema con palabras clave. Esas hojas se vuelven tu material de repaso."),
            lead("Calcula tu tiempo por reactivo:", " en la Sesión 1 tienes 3 horas para 80 reactivos, alrededor de 2 minutos con 15 segundos por reactivo. En la Sesión 2 tienes 3 horas para 70 reactivos, unos 2 minutos con 34 segundos cada uno."),
        ]),
        "        <!-- VISUAL 3 -->",
        "        <!-- MEJORA 2 -->",
    ])),
    section("simulacro", "clock", "Simulacro cronometrado", "        <!-- MEJORA 3 -->"),
])
pages["guia.html"] = page(
    "guia.html", "Guía práctica para aprobarlo | Domina el DOMINA",
    "Estrategias de estudio respaldadas por investigación, consejos para opción múltiple y técnicas de repaso.",
    hero("Guía práctica para aprobarlo"), p4)

# ---------- PÁGINA 5 ----------
p5 = "".join([
    section("alimentacion-descanso", "moon", "Alimentación, descanso y manejo del estrés", "        <!-- FOTO c -->\n" + ul([
        "Duerme bien varios días antes, no solo la noche anterior. La Academia Americana de Medicina del Sueño recomienda que los adolescentes de 13 a 18 años duerman entre 8 y 10 horas cada 24 horas (Paruthi et al., 2016).",
        "Desvelarte para estudiar de último momento te quita más de lo que te da, porque el cansancio afecta la concentración y la memoria.",
        "Desayuna antes de cada sesión. Una revisión de estudios encontró que desayunar tiene efectos positivos en el desempeño en tareas que requieren atención y memoria, sobre todo en la mañana (Adolphus et al., 2013).",
        "Lleva agua y, si se permite, algo ligero para el receso.",
        "Para controlar los nervios, escribe durante unos minutos lo que te preocupa del examen antes de empezar. Ramirez y Beilock (2011) encontraron que esta técnica mejoró las calificaciones de estudiantes con ansiedad ante los exámenes.",
        "Respira despacio, inhalando por la nariz y exhalando lento, si sientes que te bloqueas durante el examen.",
    ])),
    section("logistica", "bag", "Preparación logística", "\n".join([
        ul([
            "Confirma con tu escuela la fecha, la hora y la modalidad, física en aulas o digital desde casa.",
            "Ten listo tu pase de ingreso. Si lo pierdes, acude a servicios escolares (Ceneval, 2023).",
            "Prepara desde la noche anterior tu identificación, lápiz, goma, sacapuntas y una calculadora simple. No se permite ningún otro dispositivo electrónico.",
            "Si el examen es desde casa, revisa con anticipación tu computadora, tu conexión a internet y un lugar tranquilo sin interrupciones.",
            "Llega con tiempo. Llegar corriendo aumenta el estrés antes de empezar.",
            "Recuerda que debes presentar la Sesión 1 para poder presentar la Sesión 2.",
        ]),
        "        <!-- VISUAL 4 -->",
    ])),
    section("actitud", "star", "Actitud y motivación", ul([
        "Recuerda para qué sirve el examen. Es un diagnóstico que te muestra en qué estás bien y en qué necesitas mejorar antes de la universidad.",
        "Compárate contigo mismo, no con tus compañeros. Lo importante es saber cuánto avanzaste desde tu primer diagnóstico.",
        "Ponte metas pequeñas y concretas, como resolver 20 reactivos al día, en lugar de una meta vaga como &quot;estudiar mucho&quot;.",
        "Si un reactivo no te sale, no dejes que afecte los siguientes. Cada pregunta vale lo mismo.",
    ])),
])
pages["recomendaciones.html"] = page(
    "recomendaciones.html", "Recomendaciones previas al examen | Domina el DOMINA",
    "Alimentación, descanso, manejo del estrés, preparación logística y actitud antes del DOMINA-BACH.",
    hero("Recomendaciones previas al examen"), p5)

# ---------- PÁGINA 6 ----------
p6 = "".join([
    section("lo-que-aprendimos", "flag", "Lo que aprendimos al hacer este sitio",
        p("Antes de hacer esta página teníamos una idea muy general del DOMINA. Sabíamos que era de opción múltiple, pero pensábamos que tenía cuatro opciones y en realidad tiene tres. Tampoco conocíamos el nivel de inglés que se pide, que es un B1, ni que la guía del Ceneval contempla un receso de dos horas entre sesiones, porque en clase solo se mencionó que el examen se presenta en dos días. Investigar directamente en la guía oficial nos ayudó a entender cómo está armado el examen y qué se evalúa en cada parte, en lugar de quedarnos con lo que se dice entre compañeros. Además, repartir el sitio por secciones nos obligó a ponernos de acuerdo en un mismo estilo y a revisar el trabajo de los demás.")),
    section("como-aplicaremos", "arrow-right", "Cómo vamos a aplicar estas recomendaciones",
        p("Pensamos usar las tres estrategias principales de esta guía. La autoevaluación con preguntas la vamos a usar en comprensión lectora y en los temas de teoría de física y matemáticas, donde es fácil creer que ya entendimos algo solo porque lo leímos. El repaso en varios días lo vamos a aplicar en todas las materias, armando resúmenes con lo más importante de cada tema y palabras clave que nos ayuden a repasar más rápido. Por último, vamos a hacer simulacros con tiempo, como el de esta guía, apoyándonos en la inteligencia artificial para armar simuladores con los temas que pueden venir en el examen.")),
])
pages["conclusiones.html"] = page(
    "conclusiones.html", "Conclusiones | Domina el DOMINA",
    "Lo que aprendimos al investigar el DOMINA-BACH Avanzado y cómo vamos a aplicar las recomendaciones.",
    hero("Conclusiones"), p6)

# ---------- PÁGINA 7 ----------
def link(url):
    return (f'<a href="{url}" target="_blank" rel="noopener noreferrer">{url}'
            f'<span class="sr-only"> (se abre en una pestaña nueva)</span></a>')


ART = '<span lang="es">Artículo</span>'
REFS = [
    (True, f'Adolphus, K., Lawton, C. L., &amp; Dye, L. (2013). The effects of breakfast on behavior and academic performance in children and adolescents. <i>Frontiers in Human Neuroscience, 7</i>, {ART} 425. ' + link("https://doi.org/10.3389/fnhum.2013.00425")),
    (True, f'Bauer, D., Kopp, V., &amp; Fischer, M. R. (2007). Answer changing in multiple choice assessment: Change that answer when in doubt – and spread the word! <i>BMC Medical Education, 7</i>, {ART} 28. ' + link("https://doi.org/10.1186/1472-6920-7-28")),
    (True, 'Black, P., &amp; Wiliam, D. (1998). Assessment and classroom learning. <i>Assessment in Education: Principles, Policy &amp; Practice, 5</i>(1), 7–74. ' + link("https://doi.org/10.1080/0969595980050102")),
    (False, 'Centro Nacional de Evaluación para la Educación Superior. (2021). <i>DOMINA-BACH Básico y Avanzado</i> [Folleto]. ' + link("https://ceneval.edu.mx/wp-content/uploads/2021/09/SMALL-Folleto-DOMINA-BACH-Ba%CC%81sico-y-Avanzado.pdf")),
    (False, 'Centro Nacional de Evaluación para la Educación Superior. (2023). <i>Guía para el sustentante: Nuevo DOMINA-BACH Avanzado</i>. ' + link("https://ceneval.edu.mx/wp-content/uploads/2023/03/DOMINA_BACH_AVZ_Guia_para_el_sustentante-3.pdf")),
    (True, 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., &amp; Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <i>Psychological Bulletin, 132</i>(3), 354–380. ' + link("https://doi.org/10.1037/0033-2909.132.3.354")),
    (True, 'Cirillo, F. (2018). <i>The Pomodoro Technique: The acclaimed time-management system that has transformed how we work</i>. Currency.'),
    (True, 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., &amp; Willingham, D. T. (2013). Improving students\' learning with effective learning techniques: Promising directions from cognitive and educational psychology. <i>Psychological Science in the Public Interest, 14</i>(1), 4–58. ' + link("https://doi.org/10.1177/1529100612453266")),
    (False, 'Lark, B. (2017). <i lang="en">Two bowls of oatmeal with fruits</i> [Fotografía]. Unsplash. ' + link("https://unsplash.com/photos/two-bowls-of-oatmeal-with-fruits-W9OKrxBqiZA")),
    (False, 'Mullins, B. (2018). <i lang="en">Person using pencil</i> [Fotografía]. Unsplash. ' + link("https://unsplash.com/photos/oXV3bzR7jxI")),
    (False, 'Nguyen, D. H. N. (2020). <i lang="en">Person writing on white paper</i> [Fotografía]. Unsplash. ' + link("https://unsplash.com/photos/qDgTQOYk6B8")),
    (True, 'Paruthi, S., Brooks, L. J., D\'Ambrosio, C., Hall, W. A., Kotagal, S., Lloyd, R. M., Malow, B. A., Maski, K., Nichols, C., Quan, S. F., Rosen, C. L., Troester, M. M., &amp; Wise, M. S. (2016). Recommended amount of sleep for pediatric populations: A consensus statement of the American Academy of Sleep Medicine. <i>Journal of Clinical Sleep Medicine, 12</i>(6), 785–786. ' + link("https://doi.org/10.5664/jcsm.5866")),
    (True, 'Ramirez, G., &amp; Beilock, S. L. (2011). Writing about testing worries boosts exam performance in the classroom. <i>Science, 331</i>(6014), 211–213. ' + link("https://doi.org/10.1126/science.1199427")),
    (True, 'Roediger, H. L., III, &amp; Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. <i>Psychological Science, 17</i>(3), 249–255. ' + link("https://doi.org/10.1111/j.1467-9280.2006.01693.x")),
]
refs_html = "\n".join(
    f'          <li{" lang=\"en\"" if en else ""}>{r}</li>' for en, r in REFS)
p7 = f'''
      <section class="band band-plain" aria-label="Lista de referencias">
        <div class="band-inner band-inner-single container-wide">
          <div class="band-body">
            <ul class="refs">
{refs_html}
            </ul>
          </div>
        </div>
      </section>'''
pages["referencias.html"] = page(
    "referencias.html", "Referencias | Domina el DOMINA",
    "Referencias en formato APA 7 utilizadas en la guía del DOMINA-BACH Avanzado.",
    hero("Referencias"), p7)

# ---------- VISUALES ----------
def seg(cls, n, label, en=False):
    return (f'<span class="seg {cls}" style="--n:{n}"><span class="seg-num">{n}</span></span>',
            f'<li><span class="swatch {cls}" aria-hidden="true"></span>{label}<span class="legend-num">{n}</span></li>')


s2 = [seg("seg-1", 20, "Comprensión lectora en español"),
      seg("seg-2", 20, "Redacción indirecta en español"),
      seg("seg-3", 15, "Comprensión lectora en inglés, nivel B1"),
      seg("seg-4", 15, "Redacción indirecta en inglés, nivel B1")]

VISUAL1 = f'''
        <figure class="visual v-structure" aria-label="Infografía de la estructura del examen">
          <div class="session">
            <p class="session-name">Sesión 1</p>
            <p class="session-topic">Conocimientos disciplinares</p>
            <p class="session-total"><span class="big">80</span> reactivos</p>
            <div class="bar bar-s1 grow" style="--w:80" aria-hidden="true">
              <span class="seg seg-s1" style="--n:20"><span class="seg-num">20</span></span><span class="seg seg-s1" style="--n:20"><span class="seg-num">20</span></span><span class="seg seg-s1" style="--n:20"><span class="seg-num">20</span></span><span class="seg seg-s1" style="--n:20"><span class="seg-num">20</span></span>
            </div>
            <p class="session-note">Cuatro módulos de 20 reactivos cada uno</p>
          </div>
          <div class="session">
            <p class="session-name">Sesión 2</p>
            <p class="session-topic">Habilidades de comunicación</p>
            <p class="session-total"><span class="big">70</span> reactivos</p>
            <div class="bar bar-s2 grow" style="--w:70" aria-hidden="true">
              {"".join(s[0] for s in s2)}
            </div>
            <ul class="legend">
              {"".join(s[1] for s in s2)}
            </ul>
          </div>
          <p class="structure-total"><span class="big">150</span> reactivos en total que cuentan para la calificación</p>
        </figure>'''

GROUPS = [
    ("Grupo 1", "BSFM", "Matemáticas-Experimentales-Sociales", "Física, Cálculo diferencial e integral, Administración e Historia universal", True),
    ("Grupo 2", "BSQM", "Experimentales-Sociales", "Química, Biología, Administración e Historia universal", False),
    ("Grupo 3", "BSEA", "Sociales-Matemáticas-Experimentales", "Matemáticas financieras, Administración, Ciencias de la salud e Historia universal", False),
    ("Grupo 4", "BSHS", "Sociales-Experimentales", "Derecho, Administración, Ciencias de la salud e Historia universal", False),
]
group_cards = "\n".join(
    f'''              <li class="map-leaf group-card{' is-highlight' if hl else ''}">
                <span class="group-head"><span class="group-name">{g}</span><span class="group-key">{k}</span></span>
                <span class="group-area">{area}</span>
                <span class="group-mods">{mods}</span>{'<span class="sr-only"> (grupo resaltado)</span>' if hl else ''}
              </li>''' for g, k, area, mods, hl in GROUPS)
TRANS = ["Comprensión lectora en español", "Redacción indirecta en español",
         "Comprensión lectora en inglés", "Redacción indirecta en inglés"]
trans_leaves = "\n".join(f'              <li class="map-leaf">{t}</li>' for t in TRANS)

VISUAL2 = f'''
        <figure class="visual v-map" aria-label="Mapa conceptual de los módulos del DOMINA-BACH Avanzado">
          <p class="map-root">DOMINA-BACH Avanzado</p>
          <div class="map-branches">
            <div class="map-branch">
              <p class="map-node">Módulos disciplinares</p>
              <ul class="map-leaves">
{group_cards}
              </ul>
            </div>
            <div class="map-branch">
              <p class="map-node map-node-alt">Módulos transversales</p>
              <ul class="map-leaves">
{trans_leaves}
              </ul>
            </div>
          </div>
        </figure>'''

WEEKS = [
    ("target", "diagnóstico con reactivos de práctica de los 4 módulos y de comunicación; identificar los temas más débiles."),
    ("book", "estudiar los temas débiles en sesiones cortas, con preguntas de práctica al final de cada sesión."),
    ("clipboard", "repasar todos los módulos con los resúmenes y hacer un primer simulacro con tiempo."),
    ("moon", "segundo simulacro, repaso ligero de los resúmenes y descanso completo la noche anterior."),
]
weeks_html = "\n".join(
    f'''            <li class="tl-item">
              <span class="tl-dot">{icon(ic)}</span>
              <span class="tl-week">Semana {i + 1}<span class="sr-only">:</span></span>
              <p class="tl-text">{t}</p>
            </li>''' for i, (ic, t) in enumerate(WEEKS))
VISUAL3 = f'''
        <figure class="visual v-timeline" aria-labelledby="plan-titulo">
          <h3 id="plan-titulo">Plan de repaso de 4 semanas</h3>
          <ol class="timeline">
{weeks_html}
          </ol>
        </figure>'''

CHECK = [("pase", "pase de ingreso"), ("identificacion", "identificación"), ("lapiz", "lápiz"),
         ("goma", "goma"), ("sacapuntas", "sacapuntas"), ("calculadora", "calculadora simple"),
         ("agua", "agua"), ("desayuno", "desayuno"), ("horario", "revisar horario")]
check_html = "\n".join(
    f'''            <li><input type="checkbox" id="chk-{k}" data-key="{k}"><label for="chk-{k}"><span class="check-box" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" focusable="false"><title>Marcado</title><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="check-text">{t}</span></label></li>'''
    for k, t in CHECK)
VISUAL4 = f'''
        <div class="visual v-checklist" data-checklist>
          <h3 id="checklist-titulo">Mi checklist para el día del examen</h3>
          <div class="check-progress" aria-hidden="true"><span class="check-progress-bar"></span></div>
          <p class="check-count" aria-live="polite"><span data-count>0</span> de {len(CHECK)} listos</p>
          <ul class="checklist" aria-labelledby="checklist-titulo">
{check_html}
          </ul>
          <button type="button" class="btn btn-secondary check-reset">Reiniciar lista</button>
        </div>'''

REPORT = [
    ("Módulos disciplinares", [("Física", 72), ("Cálculo diferencial e integral", 65), ("Administración", 81), ("Historia universal", 70)]),
    ("Español", [("Comprensión lectora", 85), ("Redacción indirecta", 74)]),
    ("Inglés (nivel B1)", [("Comprensión lectora", 62), ("Redacción indirecta", 58)]),
]
report_groups = "\n".join(
    f'''            <div class="report-group">
              <p class="report-group-title">{title}</p>
              <ul class="report-bars">
{chr(10).join(f'                <li><span class="rb-label">{lab}</span><span class="rb-value">{v} %</span><span class="rb-track" aria-hidden="true"><span class="rb-fill grow" style="--v:{v}"></span></span></li>' for lab, v in items)}
              </ul>
            </div>''' for title, items in REPORT)
VISUAL5 = f'''
        <figure class="visual v-report" aria-labelledby="reporte-caption">
          <div class="report-sheet">
            <div class="report-head">
              <p class="report-title">Reporte individual de resultados</p>
              <dl class="report-data">
                <div><dt>Institución:</dt><dd>Preparatoria de ejemplo</dd></div>
                <div><dt>Nombre:</dt><dd>Estudiante de ejemplo</dd></div>
                <div><dt>Folio:</dt><dd>000000</dd></div>
                <div><dt>Fecha de aplicación:</dt><dd>dd/mm/aaaa</dd></div>
              </dl>
            </div>
            <p class="report-sub">Porcentaje de aciertos por área</p>
{report_groups}
          </div>
          <figcaption id="reporte-caption" class="report-caption">Ejemplo ilustrativo, no es un reporte oficial</figcaption>
        </figure>'''

# ---------- MEJORA 1: autodiagnóstico ----------
DIAG_AREAS = ["Física", "Cálculo diferencial e integral", "Administración", "Historia universal",
              "Comprensión lectora en español", "Redacción indirecta en español",
              "Comprensión lectora en inglés", "Redacción indirecta en inglés"]
DIAG_SCALE = ["No lo domino", "Me cuesta trabajo", "Lo entiendo", "Lo domino"]
DIAG_MSGS = [
    "Prioridad alta. Empieza tu plan de repaso con esta área y dale sesiones cortas casi todos los días.",
    "Prioridad media. Repásala varias veces por semana y resuelve preguntas de práctica al final de cada sesión.",
    "Vas bien. Mantenla con repasos espaciados y un simulacro para confirmar.",
    "Fortaleza. Repásala de forma ligera para no olvidarla y usa ese tiempo en tus áreas débiles.",
]


def diag_fieldset(i, area):
    radios = "\n".join(
        f'                <input type="radio" id="diag-{i}-{v}" name="diag-{i}" value="{v}">'
        f'<label for="diag-{i}-{v}"><span class="diag-num">{v}</span><span class="diag-txt">{t}</span></label>'
        for v, t in enumerate(DIAG_SCALE, 1))
    return (f'            <fieldset class="diag-area" data-area="{area}">\n'
            f'              <legend>{area}</legend>\n'
            f'              <div class="diag-scale">\n{radios}\n              </div>\n'
            f'            </fieldset>')


diag_fields = "\n".join(diag_fieldset(i + 1, a) for i, a in enumerate(DIAG_AREAS))
diag_texts = "\n".join(f'            <p data-nivel="{n}" data-etiqueta="{DIAG_SCALE[n - 1]}">{m}</p>'
                       for n, m in enumerate(DIAG_MSGS, 1))
MEJORA1 = f'''
        <div class="visual tool v-diag" data-diagnostico>
          <h3 id="diag-titulo">Haz tu autodiagnóstico</h3>
          <p>Antes de estudiar, califica qué tan bien dominas cada área del examen. Sé honesto: el objetivo es saber por dónde empezar, no sacar una buena calificación.</p>
          <form class="diag-form" novalidate aria-labelledby="diag-titulo">
{diag_fields}
            <div class="tool-actions">
              <button type="submit" class="btn">Ver mi diagnóstico</button>
              <p class="tool-alert" data-diag-alert role="status" aria-live="polite"></p>
            </div>
          </form>
          <div class="diag-result" data-diag-result tabindex="-1" aria-label="Resultado del autodiagnóstico" hidden>
            <ol class="diag-list"></ol>
            <p class="tool-note">Este autodiagnóstico es una guía personal y no sustituye el resultado oficial del examen.</p>
          </div>
          <template data-diag-textos>
            <p data-texto="falta">Califica las 8 áreas para ver tu diagnóstico</p>
{diag_texts}
          </template>
        </div>'''

# ---------- MEJORA 2: planificador ----------
PLAN_ACTIVIDADES = [w[1] for w in WEEKS]
plan_acts = "\n".join(f'            <p data-actividad="{i}">{t}</p>' for i, t in enumerate(PLAN_ACTIVIDADES, 1))
MEJORA2 = f'''
        <div class="visual tool v-plan" data-planificador>
          <h3 id="plan-con-fechas">Arma tu plan con fechas</h3>
          <p>Escribe la fecha de tu examen y el plan de 4 semanas se acomoda a tu calendario.</p>
          <form class="plan-form" novalidate>
            <div class="field">
              <label for="plan-fecha">Fecha de la Sesión 1 del examen</label>
              <input type="date" id="plan-fecha" name="plan-fecha">
            </div>
            <button type="submit" class="btn">Generar mi plan</button>
          </form>
          <div class="plan-result" data-plan-result tabindex="-1" aria-label="Tu plan con fechas" hidden>
            <p class="plan-msg" data-plan-msg hidden></p>
            <ol class="plan-list" data-plan-list></ol>
          </div>
          <template data-plan-textos>
            <p data-texto="extra">Tienes días extra antes de empezar. Úsalos para conseguir la guía oficial y reactivos de práctica.</p>
            <p data-texto="comprimido">Tienes menos de 4 semanas, así que el plan se comprimió en 4 etapas.</p>
            <p data-texto="pocos">Faltan muy pocos días. Repasa tus resúmenes, haz un simulacro corto y prioriza dormir bien.</p>
            <p data-texto="futura">Elige una fecha futura.</p>
            <p data-texto="noche"><strong>Noche anterior:</strong> prepara tus materiales y duerme entre 8 y 10 horas.</p>
{plan_acts}
          </template>
        </div>'''

# ---------- MEJORA 3: simulacro ----------
TXT_AJOLOTE = ("&quot;El ajolote es un anfibio endémico de los canales de Xochimilco. Aunque puede regenerar partes "
               "de su cuerpo, su población silvestre ha disminuido por la contaminación del agua y por la "
               "introducción de especies como la carpa y la tilapia.&quot;")
TXT_MARIA = ("&quot;Maria studies for thirty minutes every day instead of studying for five hours the night before "
             "the exam. She says this helps her remember more.&quot;")
# (área, texto base, pregunta, opciones, correcta, explicación, pregunta en inglés, opciones en inglés)
SIM = [
    ("Física", None, "Un objeto de 2 kg se acelera a 3 m/s². ¿Cuál es la fuerza neta que actúa sobre él?",
     ["6 N", "1.5 N", "5 N"], "A",
     "por la segunda ley de Newton, F = m · a = 2 kg × 3 m/s² = 6 N. La opción B divide en lugar de multiplicar y la C suma los valores.", False, False),
    ("Física", None, "Una onda tiene una frecuencia de 50 Hz y una longitud de onda de 2 m. ¿Cuál es su velocidad de propagación?",
     ["25 m/s", "100 m/s", "52 m/s"], "B",
     "la velocidad de una onda es v = f · λ = 50 Hz × 2 m = 100 m/s. La opción A divide y la C suma los valores.", False, False),
    ("Cálculo diferencial e integral", None, "¿Cuál es la derivada de f(x) = 4x³ − 2x + 7?",
     ["12x² − 2", "12x² − 2x", "4x² − 2"], "A",
     "la derivada de 4x³ es 12x², la de −2x es −2 y la de una constante es 0. La opción B no derivó −2x y la C no multiplicó por el exponente.", False, False),
    ("Cálculo diferencial e integral", None, "¿Cuál es la integral indefinida de 6x con respecto a x?",
     ["6x² + C", "3x² + C", "3x + C"], "B",
     "la integral de xⁿ es xⁿ⁺¹ / (n + 1), así que la integral de 6x es 6 · x² / 2 + C = 3x² + C. La opción A no dividió entre 2 y la C no aumentó el exponente.", False, False),
    ("Administración", None, "¿Qué etapa del proceso administrativo compara los resultados con lo planeado y corrige las desviaciones?",
     ["Dirección", "Control", "Planeación"], "B",
     "el control mide lo que se logró, lo compara con lo planeado y corrige. La dirección guía y motiva a las personas, y la planeación fija los objetivos.", False, False),
    ("Administración", None, "En un análisis FODA, ¿cuáles son los factores internos de una organización?",
     ["Fortalezas y debilidades", "Oportunidades y amenazas", "Fortalezas y oportunidades"], "A",
     "las fortalezas y debilidades dependen de la propia organización. Las oportunidades y amenazas vienen del entorno, por eso son factores externos.", False, False),
    ("Historia universal", None, "¿En qué año comenzó la Revolución francesa con la toma de la Bastilla?",
     ["1789", "1810", "1776"], "A",
     "la toma de la Bastilla fue el 14 de julio de 1789. En 1810 inició la Independencia de México y en 1776 se declaró la independencia de Estados Unidos.", False, False),
    ("Historia universal", None, "¿Qué nombre recibe el conflicto entre Estados Unidos y la Unión Soviética después de la Segunda Guerra Mundial, en el que ambas potencias no se enfrentaron militarmente de forma directa?",
     ["Primera Guerra Mundial", "Guerra Fría", "Guerra de los Cien Años"], "B",
     "la Guerra Fría fue una rivalidad política, económica e ideológica entre las dos potencias, sin una guerra directa entre ellas. Las otras dos opciones son conflictos de otras épocas.", False, False),
    ("Comprensión lectora en español", TXT_AJOLOTE, "Según el texto, ¿qué ha provocado la disminución del ajolote en su hábitat?",
     ["Su capacidad de regenerar partes de su cuerpo", "La contaminación del agua y las especies introducidas", "Que vive fuera de los canales de Xochimilco"], "B",
     "el texto dice directamente que la población disminuyó por la contaminación y por especies como la carpa y la tilapia. La regeneración es una característica, no una causa, y el texto dice que vive en Xochimilco.", False, False),
    ("Comprensión lectora en español", TXT_AJOLOTE, "En el texto, ¿qué significa la palabra &quot;endémico&quot;?",
     ["Que solo vive de forma natural en ese lugar", "Que está enfermo", "Que se encuentra en todo el mundo"], "A",
     "una especie endémica es la que solo existe de forma natural en una región. La opción B confunde la palabra con &quot;epidemia&quot; y la C dice lo contrario.", False, False),
    ("Redacción indirecta en español", None, "Elige la opción que completa correctamente la oración: &quot;No entiendo ______ cambiaron la fecha del examen.&quot;",
     ["porque", "por qué", "porqué"], "B",
     "&quot;por qué&quot;, separado y con acento, se usa en preguntas directas e indirectas. &quot;Porque&quot; introduce una causa y &quot;porqué&quot; es un sustantivo que significa &quot;el motivo&quot;.", False, False),
    ("Redacción indirecta en español", None, "Elige la oración con la puntuación correcta.",
     ["Para el examen, lleva lápiz, goma y calculadora.", "Para el examen lleva, lápiz goma y calculadora.", "Para el examen lleva: lápiz, goma, y, calculadora."], "A",
     "en una enumeración se separan los elementos con comas y el último se une con &quot;y&quot; sin coma. La opción B pone la coma en un lugar que separa el verbo de lo que se lleva y la C agrega comas alrededor de &quot;y&quot;.", False, False),
    ("Comprensión lectora en inglés", TXT_MARIA, "Why does Maria study a little every day?",
     ["Because she does not have time", "Because it helps her remember more", "Because the exam is tomorrow"], "B",
     "el texto dice &quot;<span lang=\"en\">She says this helps her remember more</span>&quot;. Nada indica que no tenga tiempo ni que el examen sea mañana.", True, True),
    ("Comprensión lectora en inglés", TXT_MARIA, "In the text, what does &quot;instead of&quot; mean?",
     ["además de", "en lugar de", "después de"], "B",
     "&quot;<span lang=\"en\">instead of</span>&quot; significa &quot;en lugar de&quot;. María estudia un poco cada día en lugar de estudiar cinco horas la noche anterior.", True, False),
    ("Redacción indirecta en inglés", None, "Choose the correct option: &quot;She ______ to the library yesterday.&quot;",
     ["go", "goes", "went"], "C",
     "&quot;<span lang=\"en\">yesterday</span>&quot; indica pasado, así que se usa el pasado simple de &quot;<span lang=\"en\">go</span>&quot;, que es irregular: &quot;<span lang=\"en\">went</span>&quot;.", True, True),
    ("Redacción indirecta en inglés", None, "Choose the correct option: &quot;I have lived in Mexico City ______ 2015.&quot;",
     ["for", "since", "during"], "B",
     "con el presente perfecto, &quot;<span lang=\"en\">since</span>&quot; indica el punto de inicio, como un año, y &quot;<span lang=\"en\">for</span>&quot; indica una duración, como &quot;<span lang=\"en\">for ten years</span>&quot;.", True, True),
]
SIM_AREAS = ["Física", "Cálculo diferencial e integral", "Administración", "Historia universal",
             "Comprensión lectora en español", "Redacción indirecta en español",
             "Comprensión lectora en inglés", "Redacción indirecta en inglés"]
SIM_TOTAL_S = 8 * 135 + round(8 * 180 * 60 / 70)  # 1080 + 1234 = 2314 s


def sim_item(n, q):
    area, stem, question, opts, correct, expl, en_q, en_o = q
    lq = ' lang="en"' if en_q else ""
    lo = ' lang="en"' if en_o else ""
    stem_html = f'\n              <p class="quiz-stem"{lq}>{stem}</p>' if stem else ""
    radios = "\n".join(
        f'                <input type="radio" id="sim-{n}-{l}" name="sim-{n}" value="{l}">'
        f'<label for="sim-{n}-{l}"><span class="opt-letter">{l})</span><span class="opt-text"{lo}>{o}</span></label>'
        for l, o in zip("ABC", opts))
    return f'''            <article class="sim-item" id="sim-item-{n}" data-n="{n}" data-area="{area}" data-correct="{correct}" hidden>
              <p class="sim-count">Reactivo {n} de 16</p>
              <p class="quiz-module">{area}</p>{stem_html}
              <h3 class="sim-question" id="sim-q-{n}" tabindex="-1"{lq}>{question}</h3>
              <div class="sim-options" role="radiogroup" aria-labelledby="sim-q-{n}">
{radios}
              </div>
              <p class="sim-expl" hidden><strong>Explicación:</strong> {expl}</p>
            </article>'''


sim_items = "\n".join(sim_item(i + 1, q) for i, q in enumerate(SIM))
sim_nav = "\n".join(
    f'              <li><button type="button" class="sim-nav-btn" data-go="{i}">'
    f'<span class="sim-nav-num">{i}</span><span class="sim-nav-flag" aria-hidden="true">'
    f'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" focusable="false"><title>Marcado</title><path d="M5 21V4h11l-2 4 2 4H7v9z"/></svg></span>'
    f'<span class="sr-only" data-nav-state></span></button></li>'
    for i in range(1, 17))
MEJORA3 = f'''
        <div class="sim" data-simulacro data-total="{SIM_TOTAL_S}">
          <div class="sim-screen sim-start" data-sim-start>
            <p>Pon a prueba lo que sabes con 16 reactivos al estilo del DOMINA: 2 de cada módulo de la combinación BSFM y 2 de cada habilidad de comunicación. El reloj corre al ritmo del examen real: 2 minutos con 15 segundos por reactivo en la Sesión 1 y unos 2 minutos con 34 segundos en la Sesión 2.</p>
            <p class="notice">Reactivos de práctica elaborados para esta guía con el formato del examen. No son reactivos oficiales del Ceneval.</p>
            <p class="sim-total"><strong>Tiempo total:</strong> 38 minutos con 34 segundos</p>
            <button type="button" class="btn" data-sim-begin>Empezar simulacro{icon("arrow-right")}</button>
          </div>

          <div class="sim-screen sim-exam" data-sim-exam hidden>
            <div class="sim-top">
              <p class="sim-clock" role="timer" aria-label="Tiempo restante">
                {icon("clock")}<span class="sim-clock-label">Tiempo restante</span>
                <span class="sim-clock-time" data-sim-time>38:34</span>
              </p>
              <p class="sim-warning" data-sim-warning role="status" aria-live="polite"></p>
            </div>
            <nav class="sim-nav" aria-label="Reactivos del simulacro">
              <ol>
{sim_nav}
              </ol>
              <p class="sim-legend"><span class="sim-legend-item"><span class="sim-legend-box is-answered" aria-hidden="true"></span>Respondido</span><span class="sim-legend-item"><span class="sim-legend-box is-marked" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" focusable="false"><title>Marcado</title><path d="M5 21V4h11l-2 4 2 4H7v9z"/></svg></span>Marcado para revisar</span></p>
            </nav>
            <div class="sim-items">
{sim_items}
            </div>
            <div class="sim-controls">
              <button type="button" class="btn btn-secondary" data-sim-prev>{icon("arrow-left")}Anterior</button>
              <button type="button" class="btn btn-secondary sim-mark" data-sim-mark aria-pressed="false">{icon("flag")}Marcar para revisar</button>
              <button type="button" class="btn btn-secondary" data-sim-next>Siguiente{icon("arrow-right")}</button>
            </div>
            <div class="sim-finish">
              <button type="button" class="btn" data-sim-finish>Terminar simulacro</button>
            </div>
            <div class="sim-confirm" data-sim-confirm role="alertdialog" aria-modal="false" aria-labelledby="sim-confirm-txt" hidden>
              <p id="sim-confirm-txt" data-sim-confirm-txt tabindex="-1"></p>
              <div class="sim-confirm-actions">
                <button type="button" class="btn" data-sim-confirm-yes>Sí, terminar</button>
                <button type="button" class="btn btn-secondary" data-sim-confirm-no>Seguir respondiendo</button>
              </div>
            </div>
          </div>

          <div class="sim-screen sim-results" data-sim-results tabindex="-1" aria-labelledby="sim-res-titulo" hidden>
            <h3 id="sim-res-titulo">Resultados del simulacro</h3>
            <p class="sim-score" data-sim-score></p>
            <p class="sim-msg" data-sim-msg></p>
            <p class="sim-used"><strong>Tiempo usado:</strong> <span data-sim-used></span></p>
            <h4>Aciertos por área</h4>
            <ul class="sim-areas" data-sim-areas></ul>
            <h4>Revisión de los 16 reactivos</h4>
            <ol class="sim-review" data-sim-review></ol>
            <button type="button" class="btn" data-sim-restart>Reiniciar simulacro</button>
          </div>

          <template data-sim-textos>
            <p data-texto="confirmar">Tienes X reactivos sin responder. ¿Quieres terminar?</p>
            <p data-texto="cinco">Quedan 5 minutos</p>
            <p data-rango="0">Aún hay mucho por reforzar. Usa el autodiagnóstico y empieza por tus áreas con menos aciertos.</p>
            <p data-rango="50">Vas por buen camino. Revisa las explicaciones de los reactivos que fallaste y repite el simulacro en unos días.</p>
            <p data-rango="80">Muy buen resultado. Mantén el ritmo con repasos espaciados para llegar así al examen.</p>
{chr(10).join(f'            <p data-area-orden="{i}">{a}</p>' for i, a in enumerate(SIM_AREAS))}
          </template>
        </div>'''

# ---------- FOTOS (Unsplash) ----------
# Originales de 3000 x 2000 (3:2): versiones WebP de 800 x 533 y 1600 x 1067, sin recorte.
def photo(name, alt, author, page_url, year, sizes, cls="", lazy=True):
    lazy_attr = ' loading="lazy"' if lazy else ' fetchpriority="high"'
    nt = '<span class="sr-only"> (se abre en una pestaña nueva)</span>'
    return f'''        <figure class="photo{(" " + cls) if cls else ""}">
          <div class="photo-frame">
            <img src="img/{name}-800.webp" srcset="img/{name}-800.webp 800w, img/{name}-1600.webp 1600w" sizes="{sizes}" width="1600" height="1067" alt="{alt}" decoding="async"{lazy_attr}>
          </div>
          <figcaption class="photo-credit">Foto de <a href="{page_url}" target="_blank" rel="noopener noreferrer">{author}{nt}</a> ({year}) en <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash{nt}</a></figcaption>
        </figure>'''


CARD_SIZES = "(max-width: 1099px) calc(100vw - 32px), 764px"
# Portada: la foto ocupa toda la cabecera; el crédito queda dentro de ella.
_NT = '<span class="sr-only"> (se abre en una pestaña nueva)</span>'
FOTO_A_FONDO = ('        <div class="hero-bg">\n'
                '          <img src="img/portada-800.webp" srcset="img/portada-800.webp 800w, img/portada-1600.webp 1600w" '
                'sizes="100vw" width="1600" height="1067" '
                'alt="Estudiante resolviendo una hoja de examen con lápiz sobre un pupitre." decoding="async" fetchpriority="high">\n'
                '        </div>')
FOTO_A_CREDITO = ('        <p class="photo-credit hero-credit">Foto de <a href="https://unsplash.com/photos/oXV3bzR7jxI" '
                  f'target="_blank" rel="noopener noreferrer">Ben Mullins{_NT}</a> (2018) en <a href="https://unsplash.com" '
                  f'target="_blank" rel="noopener noreferrer">Unsplash{_NT}</a></p>')
FOTO_B = photo("opcion-multiple", "Mano rellenando con lápiz los círculos de una hoja de respuestas de opción múltiple.",
               "Nguyen Dang Hoang Nhu", "https://unsplash.com/photos/qDgTQOYk6B8", 2020, CARD_SIZES)
FOTO_C = photo("desayuno", "Dos tazones de avena con fresas, frambuesas y naranja, junto a una taza de café.", "Brooke Lark",
               "https://unsplash.com/photos/two-bowls-of-oatmeal-with-fruits-W9OKrxBqiZA", 2017, CARD_SIZES)

VISUALS = {"VISUAL 1": VISUAL1, "VISUAL 2": VISUAL2, "VISUAL 3": VISUAL3, "VISUAL 4": VISUAL4,
           "VISUAL 5": VISUAL5, "MEJORA 1": MEJORA1, "MEJORA 2": MEJORA2, "MEJORA 3": MEJORA3,
           "FOTO a fondo": FOTO_A_FONDO, "FOTO a credito": FOTO_A_CREDITO, "FOTO b": FOTO_B, "FOTO c": FOTO_C}

for name, html in pages.items():
    for k, v in VISUALS.items():
        html = html.replace(f"        <!-- {k} -->", v.lstrip("\n"))
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(html)
print("ok", len(pages))
