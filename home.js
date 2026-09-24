/* SENTIDA — home v4.
   La página funciona completa sin este archivo. Acá se suma:
   - .listo (este archivo cargó), .mov / .pin según «reducir movimiento» y
     el tamaño de pantalla;
   - la carta fija que avanza en horizontal con el scroll vertical (.pin),
     y en la fila normal, el foco del teclado siempre a la vista;
   - el manifiesto que se enciende palabra por palabra;
   - flechas para las filas con desplazamiento propio;
   - carga anticipada de las fotos de las filas;
   - el menú de celular y la barra de pedido. */
(function () {
  var doc = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : {matches: false}; };
  var mqQuieto = mm('(prefers-reduced-motion: reduce)');
  var mqPin = mm('(min-width: 900px) and (min-height: 620px)');
  var alCambiar = function (mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var suave = function () { return doc.classList.contains('mov') ? 'smooth' : 'auto'; };

  var carta = $('.carta'), vista = $('.carta-vista'), fila = $('.carta-fila'),
      barra = $('.carta-barra div'), manif = $('.manif');
  var palabras = manif ? Array.prototype.slice.call(manif.querySelectorAll('.manif-texto span')) : [];
  var opacidades = palabras.map(function () { return -1; });
  var over = 0, raf = 0, pin = false;
  var enPantalla = {carta: true, manif: true};

  /* ---------- Filas con flechas ---------- */
  var filas = [];
  document.querySelectorAll('.fila-ctrl').forEach(function (ctrl) {
    var b = ctrl.querySelector('button');
    var cont = b && document.getElementById(b.getAttribute('data-fila'));
    if (!cont) return;
    var f = {ctrl: ctrl, cont: cont, prev: ctrl.querySelector('[data-dir="-1"]'), next: ctrl.querySelector('[data-dir="1"]')};
    filas.push(f);
    ctrl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      if (!btn) return;
      cont.scrollBy({left: cont.clientWidth * 0.8 * Number(btn.getAttribute('data-dir')), behavior: suave()});
    });
    cont.addEventListener('scroll', function () { estadoFila(f); }, {passive: true});
  });

  function estadoFila(f) {
    var activa = f.cont.scrollWidth > f.cont.clientWidth + 2 && !(pin && f.cont === vista);
    f.ctrl.hidden = !activa;
    if (!activa) return;
    f.prev.disabled = f.cont.scrollLeft < 4;
    f.next.disabled = f.cont.scrollLeft + f.cont.clientWidth > f.cont.scrollWidth - 4;
  }

  /* ---------- Modo ---------- */
  function modo() {
    var mov = !mqQuieto.matches;
    doc.classList.toggle('mov', mov);
    pin = mov && mqPin.matches && !!(carta && vista && fila);
    doc.classList.toggle('pin', pin);
    // Con la carta fija, su contenedor no se desplaza: no es una parada de Tab.
    if (vista) vista.tabIndex = pin ? -1 : 0;
    if (!mov) palabras.forEach(function (p, i) { p.style.opacity = ''; opacidades[i] = -1; });
    medir();
  }

  function medir() {
    if (carta && fila) {
      if (pin) {
        vista.scrollLeft = 0;
        over = Math.max(0, fila.scrollWidth - vista.clientWidth);
        carta.style.height = (over + window.innerHeight) + 'px';
      } else {
        over = 0;
        carta.style.height = '';
        fila.style.transform = '';
      }
    }
    filas.forEach(estadoFila);
    pedirCuadro();
  }

  /* ---------- Un cuadro: primero lecturas, después escrituras ---------- */
  function cuadro() {
    raf = 0;
    var vh = window.innerHeight;
    if (!vh) return;
    var mov = doc.classList.contains('mov');
    var rc = pin && enPantalla.carta ? carta.getBoundingClientRect() : null;
    var rm = mov && manif && enPantalla.manif ? manif.getBoundingClientRect() : null;

    if (rc) {
      var p = clamp(-rc.top / Math.max(1, over), 0, 1);
      fila.style.transform = 'translate3d(' + (-p * over).toFixed(1) + 'px,0,0)';
      if (barra) barra.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    if (rm) {
      // Cada palabra se enciende en su turno; se escribe solo la que cambió.
      var m = clamp((vh * 0.85 - rm.top) / (vh * 0.6), 0, 1) * (palabras.length + 4);
      for (var i = 0; i < palabras.length; i++) {
        var o = Math.round(clamp(m - i, 0.18, 1) * 20) / 20;
        if (o !== opacidades[i]) { opacidades[i] = o; palabras[i].style.opacity = o; }
      }
    }
  }
  function pedirCuadro() { if (!raf) raf = requestAnimationFrame(cuadro); }

  /* ---------- Foco del teclado en la carta ---------- */
  if (fila) {
    fila.addEventListener('focusin', function (ev) {
      var item = ev.target.closest('.carta-fila > li');
      if (!item) return;
      var pad = parseFloat(getComputedStyle(fila).paddingLeft) || 0;
      if (pin) {
        // Carta fija: se mueve la página hasta que la tarjeta quede a la vista.
        var objetivo = clamp((item.offsetLeft - pad) / Math.max(1, over), 0, 1);
        var arriba = carta.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({top: arriba + objetivo * over, behavior: 'instant'});
        vista.scrollLeft = 0;
      } else {
        // Fila normal: se desplaza la fila si la tarjeta no entra entera.
        var izq = item.offsetLeft - pad, der = item.offsetLeft + item.offsetWidth + pad;
        if (izq < vista.scrollLeft || der > vista.scrollLeft + vista.clientWidth) {
          vista.scrollTo({left: izq, behavior: suave()});
        }
      }
    });
  }

  /* ---------- Observadores ---------- */
  if ('IntersectionObserver' in window) {
    var visto = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === carta) {
          enPantalla.carta = e.isIntersecting;
          carta.classList.toggle('activa', e.isIntersecting);
        }
        if (e.target === manif) enPantalla.manif = e.isIntersecting;
      });
      pedirCuadro();
    });
    if (carta) visto.observe(carta);
    if (manif) visto.observe(manif);

    // Las fotos de las filas se piden un poco antes de llegar: el lazy
    // nativo no anticipa lo que está corrido en horizontal.
    var cerca = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
        cerca.unobserve(e.target);
      });
    }, {rootMargin: '50% 0px'});
    [fila, $('.mesas-fila')].forEach(function (el) { if (el) cerca.observe(el); });

    // Barra de pedido del celular: se esconde mientras se ve el hero (que ya
    // tiene el botón), la sección de pedido o el pie; también para el teclado.
    var barraPedido = $('.barra-pedido');
    if (barraPedido) {
      var tapan = new Set();
      var fin = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) tapan.add(e.target); else tapan.delete(e.target); });
        var oculta = tapan.size > 0;
        barraPedido.classList.toggle('oculta', oculta);
        if (oculta) barraPedido.setAttribute('inert', ''); else barraPedido.removeAttribute('inert');
      });
      ['.hero', '#pedido', '.pie'].forEach(function (s) { var el = $(s); if (el) fin.observe(el); });

      // Sobre la sección marrón, la barra pasa a crema. Se mira una franja
      // fina a la altura de la barra.
      var oscuro = new IntersectionObserver(function (es) {
        es.forEach(function (e) { barraPedido.classList.toggle('sobre-oscuro', e.isIntersecting); });
      }, {rootMargin: '-94% 0px -5% 0px'});
      var deco = $('.deco');
      if (deco) oscuro.observe(deco);
    }
  }

  /* ---------- Menú de celular ---------- */
  var menu = $('.menu');
  if (menu) {
    var cerrar = function () { menu.open = false; };
    menu.addEventListener('click', function (ev) { if (ev.target.closest('nav a')) cerrar(); });
    menu.addEventListener('focusout', function (ev) {
      if (menu.open && ev.relatedTarget && !menu.contains(ev.relatedTarget)) cerrar();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.open) { cerrar(); menu.querySelector('summary').focus(); }
    });
    document.addEventListener('click', function (ev) { if (menu.open && !menu.contains(ev.target)) cerrar(); });
  }

  /* ---------- La entrada del hero pasa una sola vez ---------- */
  var heroImg = $('.hero-foto img');
  if (heroImg) heroImg.addEventListener('animationend', function () { doc.classList.add('visto'); });

  /* ---------- Arranque ---------- */
  window.addEventListener('scroll', pedirCuadro, {passive: true});
  window.addEventListener('resize', medir);
  alCambiar(mqQuieto, modo);
  alCambiar(mqPin, modo);
  if (window.ResizeObserver && fila) new ResizeObserver(medir).observe(fila);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  doc.classList.add('listo');
  modo();
})();
