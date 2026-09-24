/* SENTIDA · la comanda — el mensaje.
   Funciones puras: del estado del formulario a las líneas del ticket y al
   texto de WhatsApp. Sin DOM, para poder probarlas en Node. */
(function (raiz) {
  'use strict';
  var A_DEFINIR = 'a definir';
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var TAMANOS = {
    chica: 'chica (10 a 12 porciones)',
    mediana: 'mediana (15 a 25 porciones)',
    grande: 'grande (20 a 30 porciones)'
  };
  var NOMBRES = {
    vainilla: 'vainilla', chocolate: 'chocolate',
    ddl: 'dulce de leche', 'butter-choco': 'butter choco',
    'frutos-rojos': 'frutos rojos', oreo: 'crema Oreo', bonobon: 'crema Bon o Bon',
    chocotorta: 'crema Chocotorta', kinder: 'crema Kinder',
    bombon: 'bombón', merenguitos: 'merenguitos', chips: 'chips', nuez: 'nuez', mani: 'maní'
  };
  var REFERENCIAS = {
    petalos: 'la de pétalos', flores: 'la de flores naturales',
    letras: 'las de letras y números', mensaje: 'la del mensaje'
  };

  function limpio(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }

  function fecha(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return '';
    var a = +m[1], mes = +m[2], dia = +m[3];
    var d = new Date(Date.UTC(a, mes - 1, dia));
    if (d.getUTCFullYear() !== a || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return '';
    return DIAS[d.getUTCDay()] + ' ' + dia + '/' + mes;
  }

  function lista(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  // Una opción puede estar sin tocar (''), en «Lo charlamos» o elegida.
  function opcion(v, dic) {
    if (!v) return {valor: A_DEFINIR, vacio: true};
    if (v === 'charlamos') return {valor: A_DEFINIR, vacio: false};
    return {valor: dic[v] || v, vacio: false};
  }

  function lineas(e) {
    e = e || {};
    var out = [];
    function push(clave, etiqueta, r) {
      out.push({clave: clave, etiqueta: etiqueta, valor: r.valor, vacio: r.vacio});
    }

    var f = fecha(e.fecha), escrita = limpio(e.fecha);
    push('fecha', 'Fecha',
      e.sinFecha ? {valor: A_DEFINIR, vacio: false}
      : f ? {valor: f, vacio: false}
      : escrita ? {valor: escrita, vacio: false}
      : {valor: A_DEFINIR, vacio: true});
    push('tamano', 'Tamaño', opcion(e.tamano, TAMANOS));
    push('bizcochuelo', 'Bizcochuelo', opcion(e.bizcochuelo, NOMBRES));

    var rel = opcion(e.relleno, NOMBRES);
    var ag = (e.agregados || []).map(function (a) { return NOMBRES[a] || a; });
    if (ag.length) {
      rel = {valor: (rel.valor === A_DEFINIR ? A_DEFINIR + ', con ' : rel.valor + ' con ') + lista(ag), vacio: false};
    }
    push('relleno', 'Relleno', rel);
    push('relleno2', 'Segundo relleno', opcion(e.relleno2, NOMBRES));

    var idea = limpio(e.idea), ref = REFERENCIAS[e.referencia] || '';
    var deco = idea && ref ? idea + ' (como ' + ref + ')' : idea || (ref ? 'como ' + ref : '');
    push('decoracion', 'Decoración', deco ? {valor: deco, vacio: false} : {valor: A_DEFINIR, vacio: true});

    var nombre = limpio(e.nombreTorta);
    if (nombre) push('nombre', 'Nombre', {valor: nombre, vacio: false});
    var numero = limpio(e.numero);
    if (numero) push('numero', 'Número', {valor: numero, vacio: false});
    return out;
  }

  function texto(e) {
    return 'Hola SENTIDA, les paso mi comanda:\n' +
      lineas(e).map(function (l) { return l.etiqueta + ': ' + l.valor; }).join('\n');
  }

  function url(numero, t) {
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(t);
  }

  var api = {A_DEFINIR: A_DEFINIR, fecha: fecha, lista: lista, lineas: lineas, texto: texto, url: url};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.ComandaMensaje = api;
})(typeof window !== 'undefined' ? window : this);
