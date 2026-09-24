/* SENTIDA · la comanda — lo que acompaña al armado.
   Escritorio: la foto del panel cambia según el paso a la vista.
   Celular: mientras la comanda está en pantalla, la cabecera se esconde y
   arriba queda la tira del ticket; al tocarla se abre la comanda entera. */
(function () {
  'use strict';
  var C = window.Comanda;
  var doc = document.documentElement;
  var comanda = document.getElementById('comanda');
  var foto = document.querySelector('.panel-foto');
  var pie = document.getElementById('panel-pie');
  var tira = document.getElementById('tira');
  var tiraLinea = document.getElementById('tira-linea');
  var ver = document.querySelector('.tira-ver');
  var dialogo = document.getElementById('comanda-dialogo');
  var cerrar = document.getElementById('dialogo-cerrar');
  if (!C || !comanda || !('IntersectionObserver' in window)) return;

  // Paso a la vista → foto y pie del panel.
  if (foto) {
    var pasos = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target.getAttribute('data-n');
        foto.setAttribute('data-activo', n);
        var img = foto.querySelector('[data-foto="' + n + '"]');
        if (img && pie) pie.textContent = 'Hecha por nosotras · ' + img.getAttribute('data-pie');
      });
    }, {rootMargin: '-45% 0px -45% 0px'});
    document.querySelectorAll('.paso[data-n], #cierre[data-n]').forEach(function (p) { pasos.observe(p); });
  }

  // Celular: la tira reemplaza a la cabecera mientras se arma.
  if (tira) {
    tira.hidden = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { doc.classList.toggle('en-comanda', e.isIntersecting); });
    }, {rootMargin: '-45% 0px -45% 0px'}).observe(comanda);
  }

  var tiraEt = tiraLinea && tiraLinea.querySelector('.tira-et');
  var tiraVal = tiraLinea && tiraLinea.querySelector('.tira-val');
  C.alCambiar(function (estado, nueva, lineas) {
    if (!tiraEt || !tiraVal) return;
    var hechas = (lineas || []).filter(function (l) { return !l.vacio; });
    var l = nueva || hechas[hechas.length - 1];
    tiraEt.textContent = l ? l.etiqueta : 'Paso 1';
    tiraVal.textContent = l ? l.valor : 'Empezá por la fecha';
  });

  // La comanda entera en un diálogo nativo: foco atrapado y Escape.
  if (dialogo && ver && typeof dialogo.showModal === 'function') {
    var focoAlCerrar = null;
    ver.addEventListener('click', function () {
      // Si el mensaje se editó a mano, el diálogo no manda: avisa y lleva a revisarlo.
      dialogo.classList.toggle('editado', !!(C.editado && C.editado()));
      dialogo.showModal();
      ver.setAttribute('aria-expanded', 'true');
    });
    dialogo.addEventListener('close', function () {
      ver.setAttribute('aria-expanded', 'false');
      (focoAlCerrar || ver).focus();
      focoAlCerrar = null;
    });
    var revisar = dialogo.querySelector('.dialogo-revisar');
    if (revisar) revisar.addEventListener('click', function (ev) {
      ev.preventDefault();
      focoAlCerrar = document.getElementById('mensaje');
      dialogo.close();
    });
    if (cerrar) cerrar.addEventListener('click', function () { dialogo.close(); });
    dialogo.addEventListener('click', function (ev) { if (ev.target === dialogo) dialogo.close(); });
  }
})();
