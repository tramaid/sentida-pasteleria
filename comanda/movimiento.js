/* SENTIDA · la comanda — movimiento y detalles de interfaz.
   Un solo gesto: al empezar, la comanda de la portada viaja a su lugar
   (el panel en escritorio, la tira en celular). Además, las flechas de la
   fila de mesas dulces y el menú del celular. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : {matches: false}; };
  var quieto = mm('(prefers-reduced-motion: reduce)');
  var celular = mm('(max-width: 899px)');
  function actualizarMov() { doc.classList.toggle('mov', !quieto.matches); }
  if (quieto.addEventListener) quieto.addEventListener('change', actualizarMov);
  actualizarMov();

  /* ---------- El gesto ---------- */
  var empezar = document.getElementById('empezar');
  var origen = document.querySelector('.ticket-portada .papel');
  var comanda = document.getElementById('comanda');
  var fecha = document.getElementById('fecha');
  if (empezar && origen && comanda) {
    empezar.addEventListener('click', function (ev) {
      ev.preventDefault();
      var desde = origen.getBoundingClientRect();
      comanda.scrollIntoView({behavior: 'instant', block: 'start'});
      if (celular.matches) doc.classList.add('en-comanda');
      if (fecha) fecha.focus({preventScroll: true});
      if (!doc.classList.contains('mov')) return;
      var destino = celular.matches ? document.getElementById('tira') : document.querySelector('.panel .ticket');
      if (!destino || !destino.animate) return;
      destino.getAnimations().forEach(function (a) { a.cancel(); });
      var hasta = destino.getBoundingClientRect();
      if (!hasta.width) return;
      var dx = desde.left - hasta.left, dy = desde.top - hasta.top, s = desde.width / hasta.width;
      destino.animate([
        {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', transformOrigin: 'top left'},
        {transform: 'none', transformOrigin: 'top left'}
      ], {duration: 700, easing: 'cubic-bezier(.16,1,.3,1)'});
    });
  }

  /* ---------- Flechas de las filas ---------- */
  document.querySelectorAll('.fila-ctrl[data-fila]').forEach(function (ctrl) {
    var cont = document.getElementById(ctrl.getAttribute('data-fila'));
    if (!cont) return;
    var prev = ctrl.querySelector('[data-dir="-1"]'), next = ctrl.querySelector('[data-dir="1"]');
    function estado() {
      ctrl.hidden = cont.scrollWidth <= cont.clientWidth + 2;
      prev.disabled = cont.scrollLeft < 4;
      next.disabled = cont.scrollLeft + cont.clientWidth > cont.scrollWidth - 4;
    }
    ctrl.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      cont.scrollBy({left: cont.clientWidth * 0.8 * Number(b.getAttribute('data-dir')),
                     behavior: doc.classList.contains('mov') ? 'smooth' : 'auto'});
    });
    cont.addEventListener('scroll', estado, {passive: true});
    window.addEventListener('resize', estado);
    estado();
  });

  /* ---------- Menú del celular ---------- */
  var menu = document.querySelector('.menu');
  if (menu) {
    var cerrar = function () { menu.open = false; };
    menu.addEventListener('click', function (ev) { if (ev.target.closest('nav a')) cerrar(); });
    menu.addEventListener('focusout', function (ev) {
      if (menu.open && ev.relatedTarget && !menu.contains(ev.relatedTarget)) cerrar();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.open) { cerrar(); menu.querySelector('summary').focus(); }
    });
    document.addEventListener('click', function (ev) { if (menu.open && !menu.contains(ev.target)) cerrar(); });
  }
})();
