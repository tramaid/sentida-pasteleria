/* ============================================================
   Mi pedido → una sola solicitud de presupuesto.

   Acá se juntan los dos flujos que en la v1 y la v2 iban por
   separado: los productos del catálogo y la torta armada en el
   configurador. Sale un único mensaje de WhatsApp, y el chat queda
   como registro de la solicitud.

   No hay total, no hay pago y no hay cuenta: nadie cargó precios ni
   seña todavía, así que la pantalla no los finge.
   ============================================================ */
(function () {
  'use strict';

  var S = window.SENTIDA, esc = S.esc, pedido = S.pedido;
  var WA = {anto: '5491158300787', nadia: '5491131459646'};
  var $ = function (id) { return document.getElementById(id); };
  if (!$('ped-lista')) return;

  function fechaLegible(valor) {
    if (!valor) return '';
    var p = valor.split('-');
    if (p.length !== 3) return valor;
    return Number(p[2]) + '/' + Number(p[1]) + '/' + p[0];
  }

  function armarMensaje() {
    var items = pedido.leer();
    var lineas = ['Hola SENTIDA! Quiero pedir presupuesto por:', ''];
    items.forEach(function (i) {
      if (i.tipo === 'torta') {
        lineas.push('• Torta decorada');
        (i.detalle || []).forEach(function (d) { lineas.push('   ' + d[0] + ': ' + d[1]); });
      } else {
        var linea = '• ' + i.nombre;
        if (i.porciones) linea += ' — ' + i.porciones + ' porciones';
        if (i.cant > 1) linea += ' ×' + i.cant;
        lineas.push(linea);
      }
      if (i.nota) lineas.push('   ' + i.nota);
    });
    var fecha = $('ped-fecha').value;
    var comentario = $('ped-comentario').value.trim();
    var nombre = $('ped-nombre').value.trim();
    if (nombre || fecha || comentario) lineas.push('');
    if (nombre) lineas.push('Soy ' + nombre + '.');
    if (fecha) lineas.push('Fecha: ' + fechaLegible(fecha));
    if (comentario) lineas.push(comentario);
    return lineas.join('\n');
  }

  function pintarEnlaces() {
    var texto = armarMensaje();
    $('ped-previo-texto').textContent = texto;
    $('env-anto').href = 'https://wa.me/' + WA.anto + '?text=' + encodeURIComponent(texto);
    $('env-nadia').href = 'https://wa.me/' + WA.nadia + '?text=' + encodeURIComponent(texto);
    try { localStorage.setItem('sentida-v3-cierre', JSON.stringify({
      nombre: $('ped-nombre').value, fecha: $('ped-fecha').value, comentario: $('ped-comentario').value
    })); } catch (e) {}
  }

  function filaTorta(i, idx) {
    var det = (i.detalle || []).map(function (d) {
      return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd></div>';
    }).join('');
    return '<article class="ped-item">' +
      '<div class="ped-datos">' +
        '<h2>Torta decorada</h2>' +
        '<div class="det">Diseñada con vos</div>' +
        '<dl class="torta-det">' + det + '</dl>' +
      '</div>' +
      '<div class="ped-acciones">' +
        '<a href="decoradas.html">Editar la torta</a>' +
        '<button type="button" data-quitar="' + idx + '">Quitar</button>' +
      '</div>' +
    '</article>';
  }

  function filaProducto(i, idx) {
    // Sin porciones cargadas no se afirma nada: el catálogo tampoco lo dice.
    var det = i.porciones ? '<div class="det">' + i.porciones + ' porciones</div>' : '';
    return '<article class="ped-item">' +
      '<div class="ped-datos">' +
        '<h2>' + esc(i.nombre) + '</h2>' + det +
        (i.nota ? '<p class="ped-nota">' + esc(i.nota) + '</p>' : '') +
      '</div>' +
      '<div class="ped-cant">' +
        '<button type="button" data-menos="' + idx + '" aria-label="Quitar una unidad de ' + esc(i.nombre) + '">−</button>' +
        '<span class="n">' + (i.cant || 1) + '</span>' +
        '<button type="button" data-mas="' + idx + '" aria-label="Sumar una unidad de ' + esc(i.nombre) + '">+</button>' +
      '</div>' +
      '<div class="ped-acciones">' +
        '<a href="producto.html?p=' + encodeURIComponent(i.slug || '') + '">Ver la ficha</a>' +
        '<button type="button" data-quitar="' + idx + '">Quitar</button>' +
      '</div>' +
    '</article>';
  }

  function pintar() {
    var items = pedido.leer();
    var n = items.reduce(function (t, i) { return t + (i.cant || 1); }, 0);

    $('ped-total').textContent = n === 0
      ? 'Sin nada elegido todavía'
      : n + (n === 1 ? ' ítem en tu pedido' : ' ítems en tu pedido');
    $('ped-vacio').hidden = n !== 0;
    $('ped-lista').hidden = n === 0;
    $('ped-cierre').hidden = n === 0;
    if (n === 0) { $('ped-lista').innerHTML = ''; return; }

    $('ped-lista').innerHTML = items.map(function (i, idx) {
      return i.tipo === 'torta' ? filaTorta(i, idx) : filaProducto(i, idx);
    }).join('');

    function conLista(fn) {
      var it = pedido.leer(); fn(it); pedido.guardar(it); pintar(); pintarEnlaces();
    }
    $('ped-lista').querySelectorAll('[data-mas]').forEach(function (b) {
      b.addEventListener('click', function () {
        conLista(function (it) { it[b.dataset.mas].cant = (it[b.dataset.mas].cant || 1) + 1; });
      });
    });
    $('ped-lista').querySelectorAll('[data-menos]').forEach(function (b) {
      b.addEventListener('click', function () {
        conLista(function (it) {
          var i = b.dataset.menos;
          it[i].cant = (it[i].cant || 1) - 1;
          if (it[i].cant < 1) it.splice(i, 1);
        });
      });
    });
    $('ped-lista').querySelectorAll('[data-quitar]').forEach(function (b) {
      b.addEventListener('click', function () {
        conLista(function (it) { it.splice(b.dataset.quitar, 1); });
      });
    });

    pintarEnlaces();
  }

  ['ped-nombre', 'ped-fecha', 'ped-comentario'].forEach(function (id) {
    $(id).addEventListener('input', pintarEnlaces);
    $(id).addEventListener('change', pintarEnlaces);
  });

  // Nada sale para hoy: todo se hace por encargo. La fecha mínima se
  // arma local, no con toISOString, que en husos positivos devolvía
  // el día anterior.
  var m = new Date(Date.now() + 86400000);
  var mm = String(m.getMonth() + 1), dd = String(m.getDate());
  $('ped-fecha').min = m.getFullYear() + '-' + (mm.length < 2 ? '0' + mm : mm) + '-' + (dd.length < 2 ? '0' + dd : dd);

  try {
    var g = JSON.parse(localStorage.getItem('sentida-v3-cierre')) || {};
    if (g.nombre) $('ped-nombre').value = g.nombre;
    if (g.fecha) $('ped-fecha').value = g.fecha;
    if (g.comentario) $('ped-comentario').value = g.comentario;
  } catch (e) {}

  // Aviso al volver del configurador, para que se vea que la torta llegó.
  if (new URLSearchParams(location.search).get('sumada') === 'torta') {
    $('ped-sumada').hidden = false;
  }

  pintar();
})();
