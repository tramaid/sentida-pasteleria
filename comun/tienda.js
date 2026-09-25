/* SENTIDA · la tienda (Nuestras tortas y Antojos).
   Con JavaScript, cada tarjeta suma al pedido con un contador y, en el
   celular, aparece la tira «Tu pedido». Sin JavaScript, cada tarjeta
   tiene su enlace de WhatsApp. */
(function () {
  'use strict';
  var C = window.Carrito;
  if (!C) return;
  var tarjetas = Array.prototype.slice.call(document.querySelectorAll('[data-producto]'));
  var tira = document.querySelector('.tira-pedido');
  var tiraN = tira && tira.querySelector('.tira-pedido-n');

  tarjetas.forEach(function (t) {
    var slug = t.getAttribute('data-producto'), nombre = t.getAttribute('data-nombre');
    var agregar = t.querySelector('.producto-agregar'), cont = t.querySelector('.contador');
    t.querySelector('.producto-wa').hidden = true;
    agregar.addEventListener('click', function () {
      C.cambiar(slug, nombre, 1);
      cont.querySelector('[data-mas]').focus();
    });
    cont.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      C.cambiar(slug, nombre, b.hasAttribute('data-mas') ? 1 : -1);
      if (!C.cantidad(slug)) agregar.focus();
    });
  });

  C.alCambiar(function () {
    tarjetas.forEach(function (t) {
      var n = C.cantidad(t.getAttribute('data-producto'));
      var cont = t.querySelector('.contador');
      t.querySelector('.producto-agregar').hidden = n > 0;
      cont.hidden = n === 0;
      cont.querySelector('output').textContent = n;
      cont.querySelector('[data-mas]').disabled = n >= C.MAXIMO;
      t.classList.toggle('en-pedido', n > 0);
    });
    if (tira) {
      var total = C.total();
      tira.hidden = total === 0;
      tiraN.textContent = total === 1 ? '1 producto' : total + ' productos';
    }
  });

  // Llegar con #slug (desde la home): la tarjeta se marca.
  function marcar() {
    var id = decodeURIComponent(location.hash.slice(1));
    var t = id && document.getElementById(id);
    if (!t || !t.hasAttribute('data-producto')) return;
    t.classList.remove('marcada');
    void t.offsetWidth;
    t.classList.add('marcada');
  }
  window.addEventListener('hashchange', marcar);
  marcar();
})();
