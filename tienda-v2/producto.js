/* ============================================================
   Ficha de producto.
   Las tarjetas del catálogo apuntaban acá desde el primer día y la
   página no existía: las 22 fichas terminaban en un 404.

   Regla de la maqueta: acá no se inventa nada. Precio, tamaños,
   porciones, anticipación mínima y costos de envío son campos de
   backend que todavía nadie cargó, así que la ficha los nombra como
   pendientes en vez de rellenarlos.
   ============================================================ */
(function () {
  'use strict';
  var ficha = document.getElementById('ficha');
  if (!ficha) return;

  var esc = window.SENTIDA_esc;
  var WA = '5491158300787';
  var slug = new URLSearchParams(location.search).get('p') || '';

  var ICONO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 49h34M18 45h28V31H18v14Zm6-14v-8h16v8M28 23v-9M36 23v-9M24 16c2-3 4-3 6 0M34 16c2-3 4-3 6 0"/></svg>';

  function aviso(titulo, texto, href, cta) {
    ficha.removeAttribute('aria-busy');
    ficha.className = 'envoltorio';
    ficha.style.paddingBlock = 'var(--s9) var(--s10)';
    ficha.innerHTML = '<div class="aviso">' +
      '<h1 style="font-size:var(--fs-h2)">' + titulo + '</h1>' +
      '<p style="margin-top:var(--s4)">' + texto + '</p>' +
      '<a class="btn btn-1" href="' + href + '">' + cta + '</a></div>';
    document.title = titulo + ' · SENTIDA Pastelería';
  }

  function pintar(datos) {
    var tortas = datos.tortas || [], past = datos.pasteleria || [];
    var p = null, tipo = 'torta';
    tortas.forEach(function (t) { if (t.slug === slug) { p = t; } });
    if (!p) past.forEach(function (t) { if (t.slug === slug) { p = t; tipo = 'past'; } });

    if (!p) {
      aviso('No encontramos ese producto',
        'Puede que el enlace esté viejo o que todavía no lo hayamos cargado. El catálogo completo está acá.',
        'tortas.html', 'Ver nuestras tortas');
      return;
    }

    document.title = p.nombre + ' · SENTIDA Pastelería';
    var volverA = tipo === 'torta' ? 'tortas.html' : 'pasteleria.html';
    var volverT = tipo === 'torta' ? 'Nuestras tortas' : 'Pastelería';

    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" width="900" height="1125">'
      : '<span class="prod-sinfoto">' + ICONO + '<span class="etiqueta">Foto en camino</span></span>';
    var estado = p.tanda ? '<span class="prod-estado encargo">Por tanda</span>' : '';

    var msg = 'Hola SENTIDA! Quiero pedir un presupuesto de: ' + p.nombre + '.';

    // Cada dato de esta lista salió de lo que nos pasaron. Lo que no,
    // se nombra como pendiente y no se completa con un valor de relleno.
    var datosFicha = [
      ['Producción', 'Por encargo'],
      ['Retiro', 'Martínez, San Isidro'],
      ['Envíos', 'Zona Norte, con costo según la distancia']
    ];
    if (p.tanda) datosFicha.push(['Tandas', 'Se hace por tanda y tiene fecha de cierre de pedidos']);

    ficha.removeAttribute('aria-busy');
    ficha.innerHTML =
      '<div class="ficha-foto">' + estado + foto + '</div>' +
      '<div class="ficha-cuerpo">' +
        '<a class="volver" href="' + volverA + '">← ' + volverT + '</a>' +
        '<span class="filete" aria-hidden="true" style="margin-top:var(--s4)"></span>' +
        '<h1>' + esc(p.nombre) + '</h1>' +
        (p.desc ? '<p class="ficha-desc">' + esc(p.desc) + '</p>' : '') +
        '<div class="ficha-precio">' +
          '<span class="etiqueta">Precio</span>' +
          '<span class="v">A cargar</span>' +
        '</div>' +
        '<div class="ficha-cta">' +
          '<a class="btn btn-1" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">Pedir presupuesto</a>' +
          '<a class="btn btn-2" href="como-comprar.html">Cómo comprar</a>' +
        '</div>' +
        '<dl class="ficha-datos">' +
          datosFicha.map(function (d) {
            return '<div><dt>' + d[0] + '</dt><dd>' + d[1] + '</dd></div>';
          }).join('') +
        '</dl>' +
        '<p class="nota">Los <strong>tamaños, las porciones y el precio</strong> de esta torta todavía no están cargados. ' +
        'Te los pasamos al responder el presupuesto.' +
        (tipo === 'torta'
          ? ' ¿La querés decorada o con una temática? Eso se arma en <a href="decoradas.html">Tortas decoradas</a>.'
          : '') +
        '</p>' +
      '</div>';

    // Hermanos del mismo listado, sin repetir el que se está mirando.
    var hermanos = (tipo === 'torta' ? tortas : past)
      .filter(function (t) { return t.slug !== p.slug; });
    // Primero los que tienen foto: una fila de cuatro placas vacías no
    // invita a seguir mirando nada.
    hermanos.sort(function (a, b) { return (b.foto ? 1 : 0) - (a.foto ? 1 : 0); });
    var mas = document.getElementById('mas');
    document.getElementById('mas-grilla').innerHTML =
      hermanos.slice(0, 4).map(window.SENTIDA_tarjeta).join('');
    var todas = document.getElementById('mas-todas');
    todas.href = volverA;
    todas.textContent = 'Ver ' + volverT.toLowerCase();
    mas.hidden = false;
  }

  fetch('datos.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(pintar)
    .catch(function () {
      aviso('No pudimos cargar el producto',
        'Puede ser la conexión. Probá de nuevo o mirá el catálogo completo.',
        'tortas.html', 'Ver nuestras tortas');
    });
})();
