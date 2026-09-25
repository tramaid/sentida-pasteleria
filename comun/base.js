/* SENTIDA · utilidades compartidas.
   Funciones puras, sin DOM: sirven en el navegador (window.Sentida) y en
   Node (module.exports) para las pruebas. */
(function (raiz) {
  'use strict';
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function limpio(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }

  // '2026-11-07' -> 'sábado 7/11'. Lo que no es una fecha válida -> ''.
  function fecha(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return '';
    var a = +m[1], mes = +m[2], dia = +m[3];
    var d = new Date(Date.UTC(a, mes - 1, dia));
    if (d.getUTCFullYear() !== a || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return '';
    return DIAS[d.getUTCDay()] + ' ' + dia + '/' + mes;
  }

  // Hoy (o d) en el formato de <input type="date">, con la hora local.
  function hoyISO(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function whatsapp(numero, texto) {
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  var api = {limpio: limpio, fecha: fecha, hoyISO: hoyISO, whatsapp: whatsapp,
             ANTO: '5491158300787', NADIA: '5491131459646'};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Sentida = api;
})(typeof window !== 'undefined' ? window : this);
