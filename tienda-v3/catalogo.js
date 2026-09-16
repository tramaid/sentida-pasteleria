/* ============================================================
   Catálogo — el motor de CARVAN sobre los datos de SENTIDA.
   La mecánica es la del original: filtros en la barra lateral,
   búsqueda, orden, modo grilla/lista, paginación + cargar más y
   vista rápida en overlay. El origen de datos es datos.json en vez
   de SQLite, y "agregar al carrito" es "agregar a la solicitud".

   Lo que cambió respecto de la v1: el pedido no vive acá, vive en
   SENTIDA.pedido (v3.js), que es el mismo que usa el configurador.
   ============================================================ */
(function () {
  'use strict';

  var POR_PAGINA = 8;
  var S = window.SENTIDA, esc = S.esc;

  var ESTADOS = {
    clasico:   {texto: 'Clásico',     clase: 'clasico'},
    encargo:   {texto: 'Por encargo', clase: 'encargo'},
    temporada: {texto: 'Por tanda',   clase: 'temporada'},
    agotado:   {texto: 'Agotado',     clase: 'encargo'}
  };

  var datos = {categorias: [], productos: []};
  var estado = {q: '', cat: '', sub: '', temporada: false, orden: 'sugerido', modo: 'grilla', pagina: 1, hasta: POR_PAGINA};

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('prod-grid');
  if (!grid) return;

  /* ---------- filtros y orden ---------- */
  function normalizar(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function filtrados() {
    var q = normalizar(estado.q);
    var lista = datos.productos.filter(function (p) {
      if (estado.cat && p.categoria !== estado.cat) return false;
      if (estado.sub && p.subcategoria !== estado.sub) return false;
      if (estado.temporada && p.estado !== 'temporada') return false;
      if (q && normalizar(p.nombre + ' ' + p.descripcion).indexOf(q) === -1) return false;
      return true;
    });
    if (estado.orden === 'alfabetico') lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
    else if (estado.orden === 'novedades') lista.sort(function (a, b) { return (b.destacado - a.destacado) || (a.orden - b.orden); });
    else lista.sort(function (a, b) { return a.orden - b.orden; });
    return lista;
  }

  /* ---------- barra lateral ---------- */
  function pintarSidebar() {
    var cont = $('cat-side-list');
    var html = '<a href="#" class="cat-side-todas' + (estado.cat ? '' : ' activa') + '" data-cat="">Todas</a>';
    datos.categorias.forEach(function (c) {
      var activa = estado.cat === c.slug;
      html += '<a href="#" class="cat-side-cat' + (activa ? ' activa' : '') + '" data-cat="' + esc(c.slug) + '"' +
        (activa ? ' aria-current="true"' : '') + '>' + esc(c.nombre) + '</a>';
      if (activa && c.subcategorias.length) {
        html += '<div class="cat-side-subs">';
        c.subcategorias.forEach(function (s) {
          html += '<a href="#" class="cat-side-sub' + (estado.sub === s.slug ? ' activa' : '') +
            '" data-sub="' + esc(s.slug) + '">' + esc(s.nombre) + '</a>';
        });
        html += '</div>';
      }
    });
    cont.innerHTML = html;
    cont.querySelectorAll('[data-cat]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        estado.cat = a.dataset.cat; estado.sub = ''; reiniciarPagina(); pintarSidebar(); pintar();
      });
    });
    cont.querySelectorAll('[data-sub]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        estado.sub = estado.sub === a.dataset.sub ? '' : a.dataset.sub; reiniciarPagina(); pintarSidebar(); pintar();
      });
    });
  }

  /* ---------- tarjetas ---------- */
  function lineaPorciones(p) {
    // Sin porciones cargadas no se afirma nada. Son campo de backend.
    if (!p.porciones || !p.porciones.length) return '';
    if (p.porciones.length === 1) return p.porciones[0] + ' porciones';
    return 'desde ' + p.porciones[0] + ' porciones · ' + p.porciones.length + ' tamaños';
  }

  function tarjeta(p) {
    var est = ESTADOS[p.estado] || ESTADOS.encargo;
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">'
      : '<span class="v2-sin-foto">' + S.ICONO + '<span>Foto en camino</span></span>';
    var el = document.createElement('article');
    el.className = 'v2-card entrando';
    el.innerHTML =
      '<button type="button" class="v2-card-foto" data-ver="' + p.id + '" aria-label="Ver ' + esc(p.nombre) + '">' +
        '<span class="v2-chip ' + est.clase + '">' + est.texto + '</span>' + foto +
      '</button>' +
      '<div class="v2-card-body">' +
        '<button type="button" class="v2-card-nombre" data-ver="' + p.id + '">' + esc(p.nombre) + '</button>' +
        (p.descripcion ? '<span class="v2-card-desc">' + esc(p.descripcion) + '</span>' : '') +
        (lineaPorciones(p) ? '<span class="v2-card-peso">' + lineaPorciones(p) + '</span>' : '') +
        '<div class="v2-card-foot">' +
          '<span class="v2-card-precio">A consultar</span>' +
          (p.estado === 'agotado'
            ? '<span class="cat-sin-stock">Agotado</span>'
            : '<button type="button" class="v2-add" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.nombre) + ' a mi pedido">+</button>') +
        '</div>' +
      '</div>';
    return el;
  }

  /* ---------- render ---------- */
  function reiniciarPagina() { estado.pagina = 1; estado.hasta = POR_PAGINA; }

  function pintar(append) {
    var lista = filtrados();
    var total = lista.length;
    var desde = append ? (estado.hasta - POR_PAGINA) : ((estado.pagina - 1) * POR_PAGINA);
    if (!append) estado.hasta = estado.pagina * POR_PAGINA;
    var trozo = lista.slice(append ? desde : ((estado.pagina - 1) * POR_PAGINA), estado.hasta);

    if (!append) grid.innerHTML = '';
    trozo.forEach(function (p) { grid.appendChild(tarjeta(p)); });

    grid.classList.toggle('lista', estado.modo === 'lista');
    grid.hidden = total === 0;
    $('cat-vacio').hidden = total !== 0;

    $('cat-total').textContent = total + (total === 1 ? ' producto' : ' productos');
    var term = $('cat-termino');
    term.hidden = !estado.q;
    term.textContent = estado.q ? 'buscando «' + estado.q + '»' : '';

    var restan = total - estado.hasta;
    $('zona-cargar').hidden = restan <= 0;
    $('cat-restan').textContent = restan > 0 ? 'Quedan ' + restan : '';

    pintarPaginacion(total);
    enlazarTarjetas();
  }

  function pintarPaginacion(total) {
    var nav = $('cat-paginacion');
    var paginas = Math.ceil(total / POR_PAGINA);
    nav.hidden = paginas <= 1;
    if (paginas <= 1) { nav.innerHTML = ''; return; }
    var html = '';
    for (var n = 1; n <= paginas; n++) {
      html += n === estado.pagina
        ? '<span class="pag-btn activa" aria-current="page">' + n + '</span>'
        : '<button type="button" class="pag-btn" data-pag="' + n + '">' + n + '</button>';
    }
    nav.innerHTML = html;
    nav.querySelectorAll('[data-pag]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.pagina = Number(b.dataset.pag);
        estado.hasta = estado.pagina * POR_PAGINA;
        pintar();
        document.querySelector('.cat-main-head').scrollIntoView({behavior: 'smooth', block: 'start'});
      });
    });
  }

  function enlazarTarjetas() {
    grid.querySelectorAll('[data-ver]').forEach(function (b) {
      if (b.dataset.listo) return;
      b.dataset.listo = '1';
      b.addEventListener('click', function () { abrirVista(Number(b.dataset.ver), b); });
    });
    grid.querySelectorAll('[data-add]').forEach(function (b) {
      if (b.dataset.listo) return;
      b.dataset.listo = '1';
      b.addEventListener('click', function () {
        var p = datos.productos.filter(function (x) { return x.id === Number(b.dataset.add); })[0];
        S.pedido.agregarProducto(p, p.porciones && p.porciones.length ? p.porciones[0] : null, '');
        b.classList.add('puesto');
        b.textContent = '✓';
        avisar(p.nombre + ' se sumó a tu pedido.');
        setTimeout(function () { b.classList.remove('puesto'); b.textContent = '+'; }, 1200);
      });
    });
  }

  // Un cambio en el contador de la bolsa es fácil de no ver. El aviso
  // vive en una región educada para que el lector de pantalla lo diga.
  function avisar(texto) {
    var el = $('cat-aviso');
    if (el) el.textContent = texto;
  }

  /* ---------- vista rápida ---------- */
  var vr = $('vr'), vrPanel = $('vr-panel'), vrCuerpo = $('vr-cuerpo'), quienAbrio = null;

  function abrirVista(id, origen) {
    var p = datos.productos.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    quienAbrio = origen || null;
    var est = ESTADOS[p.estado] || ESTADOS.encargo;
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '">'
      : '<span class="v2-sin-foto">' + S.ICONO + '<span>Foto en camino</span></span>';
    var porciones = (p.porciones || []).map(function (n, i) {
      return '<button type="button" class="vr-porcion' + (i === 0 ? ' on' : '') + '" data-porcion="' + n + '">' + n + ' porciones</button>';
    }).join('');
    vrCuerpo.innerHTML =
      '<div class="vr-foto">' + foto + '</div>' +
      '<div class="vr-info">' +
        '<p class="etiqueta">' + est.texto + '</p>' +
        '<h2 id="vr-titulo">' + esc(p.nombre) + '</h2>' +
        (p.descripcion ? '<p class="vr-desc">' + esc(p.descripcion) + '</p>' : '<p class="vr-desc">El detalle de esta torta lo cargamos junto con el precio.</p>') +
        (porciones ? '<div class="vr-porciones" role="group" aria-label="Elegí el tamaño">' + porciones + '</div>' : '') +
        '<label class="sr-only" for="vr-nota">Comentarios para este producto</label>' +
        '<textarea class="vr-nota" id="vr-nota" placeholder="Tema, colores, alguna alergia…"></textarea>' +
        '<button type="button" class="btn btn-1" id="vr-agregar">Agregar a mi pedido</button>' +
        '<a class="vr-ficha" href="producto.html?p=' + encodeURIComponent(p.slug) + '">Ver la ficha completa</a>' +
      '</div>';

    vrCuerpo.querySelectorAll('[data-porcion]').forEach(function (b) {
      b.addEventListener('click', function () {
        vrCuerpo.querySelectorAll('[data-porcion]').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    $('vr-agregar').addEventListener('click', function () {
      var sel = vrCuerpo.querySelector('[data-porcion].on');
      S.pedido.agregarProducto(p, sel ? Number(sel.dataset.porcion) : null, $('vr-nota').value.trim());
      avisar(p.nombre + ' se sumó a tu pedido.');
      cerrarVista();
    });

    vr.hidden = false;
    document.body.style.overflow = 'hidden';
    vrPanel.focus();
  }

  function cerrarVista() {
    vr.hidden = true;
    document.body.style.overflow = '';
    vrCuerpo.innerHTML = '';
    if (quienAbrio) { quienAbrio.focus(); quienAbrio = null; }
  }

  $('vr-cerrar').addEventListener('click', cerrarVista);
  vr.addEventListener('click', function (e) { if (e.target === vr) cerrarVista(); });
  document.addEventListener('keydown', function (e) {
    if (vr.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); cerrarVista(); return; }
    if (e.key !== 'Tab') return;
    var foco = vrPanel.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!foco.length) return;
    var primero = foco[0], ultimo = foco[foco.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  }, true);

  /* ---------- controles ---------- */
  var tq = null;
  $('cat-q').addEventListener('input', function (e) {
    $('cat-q-limpiar').hidden = !e.target.value;
    $('js-buscar').classList.add('buscando');
    clearTimeout(tq);
    tq = setTimeout(function () {
      estado.q = e.target.value.trim();
      $('js-buscar').classList.remove('buscando');
      reiniciarPagina(); pintar();
    }, 220);
  });
  $('cat-q-limpiar').addEventListener('click', function () {
    $('cat-q').value = ''; estado.q = ''; this.hidden = true; reiniciarPagina(); pintar(); $('cat-q').focus();
  });

  $('filtro-temporada').addEventListener('click', function () {
    estado.temporada = !estado.temporada;
    this.classList.toggle('on', estado.temporada);
    this.setAttribute('aria-pressed', String(estado.temporada));
    reiniciarPagina(); pintar();
  });

  $('cat-orden-sel').addEventListener('change', function (e) { estado.orden = e.target.value; reiniciarPagina(); pintar(); });

  function setModo(m) {
    estado.modo = m;
    $('modo-grilla').classList.toggle('on', m === 'grilla');
    $('modo-lista').classList.toggle('on', m === 'lista');
    $('modo-grilla').setAttribute('aria-pressed', String(m === 'grilla'));
    $('modo-lista').setAttribute('aria-pressed', String(m === 'lista'));
    try { localStorage.setItem('sentida-v3-modo', m); } catch (e) {}
    pintar();
  }
  $('modo-grilla').addEventListener('click', function () { setModo('grilla'); });
  $('modo-lista').addEventListener('click', function () { setModo('lista'); });

  $('cat-mas').addEventListener('click', function () {
    var b = this;
    b.disabled = true;
    estado.hasta += POR_PAGINA;
    // El paginador numérico marcaba la página 1 después de apilar dos
    // tandas y al usarlo saltaba hacia atrás.
    estado.pagina = Math.ceil(estado.hasta / POR_PAGINA);
    setTimeout(function () { pintar(true); b.disabled = false; }, 180);
  });

  $('cat-filtros-btn').addEventListener('click', function () {
    var abierto = $('cat-side').classList.toggle('abierto');
    this.setAttribute('aria-expanded', String(abierto));
    this.textContent = abierto ? 'Ocultar filtros' : 'Filtros';
  });

  /* ---------- arranque ---------- */
  try {
    var m = localStorage.getItem('sentida-v3-modo');
    if (m === 'lista') estado.modo = 'lista';
  } catch (e) {}

  // La categoría puede venir por URL: así enlaza la home.
  var qs = new URLSearchParams(location.search);
  if (qs.get('cat')) estado.cat = qs.get('cat');
  if (qs.get('sub')) estado.sub = qs.get('sub');

  fetch('datos.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) {
      datos = j;
      if (estado.modo === 'lista') setModo('lista');
      pintarSidebar();
      pintar();
    })
    .catch(function () {
      $('cat-vacio').hidden = false;
      $('cat-vacio').textContent = 'No pudimos cargar el catálogo. Puede ser la conexión: recargá la página, por favor.';
      $('cat-total').textContent = '';
    });
})();
