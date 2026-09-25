/* SENTIDA · el menú del celular.
   Es un <details>: funciona solo. Acá se cierra al elegir un enlace, con
   Escape, al tocar afuera o cuando el foco se va a otra parte. */
(function () {
  'use strict';
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var cerrar = function () { menu.open = false; };
  menu.addEventListener('click', function (ev) { if (ev.target.closest('nav a')) cerrar(); });
  menu.addEventListener('focusout', function (ev) {
    if (menu.open && ev.relatedTarget && !menu.contains(ev.relatedTarget)) cerrar();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && menu.open) { cerrar(); menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (ev) { if (menu.open && !menu.contains(ev.target)) cerrar(); });
})();
