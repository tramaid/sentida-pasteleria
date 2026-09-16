/* ============================================================
   SENTIDA v2 — común a todas las pantallas.
   Maqueta: los datos salen de datos.json. En la versión sobre el
   motor de CARVAN esto lo resuelve el servidor y el markup queda igual.
   ============================================================ */
(function () {
  'use strict';

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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrar(true);
    });
    // Tocar fuera cierra: el menú tapa media pantalla y no tenía salida
    // salvo el propio botón o Escape.
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !burger.contains(e.target)) cerrar(false);
    });
    // Al pasar el punto de quiebre el menú se vuelve barra horizontal y
    // la clase 'abierta' quedaba pegada.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) cerrar(false);
    });
  }

  /* ---------- enlace de la página actual ---------- */
  var aqui = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.cab-nav a').forEach(function (a) {
    var destino = a.getAttribute('href') || '';
    if (destino === aqui || (destino.indexOf('#') === -1 && destino === aqui)) {
      a.classList.add('on');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- tarjeta de producto ---------- */
  var ICONO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 49h34M18 45h28V31H18v14Zm6-14v-8h16v8M28 23v-9M36 23v-9M24 16c2-3 4-3 6 0M34 16c2-3 4-3 6 0"/></svg>';

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  window.SENTIDA_esc = esc;

  function tarjeta(p) {
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">'
      : '<span class="prod-sinfoto">' + ICONO + '<span class="etiqueta">Foto en camino</span></span>';
    var estado = p.tanda ? '<span class="prod-estado encargo">Por tanda</span>' : '';
    // Ni el precio ni los tamaños se inventan: son campos de backend.
    // La tarjeta decía "3 tamaños" en las catorce tortas y esa medida
    // venía del configurador de decoradas, no de las clásicas.
    var precio = '<span class="prod-precio pendiente">Precio a cargar</span>';
    return '<a class="prod" href="producto.html?p=' + encodeURIComponent(p.slug) + '">' +
      '<span class="prod-foto">' + estado + foto + '</span>' +
      '<span class="prod-cuerpo">' +
        '<span class="prod-nom">' + esc(p.nombre) + '</span>' +
        (p.desc ? '<span class="prod-desc">' + esc(p.desc) + '</span>' : '') +
        '<span class="prod-pie">' + precio + '</span>' +
      '</span></a>';
  }
  window.SENTIDA_tarjeta = tarjeta;

  /* ---------- pintado por pantalla ---------- */
  function pintar(datos) {
    var dest = document.getElementById('destacados');
    if (dest) {
      dest.innerHTML = datos.tortas.filter(function (t) { return t.destacado; })
        .slice(0, 3).map(tarjeta).join('');
    }

    var gTortas = document.getElementById('grilla-tortas');
    if (gTortas) {
      gTortas.innerHTML = datos.tortas.map(tarjeta).join('');
      var n = document.getElementById('n-tortas');
      if (n) {
        var conFoto = datos.tortas.filter(function (t) { return t.foto; }).length;
        n.textContent = datos.tortas.length + ' tortas · ' + (datos.tortas.length - conFoto) + ' esperando foto';
      }
    }

    var gPast = document.getElementById('grilla-pasteleria');
    if (gPast) {
      var cat = new URLSearchParams(location.search).get('cat') || '';
      var lista = cat ? datos.pasteleria.filter(function (p) { return p.cat === cat; }) : datos.pasteleria;
      gPast.innerHTML = lista.map(tarjeta).join('');
      var np = document.getElementById('n-pasteleria');
      if (np) np.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
      document.querySelectorAll('[data-cat]').forEach(function (a) {
        var activo = (a.dataset.cat || '') === cat;
        a.classList.toggle('on', activo);
        if (activo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }

    var gal = document.getElementById('galeria');
    if (gal) {
      gal.innerHTML = datos.galeria_decoradas.map(function (g) {
        return '<figure><img src="' + esc(g.foto) + '" alt="' + esc(g.alt) + '" loading="lazy"></figure>';
      }).join('');
      // En mobile la galería es un carrusel horizontal. Una región que
      // desplaza tiene que poder recorrerse con el teclado.
      var revisar = function () {
        var desplaza = gal.scrollWidth > gal.clientWidth + 1;
        if (desplaza) {
          gal.tabIndex = 0;
          gal.setAttribute('role', 'group');
          gal.setAttribute('aria-label', 'Tortas decoradas que hicimos, desplazable');
        } else {
          gal.removeAttribute('tabindex');
          gal.removeAttribute('role');
          gal.removeAttribute('aria-label');
        }
      };
      revisar();
      window.addEventListener('resize', revisar);
    }
  }

  /* Si datos.json no carga, las grillas se quedaban vacías en silencio
     y no había forma de distinguir "no hay productos" de "falló". */
  function fallo(destinos) {
    destinos.forEach(function (el) {
      el.innerHTML = '<div class="aviso" style="grid-column:1/-1">' +
        '<p>No pudimos cargar el catálogo. Puede ser la conexión.</p>' +
        '<button class="btn btn-2" type="button" onclick="location.reload()">Reintentar</button>' +
        '</div>';
    });
  }

  var destinos = ['destacados', 'grilla-tortas', 'grilla-pasteleria', 'galeria']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (destinos.length) {
    fetch('datos.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(pintar)
      .catch(function () { fallo(destinos); });
  }
})();
