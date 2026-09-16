/* ============================================================
   Ficha de producto.
   Las tarjetas del catálogo apuntaban acá desde el primer día y la
   página no existía: las 22 fichas terminaban en un 404.

   Regla de la maqueta: acá no se inventa nada. Precio, tamaños,
   porciones, anticipación mínima y costos de envío son campos de
   backend que todavía nadie cargó, así que la ficha los nombra como
   pendientes en vez de rellenarlos.

   En la v3 la ficha deja de mandar a WhatsApp por su cuenta: suma el
   producto al pedido, que es de donde sale la solicitud.
   ============================================================ */
(function () {
  'use strict';
  var ficha = document.getElementById('ficha');
  if (!ficha) return;

  var S = window.SENTIDA, esc = S.esc;
  var slug = new URLSearchParams(location.search).get('p') || '';


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
    var prods = datos.productos || [];
    var p = prods.filter(function (x) { return x.slug === slug; })[0] || null;

    if (!p) {
      aviso('No encontramos ese producto',
        'Puede que el enlace esté viejo o que todavía no lo hayamos cargado. El catálogo completo está acá.',
        'catalogo.html', 'Ver el catálogo');
      return;
    }

    document.title = p.nombre + ' · SENTIDA Pastelería';
    var cat = (datos.categorias || []).filter(function (c) { return c.slug === p.categoria; })[0];
    var volverA = 'catalogo.html?cat=' + encodeURIComponent(p.categoria);
    var volverT = cat ? cat.nombre : 'el catálogo';

    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" width="900" height="1125">'
      : '<span class="prod-sinfoto">' + S.ICONO + '<span class="etiqueta">Foto en camino</span></span>';
    var estado = p.estado === 'temporada' ? '<span class="prod-estado encargo">Por tanda</span>' : '';

    // Cada dato de esta lista salió de lo que nos pasaron. Lo que no,
    // se nombra como pendiente y no se completa con un valor de relleno.
    var datosFicha = [
      ['Producción', 'Por encargo'],
      ['Retiro', 'Martínez, San Isidro'],
      ['Envíos', 'Zona Norte, con costo según la distancia']
    ];
    if (p.estado === 'temporada') datosFicha.push(['Tandas', 'Se hace por tanda y tiene fecha de cierre de pedidos']);

    ficha.removeAttribute('aria-busy');
    ficha.innerHTML =
      '<div class="ficha-foto">' + estado + foto + '</div>' +
      '<div class="ficha-cuerpo">' +
        '<a class="volver" href="' + volverA + '">← ' + volverT + '</a>' +
        '<span class="filete" aria-hidden="true" style="margin-top:var(--s4)"></span>' +
        '<h1>' + esc(p.nombre) + '</h1>' +
        (p.descripcion ? '<p class="ficha-desc">' + esc(p.descripcion) + '</p>' : '') +
        '<div class="ficha-precio">' +
          '<span class="etiqueta">Precio</span>' +
          '<span class="v">A cargar</span>' +
        '</div>' +
        '<div class="ficha-cta">' +
          '<button class="btn btn-1" type="button" id="ficha-add">Agregar a mi pedido</button>' +
          '<a class="btn btn-2" href="pedido.html">Ver mi pedido</a>' +
        '</div>' +
        '<p class="ayuda" id="ficha-aviso" role="status" style="margin-top:var(--s3)"></p>' +
        '<dl class="ficha-datos">' +
          datosFicha.map(function (d) {
            return '<div><dt>' + d[0] + '</dt><dd>' + d[1] + '</dd></div>';
          }).join('') +
        '</dl>' +
        '<p class="nota">Los <strong>tamaños, las porciones y el precio</strong> de esta torta todavía no están cargados. ' +
        'Te los pasamos al responder el presupuesto.' +
        (p.categoria === 'tortas'
          ? ' ¿La querés decorada o con una temática? Eso se arma en <a href="decoradas.html">Tortas decoradas</a>.'
          : '') +
        '</p>' +
      '</div>';

    document.getElementById('ficha-add').addEventListener('click', function () {
      S.pedido.agregarProducto(p, null, '');
      document.getElementById('ficha-aviso').textContent = 'Listo, lo sumamos a tu pedido.';
    });

    // Hermanos de la misma categoría, sin repetir el que se está mirando.
    var hermanos = prods.filter(function (t) {
      return t.categoria === p.categoria && t.slug !== p.slug;
    });
    // Primero los que tienen foto: una fila de cuatro placas vacías no
    // invita a seguir mirando nada.
    hermanos.sort(function (a, b) { return (b.foto ? 1 : 0) - (a.foto ? 1 : 0); });
    var mas = document.getElementById('mas');
    document.getElementById('mas-grilla').innerHTML =
      hermanos.slice(0, 4).map(S.tarjeta).join('');
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
        'catalogo.html', 'Ver el catálogo');
    });
})();
