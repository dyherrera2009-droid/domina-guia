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
  var canAnimate = !reduceMotion && "IntersectionObserver" in window;
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

  function initReveal() {
    if (!canAnimate) return;
    var targets = document.querySelectorAll(".card, .pager");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // Ejecuta cada módulo por separado: un error en uno no detiene a los demás
  // y, si falla el de animaciones, el contenido se muestra completo.
  function safe(fn) {
    try {
      fn();
    } catch (e) {
      if (fn === initReveal) root.classList.remove("js-motion");
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
      if (bar) bar.style.width = (keys.length / inputs.length * 100) + "%";
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

  document.addEventListener("DOMContentLoaded", function () {
    safe(initTheme);
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
    safe(initReveal);
  });
})();
