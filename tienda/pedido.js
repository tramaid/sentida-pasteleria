/* ============================================================
   Mi pedido → solicitud de presupuesto.
   Es el checkout de CARVAN vaciado de plata: no hay total, no hay
   pago y no hay cuenta. Lo que sale es un mensaje de WhatsApp con
   el detalle, y el chat queda como registro de la solicitud.
   ============================================================ */
(function () {
  'use strict';

  var CLAVE = 'sentida-pedido';
  var WA = {anto: '5491158300787', nadia: '5491131459646'};

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- menú del sitio ---------- */
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.querySelector('#nav-principal');
  var menuLabel = menuButton && menuButton.querySelector('.menu-label');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  }
  if (menuButton) {
    menuButton.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuButton.focus(); }
  });

  /* ---------- datos ---------- */
  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
  }
  function guardar(items) {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) {}
  }

  function fechaLegible(valor) {
    if (!valor) return '';
    var p = valor.split('-');
    if (p.length !== 3) return valor;
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function armarMensaje() {
    var items = leer();
    var lineas = ['Hola SENTIDA! Quiero pedir presupuesto por:', ''];
    items.forEach(function (i) {
      var linea = '• ' + i.nombre;
      if (i.porciones) linea += ' — ' + i.porciones + ' porciones';
      if (i.cant > 1) linea += ' ×' + i.cant;
      lineas.push(linea);
      if (i.nota) lineas.push('   ' + i.nota);
    });
    var fecha = $('ped-fecha').value;
    var comentario = $('ped-comentario').value.trim();
    if (fecha || comentario) lineas.push('');
    if (fecha) lineas.push('Fecha: ' + fechaLegible(fecha));
    if (comentario) lineas.push(comentario);
    return lineas.join('\n');
  }

  function pintarEnlaces() {
    var texto = armarMensaje();
    $('ped-previo-texto').textContent = texto;
    $('env-anto').href = 'https://wa.me/' + WA.anto + '?text=' + encodeURIComponent(texto);
    $('env-nadia').href = 'https://wa.me/' + WA.nadia + '?text=' + encodeURIComponent(texto);
  }

  function pintar() {
    var items = leer();
    var n = items.reduce(function (t, i) { return t + (i.cant || 1); }, 0);

    var badge = $('bag-n');
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }

    $('ped-total').textContent = n === 0
      ? 'Sin creaciones elegidas'
      : n + (n === 1 ? ' creación elegida' : ' creaciones elegidas');
    $('ped-vacio').hidden = n !== 0;
    $('ped-lista').hidden = n === 0;
    $('ped-cierre').hidden = n === 0;
    if (n === 0) { $('ped-lista').innerHTML = ''; return; }

    $('ped-lista').innerHTML = items.map(function (i, idx) {
      var det = i.porciones ? i.porciones + ' porciones' : 'Unidad';
      return '<div class="ped-item">' +
        '<div class="ped-datos">' +
          '<h3>' + i.nombre + '</h3>' +
          '<div class="det">' + det + '</div>' +
          (i.nota ? '<p class="nota">' + i.nota + '</p>' : '') +
        '</div>' +
        '<div class="ped-cant">' +
          '<button type="button" data-menos="' + idx + '" aria-label="Quitar una unidad de ' + i.nombre + '">−</button>' +
          '<span class="n">' + (i.cant || 1) + '</span>' +
          '<button type="button" data-mas="' + idx + '" aria-label="Sumar una unidad de ' + i.nombre + '">+</button>' +
        '</div>' +
        '<button type="button" class="ped-quitar" data-quitar="' + idx + '">Quitar</button>' +
      '</div>';
    }).join('');

    $('ped-lista').querySelectorAll('[data-mas]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = leer(); it[b.dataset.mas].cant = (it[b.dataset.mas].cant || 1) + 1; guardar(it); pintar(); pintarEnlaces();
      });
    });
    $('ped-lista').querySelectorAll('[data-menos]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = leer(), i = b.dataset.menos;
        it[i].cant = (it[i].cant || 1) - 1;
        if (it[i].cant < 1) it.splice(i, 1);
        guardar(it); pintar(); pintarEnlaces();
      });
    });
    $('ped-lista').querySelectorAll('[data-quitar]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = leer(); it.splice(b.dataset.quitar, 1); guardar(it); pintar(); pintarEnlaces();
      });
    });

    pintarEnlaces();
  }

  $('ped-fecha').addEventListener('change', pintarEnlaces);
  $('ped-comentario').addEventListener('input', pintarEnlaces);

  // La fecha no puede ser hoy ni ayer: todo se hace a pedido.
  var manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  $('ped-fecha').min = manana;

  pintar();
})();
