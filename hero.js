/* SENTIDA — las fotos del hero.
   El texto queda quieto y las fotos se turnan cada 6,5 s con un fundido.
   Se frenan con el mouse encima, con el foco del teclado dentro del hero,
   fuera de pantalla, con la pestaña oculta y con «reducir movimiento»
   (ahí se cambian solo a mano). Las barritas saltan a una foto y dejan el
   hero en pausa; el botón de pausa lo frena y lo vuelve a andar.
   Sin este archivo se ve la primera foto con su etiqueta. */
(function () {
  'use strict';
  var INTERVALO = 6500;
  var doc = document.documentElement;
  var hero = document.querySelector('.hero');
  var marco = hero && hero.querySelector('.hero-foto');
  var avance = marco && marco.querySelector('.hero-avance');
  if (!avance) return;
  var fotos = Array.prototype.slice.call(marco.querySelectorAll('img'));
  var etiqueta = marco.querySelector('.hero-etiqueta');
  var etiNombre = etiqueta.querySelector('.hero-etiqueta-n');
  var etiIr = etiqueta.querySelector('.hero-etiqueta-ir');
  var botones = Array.prototype.slice.call(avance.querySelectorAll('[data-foto]'));
  var pausa = avance.querySelector('.hero-pausa');
  var actual = 0, reloj = 0, aMano = false, frenos = {};

  function mov() { return doc.classList.contains('mov'); }

  // Las demás fotos se piden recién cuando terminó de cargar la página.
  function cargar(img) {
    if (!img.hasAttribute('data-srcset')) return;
    img.srcset = img.getAttribute('data-srcset');
    img.removeAttribute('data-srcset');
  }
  if (document.readyState === 'complete') fotos.forEach(cargar);
  else window.addEventListener('load', function () { fotos.forEach(cargar); });

  function quieta() {
    if (aMano || !mov()) return true;
    for (var k in frenos) if (frenos[k]) return true;
    return false;
  }

  function programar() {
    clearTimeout(reloj);
    var q = quieta();
    hero.classList.toggle('hero-quieto', q);
    if (!q) reloj = setTimeout(function () { ir(actual + 1); }, INTERVALO);
  }

  function ir(n) {
    actual = (n + fotos.length) % fotos.length;
    var f = fotos[actual];
    cargar(f);
    fotos.forEach(function (img, i) {
      img.classList.toggle('activa', i === actual);
      if (i === actual) img.removeAttribute('aria-hidden');
      else img.setAttribute('aria-hidden', 'true');
    });
    botones.forEach(function (b, i) {
      b.classList.remove('activo');
      b.classList.toggle('hecho', i < actual);
      if (i === actual) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    void botones[actual].offsetWidth;  // para que la barrita vuelva a llenarse desde cero
    botones[actual].classList.add('activo');
    etiqueta.href = f.getAttribute('data-href');
    etiNombre.textContent = f.getAttribute('data-nombre');
    etiIr.textContent = f.getAttribute('data-ir');
    programar();
  }

  function pausar(si) {
    aMano = si;
    pausa.setAttribute('aria-label', si ? 'Seguir con las fotos' : 'Pausar las fotos');
    pausa.classList.toggle('en-pausa', si);
    programar();
  }

  function frenar(motivo, si) {
    if (frenos[motivo] === si) return;
    frenos[motivo] = si;
    programar();
  }

  avance.hidden = false;
  botones.forEach(function (b, i) {
    b.addEventListener('click', function () { pausar(true); ir(i); });
  });
  pausa.addEventListener('click', function () { pausar(!aMano); });
  marco.addEventListener('mouseenter', function () { frenar('mouse', true); });
  marco.addEventListener('mouseleave', function () { frenar('mouse', false); });
  hero.addEventListener('focusin', function () { frenar('foco', true); });
  hero.addEventListener('focusout', function (ev) {
    if (!ev.relatedTarget || !hero.contains(ev.relatedTarget)) frenar('foco', false);
  });
  document.addEventListener('visibilitychange', function () { frenar('oculta', document.hidden); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { frenar('fuera', !es[es.length - 1].isIntersecting); }).observe(hero);
  }
  // «Reducir movimiento» puede cambiar con la página abierta (home.js mueve .mov).
  var eraMov = mov();
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (mov() !== eraMov) { eraMov = mov(); programar(); }
    }).observe(doc, {attributes: true, attributeFilter: ['class']});
  }
  ir(0);
})();
