/* Domina el DOMINA · Script compartido
   Se carga en <head> sin defer: el tema se aplica antes de pintar la página
   y todo lo demás espera a DOMContentLoaded. */
(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "domina-tema";

  root.classList.add("js");

  /* ---------- Tema claro / oscuro (antes de pintar) ---------- */
  function storedTheme() {
    try {
      var t = window.localStorage.getItem(THEME_KEY);
      return t === "dark" || t === "light" ? t : null;
    } catch (e) {
      return null;
    }
  }

  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function systemTheme() {
    return systemDark && systemDark.matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", storedTheme() || systemTheme());

  /* ---------- Animaciones: solo si el sistema no pide reducir movimiento ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOTION_ENABLED = true;
  var canAnimate = MOTION_ENABLED && !reduceMotion && "IntersectionObserver" in window;
  if (canAnimate) root.classList.add("js-motion");

  function initTheme() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    function updateLabel() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }

    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* Sin localStorage el cambio dura solo esta visita. */
      }
      updateLabel();
    });

    // Mientras no haya elección guardada, sigue los cambios del sistema.
    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener("change", function () {
        if (storedTheme()) return;
        root.setAttribute("data-theme", systemTheme());
        updateLabel();
      });
    }

    updateLabel();
  }

  // Numera las barras de un bloque para que crezcan escalonadas (--i en styles.css).
  function numberBars(container) {
    Array.prototype.forEach.call(container.querySelectorAll(".grow"), function (bar, i) {
      bar.style.setProperty("--i", i);
    });
  }

  /* ---------- Movimiento con GSAP + ScrollTrigger ----------
     Todo parte del estado final del HTML: si GSAP no carga, si hay un error
     o si el sistema pide reducir movimiento, no se oculta nada. */
  var EASE_OUT = "power4.out"; // salida fuerte, cercana a cubic-bezier(0.23, 1, 0.32, 1)

  function initMotion() {
    if (!canAnimate) return;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      root.classList.remove("js-motion");
      safe(function () { smoothScroll(null, null); });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function (context) {
      var stopSmooth = smoothScroll(gsap, ScrollTrigger);
      var stopTitles = null;
      heroMotion(gsap);
      structureMotion(gsap);
      photoMotion(gsap);
      // Las líneas de los títulos se miden con la fuente final ya cargada
      whenFontsReady(function () {
        context.add(function () { stopTitles = titleMotion(gsap); });
        ScrollTrigger.refresh();
      });
      return function () {
        if (stopSmooth) stopSmooth();
        if (stopTitles) stopTitles();
      };
    });

    // Si se cambia a reducir movimiento a mitad de la visita, todo vuelve a su estado final
    mm.add("(prefers-reduced-motion: reduce)", function () {
      root.classList.remove("js-motion");
      restoreSplits();
    });
  }

  /* Scroll suave con Lenis. Solo suaviza la rueda del mouse y el trackpad:
     el teclado, el foco y el tacto siguen siendo el scroll del navegador.
     Si Lenis no carga, no pasa nada. Devuelve la función que lo apaga. */
  function smoothScroll(gsap, ScrollTrigger) {
    var Lenis = window.Lenis;
    if (!Lenis) return null;
    var lenis = new Lenis({
      autoRaf: !gsap,
      allowNestedScroll: true,
      // El menú desplegable y las tablas con scroll propio usan el scroll normal
      prevent: function (node) { return !!(node.closest && node.closest(".site-nav, .table-wrap")); }
    });
    if (!gsap) return function () { lenis.destroy(); };
    var tick = function (time) { lenis.raf(time * 1000); };
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return function () {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }

  // Espera a las fuentes web (máximo 1.5 s) para medir el texto con su forma final
  function whenFontsReady(fn) {
    var called = false;
    function once() {
      if (called) return;
      called = true;
      try {
        fn();
      } catch (e) {
        restoreSplits();
        if (window.console) window.console.error(e);
      }
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(once, once);
    setTimeout(once, 1500);
    if (!document.fonts) once();
  }

  /* ---------- Texto dividido para revelar ----------
     La copia visible se divide en palabras (nunca se parte una) y letras o
     líneas; la frase completa queda en .sr-only para lectores de pantalla.
     Al terminar la animación el título vuelve a ser su texto original. */
  var splits = [];

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function splitText(target, textNodes, mode) {
    var text = textNodes.map(function (n) { return n.data; }).join("").replace(/\s+/g, " ").trim();
    if (!text) return null;
    var anchor = textNodes[0];
    var sr = el("span", "sr-only", text);
    var visual = el("span", "split-visual");
    visual.setAttribute("aria-hidden", "true");
    var words = text.split(" ");
    var units = [];
    words.forEach(function (word, i) {
      var w = el("span", "split-word");
      if (mode === "chars") {
        var mask = el("span", "split-mask");
        Array.prototype.forEach.call(word, function (ch) {
          var c = el("span", "split-char", ch);
          mask.appendChild(c);
          units.push(c);
        });
        w.appendChild(mask);
      } else {
        w.textContent = word;
      }
      visual.appendChild(w);
      if (i < words.length - 1) visual.appendChild(document.createTextNode(" "));
    });
    target.insertBefore(sr, anchor);
    target.insertBefore(visual, anchor);
    textNodes.forEach(function (n) { n.parentNode.removeChild(n); });

    if (mode === "lines") {
      // Agrupa las palabras por la línea en la que cayeron y envuelve cada línea en su máscara
      var lines = [];
      var lastTop = null;
      Array.prototype.forEach.call(visual.querySelectorAll(".split-word"), function (w) {
        var top = w.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) lines.push([]);
        lines[lines.length - 1].push(w.textContent);
        lastTop = top;
      });
      visual.textContent = "";
      visual.className += " split-lines";
      lines.forEach(function (line) {
        var outer = el("span", "split-line");
        var inner = el("span", "split-line-inner", line.join(" "));
        outer.appendChild(inner);
        visual.appendChild(outer);
        units.push(inner);
      });
    }

    var record = {
      units: units,
      restore: function () {
        if (!visual.parentNode) return;
        target.insertBefore(document.createTextNode(text), sr);
        target.removeChild(sr);
        target.removeChild(visual);
      }
    };
    splits.push(record);
    return record;
  }

  function restoreSplits() {
    splits.forEach(function (r) { r.restore(); });
    splits = [];
  }

  function directText(node) {
    return Array.prototype.filter.call(node.childNodes, function (n) {
      return n.nodeType === 3;
    });
  }

  // Títulos de sección: línea por línea con máscara al entrar a la pantalla
  function titleMotion(gsap) {
    var titles = gsap.utils.toArray(".band-head h2");
    var pending = [];

    titles.forEach(function (h2) {
      // Solo títulos con texto simple (ícono + texto); si no, se dejan como están
      var extra = Array.prototype.some.call(h2.children, function (c) { return !c.classList.contains("h2-icon"); });
      if (extra || !directText(h2).length) return;
      var item = { h2: h2, split: null, tween: null, done: false };
      pending.push(item);
      build(item);
    });

    function build(item) {
      item.split = splitText(item.h2, directText(item.h2), "lines");
      if (!item.split) return;
      var icon = item.h2.querySelector(".h2-icon");
      var tl = gsap.timeline({
        scrollTrigger: { trigger: item.h2, start: "top 85%", once: true },
        onComplete: function () {
          item.done = true;
          item.split.restore();
          if (icon) gsap.set(icon, { clearProps: "transform,opacity" });
        }
      });
      if (icon) tl.from(icon, { opacity: 0, scale: 0.6, duration: 0.5, ease: EASE_OUT }, 0);
      tl.from(item.split.units, { yPercent: 110, duration: 0.8, stagger: 0.1, ease: EASE_OUT }, 0.05);
      item.tween = tl;
    }

    // Si cambia el ancho antes de revelarse, las líneas se vuelven a medir
    var timer = null;
    var lastWidth = window.innerWidth;
    function onResize() {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(function () {
        pending.forEach(function (item) {
          if (item.done || !item.split) return;
          if (item.tween) {
            if (item.tween.scrollTrigger) item.tween.scrollTrigger.kill();
            item.tween.kill();
          }
          var icon = item.h2.querySelector(".h2-icon");
          if (icon) gsap.set(icon, { clearProps: "transform,opacity" });
          item.split.restore();
          build(item);
        });
        window.ScrollTrigger.refresh();
      }, 200);
    }
    window.addEventListener("resize", onResize);

    return function () {
      window.removeEventListener("resize", onResize);
    };
  }

  // Portada: el título aparece letra por letra y después lo demás (≈ 1 s en total)
  function heroMotion(gsap) {
    var hero = document.querySelector(".hero.has-bg");
    if (!hero) return;
    var h1 = hero.querySelector("h1");
    var rest = Array.prototype.filter.call(hero.querySelectorAll(".hero-anim"), function (n) { return n !== h1; });
    var split = h1 ? splitText(h1, directText(h1), "chars") : null;

    var tl = gsap.timeline();
    if (split) {
      gsap.set(h1, { opacity: 1 });
      // 14 letras: 0.5 s cada una + 13 × 0.03 s de escalonado ≈ 0.9 s
      tl.fromTo(split.units, { yPercent: 110 }, {
        yPercent: 0, duration: 0.5, stagger: 0.03, ease: EASE_OUT,
        onComplete: function () { split.restore(); }
      }, 0);
    } else if (h1) {
      rest.unshift(h1);
    }
    tl.fromTo(rest, { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.38, stagger: 0.08, ease: EASE_OUT,
      clearProps: "transform"
    }, split ? 0.3 : 0);

    var img = hero.querySelector(".hero-bg img");
    if (img) {
      // La foto avanza un 15 % más lenta que el scroll
      gsap.to(img, {
        y: function () { return hero.offsetHeight * 0.15; },
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: function () { return "top " + hero.getBoundingClientRect().top; },
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }
  }

  // Conoce el examen: la infografía se arma con el scroll (scrub), sin fijar la página
  function structureMotion(gsap) {
    var box = document.querySelector(".v-structure");
    if (!box) return;
    var sessions = box.querySelectorAll(".session");
    var counterEl = box.querySelector(".structure-total .big");
    if (sessions.length < 2 || !counterEl) return;
    var finalValue = parseInt(counterEl.textContent, 10) || 150;
    var count = { v: 0 };

    var tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { trigger: box, start: "top 85%", end: "bottom 60%", scrub: 0.5 }
    });
    tl.from(sessions[0], { opacity: 0, y: 24, duration: 1 })
      .from(sessions[0].querySelectorAll(".seg"), { opacity: 0, y: 10, duration: 0.6, stagger: 0.25 })
      .from(sessions[1], { opacity: 0, y: 24, duration: 1 })
      .from(sessions[1].querySelectorAll(".seg"), { opacity: 0, y: 10, duration: 0.6, stagger: 0.25 })
      .from(sessions[1].querySelectorAll(".legend li"), { opacity: 0, y: 8, duration: 0.5, stagger: 0.15 }, "<")
      .from(box.querySelector(".structure-total"), { opacity: 0, y: 16, duration: 1 })
      .fromTo(count, { v: 0 }, {
        v: finalValue, duration: 1, ease: "none",
        onUpdate: function () { counterEl.textContent = String(Math.round(count.v)); }
      }, "<");
    // Al llegar al final del recorrido, el número queda exacto
    tl.eventCallback("onComplete", function () { counterEl.textContent = String(finalValue); });
  }

  // Fotos de guía y recomendaciones: se descubren como cortina al entrar
  // y después siguen con un parallax ligero dentro de su marco
  function photoMotion(gsap) {
    gsap.utils.toArray(".band .photo-frame").forEach(function (frame) {
      var img = frame.querySelector("img");
      gsap.fromTo(frame, { clipPath: "inset(0% 0% 100% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut",
        clearProps: "clipPath",
        scrollTrigger: { trigger: frame, start: "top 85%", once: true }
      });
      if (!img) return;
      gsap.fromTo(img, { scale: 1.12 }, {
        scale: 1, duration: 1.3, ease: EASE_OUT,
        scrollTrigger: { trigger: frame, start: "top 85%", once: true }
      });
      gsap.fromTo(img, { yPercent: 0 }, {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  // Cinta de datos: botón para detenerla (sirve con teclado y en celular,
  // donde no hay mouse que pase por encima)
  function initMarquee(box) {
    var btn = box.querySelector(".marquee-toggle");
    var label = box.querySelector(".marquee-toggle-text");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var paused = box.classList.toggle("is-paused");
      btn.setAttribute("aria-label", paused ? "Reanudar la cinta de datos" : "Pausar la cinta de datos");
      if (label) label.textContent = paused ? "Reanudar" : "Pausar";
    });
  }

  // Ejecuta cada módulo por separado: un error en uno no detiene a los demás
  // y, si falla el de animaciones, el contenido se muestra completo.
  function safe(fn) {
    try {
      fn();
    } catch (e) {
      if (fn === initMotion) root.classList.remove("js-motion");
      if (window.console) window.console.error(e);
    }
  }

  /* ---------- Menú desplegable en celular ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("menu-principal");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    window.matchMedia("(min-width: 1280px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Iconos para la retroalimentación ---------- */
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<title>Correcto</title><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>';
  var ICON_BAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<title>Incorrecto</title><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';

  /* ---------- Reactivos interactivos ---------- */
  function initQuiz(card) {
    var correct = card.getAttribute("data-correct");
    var options = card.querySelectorAll(".quiz-option");
    var body = card.querySelector(".quiz-feedback-body");
    var result = card.querySelector(".quiz-result");
    var retry = card.querySelector(".quiz-retry");
    if (!correct || !options.length || !body || !result || !retry) return;

    result.setAttribute("tabindex", "-1");

    function answer(chosen) {
      var isRight = chosen.getAttribute("data-option") === correct;
      Array.prototype.forEach.call(options, function (opt) {
        var status = opt.querySelector(".opt-status");
        var letter = opt.getAttribute("data-option");
        opt.disabled = true;
        if (letter === correct) {
          opt.classList.add("is-correct");
          status.innerHTML = ICON_OK + (opt === chosen ? "Correcta" : "Respuesta correcta");
        } else if (opt === chosen) {
          opt.classList.add("is-wrong");
          status.innerHTML = ICON_BAD + "Incorrecta";
        } else {
          opt.classList.add("is-dimmed");
        }
        if (opt === chosen) opt.setAttribute("aria-pressed", "true");
      });

      result.className = "quiz-result " + (isRight ? "is-correct" : "is-wrong");
      result.innerHTML = isRight ? ICON_OK + "¡Correcto!" : ICON_BAD + "Incorrecto.";
      body.hidden = false;
      result.focus();
    }

    function reset() {
      Array.prototype.forEach.call(options, function (opt) {
        opt.disabled = false;
        opt.classList.remove("is-correct", "is-wrong", "is-dimmed");
        opt.removeAttribute("aria-pressed");
        opt.querySelector(".opt-status").innerHTML = "";
      });
      body.hidden = true;
      result.innerHTML = "";
      options[0].focus();
    }

    Array.prototype.forEach.call(options, function (opt) {
      opt.addEventListener("click", function () {
        if (!opt.disabled) answer(opt);
      });
    });
    retry.addEventListener("click", reset);
  }

  /* ---------- Checklist con localStorage ---------- */
  var STORAGE_KEY = "domina-checklist";

  function loadChecked() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveChecked(keys) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {
      /* Sin localStorage la lista funciona, pero no se guarda. */
    }
  }

  function initChecklist(box) {
    var inputs = box.querySelectorAll('input[type="checkbox"]');
    var count = box.querySelector("[data-count]");
    var bar = box.querySelector(".check-progress-bar");
    var resetBtn = box.querySelector(".check-reset");
    var saved = loadChecked();

    function update() {
      var keys = [];
      Array.prototype.forEach.call(inputs, function (input) {
        if (input.checked) keys.push(input.getAttribute("data-key"));
      });
      if (count) count.textContent = String(keys.length);
      if (bar) bar.style.transform = "scaleX(" + (keys.length / inputs.length) + ")";
      return keys;
    }

    Array.prototype.forEach.call(inputs, function (input) {
      input.checked = saved.indexOf(input.getAttribute("data-key")) !== -1;
      input.addEventListener("change", function () {
        saveChecked(update());
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        Array.prototype.forEach.call(inputs, function (input) { input.checked = false; });
        saveChecked(update());
        if (inputs[0]) inputs[0].focus();
      });
    }

    update();
  }

  /* ---------- Mejora 1: autodiagnóstico ---------- */
  function initDiagnostico(box) {
    var form = box.querySelector(".diag-form");
    var alertBox = box.querySelector("[data-diag-alert]");
    var result = box.querySelector("[data-diag-result]");
    var list = box.querySelector(".diag-list");
    var tpl = box.querySelector("template[data-diag-textos]");
    if (!form || !alertBox || !result || !list || !tpl) return;

    var textos = tpl.content;
    var faltaTxt = textos.querySelector('[data-texto="falta"]').textContent;
    var areas = box.querySelectorAll(".diag-area");

    function setMissing(fs, missing) {
      fs.classList.toggle("is-missing", missing);
      var tag = fs.querySelector(".diag-missing");
      if (missing && !tag) {
        tag = document.createElement("span");
        tag.className = "diag-missing";
        tag.textContent = "Sin calificar";
        fs.querySelector("legend").appendChild(tag);
      } else if (!missing && tag) {
        tag.parentNode.removeChild(tag);
      }
    }

    function readRatings() {
      return Array.prototype.map.call(areas, function (fs, i) {
        var checked = fs.querySelector("input:checked");
        return { fs: fs, area: fs.getAttribute("data-area"), level: checked ? Number(checked.value) : 0, order: i };
      });
    }

    form.addEventListener("change", function (e) {
      var fs = e.target.closest(".diag-area");
      if (fs) setMissing(fs, false);
      if (alertBox.textContent && readRatings().every(function (r) { return r.level; })) {
        alertBox.textContent = "";
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ratings = readRatings();
      var missing = ratings.filter(function (r) { return !r.level; });

      if (missing.length) {
        ratings.forEach(function (r) { setMissing(r.fs, !r.level); });
        alertBox.textContent = faltaTxt;
        result.hidden = true;
        missing[0].fs.querySelector("input").focus();
        return;
      }

      alertBox.textContent = "";
      // De la calificación más baja a la más alta; en empates, el orden original.
      ratings.sort(function (a, b) { return a.level - b.level || a.order - b.order; });

      list.innerHTML = "";
      ratings.forEach(function (r) {
        var msg = textos.querySelector('[data-nivel="' + r.level + '"]');
        var li = document.createElement("li");
        li.className = "nivel-" + r.level;

        var head = document.createElement("div");
        head.className = "diag-head";
        var name = document.createElement("span");
        name.className = "diag-name";
        name.textContent = r.area;
        var badge = document.createElement("span");
        badge.className = "diag-badge";
        badge.textContent = r.level + " = " + msg.getAttribute("data-etiqueta");
        head.appendChild(name);
        head.appendChild(badge);

        var p = document.createElement("p");
        p.className = "diag-msg";
        p.textContent = msg.textContent;

        li.appendChild(head);
        li.appendChild(p);
        list.appendChild(li);
      });

      result.hidden = false;
      result.focus();
    });
  }

  /* ---------- Utilidades de fechas (siempre en hora local) ---------- */
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  // Math.round absorbe la hora de diferencia en los cambios de horario.
  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function formatDate(d) {
    return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()];
  }

  function parseDateInput(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getMonth() === Number(m[2]) - 1 ? d : null;
  }

  /* ---------- Mejora 2: planificador con fecha ---------- */
  function initPlanificador(box) {
    var form = box.querySelector(".plan-form");
    var input = box.querySelector("#plan-fecha");
    var result = box.querySelector("[data-plan-result]");
    var msg = box.querySelector("[data-plan-msg]");
    var list = box.querySelector("[data-plan-list]");
    var tpl = box.querySelector("template[data-plan-textos]");
    if (!form || !input || !result || !msg || !list || !tpl) return;
    var textos = tpl.content;

    function texto(key) {
      return textos.querySelector('[data-texto="' + key + '"]');
    }

    function card(stage, from, to, actHtml, night) {
      var li = document.createElement("li");
      li.className = "plan-card" + (night ? " is-night" : "");
      if (stage) {
        var st = document.createElement("span");
        st.className = "plan-stage";
        st.textContent = stage;
        li.appendChild(st);
      }
      var dates = document.createElement("span");
      dates.className = "plan-dates";
      dates.textContent = daysBetween(from, to) === 0 ? formatDate(from) : formatDate(from) + " al " + formatDate(to);
      li.appendChild(dates);
      var p = document.createElement("p");
      p.className = "plan-act";
      p.innerHTML = actHtml;
      li.appendChild(p);
      return li;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var exam = parseDateInput(input.value);
      var today = startOfDay(new Date());
      // Días disponibles: de hoy (incluido) al día anterior al examen.
      var available = exam ? daysBetween(today, exam) : 0;

      list.innerHTML = "";
      msg.hidden = true;
      msg.textContent = "";

      function showMsg(key) {
        msg.textContent = texto(key).textContent;
        msg.hidden = false;
      }

      if (available <= 0) {
        showMsg("futura");
      } else if (available <= 3) {
        showMsg("pocos");
      } else {
        var lengths;
        var start;
        var label;
        if (available >= 28) {
          lengths = [7, 7, 7, 7];
          start = addDays(exam, -28);
          label = "Semana ";
          if (available > 28) showMsg("extra");
        } else {
          // Etapas lo más parecidas posible, las más largas primero.
          var base = Math.floor(available / 4);
          var extra = available % 4;
          lengths = [0, 1, 2, 3].map(function (i) { return base + (i < extra ? 1 : 0); });
          start = today;
          label = "Etapa ";
          showMsg("comprimido");
        }

        var cursor = start;
        lengths.forEach(function (len, i) {
          var end = addDays(cursor, len - 1);
          var act = textos.querySelector('[data-actividad="' + (i + 1) + '"]').innerHTML;
          list.appendChild(card(label + (i + 1), cursor, end, act, false));
          cursor = addDays(end, 1);
        });
        var night = addDays(exam, -1);
        list.appendChild(card(null, night, night, texto("noche").innerHTML, true));
      }

      result.hidden = false;
      result.focus();
    });
  }

  /* ---------- Mejora 3: simulacro cronometrado ---------- */
  var SIM_KEY = "domina-simulacro";

  function initSimulacro(root) {
    var total = Number(root.getAttribute("data-total"));
    var startScreen = root.querySelector("[data-sim-start]");
    var examScreen = root.querySelector("[data-sim-exam]");
    var resultsScreen = root.querySelector("[data-sim-results]");
    var items = root.querySelectorAll(".sim-item");
    var navBtns = root.querySelectorAll(".sim-nav-btn");
    var top = root.querySelector(".sim-top");
    var timeEl = root.querySelector("[data-sim-time]");
    var warnEl = root.querySelector("[data-sim-warning]");
    var prevBtn = root.querySelector("[data-sim-prev]");
    var nextBtn = root.querySelector("[data-sim-next]");
    var markBtn = root.querySelector("[data-sim-mark]");
    var finishBtn = root.querySelector("[data-sim-finish]");
    var confirmBox = root.querySelector("[data-sim-confirm]");
    var confirmTxt = root.querySelector("[data-sim-confirm-txt]");
    var tpl = root.querySelector("template[data-sim-textos]");
    if (!total || !items.length || !tpl || !startScreen || !examScreen || !resultsScreen) return;

    var textos = tpl.content;
    var N = items.length;
    var state = null;
    var timer = null;

    function texto(sel) {
      return textos.querySelector(sel).textContent;
    }

    function save() {
      try {
        window.localStorage.setItem(SIM_KEY, JSON.stringify(state));
      } catch (e) {
        /* Sin localStorage el simulacro funciona, pero no sobrevive a una recarga. */
      }
    }

    function load() {
      try {
        var s = JSON.parse(window.localStorage.getItem(SIM_KEY));
        if (s && s.v === 1 && (s.status === "running" || s.status === "done") &&
            typeof s.endAt === "number" && typeof s.startedAt === "number") {
          s.answers = s.answers || {};
          s.marked = s.marked || [];
          s.current = Math.min(Math.max(Number(s.current) || 0, 0), N - 1);
          return s;
        }
      } catch (e) { /* datos dañados o sin acceso: empieza de cero */ }
      return null;
    }

    function clearSaved() {
      try {
        window.localStorage.removeItem(SIM_KEY);
      } catch (e) { /* nada que borrar */ }
    }

    function showScreen(screen) {
      [startScreen, examScreen, resultsScreen].forEach(function (s) { s.hidden = s !== screen; });
    }

    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }

    function plural(n, uno, varios) {
      return n + " " + (n === 1 ? uno : varios);
    }

    function unansweredCount() {
      var c = 0;
      for (var i = 1; i <= N; i++) if (!state.answers[i]) c++;
      return c;
    }

    function setDisabled(btn, off) {
      btn.setAttribute("aria-disabled", off ? "true" : "false");
      btn.classList.toggle("is-disabled", off);
    }

    function updateNav() {
      Array.prototype.forEach.call(navBtns, function (btn, i) {
        var n = i + 1;
        var answered = !!state.answers[n];
        var marked = state.marked.indexOf(n) !== -1;
        btn.classList.toggle("is-answered", answered);
        btn.classList.toggle("is-marked", marked);
        if (i === state.current) btn.setAttribute("aria-current", "step");
        else btn.removeAttribute("aria-current");
        var parts = [answered ? "respondido" : "sin responder"];
        if (marked) parts.push("marcado para revisar");
        btn.querySelector("[data-nav-state]").textContent = ", " + parts.join(", ");
      });
    }

    function renderExam() {
      Array.prototype.forEach.call(items, function (item, i) {
        item.hidden = i !== state.current;
        var n = i + 1;
        Array.prototype.forEach.call(item.querySelectorAll("input"), function (inp) {
          inp.checked = state.answers[n] === inp.value;
        });
      });
      var n = state.current + 1;
      markBtn.setAttribute("aria-pressed", state.marked.indexOf(n) !== -1 ? "true" : "false");
      setDisabled(prevBtn, state.current === 0);
      setDisabled(nextBtn, state.current === N - 1);
      updateNav();
    }

    function goTo(i) {
      if (i < 0 || i >= N) return;
      state.current = i;
      save();
      renderExam();
      items[i].querySelector(".sim-question").focus();
    }

    function tick() {
      var remaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
      timeEl.textContent = pad(Math.floor(remaining / 60)) + ":" + pad(remaining % 60);
      if (remaining <= 300 && !top.classList.contains("is-low")) {
        top.classList.add("is-low");
        warnEl.textContent = texto('[data-texto="cinco"]');
      }
      if (remaining <= 0) finish(true);
    }

    function startTimer() {
      stopTimer();
      top.classList.remove("is-low");
      warnEl.textContent = "";
      tick();
      if (state && state.status === "running") timer = window.setInterval(tick, 250);
    }

    function stopTimer() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function begin() {
      var now = Date.now();
      state = { v: 1, status: "running", startedAt: now, endAt: now + total * 1000, answers: {}, marked: [], current: 0 };
      save();
      renderExam();
      showScreen(examScreen);
      startTimer();
      items[0].querySelector(".sim-question").focus();
    }

    function hideConfirm(returnFocus) {
      confirmBox.hidden = true;
      if (returnFocus) finishBtn.focus();
    }

    function optionNode(item, letter) {
      var label = item.querySelector('label[for="' + item.id.replace("sim-item-", "sim-") + "-" + letter + '"]');
      var frag = document.createDocumentFragment();
      var l = document.createElement("span");
      l.textContent = letter + ") ";
      frag.appendChild(l);
      frag.appendChild(label.querySelector(".opt-text").cloneNode(true));
      return frag;
    }

    var ICON_OK_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><title>Correcta</title><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>';
    var ICON_BAD_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><title>Incorrecta</title><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';

    function renderResults() {
      var correct = 0;
      var byArea = {};
      Array.prototype.forEach.call(items, function (item, i) {
        var area = item.getAttribute("data-area");
        byArea[area] = byArea[area] || { ok: 0, total: 0 };
        byArea[area].total++;
        if (state.answers[i + 1] === item.getAttribute("data-correct")) {
          correct++;
          byArea[area].ok++;
        }
      });

      var ratio = correct / N * 100;
      root.querySelector("[data-sim-score]").textContent = correct + " de " + N + " aciertos, " + Math.round(ratio) + " %";
      var rango = ratio < 50 ? "0" : ratio < 80 ? "50" : "80";
      var msgEl = root.querySelector("[data-sim-msg]");
      msgEl.textContent = (state.timeUp ? "Se acabó el tiempo. " : "") + texto('[data-rango="' + rango + '"]');

      var used = Math.min(total, Math.max(0, Math.round((state.finishedAt - state.startedAt) / 1000)));
      root.querySelector("[data-sim-used]").textContent =
        plural(Math.floor(used / 60), "minuto", "minutos") + " con " + plural(used % 60, "segundo", "segundos");

      var areasEl = root.querySelector("[data-sim-areas]");
      areasEl.innerHTML = "";
      Array.prototype.forEach.call(textos.querySelectorAll("[data-area-orden]"), function (a) {
        var name = a.textContent;
        var r = byArea[name] || { ok: 0, total: 0 };
        var pct = r.total ? Math.round(r.ok / r.total * 100) : 0;
        var li = document.createElement("li");
        li.innerHTML = '<span class="rb-label"></span><span class="sim-area-val"></span>' +
          '<span class="rb-track" aria-hidden="true"><span class="rb-fill grow"></span></span>';
        li.querySelector(".rb-label").textContent = name;
        li.querySelector(".sim-area-val").textContent = r.ok + " de " + r.total + ", " + pct + " %";
        li.querySelector(".rb-fill").style.setProperty("--v", pct);
        areasEl.appendChild(li);
      });

      var review = root.querySelector("[data-sim-review]");
      review.innerHTML = "";
      Array.prototype.forEach.call(items, function (item, i) {
        var n = i + 1;
        var chosen = state.answers[n];
        var right = item.getAttribute("data-correct");
        var ok = chosen === right;
        var li = document.createElement("li");
        li.className = ok ? "is-right" : "is-wrong";

        var head = document.createElement("p");
        head.className = "sim-rev-head";
        var title = document.createElement("span");
        title.textContent = "Reactivo " + n + ". " + item.getAttribute("data-area");
        var status = document.createElement("span");
        status.className = "sim-rev-status";
        status.innerHTML = (ok ? ICON_OK_SM : ICON_BAD_SM) + (ok ? "Correcta" : chosen ? "Incorrecta" : "Sin responder");
        head.appendChild(title);
        head.appendChild(status);
        li.appendChild(head);

        var stem = item.querySelector(".quiz-stem");
        if (stem) li.appendChild(stem.cloneNode(true));
        var q = item.querySelector(".sim-question");
        var qp = document.createElement("p");
        qp.className = "sim-rev-q";
        qp.innerHTML = q.innerHTML;
        if (q.hasAttribute("lang")) qp.setAttribute("lang", q.getAttribute("lang"));
        li.appendChild(qp);

        var yours = document.createElement("p");
        yours.innerHTML = "<strong>Tu respuesta:</strong> ";
        if (chosen) yours.appendChild(optionNode(item, chosen));
        else yours.appendChild(document.createTextNode("sin responder"));
        li.appendChild(yours);

        var corr = document.createElement("p");
        corr.innerHTML = "<strong>Respuesta correcta:</strong> ";
        corr.appendChild(optionNode(item, right));
        li.appendChild(corr);

        var expl = item.querySelector(".sim-expl").cloneNode(true);
        expl.hidden = false;
        li.appendChild(expl);
        review.appendChild(li);
      });
    }

    function animateResults() {
      resultsScreen.classList.remove("reveal", "is-visible");
      if (!root.ownerDocument.documentElement.classList.contains("js-motion")) return;
      numberBars(resultsScreen);
      resultsScreen.classList.add("reveal");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { resultsScreen.classList.add("is-visible"); });
      });
    }

    function finish(timeUp, silent) {
      if (!state || state.status !== "running") return;
      stopTimer();
      hideConfirm(false);
      state.status = "done";
      state.timeUp = !!timeUp;
      state.finishedAt = Math.min(Date.now(), state.endAt);
      save();
      renderResults();
      showScreen(resultsScreen);
      animateResults();
      if (!silent) resultsScreen.focus();
    }

    function restart() {
      stopTimer();
      clearSaved();
      state = null;
      Array.prototype.forEach.call(root.querySelectorAll(".sim-item input"), function (inp) { inp.checked = false; });
      hideConfirm(false);
      showScreen(startScreen);
      root.querySelector("[data-sim-begin]").focus();
    }

    // Eventos
    root.querySelector("[data-sim-begin]").addEventListener("click", begin);
    root.querySelector("[data-sim-restart]").addEventListener("click", restart);

    prevBtn.addEventListener("click", function () {
      if (state && state.current > 0) goTo(state.current - 1);
    });
    nextBtn.addEventListener("click", function () {
      if (state && state.current < N - 1) goTo(state.current + 1);
    });

    markBtn.addEventListener("click", function () {
      var n = state.current + 1;
      var at = state.marked.indexOf(n);
      if (at === -1) state.marked.push(n);
      else state.marked.splice(at, 1);
      save();
      markBtn.setAttribute("aria-pressed", at === -1 ? "true" : "false");
      updateNav();
    });

    Array.prototype.forEach.call(navBtns, function (btn) {
      btn.addEventListener("click", function () {
        goTo(Number(btn.getAttribute("data-go")) - 1);
      });
    });

    examScreen.addEventListener("change", function (e) {
      var inp = e.target;
      if (!state || state.status !== "running" || inp.type !== "radio") return;
      var n = Number(inp.closest(".sim-item").getAttribute("data-n"));
      state.answers[n] = inp.value;
      save();
      updateNav();
    });

    finishBtn.addEventListener("click", function () {
      var x = unansweredCount();
      var frase = texto('[data-texto="confirmar"]');
      confirmTxt.textContent = x === 1 ? frase.replace("X reactivos", "1 reactivo") : frase.replace("X", String(x));
      confirmBox.hidden = false;
      confirmTxt.focus();
    });

    root.querySelector("[data-sim-confirm-yes]").addEventListener("click", function () { finish(false); });
    root.querySelector("[data-sim-confirm-no]").addEventListener("click", function () { hideConfirm(true); });
    confirmBox.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        hideConfirm(true);
      }
    });

    // Recupera un simulacro guardado (por ejemplo, tras recargar la página).
    state = load();
    if (state && state.status === "running") {
      if (Date.now() >= state.endAt) {
        finish(true, true);
      } else {
        renderExam();
        showScreen(examScreen);
        startTimer();
      }
    } else if (state && state.status === "done") {
      renderResults();
      showScreen(resultsScreen);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initTheme);
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-planificador]"), initPlanificador);
    });
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-simulacro]"), initSimulacro);
    });
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-diagnostico]"), initDiagnostico);
    });
    safe(initNav);
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll(".quiz"), initQuiz);
    });
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-checklist]"), initChecklist);
    });
    safe(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-marquee]"), initMarquee);
    });
    safe(initMotion);
  });
})();
