/* ============================================================
   Configurador de torta decorada.
   El estado vive en un objeto y se guarda en localStorage: volver
   atrás nunca pierde lo elegido, que es lo que pide el brief.
   El resumen no se escribe como lista de campos sino en lenguaje
   natural: la torta se va armando mientras la persona elige.
   ============================================================ */
(function () {
  'use strict';
  var conf = document.getElementById('configurador');
  if (!conf) return;

  var CLAVE = 'sentida-v2-torta';
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

  var s = {agregados: []};
  try { s = Object.assign(s, JSON.parse(localStorage.getItem(CLAVE)) || {}); } catch (e) {}
  if (!Array.isArray(s.agregados)) s.agregados = [];
  // Los archivos adjuntos no sobreviven a una recarga: guardar el número
  // dejaba el resumen diciendo "2 imágenes" sin ninguna imagen.
  delete s.referencias;

  var paso = 0;
  var secciones = Array.prototype.slice.call(conf.querySelectorAll('.paso'));
  var $ = function (id) { return document.getElementById(id); };

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) {}
  }

  function txt(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- agenda (paso 0) ---------- */
  // toISOString() convierte a UTC y en husos positivos devolvía el día
  // anterior. La fecha se arma local, que es la que se ve en pantalla.
  function iso(d) {
    var m = String(d.getMonth() + 1), dd = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (dd.length < 2 ? '0' + dd : dd);
  }

  function construirAgenda() {
    var cont = $('agenda');
    if (!cont) return;
    var hoy = new Date();
    var cortos = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    var largos = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
    var html = cortos.map(function (d, i) {
      return '<span class="etiqueta" style="text-align:center" aria-hidden="true" title="' + largos[i] + '">' + d + '</span>';
    }).join('');
    // Arranca el lunes de la semana que viene y muestra cuatro semanas.
    var inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    var mesEnCurso = -1;
    for (var i = 0; i < 28; i++) {
      var d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      // Rótulo de mes cada vez que cambia: la grilla mostraba "30, 1, 2"
      // sin ninguna referencia de a qué mes pertenecía cada número.
      if (d.getMonth() !== mesEnCurso) {
        mesEnCurso = d.getMonth();
        html += '<p class="agenda-mes">' + MESES[mesEnCurso] +
          (d.getFullYear() !== hoy.getFullYear() ? ' ' + d.getFullYear() : '') + '</p>';
        // Alinear el primer día del mes con su columna.
        var hueco = (d.getDay() + 6) % 7;
        for (var h = 0; h < hueco; h++) html += '<span class="agenda-dia hoyno" aria-hidden="true"></span>';
      }
      var fecha = iso(d);
      // Estados de ejemplo, deterministas. En producción vienen de la agenda.
      var carga = (d.getDate() * 7 + d.getMonth()) % 10;
      var lleno = carga < 2, pocos = !lleno && carga < 4;
      var nombre = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] +
        (lleno ? ', completo' : (pocos ? ', últimos cupos' : ', con lugar'));
      html += '<button type="button" class="agenda-dia' + (pocos ? ' pocos' : '') +
        '" data-fecha="' + fecha + '" aria-label="' + nombre + '"' +
        (lleno ? ' disabled' : '') + '>' + d.getDate() + '</button>';
    }
    cont.innerHTML = html;
    cont.querySelectorAll('[data-fecha]').forEach(function (b) {
      b.addEventListener('click', function () {
        cont.querySelectorAll('.agenda-dia').forEach(function (o) {
          o.classList.remove('on'); o.removeAttribute('aria-pressed');
        });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        s.fecha = b.dataset.fecha;
        guardar(); pintarResumen(); validar();
      });
      if (s.fecha === b.dataset.fecha) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
    });
  }

  function fechaLegible(valor) {
    if (!valor) return '';
    var p = valor.split('-');
    return Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1];
  }

  /* ---------- opciones ---------- */
  var grupos = {};
  conf.querySelectorAll('.opcion[data-campo]').forEach(function (b) {
    var campo = b.dataset.campo;
    (grupos[campo] = grupos[campo] || []).push(b);
    b.addEventListener('click', function () { elegir(b); });
    if (s[campo] === b.dataset.valor) {
      b.classList.add('on'); b.setAttribute('aria-checked', 'true');
      if (campo === 'entrega') $('envio-campos').hidden = b.dataset.valor !== 'Envío a domicilio';
    }
  });

  function elegir(b) {
    var campo = b.dataset.campo;
    grupos[campo].forEach(function (o) {
      o.classList.remove('on');
      o.setAttribute('aria-checked', 'false');
      o.tabIndex = -1;
    });
    b.classList.add('on'); b.setAttribute('aria-checked', 'true'); b.tabIndex = 0;
    s[campo] = b.dataset.valor;
    if (b.dataset.extra) s[campo + 'Extra'] = b.dataset.extra;
    if (campo === 'entrega') $('envio-campos').hidden = b.dataset.valor !== 'Envío a domicilio';
    guardar(); pintarResumen(); validar();
  }

  // Un radiogroup es una sola parada de tabulación y se recorre con las
  // flechas. Sin esto, llegar a "Crema Kinder" eran cinco tabulaciones y
  // el lector de pantalla no anunciaba la posición dentro del grupo.
  Object.keys(grupos).forEach(function (campo) {
    var lista = grupos[campo];
    var marcado = lista.filter(function (b) { return b.classList.contains('on'); })[0];
    lista.forEach(function (b, i) {
      b.tabIndex = (marcado ? b === marcado : i === 0) ? 0 : -1;
      b.setAttribute('aria-setsize', String(lista.length));
      b.setAttribute('aria-posinset', String(i + 1));
      b.addEventListener('keydown', function (e) {
        var salto = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
        if (salto) {
          e.preventDefault();
          var n = lista[(lista.indexOf(b) + salto + lista.length) % lista.length];
          elegir(n); n.focus();
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          var m = e.key === 'Home' ? lista[0] : lista[lista.length - 1];
          elegir(m); m.focus();
        }
      });
    });
  });

  conf.querySelectorAll('.chip[data-campo="agregados"]').forEach(function (b) {
    if (s.agregados.indexOf(b.dataset.valor) > -1) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
    b.addEventListener('click', function () {
      var v = b.dataset.valor, i = s.agregados.indexOf(v);
      if (i > -1) s.agregados.splice(i, 1); else s.agregados.push(v);
      b.classList.toggle('on', i === -1);
      b.setAttribute('aria-pressed', String(i === -1));
      guardar(); pintarResumen();
    });
  });

  conf.querySelectorAll('[data-campo]').forEach(function (el) {
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
    if (s[el.dataset.campo]) el.value = s[el.dataset.campo];
    el.addEventListener('input', function () {
      s[el.dataset.campo] = el.value;
      guardar(); pintarResumen(); validar();
    });
  });

  /* ---------- referencias ---------- */
  var refs = $('refs');
  if (refs) {
    refs.addEventListener('change', function () {
      var n = refs.files.length;
      $('refs-n').textContent = n
        ? (n === 1 ? '1 imagen adjunta.' : n + ' imágenes adjuntas.')
        : 'Podés subir una o varias imágenes.';
      $('refs-lista').innerHTML = Array.prototype.slice.call(refs.files).map(function (f) {
        return '<span class="chip" style="cursor:default">' + txt(f.name.slice(0, 22)) + '</span>';
      }).join('');
      s.referencias = n;
      pintarResumen();
    });
  }

  /* ---------- resumen ---------- */
  function filas() {
    var f = [];
    if (s.fecha) f.push(['Fecha', fechaLegible(s.fecha), 0]);
    if (s.tamano) f.push(['Tamaño', s.tamano + (s.tamanoExtra ? ' · ' + s.tamanoExtra : ''), 1]);
    if (s.bizcochuelo) f.push(['Bizcochuelo', s.bizcochuelo, 2]);
    if (s.relleno1) f.push(['Relleno 1', s.relleno1 + (s.agregados.length ? ' con ' + s.agregados.join(', ').toLowerCase() : ''), 3]);
    if (s.relleno2) f.push(['Relleno 2', s.relleno2, 3]);
    if (s.tamano || s.bizcochuelo) f.push(['Cobertura', 'Buttercream de vainilla', 4]);
    if (s.tematica) f.push(['Temática', s.tematica, 4]);
    if (s.referencias) f.push(['Referencias', s.referencias + (s.referencias === 1 ? ' imagen' : ' imágenes'), 4]);
    if (s.homenajeado) f.push(['Para', s.homenajeado, 5]);
    if (s.edad) f.push(['Número', s.edad, 5]);
    if (s.fechaRetiro) f.push(['Retiro/entrega', fechaLegible(s.fechaRetiro), 5]);
    if (s.observaciones) f.push(['Observaciones', s.observaciones, 5]);
    if (s.entrega) f.push(['Entrega', s.entrega, 6]);
    if (s.localidad) f.push(['Localidad', s.localidad, 6]);
    if (s.direccion) f.push(['Dirección', s.direccion + (s.cp ? ' (' + s.cp + ')' : ''), 6]);
    return f;
  }

  function pintarResumen() {
    var f = filas();
    var lat = $('resumen-lat');
    if (lat) {
      lat.innerHTML = f.length
        ? f.map(function (x) {
            return '<div class="fila"><dt>' + txt(x[0]) + '</dt><dd>' + txt(x[1]) + '</dd></div>';
          }).join('')
        : '<p class="vacio">Todavía no elegiste nada.</p>';
    }
    var lema = $('resumen-lema');
    if (lema) {
      lema.textContent = s.tamano
        ? 'Tu ' + s.tamano.toLowerCase() + (s.bizcochuelo ? ' de bizcochuelo de ' + s.bizcochuelo.toLowerCase() : '') +
          (s.relleno1 ? ', rellena con ' + s.relleno1.toLowerCase() : '') +
          (s.relleno2 ? ' y ' + s.relleno2.toLowerCase() : '') + '.'
        : 'Lo soñás, lo creamos. Empezá eligiendo la fecha.';
    }
    var full = $('resumen-full');
    if (full) {
      full.innerHTML = '<div class="resumen" style="position:static; padding:0; background:none">' +
        f.map(function (x) {
          return '<div class="fila"><dt>' + txt(x[0]) + '</dt><dd>' + txt(x[1]) +
            ' <button class="editar" type="button" data-ir="' + x[2] + '">Editar<span class="sr-only"> ' +
            txt(String(x[0]).toLowerCase()) + '</span></button></dd></div>';
        }).join('') + '</div>';
      full.querySelectorAll('[data-ir]').forEach(function (b) {
        b.addEventListener('click', function () { ir(Number(b.dataset.ir)); });
      });
    }
    var bv = $('barra-v');
    if (bv) bv.textContent = f.length ? f[f.length - 1][0] + ': ' + f[f.length - 1][1] : 'Elegí la fecha';

    // El enlace de WhatsApp se arma siempre, no sólo después de tocar algo:
    // arrancaba en href="#" y sin JS quedaba muerto.
    var wa = $('wa-final');
    if (wa) {
      var cuerpo = f.length
        ? f.map(function (x) { return '• ' + x[0] + ': ' + x[1]; }).join('\n')
        : '(todavía no configuré nada, quiero consultar)';
      wa.href = 'https://wa.me/5491158300787?text=' +
        encodeURIComponent('Hola SENTIDA! Quiero reservar una torta decorada:\n\n' + cuerpo);
    }
  }

  /* ---------- pasos ---------- */
  function pintarPasos() {
    var ol = $('pasos');
    ol.innerHTML = secciones.map(function (sec, i) {
      var clase = i < paso ? 'hecho' : (i === paso ? 'activo' : '');
      return '<li class="' + (i === paso ? 'activo' : '') + '"' +
        (i === paso ? ' aria-current="step"' : '') +
        '><span class="paso-barra ' + clase + '"></span><span class="rot">' + sec.dataset.rot + '</span></li>';
    }).join('');
  }

  // Qué falta para poder seguir. Antes el botón se apagaba sin decir por qué.
  var PORQUE = {
    0: 'Elegí una fecha para seguir.',
    1: 'Elegí un tamaño para seguir.',
    2: 'Elegí el bizcochuelo para seguir.',
    3: 'Elegí un relleno de cada grupo para seguir.',
    6: 'Elegí si la retirás o te la llevamos.'
  };

  function validar() {
    var req = [null, 'tamano', 'bizcochuelo', null, null, null, 'entrega', null, null];
    var falta = false;
    if (paso === 0) falta = !s.fecha;
    else if (paso === 3) falta = !s.relleno1 || !s.relleno2;
    else if (req[paso]) falta = !s[req[paso]];
    $('siguiente').disabled = falta;
    $('barra-sig').disabled = falta;
    var aviso = $('conf-falta');
    if (aviso) {
      if (falta) aviso.textContent = PORQUE[paso] || 'Completá este paso para seguir.';
      aviso.hidden = !falta;
    }
  }

  var primera = true;
  function ir(n) {
    paso = Math.max(0, Math.min(secciones.length - 1, n));
    secciones.forEach(function (sec, i) { sec.hidden = i !== paso; });
    $('atras').hidden = paso === 0;
    var ultimo = paso === secciones.length - 1;
    $('siguiente').hidden = ultimo;
    $('barra-sig').hidden = ultimo;
    $('siguiente').textContent = paso === secciones.length - 2 ? 'Ir a reservar' : 'Continuar';
    pintarPasos(); pintarResumen(); validar();
    if (primera) { primera = false; return; }
    conf.scrollIntoView({behavior: 'smooth', block: 'start'});
    // El contenido se reemplazaba entero y el foco se quedaba en el botón
    // anterior: con lector de pantalla no se anunciaba nada del paso nuevo.
    var h = secciones[paso].querySelector('h2');
    if (h) { h.tabIndex = -1; h.focus({preventScroll: true}); }
  }

  $('siguiente').addEventListener('click', function () { ir(paso + 1); });
  $('barra-sig').addEventListener('click', function () { ir(paso + 1); });
  $('atras').addEventListener('click', function () { ir(paso - 1); });

  construirAgenda();
  ir(0);
})();
