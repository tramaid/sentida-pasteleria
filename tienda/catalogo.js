/* ============================================================
   Catálogo SENTIDA — port del catálogo de CARVAN a estático.
   La mecánica es la misma: filtros en el sidebar, orden, modo
   grilla/lista, paginación + cargar más, y vista rápida en overlay.
   Acá el origen de datos es productos.json en vez de SQLite, y
   "agregar al carrito" es "agregar a la solicitud".
   ============================================================ */
(function () {
  'use strict';

  var POR_PAGINA = 8;
  var CLAVE = 'sentida-pedido';

  var ESTADOS = {
    clasico:   {texto: 'Clásico',    clase: 'clasico'},
    encargo:   {texto: 'Por encargo', clase: 'encargo'},
    temporada: {texto: 'Temporada',  clase: 'temporada'},
    agotado:   {texto: 'Agotado',    clase: 'encargo'}
  };

  var datos = {categorias: [], productos: []};
  var estado = {q: '', cat: '', sub: '', temporada: false, orden: 'sugerido', modo: 'grilla', pagina: 1, hasta: POR_PAGINA};

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('prod-grid');

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

  /* ---------- la solicitud ---------- */
  function leerPedido() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
  }
  function guardarPedido(items) {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) { /* modo privado */ }
    pintarContadorPedido();
  }
  function pintarContadorPedido() {
    var n = leerPedido().reduce(function (t, i) { return t + (i.cant || 1); }, 0);
    var el = $('bag-n');
    if (!el) return;
    el.textContent = n;
    el.hidden = n === 0;
  }
  function agregar(prod, porciones, nota) {
    var items = leerPedido();
    var clave = prod.id + '|' + (porciones || '');
    var ya = items.filter(function (i) { return i.clave === clave; })[0];
    if (ya) { ya.cant = (ya.cant || 1) + 1; if (nota) ya.nota = nota; }
    else items.push({clave: clave, id: prod.id, nombre: prod.nombre, porciones: porciones || null, nota: nota || '', cant: 1});
    guardarPedido(items);
  }

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
    else if (estado.orden === 'novedades') lista.sort(function (a, b) { return (b.novedad - a.novedad) || (a.orden - b.orden); });
    else lista.sort(function (a, b) { return a.orden - b.orden; });
    return lista;
  }

  /* ---------- sidebar ---------- */
  function pintarSidebar() {
    var cont = $('cat-side-list');
    var html = '<a href="#" class="cat-side-todas' + (estado.cat ? '' : ' activa') + '" data-cat="">Todas</a>';
    datos.categorias.forEach(function (c) {
      var activa = estado.cat === c.slug;
      html += '<a href="#" class="cat-side-cat' + (activa ? ' activa' : '') + '" data-cat="' + c.slug + '">' + c.nombre + '</a>';
      if (activa && c.subcategorias.length) {
        html += '<div class="cat-side-subs">';
        c.subcategorias.forEach(function (s) {
          html += '<a href="#" class="cat-side-sub' + (estado.sub === s.slug ? ' activa' : '') + '" data-sub="' + s.slug + '">' + s.nombre + '</a>';
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
  var ICONO_TORTA = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 49h34M18 45h28V31H18v14Zm6-14v-8h16v8M28 23v-9M36 23v-9M24 16c2-3 4-3 6 0M34 16c2-3 4-3 6 0"/></svg>';

  // Sin porciones cargadas no se afirma nada. Antes devolvía 'Unidad',
  // que para una torta es tan inventado como los 8/12/16 que había.
  function lineaPorciones(p) {
    if (!p.porciones || !p.porciones.length) return '';
    if (p.porciones.length === 1) return p.porciones[0] + ' porciones';
    return 'desde ' + p.porciones[0] + ' porciones · ' + p.porciones.length + ' tamaños';
  }

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function tarjeta(p) {
    var est = ESTADOS[p.estado] || ESTADOS.encargo;
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">'
      : '<span class="v2-sin-foto">' + ICONO_TORTA + '<span>Provisoria</span></span>';
    var el = document.createElement('div');
    el.className = 'v2-card entrando';
    el.innerHTML =
      '<button type="button" class="v2-card-foto" data-ver="' + p.id + '" aria-label="Ver ' + esc(p.nombre) + '">' +
        '<span class="v2-chip ' + est.clase + '">' + est.texto + '</span>' + foto +
      '</button>' +
      '<div class="v2-card-body">' +
        '<button type="button" class="v2-card-nombre" data-ver="' + p.id + '">' + esc(p.nombre) + '</button>' +
        (lineaPorciones(p) ? '<div class="v2-card-peso">' + lineaPorciones(p) + '</div>' : '') +
        '<div class="v2-card-foot">' +
          '<span class="v2-card-precio">A consultar</span>' +
          (p.estado === 'agotado'
            ? '<span class="cat-sin-stock">Agotado</span>'
            : '<button type="button" class="v2-add" data-add="' + p.id + '" aria-label="Agregar ' + p.nombre + ' a mi pedido">+</button>') +
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

    $('cat-total').textContent = total + (total === 1 ? ' creación' : ' creaciones');
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
        agregar(p, p.porciones && p.porciones.length ? p.porciones[0] : null, '');
        b.classList.add('puesto');
        b.textContent = '✓';
        setTimeout(function () { b.classList.remove('puesto'); b.textContent = '+'; }, 1200);
      });
    });
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
      : '<span class="v2-sin-foto">' + ICONO_TORTA + '<span>Provisoria</span></span>';
    var porciones = (p.porciones || []).map(function (n, i) {
      return '<button type="button" class="vr-porcion' + (i === 0 ? ' on' : '') + '" data-porcion="' + n + '">' + n + ' porciones</button>';
    }).join('');
    vrCuerpo.innerHTML =
      '<div class="vr-foto">' + foto + '</div>' +
      '<div class="vr-info">' +
        '<p class="etiqueta">' + est.texto + '</p>' +
        '<h2 id="vr-titulo">' + esc(p.nombre) + '</h2>' +
        '<p class="vr-desc">' + esc(p.descripcion) + '</p>' +
        (porciones ? '<div class="vr-porciones" role="group" aria-label="Elegí el tamaño">' + porciones + '</div>' : '') +
        '<label class="sr-only" for="vr-nota">Comentarios para esta creación</label>' +
        '<textarea class="vr-nota" id="vr-nota" placeholder="Tema, colores, alguna alergia…"></textarea>' +
        '<button type="button" class="button primary" id="vr-agregar">Agregar a mi pedido</button>' +
      '</div>';

    vrCuerpo.querySelectorAll('[data-porcion]').forEach(function (b) {
      b.addEventListener('click', function () {
        vrCuerpo.querySelectorAll('[data-porcion]').forEach(function (o) { o.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    $('vr-agregar').addEventListener('click', function () {
      var sel = vrCuerpo.querySelector('[data-porcion].on');
      agregar(p, sel ? Number(sel.dataset.porcion) : null, $('vr-nota').value.trim());
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
    if (e.key === 'Escape') { cerrarVista(); return; }
    if (e.key !== 'Tab') return;
    var foco = vrPanel.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!foco.length) return;
    var primero = foco[0], ultimo = foco[foco.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

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
    try { localStorage.setItem('sentida-modo', m); } catch (e) {}
    pintar();
  }
  $('modo-grilla').addEventListener('click', function () { setModo('grilla'); });
  $('modo-lista').addEventListener('click', function () { setModo('lista'); });

  $('cat-mas').addEventListener('click', function () {
    var b = this;
    b.disabled = true;
    estado.hasta += POR_PAGINA;
    estado.pagina = Math.ceil(estado.hasta / POR_PAGINA);
    setTimeout(function () { pintar(true); b.disabled = false; }, 180);
  });

  $('cat-filtros-btn').addEventListener('click', function () {
    var abierto = $('cat-side').classList.toggle('abierto');
    this.setAttribute('aria-expanded', String(abierto));
  });

  /* ---------- arranque ---------- */
  try {
    var m = localStorage.getItem('sentida-modo');
    if (m === 'lista') estado.modo = 'lista';
  } catch (e) {}

  fetch('productos.json')
    .then(function (r) { return r.json(); })
    .then(function (j) {
      datos = j;
      if (estado.modo === 'lista') setModo('lista');
      pintarSidebar();
      pintar();
      pintarContadorPedido();
    })
    .catch(function () {
      $('cat-vacio').hidden = false;
      $('cat-vacio').textContent = 'No pudimos cargar el catálogo. Recargá la página, por favor.';
      $('cat-total').textContent = '';
    });
})();
