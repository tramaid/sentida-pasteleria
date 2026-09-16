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
    burger.addEventListener('click', function () {
      var abierta = nav.classList.toggle('abierta');
      burger.setAttribute('aria-expanded', String(abierta));
      burger.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('abierta');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierta')) {
        nav.classList.remove('abierta');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- tarjeta de producto ---------- */
  var ICONO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 49h34M18 45h28V31H18v14Zm6-14v-8h16v8M28 23v-9M36 23v-9M24 16c2-3 4-3 6 0M34 16c2-3 4-3 6 0"/></svg>';

  function tarjeta(p, tipo) {
    var foto = p.foto
      ? '<img src="' + p.foto + '" alt="' + p.nombre + '" loading="lazy">'
      : '<span class="prod-sinfoto">' + ICONO + '<span class="etiqueta">Foto en camino</span></span>';
    var estado = '';
    if (p.tanda) estado = '<span class="prod-estado encargo">Por tanda</span>';
    // El precio nunca se inventa: hasta que el backend lo cargue, se dice así.
    var precio = '<span class="prod-precio pendiente">Precio a cargar</span>';
    var meta = tipo === 'torta'
      ? '<span class="prod-porciones">3 tamaños</span>'
      : '';
    return '<a class="prod" href="producto.html?p=' + p.slug + '">' +
      '<span class="prod-foto">' + estado + foto + '</span>' +
      '<span class="prod-cuerpo">' +
        '<span class="prod-nom">' + p.nombre + '</span>' +
        (p.desc ? '<span class="prod-desc">' + p.desc + '</span>' : '') +
        '<span class="prod-pie">' + precio + meta + '</span>' +
      '</span></a>';
  }

  /* ---------- pintado por pantalla ---------- */
  function pintar(datos) {
    var dest = document.getElementById('destacados');
    if (dest) {
      dest.innerHTML = datos.tortas.filter(function (t) { return t.destacado; })
        .slice(0, 3).map(function (t) { return tarjeta(t, 'torta'); }).join('');
    }

    var gTortas = document.getElementById('grilla-tortas');
    if (gTortas) {
      gTortas.innerHTML = datos.tortas.map(function (t) { return tarjeta(t, 'torta'); }).join('');
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
      gPast.innerHTML = lista.map(function (p) { return tarjeta(p, 'past'); }).join('');
      var np = document.getElementById('n-pasteleria');
      if (np) np.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
      document.querySelectorAll('[data-cat]').forEach(function (a) {
        a.classList.toggle('on', (a.dataset.cat || '') === cat);
      });
    }

    var gal = document.getElementById('galeria');
    if (gal) {
      gal.innerHTML = datos.galeria_decoradas.map(function (g) {
        return '<figure><img src="' + g.foto + '" alt="' + g.alt + '" loading="lazy"></figure>';
      }).join('');
    }
  }

  if (document.getElementById('destacados') || document.getElementById('grilla-tortas') ||
      document.getElementById('grilla-pasteleria') || document.getElementById('galeria')) {
    fetch('datos.json').then(function (r) { return r.json(); }).then(pintar).catch(function () {});
  }
})();
