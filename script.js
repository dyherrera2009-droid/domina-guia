/* Domina el DOMINA · Script compartido */
(function () {
  "use strict";

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

    window.matchMedia("(min-width: 1120px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
  });
})();
