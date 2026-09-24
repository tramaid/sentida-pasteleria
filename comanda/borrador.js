/* SENTIDA · la comanda — borrador en el navegador.
   Lo elegido se guarda en localStorage para que una recarga o una
   interrupción no lo borren. Nada sale del teléfono. */
(function () {
  'use strict';
  var C = window.Comanda;
  if (!C) return;
  var CLAVE = 'sentida-comanda-v1';

  function hoyISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function guardar(e) { try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch (err) { /* sin lugar o bloqueado */ } }
  function borrar() { try { localStorage.removeItem(CLAVE); } catch (err) { /* bloqueado */ } }
  function guardado() {
    try {
      var e = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      return e && typeof e === 'object' ? e : null;
    } catch (err) { return null; }
  }

  var e = guardado();
  if (e) {
    // Una fecha que ya pasó no sirve: se descarta.
    if (/^\d{4}-\d{2}-\d{2}$/.test(e.fecha || '') && e.fecha < hoyISO()) e.fecha = '';
    C.escribir(e);
  }

  C.alCambiar(function (estado, nueva, lineas, motivo) {
    if (motivo === 'reinicio') borrar();
    else if (motivo === 'cambio') guardar(estado);
  });
})();
