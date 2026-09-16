/* ============================================================
   SENTIDA v3 — base común a todas las pantallas.

   Acá vive lo que antes estaba duplicado en tres archivos: el menú,
   el enlace de página actual, el escape de HTML, la tarjeta de
   producto y —lo importante— el pedido, que ahora es uno solo.

   El pedido acepta dos tipos de ítem:
     · 'producto' — algo del catálogo, con cantidad.
     · 'torta'    — una torta armada en el configurador, que no es un
                    SKU sino una ficha entera. Va siempre de a una.
   Los dos salen en el mismo mensaje de WhatsApp desde pedido.html.
   ============================================================ */
(function () {
  'use strict';

  var CLAVE = 'sentida-v3-pedido';

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- el pedido ---------- */
  var pedido = {
    leer: function () {
      try {
        var v = JSON.parse(localStorage.getItem(CLAVE));
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    },
    guardar: function (items) {
      try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) { /* modo privado */ }
      pedido.pintarContador();
    },
    cantidad: function () {
      return pedido.leer().reduce(function (t, i) { return t + (i.cant || 1); }, 0);
    },
    agregarProducto: function (prod, porciones, nota) {
      var items = pedido.leer();
      var clave = 'p' + prod.id + '|' + (porciones || '');
      var ya = items.filter(function (i) { return i.clave === clave; })[0];
      if (ya) { ya.cant = (ya.cant || 1) + 1; if (nota) ya.nota = nota; }
      else items.push({
        clave: clave, tipo: 'producto', id: prod.id, slug: prod.slug,
        nombre: prod.nombre, porciones: porciones || null, nota: nota || '', cant: 1
      });
      pedido.guardar(items);
      return items;
    },
    // La torta del configurador reemplaza a la anterior si ya había una
    // sin enviar: nadie arma dos tortas a la vez y tener dos borradores
    // compitiendo es la forma más rápida de mandar la equivocada.
    guardarTorta: function (detalle, nota) {
      var items = pedido.leer().filter(function (i) { return i.tipo !== 'torta'; });
      items.push({
        clave: 'torta', tipo: 'torta', nombre: 'Torta decorada',
        detalle: detalle, nota: nota || '', cant: 1
      });
      pedido.guardar(items);
      return items;
    },
    quitar: function (clave) {
      pedido.guardar(pedido.leer().filter(function (i) { return i.clave !== clave; }));
    },
    pintarContador: function () {
      var n = pedido.cantidad();
      document.querySelectorAll('.bag-n').forEach(function (el) {
        el.textContent = n;
        el.hidden = n === 0;
      });
      document.querySelectorAll('.cab-bolsa').forEach(function (el) {
        el.setAttribute('aria-label', n === 0
          ? 'Mi pedido, vacío'
          : 'Mi pedido, ' + n + (n === 1 ? ' ítem' : ' ítems'));
      });
    }
  };

  /* ---------- menú ---------- */
  var burger = document.querySelector('.cab-burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var cerrar = function (devolverFoco) {
      if (!nav.classList.contains('abierta')) return;
      nav.classList.remove('abierta');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      if (devolverFoco) burger.focus();
    };
    burger.addEventListener('click', function () {
      var abierta = nav.classList.toggle('abierta');
      burger.setAttribute('aria-expanded', String(abierta));
      burger.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { cerrar(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(true); });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !burger.contains(e.target)) cerrar(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) cerrar(false); });
  }

  /* ---------- enlace de la página actual ---------- */
  var aqui = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.cab-nav a').forEach(function (a) {
    if ((a.getAttribute('href') || '') === aqui) {
      a.classList.add('on');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- tarjeta de producto (home y ficha) ---------- */
  var ICONO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 49h34M18 45h28V31H18v14Zm6-14v-8h16v8M28 23v-9M36 23v-9M24 16c2-3 4-3 6 0M34 16c2-3 4-3 6 0"/></svg>';

  function tarjeta(p) {
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">'
      : '<span class="prod-sinfoto">' + ICONO + '<span class="etiqueta">Foto en camino</span></span>';
    var estado = p.estado === 'temporada' ? '<span class="prod-estado encargo">Por tanda</span>' : '';
    // El precio nunca se inventa: hasta que el backend lo cargue, se dice así.
    return '<a class="prod" href="producto.html?p=' + encodeURIComponent(p.slug) + '">' +
      '<span class="prod-foto">' + estado + foto + '</span>' +
      '<span class="prod-cuerpo">' +
        '<span class="prod-nom">' + esc(p.nombre) + '</span>' +
        (p.descripcion ? '<span class="prod-desc">' + esc(p.descripcion) + '</span>' : '') +
        '<span class="prod-pie"><span class="prod-precio pendiente">Precio a cargar</span></span>' +
      '</span></a>';
  }

  /* ---------- pintado de la home ---------- */
  function pintarHome(datos) {
    var dest = document.getElementById('destacados');
    if (dest) {
      dest.innerHTML = datos.productos
        .filter(function (p) { return p.destacado && p.foto; })
        .slice(0, 3).map(tarjeta).join('');
    }
    var gal = document.getElementById('galeria');
    if (gal) {
      gal.innerHTML = datos.galeria_decoradas.map(function (g) {
        return '<figure><img src="' + esc(g.foto) + '" alt="' + esc(g.alt) + '" loading="lazy"></figure>';
      }).join('');
      var revisar = function () {
        if (gal.scrollWidth > gal.clientWidth + 1) {
          gal.tabIndex = 0;
          gal.setAttribute('role', 'group');
          gal.setAttribute('aria-label', 'Tortas decoradas que hicimos, desplazable');
        } else {
          gal.removeAttribute('tabindex'); gal.removeAttribute('role'); gal.removeAttribute('aria-label');
        }
      };
      revisar();
      window.addEventListener('resize', revisar);
    }
  }

  function fallo(destinos) {
    destinos.forEach(function (el) {
      el.innerHTML = '<div class="aviso" style="grid-column:1/-1">' +
        '<p>No pudimos cargar el catálogo. Puede ser la conexión.</p>' +
        '<button class="btn btn-2" type="button" data-recargar>Reintentar</button></div>';
    });
    document.querySelectorAll('[data-recargar]').forEach(function (b) {
      b.addEventListener('click', function () { location.reload(); });
    });
  }

  var destinos = ['destacados', 'galeria']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (destinos.length) {
    fetch('datos.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(pintarHome)
      .catch(function () { fallo(destinos); });
  }

  pedido.pintarContador();

  window.SENTIDA = {esc: esc, pedido: pedido, tarjeta: tarjeta, ICONO: ICONO};
})();
