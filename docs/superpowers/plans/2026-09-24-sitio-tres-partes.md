# SENTIDA · El sitio en tres partes — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Juntar la home v4 y la comanda en un solo sitio con tres entradas en el menú: **Nuestras tortas** y **Antojos** (tienda con carrito que termina en un WhatsApp) y **Decoradas** (la comanda, ahora un paso por vez con Siguiente y Volver).

**Architecture:** Sitio estático sin build. Cada página funciona completa sin JavaScript y mejora con scripts chicos de una sola responsabilidad. Lo compartido vive en `comun/` (tokens y cabecera en `base.css`, el ticket en `ticket.css`, utilidades puras en `base.js`, el mensaje del pedido en `pedido-mensaje.js`, el carrito en `carrito.js`). La comanda se muda a `decoradas/` y suma `pasos.js`. Las páginas de la tienda se generan con `herramientas/generar_tienda.py` desde `datos/catalogo.json` y el HTML generado se sube al repo.

**Tech Stack:** HTML, CSS y JavaScript ES5 sin dependencias. Python 3.14 + Pillow para el generador y las fotos. Pruebas: `node --test` (Node 24) para las funciones puras; `pytest` + Playwright (Chromium) para las páginas.

**Spec:** `docs/superpowers/specs/2026-09-24-sitio-tres-partes-design.md`

**Commits:** no hacer commits salvo que el usuario lo pida. Donde un plan normal diría «commit», acá se corre la suite completa.

**Cómo correr las pruebas (desde `sentida-site/`):**

```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```

## Global Constraints

- Paleta: `#FEFAF8` blanco, `#F8EADE` crema, `#CFB59E` beige, `#DDE6ED` celeste, `#402D21` marrón, `#6C4D38` marrón medio, `#46627A` celeste profundo.
- El celeste `#DDE6ED` nunca en texto ni en grandes superficies; solo rellenos chicos.
- Erode 500 (display) + Montserrat; fuentes locales en `assets/fuentes/` con respaldos métricos.
- Sin itálicas. Ningún texto por debajo de 11 px. Contraste AA en todo el texto.
- Español rioplatense con voseo; «nosotras». No se inventan precios, fechas, disponibilidad ni descripciones de productos.
- Solo fotos reales; sin personajes con marca registrada ni nombres de chicos; sin el sello viejo de «tienda de pasteles».
- WhatsApp de Anto: `5491158300787`. WhatsApp de Nadia: `5491131459646`. Los mensajes van codificados con `encodeURIComponent` (espacios como `%20`, nunca `+`).
- Cada página se ve completa sin JavaScript; el movimiento vive bajo `.mov`.
- Menú, en este orden y en las cuatro páginas: Nuestras tortas (`tortas/`) · Decoradas (`decoradas/`) · Antojos (`antojos/`) · Nosotras (`#nosotras` de la home). «Mi pedido» a la derecha.
- Las páginas nuevas (`decoradas/`, `tortas/`, `antojos/`) van en `noindex` hasta que las dueñas aprueben la propuesta.
- No nombrar PepperLabs ni ninguna plataforma de pago.

## Review Focus

- Un borrador de la comanda guardado antes de este cambio, con `"tamano": "charlamos"`: la página carga sin errores, ninguna opción queda marcada y el paso 2 pide elegir (Task 5).
- Un producto con 99 unidades: el «+» se desactiva y el pedido no pasa de 99 (Task 6 y Task 7).
- Datos raros en `localStorage` (un nombre con `<img onerror>`, cantidades como texto, slugs inválidos, fechas pasadas): se muestran como texto o se descartan, sin ejecutar nada (Task 7).
- Dos pestañas abiertas: lo que se agrega en una aparece en «Mi pedido» de la otra (Task 7).
- Atrás del navegador desde el paso 1 hasta la portada y adelante otra vez: no se pierde lo elegido y el paso sigue andando (Task 4).

---

## Estructura de archivos

```text
comun/
  base.css            tokens, tipografías, botones, cabecera y pie (decoradas, tortas, antojos)
  ticket.css          el ticket de papel, «Mi pedido», el contador y el diálogo del pedido (las cuatro páginas)
  tienda.css          grilla de productos, panel del pedido, mesa dulce, tira del celular
  base.js             window.Sentida: limpio, fecha, hoyISO, whatsapp, ANTO, NADIA (puro, también en Node)
  menu.js             el menú <details> del celular
  pedido-mensaje.js   window.PedidoMensaje: normalizar, cambiar, texto, falta… (puro, también en Node)
  carrito.js          window.Carrito: el pedido guardado, «Mi pedido», el diálogo, el envío
  tienda.js           tarjetas con «Agregar al pedido» y contador, tira del celular, ancla marcada
decoradas/            la comanda (antes comanda/)
  index.html, decoradas.css
  mensaje.js          window.ComandaMensaje (puro): sin «charlamos», con «Además», falta, primerIncompleto
  comanda.js          window.Comanda: núcleo del formulario y del ticket
  borrador.js         window.ComandaBorrador: borrador, paso guardado, ?ref=
  pasos.js            window.ComandaPasos: un paso por vez
  panel.js            foto del panel por paso, tira y diálogo del celular
  movimiento.js       el gesto de «Empezar»
comanda/index.html    redirección a ../decoradas/
tortas/index.html     generada
antojos/index.html    generada
datos/catalogo.json   fuente única de la tienda
herramientas/
  generar_tienda.py   catálogo -> tortas/ y antojos/
  preparar_foto.py    una foto -> <nombre>.webp, -800.webp y -480.webp en assets/fotos/
docs/fotos/brief-fotos.html   brief para generar fotos con GPT
tests/
  conftest.py         servidor, navegador y abrir(ancho, alto, init=None, pagina=None, **ctx)
  reglas.py           comprobaciones compartidas (texto chico, celeste, itálicas, contraste)
  comun/              base.test.mjs, pedido-mensaje.test.mjs, test_carrito.py
  decoradas/          la comanda (antes tests/comanda/)
  tienda/             test_tienda.py, test_generador.py
  home/               test_home.py
  sitio/              test_sitio.py, test_brief.py
```

---

### Task 1: Mudar la comanda a `/decoradas/` y ordenar las pruebas

**Files:**
- Move: `comanda/` → `decoradas/` (todo su contenido)
- Move: `tests/comanda/` → `tests/decoradas/`
- Create: `tests/conftest.py`
- Modify: `tests/decoradas/conftest.py` (queda solo `ruta`)
- Modify: `tests/decoradas/mensaje.test.mjs:5`
- Modify: `decoradas/index.html` (canonical)
- Create: `comanda/index.html` (redirección)
- Test: `tests/decoradas/test_redireccion.py`

**Interfaces:**
- Produces: fixture `sitio` (URL raíz con barra final), fixture `ruta` (página por defecto de cada carpeta), fixture `abrir(w=1440, h=900, init=None, pagina=None, **ctx) -> Page` con `page.errores`. Todas las tareas siguientes usan `abrir`.

- [ ] **Step 1: Mover las carpetas con git**

Run (desde `sentida-site/`):
```bash
git mv comanda decoradas
git mv tests/comanda tests/decoradas
rm -rf tests/decoradas/__pycache__
```
Expected: `git status --short` muestra los renombres `R  comanda/... -> decoradas/...` y `R  tests/comanda/... -> tests/decoradas/...`.

- [ ] **Step 2: El conftest de la raíz de las pruebas**

`tests/conftest.py`:
```python
import functools
import http.server
import pathlib
import socketserver
import threading

import pytest
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parents[1]


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        pass  # el navegador corta conexiones al cerrar contextos: no es un error de la página


@pytest.fixture(scope="session")
def sitio():
    """La raíz del sitio, servida en un puerto libre, con barra final."""
    srv = Servidor(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}/"
    srv.shutdown()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def ruta():
    """La página que abre `abrir` si no se le pasa otra. Cada carpeta la cambia."""
    return ""


@pytest.fixture
def abrir(browser, sitio, ruta):
    """abrir(ancho, alto, init=None, pagina=None, **opciones_de_contexto) -> page con .errores.

    `init` corre antes de los scripts de la página en cada navegación del contexto.
    """
    contextos = []

    def _abrir(w=1440, h=900, init=None, pagina=None, **kw):
        ctx = browser.new_context(viewport={"width": w, "height": h}, **kw)
        contextos.append(ctx)
        ctx.route("https://wa.me/**", lambda r: r.fulfill(body="ok"))
        if init:
            ctx.add_init_script(init)
        pg = ctx.new_page()
        pg.errores = []
        pg.on("pageerror", lambda e: pg.errores.append(str(e)))
        pg.on("console", lambda m: pg.errores.append(m.text) if m.type == "error" and "404" not in m.text else None)
        pg.goto(sitio + (ruta if pagina is None else pagina))
        pg.wait_for_load_state("networkidle")
        return pg

    yield _abrir
    for c in contextos:
        c.close()
```

`tests/decoradas/conftest.py` (reemplaza todo el archivo):
```python
import pytest


@pytest.fixture
def ruta():
    return "decoradas/"
```

- [ ] **Step 3: La prueba de Node apunta a la carpeta nueva**

En `tests/decoradas/mensaje.test.mjs`, reemplazar:
```js
const M = require('../../comanda/mensaje.js');
```
por:
```js
const M = require('../../decoradas/mensaje.js');
```

- [ ] **Step 4: Canonical de la página**

En `decoradas/index.html`, reemplazar:
```html
<link rel="canonical" href="https://tramaid.github.io/sentida-pasteleria/comanda/">
```
por:
```html
<link rel="canonical" href="https://tramaid.github.io/sentida-pasteleria/decoradas/">
```

- [ ] **Step 5: Escribir la prueba de la redirección**

`tests/decoradas/test_redireccion.py`:
```python
def test_la_comanda_vieja_redirige_a_decoradas(abrir):
    pg = abrir(pagina="comanda/?ref=letras#paso-2")
    pg.wait_for_url(lambda u: u.endswith("/decoradas/?ref=letras#paso-2"))
    assert pg.errores == []


def test_la_redireccion_funciona_sin_javascript(abrir):
    pg = abrir(pagina="comanda/", java_script_enabled=False)
    pg.wait_for_url(lambda u: u.endswith("/decoradas/"))
```

- [ ] **Step 6: Correrla y ver que falla**

Run: `python -m pytest tests/decoradas/test_redireccion.py -q -p no:cacheprovider`
Expected: FAIL (404 en `comanda/`, `wait_for_url` vence).

- [ ] **Step 7: La página de redirección**

`comanda/index.html`:
```html
<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Armá tu torta · SENTIDA Pastelería</title>
<link rel="canonical" href="https://tramaid.github.io/sentida-pasteleria/decoradas/">
<script>
/* La comanda se mudó a Decoradas. Se conservan ?ref= y el #paso. */
location.replace('../decoradas/' + location.search + location.hash);
</script>
<meta http-equiv="refresh" content="0; url=../decoradas/">
</head>
<body>
<p>La comanda ahora está en <a href="../decoradas/">Decoradas</a>.</p>
</body>
</html>
```

- [ ] **Step 8: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: Node 11/11; pytest todo en verde (las 45 pruebas de antes más las 2 nuevas).

---

### Task 2: Utilidades comunes y el mensaje sin «Lo charlamos», con «Además»

**Files:**
- Create: `comun/base.js`
- Test: `tests/comun/base.test.mjs`
- Modify: `decoradas/mensaje.js` (reescrito)
- Test: `tests/decoradas/mensaje.test.mjs` (reescrito)
- Modify: `decoradas/index.html` (sin «Lo charlamos», campo «¿Algo más?», carga `base.js`)
- Modify: `decoradas/comanda.js` (lee «¿Algo más?», escucha en el documento, `Sentida.hoyISO`)
- Test: `tests/decoradas/test_armado.py`

**Interfaces:**
- Produces: `window.Sentida` / `require('comun/base.js')`:
  - `limpio(t) -> string` — colapsa espacios y recorta
  - `fecha(iso) -> string` — `'2026-11-07'` → `'sábado 7/11'`; inválida → `''`
  - `hoyISO(d?: Date) -> 'AAAA-MM-DD'` (fecha local)
  - `whatsapp(numero, texto) -> 'https://wa.me/<numero>?text=<encodeURIComponent(texto)>'`
  - `ANTO: '5491158300787'`, `NADIA: '5491131459646'`
- Produces: `window.ComandaMensaje` / `module.exports`:
  - `A_DEFINIR`, `fecha`, `lista`, `lineas(estado)`, `texto(estado)`, `url(numero, texto)` (como antes)
  - `lineas` suma al final `{clave: 'ademas', etiqueta: 'Además', valor, vacio: false}` si `estado.ademas` tiene texto
  - `falta(n, estado) -> string` — `''` si el paso `n` puede pasar; si no, el aviso
  - `primerIncompleto(estado) -> 1..5 | 7`
- `estado` suma `ademas: string`. Ya no existe el valor `'charlamos'`.

- [ ] **Step 1: Pruebas de las utilidades**

`tests/comun/base.test.mjs`:
```js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const S = require('../../comun/base.js');

test('limpio colapsa espacios', () => {
  assert.equal(S.limpio('  rosa   y \n dorado '), 'rosa y dorado');
  assert.equal(S.limpio(undefined), '');
});

test('fecha en palabras', () => {
  assert.equal(S.fecha('2026-11-07'), 'sábado 7/11');
  assert.equal(S.fecha('2026-10-18'), 'domingo 18/10');
  assert.equal(S.fecha('2026-02-30'), '');
  assert.equal(S.fecha('7 de noviembre'), '');
});

test('hoyISO usa la fecha local', () => {
  assert.equal(S.hoyISO(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('whatsapp codifica sin «+»', () => {
  const u = S.whatsapp(S.ANTO, 'Hola & chau #1\nrosa 🌸');
  assert.ok(u.startsWith('https://wa.me/5491158300787?text='));
  const q = u.split('?text=')[1];
  assert.ok(!q.includes('+') && !q.includes(' ') && !q.includes('&') && !q.includes('#'));
  assert.equal(decodeURIComponent(q), 'Hola & chau #1\nrosa 🌸');
  assert.equal(S.NADIA, '5491131459646');
});
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `node --test "tests/comun/*.test.mjs"`
Expected: FAIL con `Cannot find module '../../comun/base.js'`.

- [ ] **Step 3: `comun/base.js`**

```js
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
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --test "tests/comun/*.test.mjs"`
Expected: PASS 4/4.

- [ ] **Step 5: Reescribir las pruebas del mensaje**

`tests/decoradas/mensaje.test.mjs` (reemplaza todo el archivo):
```js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../../decoradas/mensaje.js');

const COMPLETO = {
  fecha: '2026-11-07', sinFecha: false, tamano: 'mediana', bizcochuelo: 'vainilla',
  relleno: 'ddl', agregados: ['chips', 'nuez'], relleno2: 'frutos-rojos',
  idea: 'flores naturales en tonos pastel', referencia: 'flores', nombreTorta: 'Mamá', numero: '60'
};

test('fecha en palabras', () => {
  assert.equal(M.fecha('2026-11-07'), 'sábado 7/11');
  assert.equal(M.fecha('2026-02-30'), '');
});

test('lista con «y»', () => {
  assert.equal(M.lista([]), '');
  assert.equal(M.lista(['nuez']), 'nuez');
  assert.equal(M.lista(['bombón', 'chips', 'nuez']), 'bombón, chips y nuez');
});

test('estado vacío: seis líneas «a definir» marcadas vacías', () => {
  const ls = M.lineas({});
  assert.deepEqual(ls.map(l => l.clave), ['fecha', 'tamano', 'bizcochuelo', 'relleno', 'relleno2', 'decoracion']);
  assert.ok(ls.every(l => l.vacio && l.valor === 'a definir'));
});

test('mensaje completo, tal cual la especificación', () => {
  assert.equal(M.texto(COMPLETO), [
    'Hola SENTIDA, les paso mi comanda:',
    'Fecha: sábado 7/11',
    'Tamaño: mediana (15 a 25 porciones)',
    'Bizcochuelo: vainilla',
    'Relleno: dulce de leche con chips y nuez',
    'Segundo relleno: frutos rojos',
    'Decoración: flores naturales en tonos pastel (como la de flores naturales)',
    'Nombre: Mamá',
    'Número: 60'
  ].join('\n'));
});

test('«Además» va al final, solo si tiene texto', () => {
  assert.equal(M.texto({...COMPLETO, ademas: '  sin nuez,   por favor '}).split('\n').pop(), 'Además: sin nuez, por favor');
  assert.ok(!M.texto({...COMPLETO, ademas: '   '}).includes('Además'));
  const l = M.lineas({ademas: 'x'}).pop();
  assert.deepEqual([l.clave, l.etiqueta, l.vacio], ['ademas', 'Además', false]);
});

test('«Todavía no sé» la fecha', () => {
  const l = M.lineas({fecha: '2026-11-07', sinFecha: true})[0];
  assert.deepEqual([l.valor, l.vacio], ['a definir', false]);
});

test('fecha escrita a mano se respeta', () => {
  assert.equal(M.lineas({fecha: '7 de noviembre'})[0].valor, '7 de noviembre');
});

test('agregados sin relleno elegido', () => {
  const l = M.lineas({agregados: ['nuez']}).find(x => x.clave === 'relleno');
  assert.equal(l.valor, 'a definir, con nuez');
  assert.equal(l.vacio, false);
});

test('decoración solo con referencia, e idea con espacios de más', () => {
  assert.equal(M.lineas({referencia: 'petalos'})[5].valor, 'como la de pétalos');
  assert.equal(M.lineas({idea: '  rosa   y  dorado '})[5].valor, 'rosa y dorado');
});

test('nombre y número solo si se completaron', () => {
  assert.equal(M.lineas({nombreTorta: '  ', numero: ''}).length, 6);
  assert.deepEqual(M.lineas({nombreTorta: 'Lu', numero: '5'}).slice(6).map(l => l.valor), ['Lu', '5']);
});

test('qué falta en cada paso', () => {
  assert.equal(M.falta(1, {}), 'Elegí una fecha o marcá «Todavía no sé».');
  assert.equal(M.falta(1, {sinFecha: true}), '');
  assert.equal(M.falta(1, {fecha: '7 de noviembre'}), '');
  assert.equal(M.falta(2, {}), 'Elegí un tamaño para seguir.');
  assert.equal(M.falta(3, {}), 'Elegí un bizcochuelo para seguir.');
  assert.equal(M.falta(4, {agregados: ['nuez']}), 'Elegí un relleno para seguir.');
  assert.equal(M.falta(5, {}), 'Elegí el segundo relleno para seguir.');
  assert.equal(M.falta(6, {}), '');
  assert.equal(M.falta(7, {}), '');
  assert.equal(M.falta(2, COMPLETO), '');
});

test('el primer paso incompleto', () => {
  assert.equal(M.primerIncompleto({}), 1);
  assert.equal(M.primerIncompleto({sinFecha: true, tamano: 'chica'}), 3);
  assert.equal(M.primerIncompleto(COMPLETO), 7);
  assert.equal(M.primerIncompleto({...COMPLETO, idea: '', referencia: ''}), 7);
});

test('url de WhatsApp codificada', () => {
  const u = M.url('5491158300787', 'Hola & chau\nrosa');
  assert.equal(decodeURIComponent(u.split('?text=')[1]), 'Hola & chau\nrosa');
});
```

- [ ] **Step 6: Correrlas y ver que fallan**

Run: `node --test "tests/decoradas/*.test.mjs"`
Expected: FAIL en «Además», «qué falta» y «el primer paso incompleto» (`M.falta is not a function`).

- [ ] **Step 7: Reescribir `decoradas/mensaje.js`**

```js
/* SENTIDA · la comanda — el mensaje.
   Funciones puras: del estado del formulario a las líneas del ticket, al
   texto de WhatsApp y a lo que le falta a cada paso. Sin DOM, para poder
   probarlas en Node. */
(function (raiz) {
  'use strict';
  var S = typeof module === 'object' && module.exports ? require('../comun/base.js') : raiz.Sentida;
  var A_DEFINIR = 'a definir';
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
  // Lo que se muestra si se toca Siguiente sin haber elegido.
  var FALTA = {
    1: 'Elegí una fecha o marcá «Todavía no sé».',
    2: 'Elegí un tamaño para seguir.',
    3: 'Elegí un bizcochuelo para seguir.',
    4: 'Elegí un relleno para seguir.',
    5: 'Elegí el segundo relleno para seguir.'
  };
  var CIERRE = 7;

  function lista(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  // Una opción sin tocar queda «a definir» y vacía.
  function opcion(v, dic) {
    if (!v) return {valor: A_DEFINIR, vacio: true};
    return {valor: dic[v] || v, vacio: false};
  }

  function lineas(e) {
    e = e || {};
    var out = [];
    function push(clave, etiqueta, r) {
      out.push({clave: clave, etiqueta: etiqueta, valor: r.valor, vacio: r.vacio});
    }

    var f = S.fecha(e.fecha), escrita = S.limpio(e.fecha);
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
      rel = {valor: (rel.vacio ? A_DEFINIR + ', con ' : rel.valor + ' con ') + lista(ag), vacio: false};
    }
    push('relleno', 'Relleno', rel);
    push('relleno2', 'Segundo relleno', opcion(e.relleno2, NOMBRES));

    var idea = S.limpio(e.idea), ref = REFERENCIAS[e.referencia] || '';
    var deco = idea && ref ? idea + ' (como ' + ref + ')' : idea || (ref ? 'como ' + ref : '');
    push('decoracion', 'Decoración', deco ? {valor: deco, vacio: false} : {valor: A_DEFINIR, vacio: true});

    var nombre = S.limpio(e.nombreTorta);
    if (nombre) push('nombre', 'Nombre', {valor: nombre, vacio: false});
    var numero = S.limpio(e.numero);
    if (numero) push('numero', 'Número', {valor: numero, vacio: false});
    var ademas = S.limpio(e.ademas);
    if (ademas) push('ademas', 'Además', {valor: ademas, vacio: false});
    return out;
  }

  function texto(e) {
    return 'Hola SENTIDA, les paso mi comanda:\n' +
      lineas(e).map(function (l) { return l.etiqueta + ': ' + l.valor; }).join('\n');
  }

  // Qué le falta al paso n para poder pasar ('' si nada). 6 y 7 no piden nada.
  function falta(n, e) {
    e = e || {};
    var listo = {
      1: !!(e.sinFecha || S.limpio(e.fecha)),
      2: !!e.tamano, 3: !!e.bizcochuelo, 4: !!e.relleno, 5: !!e.relleno2
    }[n];
    return listo === false ? FALTA[n] : '';
  }

  // El primer paso obligatorio sin completar; el cierre (7) si están todos.
  function primerIncompleto(e) {
    for (var n = 1; n <= 5; n++) if (falta(n, e)) return n;
    return CIERRE;
  }

  function url(numero, t) { return S.whatsapp(numero, t); }

  var api = {A_DEFINIR: A_DEFINIR, fecha: S.fecha, lista: lista, lineas: lineas, texto: texto,
             falta: falta, primerIncompleto: primerIncompleto, url: url};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.ComandaMensaje = api;
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 8: Correr y ver que pasan**

Run: `node --test "tests/**/*.test.mjs"`
Expected: PASS (4 de `base`, 13 de `mensaje`).

- [ ] **Step 9: Pruebas de la página: sin «Lo charlamos» y con «¿Algo más?»**

En `tests/decoradas/test_armado.py`, reemplazar la función `test_lo_charlamos` entera por:
```python
def test_no_hay_lo_charlamos(abrir):
    pg = abrir()
    assert pg.locator("input[value=charlamos]").count() == 0
    assert "charlamos" not in pg.inner_text("#armado").lower()


def test_algo_mas_va_al_ticket_y_al_mensaje(abrir):
    pg = abrir()
    pg.fill("#ademas", "sin nuez, por favor")
    pg.keyboard.press("Tab")
    assert pg.text_content('.panel [data-clave="ademas"] dd') == "sin nuez, por favor"
    assert pg.input_value("#mensaje").endswith("\nAdemás: sin nuez, por favor")
    assert pg.text_content("#anuncio") == "Además: sin nuez, por favor"


def test_algo_mas_no_se_ve_sin_javascript(abrir):
    pg = abrir(java_script_enabled=False)
    assert pg.is_hidden("#campo-ademas")
```

- [ ] **Step 10: Correrlas y ver que fallan**

Run: `python -m pytest tests/decoradas/test_armado.py -q -p no:cacheprovider`
Expected: FAIL en las tres (hay radios `charlamos`; no existe `#ademas`).

- [ ] **Step 11: Cambios en el HTML**

Guardar en el scratchpad como `t2_html.py` y correr desde `sentida-site/` con `python -X utf8 <ruta>/t2_html.py`:
```python
import os
os.chdir(r'E:/E descargas/SENTIDA-sitio-web/sentida-site')


def cambiar(p, pares):
    s = open(p, encoding='utf-8').read()
    for a, b, n in pares:
        assert s.count(a) == n, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='\n').write(s)


cambiar('decoradas/index.html', [
    ('            <label class="opcion"><input type="radio" name="tamano" value="charlamos"><span>Lo charlamos</span></label>\n', '', 1),
    ('            <label class="opcion"><input type="radio" name="bizcochuelo" value="charlamos"><span>Lo charlamos</span></label>\n', '', 1),
    ('            <label class="opcion"><input type="radio" name="relleno" value="charlamos"><span>Lo charlamos</span></label>\n', '', 1),
    ('            <label class="opcion"><input type="radio" name="relleno2" value="charlamos"><span>Lo charlamos</span></label>\n', '', 1),
    ('<script src="mensaje.js" defer></script>',
     '<script src="../comun/base.js" defer></script>\n<script src="mensaje.js" defer></script>', 1),
    ('''        <p class="cierre-baja">Revisala y mandala. En WhatsApp todavía la podés corregir antes de enviar. Te respondemos con precio y disponibilidad.</p>
''', '''        <p class="cierre-baja">Revisala y mandala. En WhatsApp todavía la podés corregir antes de enviar. Te respondemos con precio y disponibilidad.</p>
        <div class="campo campo-ademas" id="campo-ademas" hidden>
          <label class="campo-t" for="ademas">¿Algo más que tengamos que saber?</label>
          <p class="campo-ayuda" id="ademas-ayuda">Un sabor que no estaba, una alergia, un detalle que no querés que se nos pase.</p>
          <textarea id="ademas" name="ademas" form="armado" rows="3" aria-describedby="ademas-ayuda"></textarea>
        </div>
''', 1),
])
print('ok')
```
Expected: `ok`. Cada patrón de «Lo charlamos» incluye sus 12 espacios de sangría y el salto de línea, así la línea desaparece entera.

- [ ] **Step 12: `decoradas/comanda.js` lee «¿Algo más?» y escucha en el documento**

Guardar en el scratchpad como `t2_js.py` y correr igual que el anterior:
```python
import os
os.chdir(r'E:/E descargas/SENTIDA-sitio-web/sentida-site')


def cambiar(p, pares):
    s = open(p, encoding='utf-8').read()
    for a, b in pares:
        assert s.count(a) == 1, (p, a[:70])
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='\n').write(s)


cambiar('decoradas/comanda.js', [
    ("  var M = window.ComandaMensaje;\n",
     "  var M = window.ComandaMensaje, S = window.Sentida;\n"),
    ("  var reescribirBtn = document.getElementById('reescribir');\n  if (!M || !armado || !envio || !mensaje) return;",
     "  var reescribirBtn = document.getElementById('reescribir');\n  var campoAdemas = document.getElementById('campo-ademas');\n  if (!M || !S || !armado || !envio || !mensaje) return;"),
    ("  var CLAVES = {fecha: 'fecha', idea: 'decoracion', 'nombre-torta': 'nombre', numero: 'numero'};",
     "  var CLAVES = {fecha: 'fecha', idea: 'decoracion', 'nombre-torta': 'nombre', numero: 'numero', ademas: 'ademas'};"),
    ("      numero: f.numero.value\n    };",
     "      numero: f.numero.value,\n      ademas: f.ademas ? f.ademas.value : ''\n    };"),
    ("    f.numero.value = e.numero || '';\n",
     "    f.numero.value = e.numero || '';\n    if (f.ademas) f.ademas.value = e.ademas || '';\n"),
    ("""  // La fecha no puede ser anterior a hoy.
  var hoy = new Date();
  armado.elements.fecha.min = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') +
    '-' + String(hoy.getDate()).padStart(2, '0');

  armado.addEventListener('change', function (ev) {
    var t = ev.target;
""", """  // La fecha no puede ser anterior a hoy.
  armado.elements.fecha.min = S.hoyISO();
  // «¿Algo más?» solo sirve con JavaScript: sin él, el mensaje se escribe a mano.
  if (campoAdemas) campoAdemas.hidden = false;

  // Los campos del armado avisan por el documento: «¿Algo más?» está en el
  // cierre, fuera del <form>, pero le pertenece (form="armado").
  function delArmado(t) { return !!t && t.form === armado; }
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (!delArmado(t)) return;
"""),
    ("""  armado.addEventListener('input', function (ev) {
    // Mientras se escribe: ticket y mensaje al día, sin animación ni anuncio por letra.
    if (ev.target.type === 'text' || ev.target.tagName === 'TEXTAREA') render({silencioso: true});
  });""", """  document.addEventListener('input', function (ev) {
    var t = ev.target;
    // Mientras se escribe: ticket y mensaje al día, sin animación ni anuncio por letra.
    if (delArmado(t) && (t.type === 'text' || t.tagName === 'TEXTAREA')) render({silencioso: true});
  });"""),
])
print('ok')
```
Expected: `ok`.

- [ ] **Step 13: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde. `test_ticket_y_mensaje_en_vivo` y `test_mandar_abre_whatsapp_con_el_mensaje` siguen pasando porque el mensaje completo no cambió.

---

### Task 3: La base común, la cabecera del sitio y la página de Decoradas

**Files:**
- Create: `comun/base.css`, `comun/ticket.css`, `comun/menu.js`
- Create: `decoradas/decoradas.css`
- Delete: `decoradas/comanda.css`
- Modify: `decoradas/index.html` (reescrito)
- Modify: `decoradas/movimiento.js` (sin el menú ni las flechas de las mesas)
- Test: `tests/decoradas/test_pagina.py`, `tests/decoradas/test_movimiento.py`

**Interfaces:**
- Produces: la cabecera común (el mismo marcado en las cuatro páginas, cambiando solo el prefijo `../` y el `aria-current`):
  - `.cab-nav` con cuatro enlaces en este orden: Nuestras tortas, Decoradas, Antojos, Nosotras (este último con `class="solo-ancho"`).
  - `a.mi-pedido[data-mi-pedido]` con `.mi-pedido-t` («Mi pedido») y `.mi-pedido-n[hidden]` (la cantidad). `carrito.js` (Task 7) lo busca por `[data-mi-pedido]`.
  - `details.menu` con los mismos cuatro enlaces.
- Produces: `comun/ticket.css` define `.ticket`, `.papel`, `.ticket-cab`, `.ticket-t`, `.ticket-lineas`, `.ticket-ir`, `.ticket-fijo`, `.ticket-pie`, `.mi-pedido*`. Task 7 le agrega el contador y el diálogo del pedido.
- Produces: en `decoradas/index.html`, el marcado que usa `pasos.js` (Task 4): `section.paso[data-n][id=paso-N]` con `h3.paso-t[tabindex=-1]`, `#cierre[data-n=7]` con `h2.cierre-t#cierre-t[tabindex=-1]`, `#avance[hidden]` con seis `<span>`, `#pasos-nav[hidden]` con `#pasos-falta`, `#volver`, `#siguiente` y `#siguiente-t`, y el enlace «Ver mi comanda» del paso 6 dentro de `p.solo-sin-js`.

- [ ] **Step 1: Escribir las pruebas de la página**

`tests/decoradas/test_pagina.py`:
```python
MENU = ["Nuestras tortas", "Decoradas", "Antojos", "Nosotras"]


def test_cabecera_del_sitio(abrir, sitio):
    pg = abrir()
    nav = pg.eval_on_selector_all(".cab-nav a", "as => as.map(a => [a.textContent, a.href])")
    assert nav == [["Nuestras tortas", sitio + "tortas/"], ["Decoradas", sitio + "decoradas/"],
                   ["Antojos", sitio + "antojos/"], ["Nosotras", sitio + "#nosotras"]]
    assert pg.get_attribute('.cab-nav a[aria-current="page"]', "href") == "../decoradas/"
    assert pg.get_attribute(".cab-marca", "href") == "../"
    assert pg.get_attribute(".cab [data-mi-pedido]", "href") == "../tortas/#pedido"
    assert pg.eval_on_selector_all(".menu nav a", "as => as.map(a => a.textContent)") == MENU


def test_la_pagina_es_solo_la_comanda(abrir):
    pg = abrir()
    for fuera in ("#carta", "#mesas", "#nosotras"):
        assert pg.locator(fuera).count() == 0, fuera
    assert pg.text_content(".ticket-portada h1") == "Armá tu torta."
    assert pg.text_content(".portada-sub") == "En seis pasos, y te la cotizamos por WhatsApp."
    assert pg.get_attribute(".ticket-portada .btn-2", "href") == "../tortas/"
    assert pg.text_content(".ticket-portada .btn-2") == "Ver nuestras tortas"
    assert pg.eval_on_selector_all(".pie-links a[href^='../']", "as => as.map(a => a.getAttribute('href'))") == \
        ["../tortas/", "../decoradas/", "../antojos/", "../#nosotras"]


def test_los_pasos_tienen_su_ancla_y_titulo_enfocable(abrir):
    pg = abrir()
    for n in range(1, 7):
        assert pg.get_attribute(f"#paso-{n} .paso-t", "tabindex") == "-1"
    assert pg.get_attribute("#cierre .cierre-t", "tabindex") == "-1"
    assert pg.is_hidden("#pasos-nav")
    assert pg.is_hidden("#avance")


def test_en_1100_el_menu_pasa_al_boton(abrir):
    pg = abrir(1000, 800)
    assert pg.is_hidden(".cab-nav")
    assert pg.is_visible(".menu summary")
    ancho = abrir(1440, 900)
    assert ancho.is_visible(".cab-nav")
    assert ancho.is_hidden(".menu summary")
```

En `tests/decoradas/test_movimiento.py`, borrar `test_flechas_de_las_mesas` y reemplazar `test_menu_se_cierra_al_elegir_y_con_escape` por:
```python
def test_menu_se_cierra_al_elegir_y_con_escape(abrir):
    pg = abrir(390, 844, is_mobile=True, has_touch=True)
    pg.click(".menu summary")
    assert pg.evaluate("document.querySelector('.menu').open")
    pg.keyboard.press("Escape")
    assert not pg.evaluate("document.querySelector('.menu').open")
    assert pg.evaluate("document.activeElement.tagName") == "SUMMARY"
    pg.click(".menu summary")
    # Elegir un enlace cierra el menú (acá no se navega para poder mirarlo).
    pg.evaluate("document.querySelector('.menu nav a').addEventListener('click', e => e.preventDefault())")
    pg.click(".menu nav a")
    assert not pg.evaluate("document.querySelector('.menu').open")
    pg.click(".menu summary")
    pg.mouse.click(5, 600)  # el margen de la portada: afuera del menú y sin enlaces
    assert not pg.evaluate("document.querySelector('.menu').open")
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `python -m pytest tests/decoradas/test_pagina.py tests/decoradas/test_movimiento.py -q -p no:cacheprovider`
Expected: FAIL (el menú viejo tiene «La carta»; existe `#carta`; el título dice «Lo soñás, lo creamos.»).

- [ ] **Step 3: `comun/base.css`**

```css
/* ============================================================
   SENTIDA · base común (TRAMA, 24/09/2026)
   La usan Decoradas, Nuestras tortas y Antojos: tokens, tipografías,
   botones, cabecera y pie. La home tiene home.css, con los mismos tokens.
   ============================================================ */

@font-face{font-family:Erode; src:url("../assets/fuentes/erode-400.woff2") format("woff2"); font-weight:400; font-display:swap}
@font-face{font-family:Erode; src:url("../assets/fuentes/erode-500.woff2") format("woff2"); font-weight:500; font-display:swap}
@font-face{font-family:Montserrat; src:url("../assets/fuentes/montserrat-latin.woff2") format("woff2"); font-weight:100 900; font-display:swap}
@font-face{font-family:"Montserrat respaldo"; src:local("Arial"), local("Helvetica"); size-adjust:109.2%; ascent-override:88.6%; descent-override:23%; line-gap-override:0%}
@font-face{font-family:"Erode respaldo"; src:local("Georgia"); size-adjust:94.4%; ascent-override:98.5%; descent-override:23.3%; line-gap-override:9.5%}

:root{
  --blanco:#FEFAF8;
  --crema:#F8EADE;
  --beige:#CFB59E;
  --celeste:#DDE6ED;          /* solo relleno chico, nunca texto */
  --marron:#402D21;
  --marron-medio:#6C4D38;
  --celeste-profundo:#46627A;
  --linea:rgba(207,181,158,.6);
  --sombra:rgba(64,45,33,.28);
  --velo:rgba(64,45,33,.45);

  --display:Erode, "Erode respaldo", Georgia, serif;
  --ui:Montserrat, "Montserrat respaldo", system-ui, sans-serif;
  --lateral:clamp(20px,4vw,56px);
  --ancho:1440px;
  --cab:69px;
}

*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
html{scroll-padding-top:calc(var(--cab) + 8px); scrollbar-color:var(--beige) var(--blanco)}
html.mov{scroll-behavior:smooth}
html,body{margin:0; background:var(--blanco); color:var(--marron); font-family:var(--ui); -webkit-font-smoothing:antialiased; overflow-x:clip}
a{color:var(--marron); text-decoration:none}
:where(a:hover){color:var(--marron-medio)}
img{display:block; max-width:100%; height:auto}
h1,h2,h3,p,ul,ol,dl,dd,figure{margin:0}
a:focus-visible,button:focus-visible,summary:focus-visible,[tabindex="0"]:focus-visible,
input:focus-visible,textarea:focus-visible{outline:2px solid var(--celeste-profundo); outline-offset:3px}
[tabindex="-1"]:focus{outline:none}
::selection{background:var(--celeste); color:var(--marron)}

.sr{position:absolute!important; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap}
.saltar{position:fixed; z-index:99; left:16px; top:-6rem; background:var(--marron); color:var(--blanco); padding:12px 16px; border-radius:2px; border:1px solid transparent}
.saltar:focus{top:16px; color:var(--blanco)}
.ico{width:1.15em; height:1.15em; flex:none; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round}
.ico-wa{fill:currentColor; stroke:none}
.display{font-family:var(--display); font-weight:500}
.envoltorio{max-width:var(--ancho); margin:0 auto; padding-inline:var(--lateral)}

/* Botones y enlaces */
.btn,.enlace,.cab-nav a,.menu summary{font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase}
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  min-height:48px; padding:0 22px; border:1px solid transparent; border-radius:2px;
  font-family:var(--ui); cursor:pointer; transition:background-color .2s, color .2s;
}
.btn .ico{width:16px; height:16px}
.btn-1{background:var(--marron); color:var(--blanco)}
.btn-1:hover{background:var(--marron-medio); color:var(--blanco)}
.btn-2{background:transparent; color:var(--marron); border-color:var(--marron)}
.btn-2:hover{background:var(--crema); color:var(--marron)}
.botones{display:flex; flex-wrap:wrap; gap:10px}
.enlace{display:inline-flex; align-items:center; gap:8px; min-height:44px; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:7px}
.enlace .ico{width:14px; height:14px}
.enlace-btn{background:none; border:0; padding:0; min-height:44px; font:inherit; font-size:14px; color:var(--marron); text-decoration:underline; text-underline-offset:5px; cursor:pointer}

/* ------------------------------------------------------------
   Cabecera: el mismo contenido en las cuatro páginas
   ------------------------------------------------------------ */
.cab{position:fixed; top:0; left:0; right:0; z-index:60; background:var(--blanco); border-bottom:1px solid var(--linea)}
.cab-in{position:relative; max-width:var(--ancho); margin:0 auto; height:calc(var(--cab) - 1px); padding:0 var(--lateral); display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:24px}
.cab-nav{display:flex; gap:0 24px}
.cab-nav a{display:inline-flex; align-items:center; min-height:44px; white-space:nowrap}
.cab-nav a[aria-current="page"]{text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:7px}
.cab-nav .solo-ancho{display:none}
.cab-marca{display:flex; align-items:center; min-height:44px}
.cab-marca img{height:44px; width:auto}
.cab-acc{display:flex; justify-content:flex-end; align-items:center; gap:12px}
.menu{display:none}
.menu summary{list-style:none; cursor:pointer; display:inline-flex; align-items:center; gap:10px; min-height:44px; padding:0 14px; border:1px solid var(--marron); border-radius:2px}
.menu summary::-webkit-details-marker{display:none}
.menu-cerrar,.menu-i-cerrar,.menu[open] .menu-abrir,.menu[open] .menu-i-abrir{display:none}
.menu[open] .menu-cerrar,.menu[open] .menu-i-cerrar{display:inline}
.menu nav{position:absolute; top:100%; left:0; right:0; background:var(--blanco); border-bottom:1px solid var(--beige); padding:8px var(--lateral) 24px; display:flex; flex-direction:column; max-height:calc(100vh - var(--cab)); max-height:calc(100dvh - var(--cab)); overflow-y:auto; overscroll-behavior:contain}
.menu nav a{font-family:var(--display); font-size:26px; line-height:1.1; display:flex; align-items:center; min-height:56px; border-bottom:1px solid var(--linea)}
.menu nav a[aria-current="page"]{color:var(--marron-medio)}

/* ------------------------------------------------------------
   Pie
   ------------------------------------------------------------ */
.pie{background:var(--marron); color:var(--crema)}
.pie a{color:var(--crema)}
.pie a:hover{color:var(--blanco); text-decoration:underline; text-underline-offset:4px}
.pie :focus-visible{outline-color:var(--crema)}
.pie-in{padding-block:64px 40px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:40px}
.pie-marca{display:flex; align-items:center; gap:20px}
.pie-marca img{width:88px; height:88px; background:var(--blanco); border-radius:50%}
.pie-marca p{font-size:28px; line-height:1.1; color:var(--blanco)}
.pie-links{display:flex; flex-wrap:wrap; gap:16px 56px; font-size:13px; line-height:1.5}
.pie-links ul{list-style:none; padding:0}
.pie-links a{display:inline-flex; align-items:center; min-height:44px}
.pie-links p{padding-top:12px; line-height:1.9}
.pie-fin{padding-block:20px; border-top:1px solid var(--marron-medio); display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px; font-size:12px}

/* Con cuatro secciones, el menú entra entero recién desde 1100 px;
   «Nosotras», desde 1280 px (antes queda en el pie). */
@media (min-width:1280px){
  .cab-nav .solo-ancho{display:inline-flex}
}
@media (max-width:1099px){
  .cab-in{grid-template-columns:auto 1fr; gap:12px}
  .cab-nav{display:none}
  .menu{display:block}
}
@media (max-width:899px){
  :root{--cab:65px}
  .cab-marca img{height:38px}
}
@media (max-width:380px){
  .btn{padding:0 14px}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
}
```

- [ ] **Step 4: `comun/ticket.css` (primera parte: el ticket y «Mi pedido»)**

```css
/* ============================================================
   SENTIDA · el ticket de papel y «Mi pedido» (TRAMA, 24/09/2026)
   Lo usan las cuatro páginas: toma los tokens de base.css o de home.css.
   ============================================================ */

/* El ticket: papel con borde dentado y sombra que sigue el dentado */
.ticket{filter:drop-shadow(0 14px 16px var(--sombra))}
.papel{
  background:var(--blanco); padding:20px 20px 30px; font-variant-numeric:tabular-nums;
  -webkit-mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50% / 16px 100%;
          mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50% / 16px 100%;
}
.ticket-cab{display:flex; justify-content:space-between; gap:12px; padding-bottom:8px; border-bottom:1px solid var(--marron); font-size:11px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--marron-medio)}
.ticket-t{font-size:24px; margin:12px 0 4px}
.ticket-lineas > div{display:flex; justify-content:space-between; align-items:baseline; gap:16px; padding:7px 0; border-bottom:1px dashed var(--beige); font-size:13px; line-height:1.4}
.ticket-lineas dt{color:var(--marron-medio); flex:none}
.ticket-lineas dd{font-weight:600; text-align:right; overflow-wrap:anywhere}
.ticket-lineas dd.vacio{color:var(--marron-medio); font-weight:400}
/* En la comanda, cada línea lleva a su paso: un botón que se lee como texto. */
.ticket-ir{background:none; border:0; padding:0; min-height:24px; font:inherit; color:inherit; text-align:left; cursor:pointer; text-decoration:underline; text-decoration-color:var(--beige); text-underline-offset:3px}
.ticket-ir:hover{color:var(--marron)}
.ticket-ir:disabled{cursor:default; text-decoration:none}
.ticket-ir:focus-visible{outline:2px solid var(--celeste-profundo); outline-offset:2px}
.ticket-fijo{font-size:12px; line-height:1.5; color:var(--marron-medio); margin-top:10px}
.ticket-fijo strong{color:var(--marron); font-weight:600}
.ticket-pie{margin-top:12px; padding-top:8px; border-top:1px solid var(--marron); font-size:12px; line-height:1.5; color:var(--marron-medio)}
.ticket-pie a{text-decoration:underline; text-underline-offset:3px}
.mov .ticket-lineas .nueva{animation:imprimir .3s cubic-bezier(.16,1,.3,1)}
@keyframes imprimir{from{transform:translateY(-6px); opacity:.2}}

/* «Mi pedido» en la cabecera */
.mi-pedido{display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 4px; font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--marron); white-space:nowrap}
.mi-pedido .ico{width:20px; height:20px}
.mi-pedido-n{display:inline-grid; place-items:center; min-width:22px; height:22px; padding:0 6px; border-radius:11px; background:var(--marron); color:var(--blanco); font-size:12px; letter-spacing:0}
@media (max-width:899px){
  .mi-pedido-t{position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap}
}
```

- [ ] **Step 5: `decoradas/decoradas.css`**

```css
/* ============================================================
   SENTIDA · Decoradas: la comanda (TRAMA, 24/09/2026)
   Sin JavaScript, los seis pasos se ven uno abajo del otro. Con
   JavaScript aparecen la tira del celular y, con pasos.js, un paso por
   vez (.en-pasos). El movimiento vive bajo .mov.
   ============================================================ */

/* ------------------------------------------------------------
   Portada: la comanda en blanco, al centro
   ------------------------------------------------------------ */
.portada{
  margin-top:var(--cab); min-height:calc(100svh - var(--cab)); background:var(--crema);
  display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,500px) minmax(0,1fr);
  grid-template-areas:"a t b" "baja baja baja"; align-items:center;
  column-gap:clamp(20px,4vw,64px); row-gap:28px; padding:clamp(32px,6vh,72px) var(--lateral) clamp(28px,5vh,56px);
}
.portada-foto{overflow:hidden; border-radius:2px}
.portada-foto img{width:100%; height:100%; object-fit:cover}
.portada-foto-a{grid-area:a; justify-self:end; width:min(100%,320px); aspect-ratio:1}
.portada-foto-b{grid-area:b; width:min(100%,280px); aspect-ratio:3/4; margin-top:14vh}
.ticket-portada{grid-area:t}
.ticket-portada .papel{padding:24px 24px 34px}
.portada h1{font-size:clamp(3rem,5vw,4.75rem); line-height:.9; letter-spacing:-.03em; margin:16px 0 12px}
.portada h1 span{display:block; color:var(--marron-medio)}
.portada-sub{font-size:15px; line-height:1.5; color:var(--marron-medio); margin-bottom:8px}
.ticket-portada .botones{margin-top:20px}
.portada-baja{grid-area:baja; justify-self:center; text-align:center; font-size:15px; line-height:1.6; color:var(--marron-medio); max-width:56ch}

/* ------------------------------------------------------------
   La comanda: pasos a la izquierda, panel fijo a la derecha
   ------------------------------------------------------------ */
.comanda{border-top:1px solid var(--beige)}
.comanda-in{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.pasos-col{padding:0 clamp(24px,4vw,72px) 0 max(var(--lateral), calc((100vw - var(--ancho)) / 2 + var(--lateral)))}
.pasos-t{font-size:clamp(1.75rem,2.6vw,2.5rem); line-height:1; padding-top:clamp(56px,10vh,96px)}
.paso{min-height:calc(100vh - var(--cab)); display:flex; flex-direction:column; justify-content:center; align-items:flex-start; gap:20px; padding-block:48px; border-bottom:1px solid var(--linea)}
.paso-n,.paso-sub{font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--celeste-profundo)}
.paso-sub{margin-top:8px}
.paso-t{font-size:clamp(2.25rem,4vw,3.75rem); line-height:.95; letter-spacing:-.025em}
.paso-ayuda{font-size:14px; line-height:1.55; color:var(--marron-medio); max-width:46ch}
.paso-foto{display:none}

.opciones{display:flex; flex-wrap:wrap; gap:10px}
.opcion{position:relative; display:inline-flex}
.opcion input{position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; cursor:pointer}
.opcion span{
  display:inline-flex; flex-direction:column; justify-content:center; min-height:52px; padding:10px 18px;
  border:1px solid var(--marron); border-radius:2px; background:var(--blanco);
  font-size:12px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; transition:background-color .2s, color .2s;
}
.opcion small{font-size:12px; font-weight:400; letter-spacing:0; text-transform:none; color:var(--marron-medio); margin-top:2px}
.opcion:hover span{background:var(--crema)}
.opcion input:checked + span{background:var(--marron); color:var(--blanco)}
.opcion input:checked + span small{color:var(--crema)}
.opcion input:focus-visible + span{outline:2px solid var(--celeste-profundo); outline-offset:3px}
.opcion-chica span{min-height:44px; padding:8px 14px}

.campo{display:flex; flex-direction:column; gap:8px; width:100%}
.campo-t{font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--marron-medio); line-height:1.5}
.campo-ayuda{font-size:14px; line-height:1.5; color:var(--marron-medio); margin-top:-4px}
.campo input,.campo textarea,#mensaje{
  font:inherit; font-size:16px; color:var(--marron); background:var(--blanco);
  border:1px solid var(--marron); border-radius:2px; padding:12px 14px; min-height:48px; width:min(100%,420px);
}
.campo textarea{min-height:110px; width:min(100%,520px); resize:vertical; line-height:1.5}
.campos-dos{display:flex; flex-wrap:wrap; gap:16px; width:100%}
.campos-dos .campo{width:auto; flex:1 1 180px}
.campos-dos input{width:100%}
.check{display:inline-flex; align-items:center; gap:10px; min-height:44px; font-size:15px; cursor:pointer}
.check input{width:20px; height:20px; margin:0; accent-color:var(--marron)}

.referencias{display:grid; grid-template-columns:repeat(5,minmax(0,112px)); gap:12px}
.ref-vacia{display:block; width:100%; aspect-ratio:1; border:1px dashed var(--beige); border-radius:2px; outline:2px solid transparent; outline-offset:2px}
.referencia input:checked + span .ref-vacia{outline-color:var(--marron)}
.referencia input:focus-visible + span .ref-vacia{outline-color:var(--celeste-profundo)}
.referencia{position:relative; display:block}
.referencia input{position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; cursor:pointer}
.referencia > span{display:flex; flex-direction:column; gap:8px}
.referencia img{width:100%; aspect-ratio:1; object-fit:cover; border-radius:2px; outline:2px solid transparent; outline-offset:2px}
.ref-t{align-self:flex-start; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; line-height:1.3; padding:2px 4px; border-radius:2px}
.referencia input:checked + span img{outline-color:var(--marron)}
.referencia input:checked + span .ref-t{background:var(--celeste)}
.referencia input:focus-visible + span img{outline-color:var(--celeste-profundo)}

.panel{position:sticky; top:var(--cab); height:calc(100vh - var(--cab)); align-self:start}
.panel-foto{position:absolute; inset:0; overflow:hidden; background:var(--crema)}
.panel-foto img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0}
.panel-foto[data-activo="1"] [data-foto="1"],.panel-foto[data-activo="2"] [data-foto="2"],
.panel-foto[data-activo="3"] [data-foto="3"],.panel-foto[data-activo="4"] [data-foto="4"],
.panel-foto[data-activo="5"] [data-foto="5"],.panel-foto[data-activo="6"] [data-foto="6"],
.panel-foto[data-activo="7"] [data-foto="7"]{opacity:1}
.mov .panel-foto img{transition:opacity .5s ease}
.panel-foto figcaption{position:absolute; left:20px; bottom:20px; background:var(--blanco); padding:6px 10px; border-radius:2px; font-size:13px; font-weight:500}
.panel-lugar{position:absolute; inset:0; display:flex; align-items:center; justify-content:flex-end; padding:24px clamp(20px,4vw,56px); pointer-events:none}
.panel-lugar .ticket{width:min(360px,100%); pointer-events:auto}

.cierre{padding-block:clamp(72px,12vh,120px); display:flex; flex-direction:column; gap:20px}
.cierre-t{font-size:clamp(2.5rem,4.6vw,4.25rem); line-height:.95; letter-spacing:-.025em}
.cierre-baja{font-size:16px; line-height:1.6; color:var(--marron-medio); max-width:46ch}
.campo-ademas{max-width:560px}
#envio{display:flex; flex-direction:column; gap:10px; align-items:flex-start}
#mensaje{width:100%; max-width:560px; min-height:280px; line-height:1.6; font-size:16px; resize:vertical}
.cierre-nadia a{display:inline-flex; align-items:center; min-height:44px; font-size:14px; text-decoration:underline; text-underline-offset:5px}

/* ------------------------------------------------------------
   Tira del ticket y diálogo (celular, con JavaScript)
   ------------------------------------------------------------ */
.tira{display:none}
.comanda-dialogo{border:0; padding:0; background:transparent; color:var(--marron); width:min(440px, calc(100vw - 24px)); max-height:calc(100dvh - 24px)}
.comanda-dialogo::backdrop{background:var(--velo)}
.dialogo-in{display:flex; flex-direction:column; gap:16px; padding:16px; max-height:inherit; overflow:auto; background:var(--crema); border-radius:2px}
.dialogo-t{font-size:28px}
.dialogo-editado{display:none; font-size:14px; line-height:1.5; color:var(--marron-medio)}
.dialogo-revisar{display:none}
.comanda-dialogo.editado .dialogo-editado{display:block}
.comanda-dialogo.editado .dialogo-revisar{display:inline-flex}
.comanda-dialogo.editado .dialogo-enviar{display:none}

/* ------------------------------------------------------------
   Tablet y celular
   ------------------------------------------------------------ */
@media (max-width:899px){
  .portada{grid-template-columns:1fr 1fr; grid-template-areas:"a b" "t t" "baja baja"; min-height:0; row-gap:20px}
  .portada-foto-a,.portada-foto-b{width:100%; margin:0; aspect-ratio:1; justify-self:stretch}
  .portada-baja{text-align:left; justify-self:start}

  .comanda-in{display:block}
  .pasos-col{padding:0 var(--lateral)}
  .panel{display:none}
  .paso{min-height:0; padding-block:56px}
  .paso-foto{display:block; width:100%; margin-top:8px}
  .paso-foto img{width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:2px}
  .paso-foto figcaption{margin-top:8px; font-size:13px; color:var(--marron-medio)}
  .referencias{grid-template-columns:repeat(2,minmax(0,1fr)); width:100%}

  /* Mientras se arma, la tira del ticket reemplaza a la cabecera. */
  .js.en-comanda .cab{visibility:hidden}
  .js.en-comanda .tira{
    display:flex; position:fixed; top:0; left:0; right:0; z-index:61; height:var(--cab);
    align-items:center; gap:12px; padding:0 var(--lateral); background:var(--blanco); border-bottom:1px solid var(--marron);
  }
  .tira-t{font-size:18px; flex:none}
  .tira-linea{flex:1; min-width:0; display:flex; flex-direction:column; gap:1px}
  .tira-et{font-size:11px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--marron-medio); line-height:1.3}
  .tira-val{font-size:13px; font-weight:600; line-height:1.25; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical}
  .tira-ver{flex:none; min-height:44px; padding:0 14px; background:var(--marron); color:var(--blanco); border:1px solid transparent; border-radius:2px; font-family:var(--ui); font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; cursor:pointer}
}

@media (max-width:429px){
  .tira-t{display:none}
}
```

Después: `git rm decoradas/comanda.css`.

- [ ] **Step 6: `comun/menu.js`**

```js
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
```

- [ ] **Step 7: `decoradas/movimiento.js` queda solo con el gesto**

Reemplazar todo el archivo por:
```js
/* SENTIDA · la comanda — el gesto de entrada.
   Al empezar, la comanda de la portada viaja a su lugar (el panel en
   escritorio, la tira en celular) y se muestra el paso donde quedaste. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : {matches: false}; };
  var quieto = mm('(prefers-reduced-motion: reduce)');
  var celular = mm('(max-width: 899px)');
  function actualizarMov() { doc.classList.toggle('mov', !quieto.matches); }
  if (quieto.addEventListener) quieto.addEventListener('change', actualizarMov);
  actualizarMov();

  var empezar = document.getElementById('empezar');
  var origen = document.querySelector('.ticket-portada .papel');
  var comanda = document.getElementById('comanda');
  var fecha = document.getElementById('fecha');
  if (!empezar || !origen || !comanda) return;

  empezar.addEventListener('click', function (ev) {
    ev.preventDefault();
    var desde = origen.getBoundingClientRect();
    var P = window.ComandaPasos;
    if (P) P.ir(P.actual() || 1);
    else {
      comanda.scrollIntoView({behavior: 'instant', block: 'start'});
      if (fecha) fecha.focus({preventScroll: true});
    }
    if (celular.matches) doc.classList.add('en-comanda');
    if (!doc.classList.contains('mov')) return;
    var destino = celular.matches ? document.getElementById('tira') : document.querySelector('.panel .ticket');
    if (!destino || !destino.animate) return;
    destino.getAnimations().forEach(function (a) { a.cancel(); });
    var hasta = destino.getBoundingClientRect();
    if (!hasta.width) return;
    var dx = desde.left - hasta.left, dy = desde.top - hasta.top, s = desde.width / hasta.width;
    destino.animate([
      {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', transformOrigin: 'top left'},
      {transform: 'none', transformOrigin: 'top left'}
    ], {duration: 700, easing: 'cubic-bezier(.16,1,.3,1)'});
  });
})();
```

- [ ] **Step 8: Reescribir `decoradas/index.html`**

Reemplazar todo el archivo por lo siguiente. Todo lo que no se menciona en «Interfaces» (los pasos, el panel, el diálogo) queda como estaba, sin «Lo charlamos» y con «¿Algo más?».
```html
<!doctype html>
<html lang="es-AR" class="sin-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex">
<title>Decoradas · Armá tu torta · SENTIDA Pastelería</title>
<meta name="description" content="Armá tu torta decorada paso a paso: fecha, tamaño, bizcochuelo, rellenos y decoración. Te la cotizamos por WhatsApp.">
<meta name="theme-color" content="#F8EADE">
<link rel="canonical" href="https://tramaid.github.io/sentida-pasteleria/decoradas/">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
<link rel="preload" href="../assets/fuentes/erode-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fuentes/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../comun/base.css">
<link rel="stylesheet" href="../comun/ticket.css">
<link rel="stylesheet" href="decoradas.css">
<script>
/* Sin JavaScript la página se ve completa y quieta: los seis pasos, uno
   abajo del otro. «js» habilita la tira del celular y los controles;
   «mov», el movimiento (si no se pidió reducirlo). */
(function (r) {
  r.classList.remove('sin-js'); r.classList.add('js');
  if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) r.classList.add('mov');
})(document.documentElement);
</script>
<script src="../comun/base.js" defer></script>
<script src="../comun/menu.js" defer></script>
<script src="mensaje.js" defer></script>
<script src="comanda.js" defer></script>
<script src="borrador.js" defer></script>
<script src="panel.js" defer></script>
<script src="movimiento.js" defer></script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-flecha" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></symbol>
  <symbol id="i-izq" viewBox="0 0 24 24"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5"/></symbol>
  <symbol id="i-diagonal" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-cerrar" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>
  <symbol id="i-bolsa" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.5H6.2L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></symbol>
  <symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.17.25-.63.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06s.89 2.39 1.01 2.56c.13.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.46-.6 1.67-1.18.2-.57.2-1.07.14-1.17-.06-.11-.22-.17-.47-.29Z"/></symbol>
</svg>
<a class="saltar" href="#comanda">Saltar a la comanda</a>
<p id="nueva-pestana" hidden>Se abre WhatsApp o Instagram en otra pestaña.</p>
<p class="sr" id="anuncio" aria-live="polite"></p>

<header class="cab">
  <div class="cab-in">
    <nav class="cab-nav" aria-label="Secciones">
      <a href="../tortas/">Nuestras tortas</a><a href="../decoradas/" aria-current="page">Decoradas</a><a href="../antojos/">Antojos</a><a href="../#nosotras" class="solo-ancho">Nosotras</a>
    </nav>
    <a class="cab-marca" href="../" aria-label="SENTIDA Pastelería, inicio"><img src="../assets/logo-sentida.svg" alt="SENTIDA Pastelería" width="116" height="44"></a>
    <div class="cab-acc">
      <a class="mi-pedido" href="../tortas/#pedido" data-mi-pedido><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-bolsa"/></svg><span class="mi-pedido-t">Mi pedido</span><span class="mi-pedido-n" hidden>0</span></a>
      <details class="menu">
        <summary><span class="menu-abrir">Menú</span><span class="menu-cerrar">Cerrar</span><svg class="ico menu-i-abrir" aria-hidden="true" focusable="false"><use href="#i-menu"/></svg><svg class="ico menu-i-cerrar" aria-hidden="true" focusable="false"><use href="#i-cerrar"/></svg></summary>
        <nav aria-label="Menú">
          <a href="../tortas/">Nuestras tortas</a>
          <a href="../decoradas/" aria-current="page">Decoradas</a>
          <a href="../antojos/">Antojos</a>
          <a href="../#nosotras">Nosotras</a>
        </nav>
      </details>
    </div>
  </div>
</header>

<div class="tira" id="tira" hidden>
  <span class="tira-t display">Tu torta</span>
  <span class="tira-linea" id="tira-linea"><span class="tira-et">Paso 1</span><span class="tira-val">Empezá por la fecha</span></span>
  <button type="button" class="tira-ver" aria-label="Ver comanda" aria-haspopup="dialog" aria-controls="comanda-dialogo" aria-expanded="false">Ver</button>
</div>

<main id="contenido">

<section class="portada" id="inicio" aria-labelledby="portada-t">
  <figure class="portada-foto portada-foto-a"><img src="../assets/fotos/numero-15.webp" srcset="../assets/fotos/numero-15-480.webp 480w, ../assets/fotos/numero-15.webp 766w" sizes="(max-width: 899px) 45vw, 22vw" width="766" height="766" alt="Torta número 15 con macarons, merenguitos y rosas"></figure>
  <div class="ticket ticket-portada">
    <div class="papel">
      <div class="ticket-cab"><span>SENTIDA · Pastelería</span><span>Comanda nº&nbsp;—</span></div>
      <h1 class="display" id="portada-t">Armá <span>tu torta.</span></h1>
      <p class="portada-sub">En seis pasos, y te la cotizamos por WhatsApp.</p>
      <dl class="ticket-lineas">
        <div><dt>Fecha</dt><dd class="vacio">…</dd></div>
        <div><dt>Tamaño</dt><dd class="vacio">…</dd></div>
        <div><dt>Bizcochuelo</dt><dd class="vacio">…</dd></div>
        <div><dt>Rellenos</dt><dd class="vacio">…</dd></div>
        <div><dt>Decoración</dt><dd class="vacio">…</dd></div>
      </dl>
      <div class="botones">
        <a class="btn btn-1" href="#comanda" id="empezar">Empezar mi comanda</a>
        <a class="btn btn-2" href="../tortas/">Ver nuestras tortas</a>
      </div>
    </div>
  </div>
  <figure class="portada-foto portada-foto-b"><img src="../assets/fotos/letra-f.webp" srcset="../assets/fotos/letra-f-480.webp 480w, ../assets/fotos/letra-f-800.webp 800w, ../assets/fotos/letra-f.webp 1000w" sizes="(max-width: 899px) 45vw, 20vw" width="1000" height="1333" alt="Torta con forma de letra F, con macarons, rosas y chocolate blanco"></figure>
  <p class="portada-baja">Tortas decoradas hechas a mano por Anto y Nadia en Martínez, San Isidro.</p>
</section>

<section class="comanda" id="comanda" aria-labelledby="comanda-t">
  <div class="comanda-in">
    <div class="pasos-col">
      <h2 class="display pasos-t" id="comanda-t">Armá tu torta, paso a paso.</h2>
      <div class="avance" id="avance" aria-hidden="true" hidden><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <form class="pasos" id="armado" action="#cierre">

        <section class="paso" id="paso-1" data-n="1" aria-labelledby="paso-1-t">
          <p class="paso-n">Paso 1 de 6</p>
          <h3 class="paso-t display" id="paso-1-t" tabindex="-1">¿Para cuándo?</h3>
          <div class="campo">
            <label class="campo-t" for="fecha">Fecha</label>
            <input type="date" id="fecha" name="fecha">
          </div>
          <label class="check"><input type="checkbox" id="sin-fecha" name="sin-fecha" value="1"> Todavía no sé</label>
          <p class="paso-ayuda">Trabajamos con cupo por día: te confirmamos si la fecha está libre.</p>
          <figure class="paso-foto"><img src="../assets/fotos/hero-flores-640.webp" width="1220" height="1600" alt="Torta alta con rombos pintados a mano y una corona de flores naturales" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · torta con flores naturales</figcaption></figure>
        </section>

        <section class="paso" id="paso-2" data-n="2" aria-labelledby="paso-2-t">
          <p class="paso-n">Paso 2 de 6</p>
          <h3 class="paso-t display" id="paso-2-t" tabindex="-1">¿Para cuántos?</h3>
          <div class="opciones" role="radiogroup" aria-labelledby="paso-2-t">
            <label class="opcion"><input type="radio" name="tamano" value="chica"><span>Chica <small>10 a 12 porciones</small></span></label>
            <label class="opcion"><input type="radio" name="tamano" value="mediana"><span>Mediana <small>15 a 25 porciones</small></span></label>
            <label class="opcion"><input type="radio" name="tamano" value="grande"><span>Grande <small>20 a 30 porciones</small></span></label>
          </div>
          <figure class="paso-foto"><img src="../assets/fotos/dos-pisos-480.webp" width="931" height="932" alt="Torta de dos pisos turquesa con una cascada de flores naturales" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · torta de dos pisos</figcaption></figure>
        </section>

        <section class="paso" id="paso-3" data-n="3" aria-labelledby="paso-3-t">
          <p class="paso-n">Paso 3 de 6</p>
          <h3 class="paso-t display" id="paso-3-t" tabindex="-1">¿Qué bizcochuelo?</h3>
          <div class="opciones" role="radiogroup" aria-labelledby="paso-3-t">
            <label class="opcion"><input type="radio" name="bizcochuelo" value="vainilla"><span>Vainilla</span></label>
            <label class="opcion"><input type="radio" name="bizcochuelo" value="chocolate"><span>Chocolate</span></label>
          </div>
          <figure class="paso-foto"><img src="../assets/fotos/carrot-cake-480.webp" width="1000" height="1250" alt="Carrot cake de tres capas con frosting" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · carrot cake</figcaption></figure>
        </section>

        <section class="paso" id="paso-4" data-n="4" aria-labelledby="paso-4-t">
          <p class="paso-n">Paso 4 de 6</p>
          <h3 class="paso-t display" id="paso-4-t" tabindex="-1">¿Con qué la rellenamos?</h3>
          <div class="opciones" role="radiogroup" aria-labelledby="paso-4-t">
            <label class="opcion"><input type="radio" name="relleno" value="ddl"><span>Dulce de leche</span></label>
            <label class="opcion"><input type="radio" name="relleno" value="butter-choco"><span>Butter choco</span></label>
          </div>
          <p class="paso-sub" id="agregados-t">Agregados, si querés</p>
          <div class="opciones" role="group" aria-labelledby="agregados-t">
            <label class="opcion opcion-chica"><input type="checkbox" name="agregado" value="bombon"><span>Bombón</span></label>
            <label class="opcion opcion-chica"><input type="checkbox" name="agregado" value="merenguitos"><span>Merenguitos</span></label>
            <label class="opcion opcion-chica"><input type="checkbox" name="agregado" value="chips"><span>Chips</span></label>
            <label class="opcion opcion-chica"><input type="checkbox" name="agregado" value="nuez"><span>Nuez</span></label>
            <label class="opcion opcion-chica"><input type="checkbox" name="agregado" value="mani"><span>Maní</span></label>
          </div>
          <figure class="paso-foto"><img src="../assets/fotos/marquise-480.webp" width="1000" height="960" alt="Marquise con dulce de leche, crema y frutillas" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · marquise</figcaption></figure>
        </section>

        <section class="paso" id="paso-5" data-n="5" aria-labelledby="paso-5-t">
          <p class="paso-n">Paso 5 de 6</p>
          <h3 class="paso-t display" id="paso-5-t" tabindex="-1">¿Y el segundo relleno?</h3>
          <div class="opciones" role="radiogroup" aria-labelledby="paso-5-t">
            <label class="opcion"><input type="radio" name="relleno2" value="frutos-rojos"><span>Frutos rojos</span></label>
            <label class="opcion"><input type="radio" name="relleno2" value="oreo"><span>Crema Oreo</span></label>
            <label class="opcion"><input type="radio" name="relleno2" value="bonobon"><span>Crema Bon o Bon</span></label>
            <label class="opcion"><input type="radio" name="relleno2" value="chocotorta"><span>Crema Chocotorta</span></label>
            <label class="opcion"><input type="radio" name="relleno2" value="kinder"><span>Crema Kinder</span></label>
          </div>
          <figure class="paso-foto"><img src="../assets/fotos/sablee-ddl-480.webp" width="900" height="1200" alt="Tarta sablée con dulce de leche, crema y frutos rojos" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · sablée con frutos rojos</figcaption></figure>
        </section>

        <section class="paso" id="paso-6" data-n="6" aria-labelledby="paso-6-t">
          <p class="paso-n">Paso 6 de 6</p>
          <h3 class="paso-t display" id="paso-6-t" tabindex="-1">¿Cómo la imaginás?</h3>
          <div class="campo">
            <label class="campo-t" for="idea">Tu idea</label>
            <p class="campo-ayuda" id="idea-ayuda">Temática, colores, lo que se te ocurra.</p>
            <textarea id="idea" name="idea" rows="3" aria-describedby="idea-ayuda"></textarea>
          </div>
          <p class="paso-sub" id="referencia-t">Una referencia, si querés</p>
          <div class="referencias" role="radiogroup" aria-labelledby="referencia-t">
            <label class="referencia"><input type="radio" name="referencia" value="petalos"><span><img src="../assets/fotos/torta-petalos-480.webp" width="960" height="1280" alt="" loading="lazy" decoding="async"><span class="ref-t">Pétalos</span></span></label>
            <label class="referencia"><input type="radio" name="referencia" value="flores"><span><img src="../assets/fotos/hero-flores-640.webp" width="1220" height="1600" alt="" loading="lazy" decoding="async"><span class="ref-t">Flores naturales</span></span></label>
            <label class="referencia"><input type="radio" name="referencia" value="letras"><span><img src="../assets/fotos/letra-f-480.webp" width="1000" height="1333" alt="" loading="lazy" decoding="async"><span class="ref-t">Letras y números</span></span></label>
            <label class="referencia"><input type="radio" name="referencia" value="mensaje"><span><img src="../assets/fotos/hello-30-480.webp" width="731" height="1300" alt="" loading="lazy" decoding="async"><span class="ref-t">Con mensaje</span></span></label>
            <label class="referencia"><input type="radio" name="referencia" value="" checked><span><span class="ref-vacia" aria-hidden="true"></span><span class="ref-t">Sin referencia</span></span></label>
          </div>
          <div class="campos-dos">
            <div class="campo">
              <label class="campo-t" for="nombre-torta">Nombre en la torta</label>
              <input type="text" id="nombre-torta" name="nombre-torta" autocomplete="off">
            </div>
            <div class="campo">
              <label class="campo-t" for="numero">Número o edad</label>
              <input type="text" id="numero" name="numero" inputmode="numeric" maxlength="3" autocomplete="off">
            </div>
          </div>
          <p class="paso-ayuda">Incluye nombre, número en chocolate, decoraciones básicas, velita y detalles en buttercream. Flores naturales y figuras especiales se cotizan aparte.</p>
          <p class="solo-sin-js"><a class="btn btn-1" href="#cierre">Ver mi comanda</a></p>
          <figure class="paso-foto"><img src="../assets/fotos/torta-petalos-480.webp" width="960" height="1280" alt="Torta alta cubierta de pétalos de flores comestibles" loading="lazy" decoding="async"><figcaption>Hecha por nosotras · torta de pétalos</figcaption></figure>
        </section>
      </form>

      <div class="cierre" id="cierre" data-n="7">
        <h2 class="display cierre-t" id="cierre-t" tabindex="-1">Tu comanda está lista.</h2>
        <p class="cierre-baja">Revisala y mandala. En WhatsApp todavía la podés corregir antes de enviar. Te respondemos con precio y disponibilidad.</p>
        <div class="campo campo-ademas" id="campo-ademas" hidden>
          <label class="campo-t" for="ademas">¿Algo más que tengamos que saber?</label>
          <p class="campo-ayuda" id="ademas-ayuda">Un sabor que no estaba, una alergia, un detalle que no querés que se nos pase.</p>
          <textarea id="ademas" name="ademas" form="armado" rows="3" aria-describedby="ademas-ayuda"></textarea>
        </div>
        <form id="envio" action="https://wa.me/5491158300787" method="get" target="_blank" data-numero="5491158300787">
          <label class="campo-t" for="mensaje">Tu mensaje</label>
          <textarea id="mensaje" name="text" rows="11">Hola SENTIDA, les paso mi comanda:
Fecha: 
Tamaño: 
Bizcochuelo: 
Relleno: 
Segundo relleno: 
Decoración: </textarea>
          <p class="reescribir-p"><button type="button" class="enlace-btn" id="reescribir" hidden>Volver a escribirla con mis elecciones</button></p>
          <div class="botones">
            <button class="btn btn-1" type="submit"><svg class="ico ico-wa" aria-hidden="true" focusable="false"><use href="#i-whatsapp"/></svg>Mandar por WhatsApp a Anto</button>
            <button class="btn btn-2" type="button" id="reiniciar" hidden>Empezar de nuevo</button>
          </div>
          <p class="cierre-nadia"><a href="https://wa.me/5491131459646?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido." target="_blank" rel="noopener" aria-describedby="nueva-pestana">¿Preferís escribirle a Nadia? 11&nbsp;3145&#8209;9646</a></p>
        </form>
      </div>

      <div class="pasos-nav" id="pasos-nav" hidden>
        <p class="pasos-falta" id="pasos-falta" aria-live="polite"></p>
        <button type="button" class="btn btn-2" id="volver"><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-izq"/></svg>Volver</button>
        <button type="button" class="btn btn-1" id="siguiente" aria-describedby="pasos-falta"><span id="siguiente-t">Siguiente</span><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-flecha"/></svg></button>
      </div>
    </div>

    <aside class="panel" aria-label="Tu comanda">
      <figure class="panel-foto" data-activo="1">
        <img data-foto="1" data-pie="torta con flores naturales" src="../assets/fotos/hero-flores-960.webp" srcset="../assets/fotos/hero-flores-640.webp 640w, ../assets/fotos/hero-flores-960.webp 960w, ../assets/fotos/hero-flores-1220.webp 1220w" sizes="50vw" width="1220" height="1600" alt="" loading="lazy" decoding="async">
        <img data-foto="2" data-pie="torta de dos pisos" src="../assets/fotos/dos-pisos.webp" srcset="../assets/fotos/dos-pisos-480.webp 480w, ../assets/fotos/dos-pisos-800.webp 800w, ../assets/fotos/dos-pisos.webp 931w" sizes="50vw" width="931" height="932" alt="" loading="lazy" decoding="async">
        <img data-foto="3" data-pie="carrot cake" src="../assets/fotos/carrot-cake.webp" srcset="../assets/fotos/carrot-cake-480.webp 480w, ../assets/fotos/carrot-cake-800.webp 800w, ../assets/fotos/carrot-cake.webp 1000w" sizes="50vw" width="1000" height="1250" alt="" loading="lazy" decoding="async">
        <img data-foto="4" data-pie="marquise" src="../assets/fotos/marquise.webp" srcset="../assets/fotos/marquise-480.webp 480w, ../assets/fotos/marquise-800.webp 800w, ../assets/fotos/marquise.webp 1000w" sizes="50vw" width="1000" height="960" alt="" loading="lazy" decoding="async">
        <img data-foto="5" data-pie="sablée con frutos rojos" src="../assets/fotos/sablee-ddl.webp" srcset="../assets/fotos/sablee-ddl-480.webp 480w, ../assets/fotos/sablee-ddl-800.webp 800w, ../assets/fotos/sablee-ddl.webp 900w" sizes="50vw" width="900" height="1200" alt="" loading="lazy" decoding="async">
        <img data-foto="6" data-pie="torta de pétalos" src="../assets/fotos/torta-petalos.webp" srcset="../assets/fotos/torta-petalos-480.webp 480w, ../assets/fotos/torta-petalos-800.webp 800w, ../assets/fotos/torta-petalos.webp 960w" sizes="50vw" width="960" height="1280" alt="" loading="lazy" decoding="async">
        <img data-foto="7" data-pie="Anto con una torta de pétalos" src="../assets/fotos/anto-torta-flores.webp" srcset="../assets/fotos/anto-torta-flores-480.webp 480w, ../assets/fotos/anto-torta-flores-800.webp 800w, ../assets/fotos/anto-torta-flores.webp 1000w" sizes="50vw" width="1000" height="1333" alt="" loading="lazy" decoding="async">
        <figcaption id="panel-pie">Hecha por nosotras · torta con flores naturales</figcaption>
      </figure>
      <div class="panel-lugar">
        <div class="ticket" data-ticket>
          <div class="papel">
            <div class="ticket-cab"><span>SENTIDA · Pastelería</span><span>Comanda nº&nbsp;—</span></div>
            <p class="ticket-t display">Tu torta</p>
            <dl class="ticket-lineas">
              <div data-clave="fecha"><dt>Fecha</dt><dd class="vacio">…</dd></div>
              <div data-clave="tamano"><dt>Tamaño</dt><dd class="vacio">…</dd></div>
              <div data-clave="bizcochuelo"><dt>Bizcochuelo</dt><dd class="vacio">…</dd></div>
              <div data-clave="relleno"><dt>Relleno</dt><dd class="vacio">…</dd></div>
              <div data-clave="relleno2"><dt>Segundo relleno</dt><dd class="vacio">…</dd></div>
              <div data-clave="decoracion"><dt>Decoración</dt><dd class="vacio">…</dd></div>
            </dl>
            <p class="ticket-fijo"><strong>Cobertura:</strong> buttercream de vainilla</p>
            <p class="ticket-fijo"><strong>Incluye:</strong> nombre, número en chocolate, decoraciones básicas, velita y detalles en buttercream.</p>
            <p class="ticket-fijo">Flores naturales y figuras especiales se cotizan aparte.</p>
            <p class="ticket-pie">Sin conservantes · Por encargo · Retiro en Martínez o envío en Zona Norte</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</section>

</main>

<footer class="pie">
  <div class="pie-in envoltorio">
    <div class="pie-marca">
      <img src="../assets/SENTIDASELLO.svg" alt="" width="88" height="88" loading="lazy">
      <p class="display">Lo soñás,<br>lo creamos.</p>
    </div>
    <nav class="pie-links" aria-label="Pie">
      <ul role="list">
        <li><a href="../tortas/">Nuestras tortas</a></li>
        <li><a href="../decoradas/">Decoradas</a></li>
        <li><a href="../antojos/">Antojos</a></li>
        <li><a href="../#nosotras">Nosotras</a></li>
      </ul>
      <ul role="list">
        <li><a href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido." target="_blank" rel="noopener" aria-describedby="nueva-pestana">WhatsApp</a></li>
        <li><a href="https://www.instagram.com/sentidapasteleria/" target="_blank" rel="noopener" aria-describedby="nueva-pestana">@sentidapasteleria</a></li>
      </ul>
      <p>Martínez, San Isidro<br>Solo por encargo</p>
    </nav>
  </div>
  <div class="pie-fin envoltorio"><span>© 2026 SENTIDA Pastelería</span><span>Propuesta de TRAMA</span></div>
</footer>

<dialog class="comanda-dialogo" id="comanda-dialogo" aria-labelledby="dialogo-t">
  <div class="dialogo-in">
    <p class="dialogo-t display" id="dialogo-t">Tu comanda</p>
    <div class="ticket" data-ticket>
      <div class="papel">
        <dl class="ticket-lineas"></dl>
        <p class="ticket-fijo"><strong>Cobertura:</strong> buttercream de vainilla</p>
        <p class="ticket-fijo"><strong>Incluye:</strong> nombre, número en chocolate, decoraciones básicas, velita y detalles en buttercream.</p>
      </div>
    </div>
    <p class="dialogo-editado">Editaste el mensaje a mano, así que se manda tu versión. Revisalo antes de enviar.</p>
    <div class="botones">
      <button class="btn btn-1 dialogo-enviar" type="submit" form="envio"><svg class="ico ico-wa" aria-hidden="true" focusable="false"><use href="#i-whatsapp"/></svg>Mandar por WhatsApp a Anto</button>
      <a class="btn btn-1 dialogo-revisar" href="#cierre">Revisar mi mensaje</a>
      <button class="btn btn-2" type="button" id="dialogo-cerrar">Seguir armando</button>
    </div>
  </div>
</dialog>
</body>
</html>
```

- [ ] **Step 9: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde. Si `test_teclado_recorre_todo_con_foco_visible` falla por tener menos de 30 paradas (la página perdió la carta y las mesas), bajar el umbral a `visitados > 20` con un comentario que lo explique.

---

### Task 4: La comanda, un paso por vez

**Files:**
- Create: `decoradas/pasos.js`
- Modify: `decoradas/comanda.js` (cada línea del ticket es un botón)
- Modify: `decoradas/panel.js` (reescrito: la foto sigue al paso, no al scroll)
- Modify: `decoradas/decoradas.css` (se agrega el bloque «Un paso por vez»)
- Modify: `decoradas/index.html` (carga `pasos.js`)
- Create: `tests/decoradas/ayuda_decoradas.py`, `tests/decoradas/test_pasos.py`
- Modify (reescritos): `tests/decoradas/test_armado.py`, `test_panel.py`, `test_movimiento.py`, `test_revision.py`, `test_borrador.py`, `test_sin_js.py`, `test_aceptacion.py`

**Interfaces:**
- Consumes: `window.Comanda` (`leer`, `render`, `alCambiar(fn(estado, nueva, lineas, motivo))`), `window.ComandaMensaje` (`falta`, `primerIncompleto`), el marcado de Task 3.
- Consumes (opcional, llega en Task 5): `window.ComandaBorrador.paso() -> {actual, alcanzado} | null` y `.guardarPaso({actual, alcanzado})`. Sin él, `pasos.js` arranca en el paso 1.
- Produces: `window.ComandaPasos`:
  - `ir(n, opts?)` — muestra el paso `n` (1 a 7). `opts`: `sinHistoria`, `reemplazar`, `sinScroll`, `foco` (`false` para no mover el foco). Ir a 7 con pasos obligatorios sin completar lleva al primero que falte, con su aviso.
  - `actual() -> number`
  - `siguiente()` — lo mismo que tocar Siguiente
  - `alCambiar(fn(n))` — avisa cada cambio de paso; si ya hay uno, llama enseguida.
- Produces: `<html class="en-pasos">` mientras `pasos.js` maneja la página; los pasos que no se ven llevan `hidden`; cada cambio de paso guarda `#paso-N` (o `#cierre`) en el historial.
- Produces: cada línea de los tickets de la comanda es `<div data-clave><dt><button class="ticket-ir" aria-label="Cambiar: Etiqueta">Etiqueta</button></dt><dd>…</dd></div>`.

- [ ] **Step 1: Las ayudas de las pruebas**

`tests/decoradas/ayuda_decoradas.py`:
```python
"""Ayudas para recorrer la comanda paso a paso en las pruebas."""


def visibles(pg):
    """Los pasos que se ven (1 a 7)."""
    return pg.evaluate(
        "[...document.querySelectorAll('.paso[data-n], #cierre')].filter(p => !p.hidden).map(p => +p.dataset.n)")


def siguiente(pg):
    pg.click("#siguiente")


def atras(pg):
    """El botón atrás del navegador (navegación dentro del mismo documento)."""
    pg.evaluate("history.back()")
    pg.wait_for_timeout(150)


def adelante(pg):
    pg.evaluate("history.forward()")
    pg.wait_for_timeout(150)


def completar(pg, n):
    """Elige lo del paso n como en la especificación (7/11, mediana, vainilla…)."""
    if n == 1:
        pg.fill("#fecha", "2026-11-07")
    elif n == 2:
        pg.check("input[name=tamano][value=mediana]")
    elif n == 3:
        pg.check("input[name=bizcochuelo][value=vainilla]")
    elif n == 4:
        pg.check("input[name=relleno][value=ddl]")
        pg.check("input[name=agregado][value=nuez]")
        pg.check("input[name=agregado][value=chips]")
    elif n == 5:
        pg.check("input[name=relleno2][value=frutos-rojos]")
    elif n == 6:
        pg.fill("#idea", "flores naturales en tonos pastel")
        pg.check("input[name=referencia][value=flores]")
        pg.fill("#nombre-torta", "Mamá")
        pg.fill("#numero", "60")


def armar(pg, hasta=7):
    """Completa los pasos 1 a hasta-1 con Siguiente y queda parada en `hasta`."""
    for n in range(1, hasta):
        completar(pg, n)
        siguiente(pg)
    assert visibles(pg) == [hasta]
```

- [ ] **Step 2: Las pruebas del paso a paso**

`tests/decoradas/test_pasos.py`:
```python
from ayuda_decoradas import adelante, armar, atras, completar, siguiente, visibles

CEL = dict(is_mobile=True, has_touch=True)
FALTA_FECHA = "Elegí una fecha o marcá «Todavía no sé»."


def test_se_ve_un_paso_por_vez(abrir):
    pg = abrir()
    assert "en-pasos" in pg.evaluate("document.documentElement.className")
    assert visibles(pg) == [1]
    assert pg.is_hidden("#volver")
    assert pg.get_attribute("#siguiente", "aria-disabled") == "true"
    assert pg.get_attribute("#avance", "data-paso") == "1"
    assert pg.errores == []


def test_siguiente_sin_respuesta_dice_que_falta(abrir):
    pg = abrir()
    siguiente(pg)
    assert visibles(pg) == [1]
    assert pg.text_content("#pasos-falta") == FALTA_FECHA
    assert pg.evaluate("document.activeElement.id") == "fecha"


def test_con_respuesta_avanza_y_vuelve(abrir):
    pg = abrir()
    pg.check("#sin-fecha")
    assert pg.get_attribute("#siguiente", "aria-disabled") is None
    siguiente(pg)
    assert visibles(pg) == [2]
    assert pg.evaluate("document.activeElement.id") == "paso-2-t"
    assert pg.is_visible("#volver")
    assert pg.url.endswith("#paso-2")
    assert pg.get_attribute("#avance", "data-paso") == "2"
    pg.click("#volver")
    assert visibles(pg) == [1]
    assert pg.is_checked("#sin-fecha")


def test_elegir_no_avanza_solo(abrir):
    pg = abrir()
    pg.check("#sin-fecha")
    siguiente(pg)
    pg.check("input[name=tamano][value=chica]")
    assert visibles(pg) == [2]


def test_paso_seis_se_puede_pasar_vacio_y_dice_ver_mi_comanda(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    assert pg.text_content("#siguiente-t") == "Ver mi comanda"
    assert pg.get_attribute("#siguiente", "aria-disabled") is None
    assert pg.is_hidden(".solo-sin-js")
    siguiente(pg)
    assert visibles(pg) == [7]
    assert pg.is_hidden("#siguiente")
    assert pg.is_visible("#volver")
    assert pg.url.endswith("#cierre")
    assert pg.evaluate("document.activeElement.id") == "cierre-t"


def test_atras_del_navegador_vuelve_un_paso(abrir):
    pg = abrir()
    armar(pg, hasta=4)
    atras(pg)
    assert visibles(pg) == [3]
    atras(pg)
    assert visibles(pg) == [2]
    adelante(pg)
    assert visibles(pg) == [3]


def test_atras_hasta_la_portada_y_adelante(abrir):
    pg = abrir()
    pg.click("#empezar")
    completar(pg, 1)
    siguiente(pg)
    pg.check("input[name=tamano][value=grande]")
    atras(pg)
    assert visibles(pg) == [1]
    atras(pg)
    assert pg.evaluate("location.hash") == ""
    adelante(pg)
    adelante(pg)
    assert visibles(pg) == [2]
    assert pg.is_checked("input[name=tamano][value=grande]")
    siguiente(pg)
    assert visibles(pg) == [3]
    assert pg.errores == []


def test_la_linea_del_ticket_lleva_a_su_paso(abrir):
    pg = abrir()
    armar(pg)
    pg.click('.panel [data-clave="bizcochuelo"] .ticket-ir')
    assert visibles(pg) == [3]
    assert pg.evaluate("document.activeElement.id") == "paso-3-t"
    assert pg.get_attribute('.panel [data-clave="bizcochuelo"] .ticket-ir', "aria-label") == "Cambiar: Bizcochuelo"


def test_no_se_salta_a_pasos_no_alcanzados(abrir):
    pg = abrir()
    assert pg.is_enabled('.panel [data-clave="fecha"] .ticket-ir')
    assert pg.is_disabled('.panel [data-clave="tamano"] .ticket-ir')
    pg.check("#sin-fecha")
    siguiente(pg)
    assert pg.is_enabled('.panel [data-clave="tamano"] .ticket-ir')
    assert pg.is_disabled('.panel [data-clave="bizcochuelo"] .ticket-ir')


def test_desde_el_dialogo_del_celular_se_salta_y_cierra(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    armar(pg, hasta=4)
    pg.click(".tira-ver")
    pg.click('#comanda-dialogo [data-clave="tamano"] .ticket-ir')
    pg.wait_for_timeout(100)
    assert not pg.evaluate("document.getElementById('comanda-dialogo').open")
    assert visibles(pg) == [2]
    assert pg.evaluate("document.activeElement.id") == "paso-2-t"


def test_entrar_con_un_paso_sin_los_anteriores_va_al_que_falta(abrir):
    pg = abrir(pagina="decoradas/#paso-5")
    assert visibles(pg) == [1]
    assert pg.url.endswith("#paso-1")


def test_el_cierre_con_la_fecha_borrada_vuelve_al_paso_uno(abrir):
    pg = abrir()
    armar(pg)
    pg.click('.panel [data-clave="fecha"] .ticket-ir')
    pg.fill("#fecha", "")
    pg.evaluate("ComandaPasos.ir(7)")
    assert visibles(pg) == [1]
    assert pg.text_content("#pasos-falta") == FALTA_FECHA


def test_enter_en_un_campo_avanza(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    pg.fill("#nombre-torta", "Lu")
    pg.press("#nombre-torta", "Enter")
    assert visibles(pg) == [7]
    assert "Nombre: Lu" in pg.input_value("#mensaje")


def test_enter_en_la_idea_no_avanza(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    pg.press("#idea", "Enter")
    assert visibles(pg) == [6]


def test_en_celular_la_barra_queda_abajo_y_a_la_vista(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    caja = pg.locator("#pasos-nav").bounding_box()
    assert caja["y"] + caja["height"] <= 844 + 1
    assert caja["y"] > 844 / 2


def test_sin_movimiento_cambia_de_paso_sin_animar(abrir):
    pg = abrir(reduced_motion="reduce")
    pg.check("#sin-fecha")
    siguiente(pg)
    assert pg.evaluate("document.getElementById('paso-2').getAnimations().length") == 0


def test_con_movimiento_la_pregunta_entra(abrir):
    pg = abrir()
    pg.check("#sin-fecha")
    siguiente(pg)
    assert pg.evaluate("document.getElementById('paso-2').getAnimations().length") == 1
```

- [ ] **Step 3: Reescribir las pruebas que suponían todos los pasos a la vista**

`tests/decoradas/test_armado.py` (reemplaza todo el archivo):
```python
from urllib.parse import unquote

from ayuda_decoradas import armar

ESPERADO = "\n".join([
    "Hola SENTIDA, les paso mi comanda:",
    "Fecha: sábado 7/11",
    "Tamaño: mediana (15 a 25 porciones)",
    "Bizcochuelo: vainilla",
    "Relleno: dulce de leche con chips y nuez",
    "Segundo relleno: frutos rojos",
    "Decoración: flores naturales en tonos pastel (como la de flores naturales)",
    "Nombre: Mamá",
    "Número: 60",
])


def texto_de(url):
    assert url.startswith("https://wa.me/5491158300787?text=")
    q = url.split("?text=", 1)[1]
    assert "+" not in q
    return unquote(q)


def test_ticket_y_mensaje_en_vivo(abrir):
    pg = abrir()
    assert pg.inner_text('.panel [data-clave="tamano"] dd') == "…"
    armar(pg)
    assert pg.input_value("#mensaje") == ESPERADO
    assert pg.inner_text('.panel [data-clave="relleno"] dd') == "dulce de leche con chips y nuez"
    assert pg.inner_text('.panel [data-clave="nombre"] dd') == "Mamá"
    assert pg.errores == []


def test_mandar_abre_whatsapp_con_el_mensaje(abrir):
    pg = abrir()
    armar(pg)
    with pg.context.expect_page() as nueva:
        pg.click("#envio button[type=submit]")
    assert texto_de(nueva.value.url) == ESPERADO


def test_no_hay_lo_charlamos(abrir):
    pg = abrir()
    assert pg.locator("input[value=charlamos]").count() == 0
    assert "charlamos" not in pg.text_content("#armado").lower()


def test_algo_mas_va_al_ticket_y_al_mensaje(abrir):
    pg = abrir()
    armar(pg)
    pg.fill("#ademas", "sin nuez, por favor")
    pg.keyboard.press("Tab")
    assert pg.text_content('.panel [data-clave="ademas"] dd') == "sin nuez, por favor"
    assert pg.input_value("#mensaje").endswith("\nAdemás: sin nuez, por favor")
    assert pg.text_content("#anuncio") == "Además: sin nuez, por favor"


def test_algo_mas_no_se_ve_sin_javascript(abrir):
    pg = abrir(java_script_enabled=False)
    assert pg.is_hidden("#campo-ademas")


def test_sin_fecha_limpia_la_fecha(abrir):
    pg = abrir()
    pg.fill("#fecha", "2026-11-07")
    pg.check("#sin-fecha")
    assert pg.input_value("#fecha") == ""
    assert "Fecha: a definir" in pg.input_value("#mensaje")
    pg.fill("#fecha", "2026-11-07")
    assert not pg.is_checked("#sin-fecha")


def test_mensaje_editado_a_mano_no_se_pisa(abrir):
    pg = abrir()
    armar(pg)
    pg.fill("#mensaje", "Hola, quiero algo especial")
    pg.click('.panel [data-clave="bizcochuelo"] .ticket-ir')
    pg.check("input[name=bizcochuelo][value=chocolate]")
    pg.evaluate("ComandaPasos.ir(7)")
    assert pg.input_value("#mensaje") == "Hola, quiero algo especial"
    assert pg.is_visible("#reescribir")
    pg.click("#reescribir")
    assert "Bizcochuelo: chocolate" in pg.input_value("#mensaje")
    assert pg.is_hidden("#reescribir")


def test_caracteres_raros_llegan_enteros(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    pg.fill("#idea", 'rosa & dorado #1, "vintage" 🌸')
    pg.click("#siguiente")
    with pg.context.expect_page() as nueva:
        pg.click("#envio button[type=submit]")
    assert 'Decoración: rosa & dorado #1, "vintage" 🌸' in texto_de(nueva.value.url)


def test_fecha_minima_es_hoy(abrir):
    pg = abrir()
    assert pg.get_attribute("#fecha", "min") == pg.evaluate(
        "(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()")
```

`tests/decoradas/test_panel.py` (reemplaza todo el archivo):
```python
from ayuda_decoradas import armar, completar, siguiente

CEL = dict(is_mobile=True, has_touch=True)


def test_foto_del_panel_sigue_al_paso(abrir):
    pg = abrir()
    assert pg.get_attribute(".panel-foto", "data-activo") == "1"
    armar(pg, hasta=4)
    assert pg.get_attribute(".panel-foto", "data-activo") == "4"
    for n in (4, 5):
        completar(pg, n)
        siguiente(pg)
    assert pg.get_attribute(".panel-foto", "data-activo") == "6"
    assert pg.text_content("#panel-pie") == "Hecha por nosotras · torta de pétalos"
    caja = pg.locator(".panel .ticket").bounding_box()
    assert caja["y"] >= 0 and caja["y"] + caja["height"] <= 900
    pg.click("#volver")
    assert pg.get_attribute(".panel-foto", "data-activo") == "5"


def test_tira_reemplaza_la_cabecera(abrir):
    pg = abrir(390, 844, **CEL)
    assert pg.locator("#tira").is_hidden()
    pg.click("#empezar")
    assert pg.locator("#tira").is_visible()
    assert pg.evaluate("getComputedStyle(document.querySelector('.cab')).visibility") == "hidden"
    completar(pg, 1)
    siguiente(pg)
    pg.check("input[name=tamano][value=chica]")
    assert pg.text_content(".tira-et") == "Tamaño"
    assert pg.text_content(".tira-val") == "chica (10 a 12 porciones)"
    pg.evaluate("document.querySelector('.pie').scrollIntoView({behavior: 'instant'})")
    pg.wait_for_timeout(500)
    assert pg.locator("#tira").is_hidden()


def test_dialogo_de_la_comanda(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    armar(pg, hasta=3)
    pg.check("input[name=bizcochuelo][value=chocolate]")
    pg.click(".tira-ver")
    assert pg.evaluate("document.getElementById('comanda-dialogo').open")
    assert pg.get_attribute(".tira-ver", "aria-expanded") == "true"
    assert pg.inner_text('#comanda-dialogo [data-clave="bizcochuelo"] dd') == "chocolate"
    pg.keyboard.press("Escape")
    assert not pg.evaluate("document.getElementById('comanda-dialogo').open")
    assert pg.evaluate("document.activeElement.classList.contains('tira-ver')")


def test_mandar_desde_el_dialogo(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    armar(pg, hasta=3)
    pg.check("input[name=bizcochuelo][value=vainilla]")
    pg.click(".tira-ver")
    with pg.context.expect_page() as nueva:
        pg.click("#comanda-dialogo button[type=submit]")
    assert "Bizcochuelo%3A%20vainilla" in nueva.value.url
```

`tests/decoradas/test_movimiento.py` (reemplaza todo el archivo; el test del menú es el de Task 3):
```python
def test_empezar_lleva_al_paso_y_enfoca_su_titulo(abrir):
    pg = abrir()
    pg.click("#empezar")
    pg.wait_for_timeout(80)
    assert pg.evaluate("document.activeElement.id") == "paso-1-t"
    assert pg.url.endswith("#paso-1")
    assert pg.evaluate("document.querySelector('.panel .ticket').getAnimations().length") == 1
    # Queda justo debajo de la cabecera fija (scroll-padding-top), no tapada por ella.
    margen = pg.evaluate("parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)")
    assert abs(pg.evaluate("document.getElementById('comanda').getBoundingClientRect().top") - margen) < 2
    pg.wait_for_timeout(900)
    assert pg.evaluate("document.getAnimations().filter(a => a.playState === 'running').length") == 0


def test_doble_toque_una_sola_animacion(abrir):
    pg = abrir()
    pg.click("#empezar")
    pg.evaluate("document.getElementById('empezar').click()")
    assert pg.evaluate("document.querySelector('.panel .ticket').getAnimations().length") == 1
    assert pg.errores == []


def test_empezar_en_celular_anima_la_tira(abrir):
    pg = abrir(390, 844, is_mobile=True, has_touch=True)
    pg.click("#empezar")
    pg.wait_for_timeout(80)
    assert pg.evaluate("document.getElementById('tira').getAnimations().length") == 1
    assert pg.evaluate("document.activeElement.id") == "paso-1-t"


def test_sin_movimiento_no_anima(abrir):
    pg = abrir(reduced_motion="reduce")
    assert "mov" not in pg.evaluate("document.documentElement.className").split()
    pg.click("#empezar")
    pg.wait_for_timeout(50)
    assert pg.evaluate("document.querySelector('.panel .ticket').getAnimations().length") == 0
    assert pg.evaluate("document.activeElement.id") == "paso-1-t"


def test_la_linea_nueva_se_imprime(abrir):
    pg = abrir()
    pg.check("#sin-fecha")
    assert pg.get_attribute('.panel [data-clave="fecha"]', "class") == "nueva"


def test_menu_se_cierra_al_elegir_y_con_escape(abrir):
    pg = abrir(390, 844, is_mobile=True, has_touch=True)
    pg.click(".menu summary")
    assert pg.evaluate("document.querySelector('.menu').open")
    pg.keyboard.press("Escape")
    assert not pg.evaluate("document.querySelector('.menu').open")
    assert pg.evaluate("document.activeElement.tagName") == "SUMMARY"
    pg.click(".menu summary")
    # Elegir un enlace cierra el menú (acá no se navega para poder mirarlo).
    pg.evaluate("document.querySelector('.menu nav a').addEventListener('click', e => e.preventDefault())")
    pg.click(".menu nav a")
    assert not pg.evaluate("document.querySelector('.menu').open")
    pg.click(".menu summary")
    pg.mouse.click(5, 600)  # el margen de la portada: afuera del menú y sin enlaces
    assert not pg.evaluate("document.querySelector('.menu').open")
```

`tests/decoradas/test_revision.py` (reemplaza todo el archivo):
```python
"""Hallazgos de la revisión final de la comanda: cada prueba reproduce uno."""
from urllib.parse import unquote

from ayuda_decoradas import armar

CEL = dict(is_mobile=True, has_touch=True)


def test_la_tira_no_corta_lo_elegido_en_360(abrir):
    pg = abrir(360, 740, **CEL)
    pg.click("#empezar")
    armar(pg, hasta=4)
    pg.check("input[name=relleno][value=ddl]")
    pg.check("input[name=agregado][value=chips]")
    pg.check("input[name=agregado][value=nuez]")
    assert pg.text_content(".tira-et") == "Relleno"
    assert pg.text_content(".tira-val") == "dulce de leche con chips y nuez"
    cortado = pg.evaluate("""(() => { const v = document.querySelector('.tira-val');
        return v.scrollWidth > v.clientWidth + 1 || v.scrollHeight > v.clientHeight + 1; })()""")
    assert not cortado


def test_escribir_la_idea_no_reimprime_ni_anuncia_cada_letra(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    pg.evaluate("""window.__anuncios = 0;
        new MutationObserver(() => window.__anuncios++).observe(document.getElementById('anuncio'),
            {childList: true, characterData: true, subtree: true});""")
    pg.click("#idea")
    pg.keyboard.type("flores rosas", delay=15)
    assert pg.evaluate("window.__anuncios") == 0
    assert pg.get_attribute('.panel [data-clave="decoracion"]', "class") != "nueva"
    assert pg.text_content('.panel [data-clave="decoracion"] dd') == "flores rosas"
    pg.keyboard.press("Tab")
    assert pg.text_content("#anuncio") == "Decoración: flores rosas"


def test_dialogo_avisa_si_el_mensaje_fue_editado(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    armar(pg)
    pg.fill("#mensaje", "Hola, quiero una chica")
    pg.click(".tira-ver")
    assert pg.is_visible("#comanda-dialogo .dialogo-editado")
    assert pg.is_hidden("#comanda-dialogo button[type=submit]")
    pg.click("#comanda-dialogo .dialogo-revisar")
    assert not pg.evaluate("document.getElementById('comanda-dialogo').open")
    assert pg.evaluate("document.activeElement.id") == "mensaje"
    assert pg.evaluate("document.getElementById('mensaje').getBoundingClientRect().top < innerHeight")


def test_dialogo_sin_edicion_manda_directo(abrir):
    pg = abrir(390, 844, **CEL)
    pg.click("#empezar")
    armar(pg, hasta=3)
    pg.click(".tira-ver")
    assert pg.is_hidden("#comanda-dialogo .dialogo-editado")
    assert pg.is_visible("#comanda-dialogo button[type=submit]")


def test_la_referencia_se_puede_sacar(abrir):
    pg = abrir()
    armar(pg, hasta=6)
    pg.check("input[name=referencia][value=petalos]")
    assert "como la de pétalos" in pg.input_value("#mensaje")
    pg.check("input[name=referencia][value='']")
    assert "Decoración: a definir" in pg.input_value("#mensaje")
    assert "pétalos" not in pg.input_value("#mensaje")


def test_el_mensaje_no_hace_zoom_en_iphone(abrir):
    pg = abrir(390, 844, **CEL)
    assert pg.evaluate("parseFloat(getComputedStyle(document.getElementById('mensaje')).fontSize)") >= 16


def test_empezar_de_nuevo_solo_aparece_cuando_sirve(abrir):
    pg = abrir()
    assert pg.evaluate("document.getElementById('reiniciar').hidden")
    pg.check("#sin-fecha")
    assert not pg.evaluate("document.getElementById('reiniciar').hidden")
    sin_js = abrir(java_script_enabled=False)
    assert sin_js.is_hidden("#reiniciar")
    assert sin_js.is_hidden("#reescribir")


def test_si_la_pestana_nueva_esta_bloqueada_va_en_la_misma(abrir):
    pg = abrir(390, 844, init="window.open = () => null;", **CEL)
    pg.click("#empezar")
    armar(pg)
    with pg.expect_navigation():
        pg.click("#envio button[type=submit]")
    assert pg.url.startswith("https://wa.me/5491158300787?text=")
    assert "Bizcochuelo: vainilla" in unquote(pg.url.split("?text=", 1)[1])
```

`tests/decoradas/test_borrador.py` (reemplaza todo el archivo; Task 5 le agrega más):
```python
from ayuda_decoradas import armar, visibles

CLAVE = "sentida-comanda-v1"


def test_el_borrador_sobrevive_la_recarga(abrir, sitio):
    pg = abrir()
    armar(pg, hasta=3)
    pg.goto(sitio + "decoradas/")
    pg.wait_for_load_state("networkidle")
    assert pg.is_checked("input[name=tamano][value=mediana]")
    assert "Tamaño: mediana (15 a 25 porciones)" in pg.input_value("#mensaje")
    assert pg.inner_text('.panel [data-clave="tamano"] dd') == "mediana (15 a 25 porciones)"


def test_empezar_de_nuevo_lo_borra(abrir, sitio):
    pg = abrir()
    armar(pg)
    pg.click("#reiniciar")
    assert visibles(pg) == [1]
    assert pg.evaluate("document.activeElement.id") == "fecha"
    assert pg.evaluate(f"localStorage.getItem('{CLAVE}')") is None
    pg.goto(sitio + "decoradas/")
    pg.wait_for_load_state("networkidle")
    assert not pg.is_checked("input[name=tamano][value=mediana]")


def test_borrador_con_fecha_pasada(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', JSON.stringify({{fecha:'2020-01-01', tamano:'chica'}}))")
    assert pg.input_value("#fecha") == ""
    assert pg.is_checked("input[name=tamano][value=chica]")
    assert pg.errores == []


def test_borrador_roto_no_rompe_nada(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', '{{roto')")
    assert pg.errores == []
    assert pg.input_value("#mensaje").startswith("Hola SENTIDA, les paso mi comanda:")
```

`tests/decoradas/test_sin_js.py` (reemplaza la primera prueba; la segunda queda igual):
```python
def test_sin_js_se_ve_todo(abrir):
    pg = abrir(1440, 900, java_script_enabled=False)
    assert pg.evaluate("document.documentElement.className") == "sin-js"
    assert pg.locator(".paso").count() == 6
    for n in range(1, 7):
        assert pg.locator(f'.paso[data-n="{n}"]').is_visible()
    assert pg.locator("#cierre").is_visible()
    for oculto in ("#tira", "#pasos-nav", "#avance", "#campo-ademas"):
        assert pg.is_hidden(oculto), oculto
    assert pg.is_visible(".solo-sin-js")
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0
```

En `tests/decoradas/test_aceptacion.py`:
- agregar arriba `from ayuda_decoradas import armar`;
- en `test_teclado_recorre_todo_con_foco_visible`, cambiar `assert visitados > 30` por `assert visitados > 15  # un paso por vez: solo se recorre el paso actual`;
- en `test_contraste_aa`, reemplazar la línea `pg.check("input[name=tamano][value=mediana]")` por:
```python
    armar(pg, hasta=2)
    pg.check("input[name=tamano][value=mediana]")
```

- [ ] **Step 4: Correr y ver que fallan**

Run: `python -m pytest tests/decoradas -q -p no:cacheprovider`
Expected: FAIL casi todo lo que usa `armar` (no existe `#siguiente` visible; `ComandaPasos` no está definido).

- [ ] **Step 5: `decoradas/pasos.js`**

```js
/* SENTIDA · la comanda — un paso por vez.
   Muestra una sola pregunta, con Volver y Siguiente al pie. Siguiente pide
   que el paso tenga respuesta y, si falta, lo dice; Enter en un campo
   avanza; el botón atrás del navegador vuelve un paso; cada línea del
   ticket lleva a su paso. Sin este archivo, los pasos se ven uno abajo del
   otro. */
(function () {
  'use strict';
  var C = window.Comanda, M = window.ComandaMensaje, B = window.ComandaBorrador;
  var comanda = document.getElementById('comanda');
  var armado = document.getElementById('armado');
  var nav = document.getElementById('pasos-nav');
  if (!C || !M || !comanda || !armado || !nav || !(window.history && history.pushState)) return;

  var CIERRE = 7;
  // Línea del ticket -> paso donde se elige.
  var PASO_DE = {fecha: 1, tamano: 2, bizcochuelo: 3, relleno: 4, relleno2: 5,
                 decoracion: 6, nombre: 6, numero: 6, ademas: 7};
  var doc = document.documentElement;
  var pasos = {};
  document.querySelectorAll('.paso[data-n], #cierre[data-n]').forEach(function (p) {
    pasos[+p.getAttribute('data-n')] = p;
  });
  var volver = document.getElementById('volver');
  var siguiente = document.getElementById('siguiente');
  var siguienteT = document.getElementById('siguiente-t');
  var falta = document.getElementById('pasos-falta');
  var avance = document.getElementById('avance');
  var empezar = document.getElementById('empezar');
  var oyentes = [];
  var guardado = (B && B.paso()) || {actual: 1, alcanzado: 1};
  var actual = 0;
  var alcanzado = guardado.alcanzado;

  function titulo(n) { return pasos[n].querySelector('.paso-t, .cierre-t'); }

  function pasoDelHash() {
    if (location.hash === '#cierre') return CIERRE;
    var m = /^#paso-([1-6])$/.exec(location.hash);
    return m ? +m[1] : 0;
  }

  // Siguiente se ve inactivo mientras el paso no tenga lo que hace falta.
  function estadoSiguiente() {
    if (!actual) return;
    if (M.falta(actual, C.leer())) siguiente.setAttribute('aria-disabled', 'true');
    else { siguiente.removeAttribute('aria-disabled'); falta.textContent = ''; }
  }

  // Solo se puede saltar a los pasos que ya se alcanzaron.
  function pintarTicket() {
    document.querySelectorAll('[data-ticket] [data-clave] .ticket-ir').forEach(function (b) {
      var n = PASO_DE[b.closest('[data-clave]').getAttribute('data-clave')];
      b.disabled = !n || n > alcanzado;
    });
  }

  function mostrar(n, direccion) {
    Object.keys(pasos).forEach(function (k) {
      pasos[k].hidden = +k !== n;
      pasos[k].classList.remove('entra', 'entra-atras');
    });
    if (direccion) {
      void pasos[n].offsetWidth;  // para que la animación arranque de nuevo
      pasos[n].classList.add(direccion > 0 ? 'entra' : 'entra-atras');
    }
    armado.hidden = n === CIERRE;  // en el cierre, el formulario vacío no ocupa lugar
    volver.hidden = n === 1;
    siguiente.hidden = n === CIERRE;
    siguienteT.textContent = n === 6 ? 'Ver mi comanda' : 'Siguiente';
    if (avance) avance.setAttribute('data-paso', n);
  }

  function ir(n, opts) {
    opts = opts || {};
    n = Math.min(Math.max(Math.floor(n) || 1, 1), CIERRE);
    var aviso = '';
    // Al cierre se llega con los pasos obligatorios completos.
    if (n === CIERRE) {
      var p = M.primerIncompleto(C.leer());
      if (p < CIERRE) { n = p; aviso = M.falta(p, C.leer()); }
    }
    var direccion = actual && doc.classList.contains('mov') ? n - actual : 0;
    actual = n;
    alcanzado = Math.max(alcanzado, n);
    mostrar(n, direccion);
    falta.textContent = aviso;
    estadoSiguiente();
    if (!opts.sinHistoria) {
      var hash = n === CIERRE ? '#cierre' : '#paso-' + n;
      if (opts.reemplazar) history.replaceState({paso: n}, '', hash);
      else if (location.hash !== hash) history.pushState({paso: n}, '', hash);
    }
    if (!opts.sinScroll) {
      var margen = parseFloat(getComputedStyle(doc).scrollPaddingTop) || 0;
      if (Math.abs(comanda.getBoundingClientRect().top - margen) > 2) {
        comanda.scrollIntoView({behavior: 'instant', block: 'start'});
      }
    }
    if (opts.foco !== false) titulo(n).focus({preventScroll: true});
    if (B) B.guardarPaso({actual: actual, alcanzado: alcanzado});
    pintarTicket();
    oyentes.forEach(function (fn) { fn(n); });
  }

  siguiente.addEventListener('click', function () {
    var f = M.falta(actual, C.leer());
    if (!f) { ir(actual + 1); return; }
    falta.textContent = f;
    var primero = pasos[actual].querySelector('input');
    if (primero) primero.focus();
  });
  volver.addEventListener('click', function () { ir(actual - 1); });

  // Enter en un campo (no en un área de texto ni en una casilla) avanza.
  armado.addEventListener('keydown', function (ev) {
    var t = ev.target;
    if (ev.key !== 'Enter' || t.tagName !== 'INPUT' || t.type === 'checkbox') return;
    ev.preventDefault();
    siguiente.click();
  });

  // Cada línea del ticket lleva a su paso. Desde el diálogo del celular,
  // primero se cierra (y devuelve el foco a la tira) y después se va.
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ticket] .ticket-ir');
    if (!b || b.disabled) return;
    var n = PASO_DE[b.closest('[data-clave]').getAttribute('data-clave')];
    var dlg = b.closest('dialog');
    if (dlg && dlg.open) {
      dlg.addEventListener('close', function () { ir(n); }, {once: true});
      dlg.close();
    } else ir(n);
  });

  // El botón atrás (y adelante) del navegador.
  window.addEventListener('popstate', function (ev) {
    var n = (ev.state && ev.state.paso) || pasoDelHash();
    if (n) ir(n, {sinHistoria: true});
  });

  C.alCambiar(function (estado, nueva, lineas, motivo) {
    if (motivo === 'reinicio') {
      alcanzado = 1;
      if (empezar) empezar.textContent = 'Empezar mi comanda';
      ir(1, {foco: false});
      return;
    }
    estadoSiguiente();
    pintarTicket();
  });

  // Arranque: el paso del #hash, o el guardado, sin saltear pasos que falten.
  doc.classList.add('en-pasos');
  nav.hidden = false;
  if (avance) avance.hidden = false;
  var desdeHash = pasoDelHash();
  var inicial = Math.min(desdeHash || guardado.actual || 1, M.primerIncompleto(C.leer()));
  alcanzado = Math.max(alcanzado, inicial);
  if (empezar && alcanzado > 1) empezar.textContent = 'Seguir mi comanda';
  ir(inicial, {sinHistoria: !desdeHash, reemplazar: true, sinScroll: true, foco: false});

  window.ComandaPasos = {
    ir: ir,
    actual: function () { return actual; },
    siguiente: function () { siguiente.click(); },
    alCambiar: function (fn) { oyentes.push(fn); if (actual) fn(actual); }
  };
})();
```

- [ ] **Step 6: Cada línea del ticket es un botón**

En `decoradas/comanda.js`, dentro de `pintarTicket`, reemplazar:
```js
      var dt = document.createElement('dt');
      dt.textContent = l.etiqueta;
```
por:
```js
      var dt = document.createElement('dt');
      // Cada línea lleva a su paso: pasos.js decide si ya se puede ir.
      var ir = document.createElement('button');
      ir.type = 'button';
      ir.className = 'ticket-ir';
      ir.textContent = l.etiqueta;
      ir.setAttribute('aria-label', 'Cambiar: ' + l.etiqueta);
      dt.appendChild(ir);
```
Y en el manejador de `submit` de `armado`, reemplazar:
```js
    document.getElementById('cierre').scrollIntoView();
```
por:
```js
    if (window.ComandaPasos) window.ComandaPasos.siguiente();
    else document.getElementById('cierre').scrollIntoView();
```
Y cambiar el comentario de arriba de ese manejador a `// Enter en un campo de texto no recarga la página: avanza un paso.`

- [ ] **Step 7: `decoradas/panel.js`**

Reemplazar todo el archivo por:
```js
/* SENTIDA · la comanda — lo que acompaña al armado.
   Escritorio: la foto del panel cambia según el paso.
   Celular: mientras la comanda está en pantalla, la cabecera se esconde y
   arriba queda la tira del ticket; al tocarla se abre la comanda entera. */
(function () {
  'use strict';
  var C = window.Comanda, P = window.ComandaPasos;
  var doc = document.documentElement;
  var comanda = document.getElementById('comanda');
  var foto = document.querySelector('.panel-foto');
  var pie = document.getElementById('panel-pie');
  var tira = document.getElementById('tira');
  var tiraLinea = document.getElementById('tira-linea');
  var ver = document.querySelector('.tira-ver');
  var dialogo = document.getElementById('comanda-dialogo');
  var cerrar = document.getElementById('dialogo-cerrar');
  var mensaje = document.getElementById('mensaje');
  if (!C || !comanda) return;

  // Paso actual -> foto y pie del panel.
  if (foto && P) {
    P.alCambiar(function (n) {
      foto.setAttribute('data-activo', n);
      var img = foto.querySelector('[data-foto="' + n + '"]');
      if (img && pie) pie.textContent = 'Hecha por nosotras · ' + img.getAttribute('data-pie');
    });
  }

  // Celular: la tira reemplaza a la cabecera mientras se arma.
  if (tira && 'IntersectionObserver' in window) {
    tira.hidden = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { doc.classList.toggle('en-comanda', e.isIntersecting); });
    }, {rootMargin: '-45% 0px -45% 0px'}).observe(comanda);
  }

  var tiraEt = tiraLinea && tiraLinea.querySelector('.tira-et');
  var tiraVal = tiraLinea && tiraLinea.querySelector('.tira-val');
  C.alCambiar(function (estado, nueva, lineas) {
    if (!tiraEt || !tiraVal) return;
    var hechas = (lineas || []).filter(function (l) { return !l.vacio; });
    var l = nueva || hechas[hechas.length - 1];
    tiraEt.textContent = l ? l.etiqueta : 'Paso 1';
    tiraVal.textContent = l ? l.valor : 'Empezá por la fecha';
  });

  // La comanda entera en un diálogo nativo: foco atrapado y Escape.
  if (dialogo && ver && typeof dialogo.showModal === 'function') {
    ver.addEventListener('click', function () {
      // Si el mensaje se editó a mano, el diálogo no manda: avisa y lleva a revisarlo.
      dialogo.classList.toggle('editado', !!(C.editado && C.editado()));
      dialogo.showModal();
      ver.setAttribute('aria-expanded', 'true');
    });
    dialogo.addEventListener('close', function () {
      ver.setAttribute('aria-expanded', 'false');
      ver.focus();
    });
    // «Revisar mi mensaje»: se cierra el diálogo y se va al cierre, con el foco en el mensaje.
    var revisar = dialogo.querySelector('.dialogo-revisar');
    if (revisar) revisar.addEventListener('click', function (ev) {
      ev.preventDefault();
      dialogo.addEventListener('close', function () {
        if (P) P.ir(7, {foco: false});
        if (mensaje) mensaje.focus();
      }, {once: true});
      dialogo.close();
    });
    if (cerrar) cerrar.addEventListener('click', function () { dialogo.close(); });
    dialogo.addEventListener('click', function (ev) { if (ev.target === dialogo) dialogo.close(); });
  }
})();
```

- [ ] **Step 8: El CSS del paso a paso**

Agregar al final de `decoradas/decoradas.css`, antes de `@media (max-width:899px)` (o sea, después del bloque «Tira del ticket y diálogo»):
```css
/* ------------------------------------------------------------
   Un paso por vez (pasos.js suma .en-pasos a <html>)
   ------------------------------------------------------------ */
.en-pasos .pasos-col{display:flex; flex-direction:column; min-height:calc(100svh - var(--cab))}
.en-pasos .pasos-t{position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; padding:0}
.avance{display:flex; gap:6px; padding-top:clamp(28px,5vh,48px)}
.avance span{flex:1; height:3px; border-radius:2px; background:var(--linea)}
.avance[data-paso="1"] span:nth-child(-n+1),.avance[data-paso="2"] span:nth-child(-n+2),
.avance[data-paso="3"] span:nth-child(-n+3),.avance[data-paso="4"] span:nth-child(-n+4),
.avance[data-paso="5"] span:nth-child(-n+5),.avance[data-paso="6"] span:nth-child(-n+6),
.avance[data-paso="7"] span{background:var(--marron)}
.en-pasos .pasos{flex:1; display:flex; flex-direction:column}
.en-pasos .paso{flex:1; min-height:0; border-bottom:0; padding-block:28px 32px}
.en-pasos .cierre{flex:1; padding-block:28px 32px}
.en-pasos #mensaje{min-height:220px}
.en-pasos .solo-sin-js{display:none}
.pasos-nav{position:sticky; bottom:0; z-index:5; display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:14px 0 calc(16px + env(safe-area-inset-bottom)); background:var(--blanco); border-top:1px solid var(--linea)}
#siguiente{margin-left:auto}
.pasos-falta{flex-basis:100%; font-size:14px; font-weight:600; line-height:1.4; color:var(--marron)}
.pasos-falta:empty{display:none}
.btn-1[aria-disabled="true"],.btn-1[aria-disabled="true"]:hover{background:var(--crema); color:var(--marron-medio); border-color:var(--beige); cursor:not-allowed}
.mov .paso.entra,.mov .cierre.entra{animation:entra .35s cubic-bezier(.16,1,.3,1)}
.mov .paso.entra-atras,.mov .cierre.entra-atras{animation:entra-atras .35s cubic-bezier(.16,1,.3,1)}
@keyframes entra{from{opacity:0; transform:translateX(28px)}}
@keyframes entra-atras{from{opacity:0; transform:translateX(-28px)}}
```
Y dentro del `@media (max-width:899px)` existente, al final:
```css
  .en-pasos .paso,.en-pasos .cierre{padding-block:24px 28px}
  html.en-pasos{scroll-padding-bottom:88px}
```

- [ ] **Step 9: Cargar `pasos.js`**

En `decoradas/index.html`, reemplazar:
```html
<script src="borrador.js" defer></script>
```
por:
```html
<script src="borrador.js" defer></script>
<script src="pasos.js" defer></script>
```

- [ ] **Step 10: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde.

---

### Task 5: El borrador recuerda el paso y la referencia llega desde la home

**Files:**
- Modify: `decoradas/borrador.js` (reescrito)
- Test: `tests/decoradas/test_borrador.py` (se agregan pruebas)

**Interfaces:**
- Consumes: `window.Comanda` (`leer`, `escribir`, `render`, `alCambiar`), `window.Sentida.hoyISO`.
- Produces: `window.ComandaBorrador`:
  - `paso() -> {actual: 1..7, alcanzado: 1..7} | null` — lo guardado, ya saneado (`actual <= alcanzado`).
  - `guardarPaso({actual, alcanzado})` — lo guarda junto con el estado; si todavía no hay borrador y `alcanzado` es 1, no crea uno.
- El borrador en `localStorage['sentida-comanda-v1']` es el estado de `Comanda.leer()` más `paso`.
- `?ref=petalos|flores|letras|mensaje` marca esa referencia si el borrador no tiene otra.

- [ ] **Step 1: Pruebas nuevas del borrador**

Agregar al final de `tests/decoradas/test_borrador.py`:
```python
def test_retoma_en_el_paso_guardado(abrir, sitio):
    pg = abrir()
    armar(pg, hasta=4)
    pg.goto(sitio + "decoradas/")
    pg.wait_for_load_state("networkidle")
    assert pg.text_content("#empezar") == "Seguir mi comanda"
    assert visibles(pg) == [4]
    pg.click("#empezar")
    assert pg.url.endswith("#paso-4")
    assert pg.evaluate("document.activeElement.id") == "paso-4-t"


def test_sin_borrador_dice_empezar_y_no_guarda_nada(abrir):
    pg = abrir()
    assert pg.text_content("#empezar") == "Empezar mi comanda"
    assert pg.evaluate(f"localStorage.getItem('{CLAVE}')") is None


def test_la_referencia_llega_desde_la_home(abrir):
    pg = abrir(pagina="decoradas/?ref=petalos")
    assert pg.is_checked("input[name=referencia][value=petalos]")
    assert "Decoración: como la de pétalos" in pg.input_value("#mensaje")


def test_la_referencia_no_pisa_el_borrador(abrir):
    pg = abrir(pagina="decoradas/?ref=petalos",
               init=f"localStorage.setItem('{CLAVE}', JSON.stringify({{referencia: 'flores'}}))")
    assert pg.is_checked("input[name=referencia][value=flores]")


def test_una_referencia_desconocida_se_ignora(abrir):
    pg = abrir(pagina="decoradas/?ref=zzz")
    assert pg.is_checked("input[name=referencia][value='']")
    assert pg.errores == []


def test_borrador_con_forma_rara(abrir):
    raro = "{agregados: 5, tamano: ['x'], sinFecha: 'si', idea: {a: 1}, paso: {actual: 99, alcanzado: 'a'}}"
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', JSON.stringify({raro}))")
    assert pg.errores == []
    assert visibles(pg) == [1]
    assert not pg.is_checked("#sin-fecha")
    pg.check("#sin-fecha")
    assert '"sinFecha":true' in pg.evaluate(f"localStorage.getItem('{CLAVE}')")


def test_borrador_viejo_con_lo_charlamos(abrir):
    viejo = "{sinFecha: true, tamano: 'charlamos', paso: {actual: 3, alcanzado: 3}}"
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', JSON.stringify({viejo}))")
    assert pg.errores == []
    assert visibles(pg) == [2]
    assert pg.evaluate("document.querySelector('input[name=tamano]:checked')") is None
    assert "Tamaño: a definir" in pg.input_value("#mensaje")
    assert pg.get_attribute("#siguiente", "aria-disabled") == "true"
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `python -m pytest tests/decoradas/test_borrador.py -q -p no:cacheprovider`
Expected: FAIL en «retoma», «referencia llega», «forma rara» y «lo charlamos» (el paso no se guarda; `?ref` no hace nada; `agregados: 5` rompe `escribir`).

- [ ] **Step 3: `decoradas/borrador.js`**

Reemplazar todo el archivo por:
```js
/* SENTIDA · la comanda — borrador en el navegador.
   Lo elegido (y el paso en el que quedaste) se guarda en localStorage para
   que una recarga o una interrupción no lo borren. Nada sale del teléfono.
   También marca la referencia que llega desde la home (?ref=petalos). */
(function () {
  'use strict';
  var C = window.Comanda, S = window.Sentida;
  if (!C || !S) return;
  var CLAVE = 'sentida-comanda-v1';
  var REFERENCIAS = ['petalos', 'flores', 'letras', 'mensaje'];
  var paso = null;

  function hay() {
    try { return localStorage.getItem(CLAVE) !== null; } catch (err) { return false; }
  }
  function guardar(e) {
    try {
      var copia = {};
      Object.keys(e).forEach(function (k) { copia[k] = e[k]; });
      copia.paso = paso;
      localStorage.setItem(CLAVE, JSON.stringify(copia));
    } catch (err) { /* sin lugar o bloqueado */ }
  }
  function borrar() { try { localStorage.removeItem(CLAVE); } catch (err) { /* bloqueado */ } }
  function guardado() {
    try {
      var e = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      return e && typeof e === 'object' && !Array.isArray(e) ? e : null;
    } catch (err) { return null; }
  }

  // Solo lo que tiene la forma esperada: un borrador raro no rompe la página.
  function sano(e) {
    var s = function (x) { return typeof x === 'string' ? x : ''; };
    return {
      fecha: s(e.fecha), sinFecha: e.sinFecha === true, tamano: s(e.tamano), bizcochuelo: s(e.bizcochuelo),
      relleno: s(e.relleno),
      agregados: Array.isArray(e.agregados) ? e.agregados.filter(function (a) { return typeof a === 'string'; }) : [],
      relleno2: s(e.relleno2), idea: s(e.idea), referencia: s(e.referencia),
      nombreTorta: s(e.nombreTorta), numero: s(e.numero), ademas: s(e.ademas)
    };
  }
  function pasoSano(p) {
    if (!p || typeof p !== 'object') return null;
    var a = Math.floor(Number(p.alcanzado)), n = Math.floor(Number(p.actual));
    if (!(a >= 1 && a <= 7)) return null;
    return {actual: n >= 1 && n <= a ? n : a, alcanzado: a};
  }

  var e = guardado();
  if (e) {
    paso = pasoSano(e.paso);
    e = sano(e);
    // Una fecha que ya pasó no sirve: se descarta.
    if (/^\d{4}-\d{2}-\d{2}$/.test(e.fecha) && e.fecha < S.hoyISO()) e.fecha = '';
    C.escribir(e);
  }

  C.alCambiar(function (estado, nueva, lineas, motivo) {
    if (motivo === 'reinicio') { paso = null; borrar(); }
    else if (motivo === 'cambio') guardar(estado);
  });

  // La referencia que llega desde la home, si el borrador no tiene otra.
  var ref = (/[?&]ref=([a-z]+)/.exec(location.search) || [])[1];
  if (ref && REFERENCIAS.indexOf(ref) >= 0 && !C.leer().referencia) {
    var radio = document.querySelector('input[name="referencia"][value="' + ref + '"]');
    if (radio) { radio.checked = true; C.render({silencioso: true}); }
  }

  window.ComandaBorrador = {
    paso: function () { return paso; },
    guardarPaso: function (p) {
      paso = p;
      // Con solo haber abierto la página no se crea un borrador.
      if (p.alcanzado > 1 || hay()) guardar(C.leer());
    }
  };
})();
```

- [ ] **Step 4: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde. `test_empezar_de_nuevo_lo_borra` sigue pasando: al reiniciar, `borrador.js` borra la clave antes de que `pasos.js` vuelva al paso 1, y `guardarPaso` no la vuelve a crear porque `alcanzado` es 1 y ya no hay borrador.

---

### Task 6: El mensaje del pedido de la tienda

**Files:**
- Create: `comun/pedido-mensaje.js`
- Test: `tests/comun/pedido-mensaje.test.mjs`

**Interfaces:**
- Consumes: `comun/base.js` (`limpio`, `fecha`, `whatsapp`).
- Produces: `window.PedidoMensaje` / `module.exports`:
  - `MAXIMO: 99`
  - `vacio() -> {items: [], fecha: '', entrega: 'retiro', nombre: '', ademas: ''}`
  - `normalizar(e, hoy?) -> estado` — descarta ítems sin slug válido (`/^[a-z0-9-]{1,60}$/`), sin nombre, repetidos o con cantidad < 1; limita a 99; fechas inválidas o anteriores a `hoy` quedan `''`; `entrega` es `'retiro'` o `'envio'`.
  - `cantidad(e, slug) -> number`, `total(e) -> number`
  - `cambiar(e, slug, nombre, delta) -> estado nuevo` (no modifica `e`; en 0 saca el producto)
  - `texto(e) -> string`, `url(numero, e) -> string`
  - `falta(e) -> '' | 'items' | 'fecha' | 'nombre'` y `FALTA` con el aviso de cada una.
- Un ítem es `{slug: string, nombre: string, cant: 1..99}`.

- [ ] **Step 1: Escribir las pruebas**

`tests/comun/pedido-mensaje.test.mjs`:
```js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const P = require('../../comun/pedido-mensaje.js');

const DOS = {
  items: [{slug: 'key-lime-pie', nombre: 'Key Lime Pie', cant: 1},
          {slug: 'alfajores-maicena', nombre: 'Alfajores de maicena', cant: 12}],
  fecha: '2026-11-07', entrega: 'retiro', nombre: 'Laura', ademas: 'sin nuez, por favor'
};

test('vacío', () => {
  assert.deepEqual(P.vacio(), {items: [], fecha: '', entrega: 'retiro', nombre: '', ademas: ''});
});

test('mensaje tal cual la especificación', () => {
  assert.equal(P.texto(DOS), [
    'Hola SENTIDA, quiero hacer este pedido:',
    '• Key Lime Pie × 1',
    '• Alfajores de maicena × 12',
    'Para: sábado 7/11',
    'Entrega: retiro en Martínez',
    'A nombre de: Laura',
    'Además: sin nuez, por favor',
    '¿Me confirman precio y disponibilidad?'
  ].join('\n'));
});

test('envío, y sin líneas vacías', () => {
  const t = P.texto({...P.vacio(), items: DOS.items, entrega: 'envio'});
  assert.ok(t.includes('Entrega: envío en Zona Norte'));
  assert.ok(!t.includes('Para:') && !t.includes('A nombre de:') && !t.includes('Además:'));
});

test('sumar, restar y sacar', () => {
  let e = P.cambiar(P.vacio(), 'marquise', 'Marquise', 1);
  assert.deepEqual(e.items, [{slug: 'marquise', nombre: 'Marquise', cant: 1}]);
  e = P.cambiar(e, 'marquise', 'Marquise', 2);
  assert.equal(P.cantidad(e, 'marquise'), 3);
  e = P.cambiar(e, 'chupitos', 'Chupitos', 1);
  assert.equal(P.total(e), 4);
  e = P.cambiar(e, 'marquise', 'Marquise', -3);
  assert.equal(P.cantidad(e, 'marquise'), 0);
  assert.deepEqual(e.items.map(i => i.slug), ['chupitos']);
  assert.deepEqual(P.cambiar(e, 'no-esta', 'No', -1).items, e.items);
});

test('no pasa de 99', () => {
  let e = P.cambiar(P.vacio(), 'chupitos', 'Chupitos', 98);
  e = P.cambiar(e, 'chupitos', 'Chupitos', 5);
  assert.equal(P.cantidad(e, 'chupitos'), 99);
  assert.equal(P.MAXIMO, 99);
});

test('cambiar no toca el estado anterior', () => {
  const a = P.cambiar(P.vacio(), 'marquise', 'Marquise', 1);
  P.cambiar(a, 'marquise', 'Marquise', 1);
  assert.equal(P.cantidad(a, 'marquise'), 1);
});

test('normalizar descarta lo raro', () => {
  const e = P.normalizar({
    items: [
      {slug: 'x', nombre: '<img src=x>', cant: 2},
      {slug: '<b>', nombre: 'Mal', cant: 1},
      {slug: 'marquise', nombre: 'Marquise', cant: '3'},
      {slug: 'marquise', nombre: 'Repetida', cant: 1},
      {slug: 'vacia', nombre: '   ', cant: 1},
      {slug: 'cero', nombre: 'Cero', cant: 0},
      {slug: 'mucha', nombre: 'Mucha', cant: 500},
      null, 'texto'
    ],
    fecha: '2020-01-01', entrega: 'avion', nombre: 42, ademas: ['x']
  }, '2026-09-24');
  assert.deepEqual(e.items, [
    {slug: 'x', nombre: '<img src=x>', cant: 2},
    {slug: 'marquise', nombre: 'Marquise', cant: 3},
    {slug: 'mucha', nombre: 'Mucha', cant: 99}
  ]);
  assert.deepEqual([e.fecha, e.entrega, e.nombre, e.ademas], ['', 'retiro', '', '']);
  assert.deepEqual(P.normalizar(null), P.vacio());
  assert.deepEqual(P.normalizar([1, 2]), P.vacio());
  assert.equal(P.normalizar({fecha: '2026-11-07'}, '2026-09-24').fecha, '2026-11-07');
  assert.equal(P.normalizar({fecha: '2026-02-30'}).fecha, '');
});

test('qué falta para mandar', () => {
  assert.equal(P.falta(P.vacio()), 'items');
  const uno = P.cambiar(P.vacio(), 'marquise', 'Marquise', 1);
  assert.equal(P.falta(uno), 'fecha');
  assert.equal(P.falta({...uno, fecha: '2026-11-07'}), 'nombre');
  assert.equal(P.falta({...uno, fecha: '2026-11-07', nombre: '  '}), 'nombre');
  assert.equal(P.falta({...uno, fecha: '2026-11-07', nombre: 'Lu'}), '');
  assert.equal(P.FALTA.items, 'Todavía no agregaste nada.');
  assert.equal(P.FALTA.fecha, 'Elegí para cuándo lo querés.');
  assert.equal(P.FALTA.nombre, 'Decinos a nombre de quién.');
});

test('url a WhatsApp', () => {
  const u = P.url('5491131459646', DOS);
  assert.ok(u.startsWith('https://wa.me/5491131459646?text='));
  assert.ok(!u.includes('+'));
  assert.equal(decodeURIComponent(u.split('?text=')[1]), P.texto(DOS));
});
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `node --test "tests/comun/*.test.mjs"`
Expected: FAIL con `Cannot find module '../../comun/pedido-mensaje.js'`.

- [ ] **Step 3: `comun/pedido-mensaje.js`**

```js
/* SENTIDA · el pedido de la tienda — el mensaje.
   Funciones puras: ordenan lo guardado, suman y restan productos y arman
   el texto de WhatsApp. Sin DOM, para poder probarlas en Node. */
(function (raiz) {
  'use strict';
  var S = typeof module === 'object' && module.exports ? require('./base.js') : raiz.Sentida;
  var MAXIMO = 99;
  var FALTA = {
    items: 'Todavía no agregaste nada.',
    fecha: 'Elegí para cuándo lo querés.',
    nombre: 'Decinos a nombre de quién.'
  };

  function vacio() { return {items: [], fecha: '', entrega: 'retiro', nombre: '', ademas: ''}; }
  function cadena(x, largo) { return typeof x === 'string' ? x.slice(0, largo) : ''; }

  // Todo lo que viene de localStorage pasa por acá: lo que no tiene la forma
  // esperada se descarta sin romper nada.
  function normalizar(e, hoy) {
    var n = vacio();
    if (!e || typeof e !== 'object' || Array.isArray(e)) return n;
    var vistos = {};
    (Array.isArray(e.items) ? e.items : []).forEach(function (i) {
      if (!i || typeof i !== 'object' || typeof i.slug !== 'string') return;
      if (!/^[a-z0-9-]{1,60}$/.test(i.slug) || vistos[i.slug]) return;
      var nombre = S.limpio(cadena(i.nombre, 80));
      var cant = Math.floor(Number(i.cant));
      if (!nombre || !(cant >= 1)) return;
      vistos[i.slug] = true;
      n.items.push({slug: i.slug, nombre: nombre, cant: Math.min(cant, MAXIMO)});
    });
    var f = cadena(e.fecha, 10);
    n.fecha = S.fecha(f) && (!hoy || f >= hoy) ? f : '';
    n.entrega = e.entrega === 'envio' ? 'envio' : 'retiro';
    n.nombre = cadena(e.nombre, 80);
    n.ademas = cadena(e.ademas, 500);
    return n;
  }

  function cantidad(e, slug) {
    for (var i = 0; i < e.items.length; i++) if (e.items[i].slug === slug) return e.items[i].cant;
    return 0;
  }
  function total(e) { return e.items.reduce(function (t, i) { return t + i.cant; }, 0); }

  // Suma (delta > 0) o resta (delta < 0) un producto. Devuelve un estado nuevo.
  function cambiar(e, slug, nombre, delta) {
    var n = normalizar(e);
    var estaba = false;
    n.items = n.items.map(function (i) {
      if (i.slug !== slug) return i;
      estaba = true;
      return {slug: i.slug, nombre: i.nombre, cant: Math.min(i.cant + delta, MAXIMO)};
    }).filter(function (i) { return i.cant > 0; });
    if (!estaba && delta > 0) n.items.push({slug: slug, nombre: S.limpio(nombre), cant: Math.min(delta, MAXIMO)});
    return n;
  }

  function texto(e) {
    var ls = ['Hola SENTIDA, quiero hacer este pedido:'];
    e.items.forEach(function (i) { ls.push('• ' + i.nombre + ' × ' + i.cant); });
    var f = S.fecha(e.fecha);
    if (f) ls.push('Para: ' + f);
    ls.push('Entrega: ' + (e.entrega === 'envio' ? 'envío en Zona Norte' : 'retiro en Martínez'));
    var nombre = S.limpio(e.nombre), ademas = S.limpio(e.ademas);
    if (nombre) ls.push('A nombre de: ' + nombre);
    if (ademas) ls.push('Además: ' + ademas);
    ls.push('¿Me confirman precio y disponibilidad?');
    return ls.join('\n');
  }

  // Qué falta para poder mandar: '' si nada.
  function falta(e) {
    if (!e.items.length) return 'items';
    if (!S.fecha(e.fecha)) return 'fecha';
    if (!S.limpio(e.nombre)) return 'nombre';
    return '';
  }

  function url(numero, e) { return S.whatsapp(numero, texto(e)); }

  var api = {MAXIMO: MAXIMO, FALTA: FALTA, vacio: vacio, normalizar: normalizar, cantidad: cantidad,
             total: total, cambiar: cambiar, texto: texto, falta: falta, url: url};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.PedidoMensaje = api;
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --test "tests/**/*.test.mjs"`
Expected: PASS (4 de `base`, 9 de `pedido-mensaje`, 13 de `mensaje`).

---

### Task 7: El carrito: «Mi pedido», el ticket y el envío

**Files:**
- Create: `comun/carrito.js`
- Modify: `comun/ticket.css` (se agrega el contador, la lista y el diálogo)
- Modify: `decoradas/index.html` (carga `pedido-mensaje.js` y `carrito.js`)
- Create: `tests/comun/conftest.py`, `tests/comun/test_carrito.py`

**Interfaces:**
- Consumes: `window.Sentida`, `window.PedidoMensaje`; en la página, los `[data-mi-pedido]` de la cabecera y, si hay, los `[data-carrito-lista]`, `[data-carrito-vacio]` y `[data-carrito-abrir]`. El `<script>` lleva `data-raiz` con el prefijo hasta la raíz del sitio (`""` en la home, `"../"` en las demás).
- Produces: `window.Carrito`:
  - `MAXIMO`
  - `cantidad(slug) -> number`, `total() -> number`
  - `cambiar(slug, nombre, delta)` — guarda, repinta, anuncia
  - `abrir(desde?)` — abre el diálogo del pedido; al cerrarlo el foco vuelve a `desde`
  - `alCambiar(fn(estado, slugNuevo|null))` — llama enseguida y en cada cambio
- Produces: `dialog#carrito-dialogo` (lo crea el script) con `#carrito-t`, `[data-carrito-lista]`, `[data-carrito-vacio]`, `[data-si-vacio]`, `form.carrito-form` (`#carrito-fecha`, `input[name=entrega]`, `#carrito-nombre`, `#carrito-ademas`, `[data-falta]`, `[type=submit]`, `[data-nadia]`), `[data-listo]` con `[data-vaciar]` y `[data-todavia]`, y `.carrito-decorada a`.
- `localStorage['sentida-pedido-v1']` guarda el estado de `PedidoMensaje`.

- [ ] **Step 1: Escribir las pruebas**

`tests/comun/conftest.py`:
```python
import pytest


@pytest.fixture
def ruta():
    # El carrito se prueba en Decoradas: tiene «Mi pedido» y no tiene tienda.
    return "decoradas/"
```

`tests/comun/test_carrito.py`:
```python
import json
from urllib.parse import unquote

CLAVE = "sentida-pedido-v1"


def guardado(items, **mas):
    """Script de init que deja un pedido guardado antes de que cargue la página."""
    return f"localStorage.setItem('{CLAVE}', {json.dumps(json.dumps({'items': items, **mas}))});"


UNO = guardado([{"slug": "key-lime-pie", "nombre": "Key Lime Pie", "cant": 1}])


def abrir_pedido(pg):
    pg.click(".cab [data-mi-pedido]")
    assert pg.evaluate("document.getElementById('carrito-dialogo').open")


def mandar(pg):
    pg.fill("#carrito-fecha", "2026-11-07")
    pg.fill("#carrito-nombre", "Laura")
    with pg.context.expect_page() as nueva:
        pg.click("#carrito-dialogo [type=submit]")
    return nueva.value.url


def test_mi_pedido_vacio(abrir):
    pg = abrir()
    assert pg.is_hidden(".cab .mi-pedido-n")
    assert pg.get_attribute(".cab [data-mi-pedido]", "aria-label") == "Mi pedido, vacío"
    abrir_pedido(pg)
    assert pg.is_visible("#carrito-dialogo [data-carrito-vacio]")
    assert pg.is_hidden("#carrito-dialogo .carrito-form")
    assert pg.eval_on_selector_all("#carrito-dialogo [data-si-vacio] a",
                                   "as => as.map(a => a.getAttribute('href'))") == ["../tortas/", "../antojos/"]
    assert pg.evaluate("document.activeElement.id") == "carrito-t"
    pg.keyboard.press("Escape")
    assert pg.evaluate("document.activeElement.hasAttribute('data-mi-pedido')")


def test_mi_pedido_con_un_producto(abrir):
    pg = abrir(init=UNO)
    assert pg.text_content(".cab .mi-pedido-n") == "1"
    assert pg.get_attribute(".cab [data-mi-pedido]", "aria-label") == "Mi pedido, 1 producto"
    abrir_pedido(pg)
    assert pg.text_content("#carrito-dialogo .carrito-nombre") == "Key Lime Pie"
    assert pg.is_visible("#carrito-dialogo .carrito-form")
    assert pg.get_attribute("#carrito-dialogo .carrito-decorada a", "href") == "../decoradas/"


def test_sumar_y_restar_desde_el_ticket(abrir):
    pg = abrir(init=UNO)
    abrir_pedido(pg)
    pg.click("#carrito-dialogo [data-mas]")
    assert pg.text_content("#carrito-dialogo .contador output") == "2"
    assert pg.text_content(".cab .mi-pedido-n") == "2"
    assert pg.evaluate("document.activeElement.hasAttribute('data-mas')")
    pg.click("#carrito-dialogo [data-menos]")
    pg.click("#carrito-dialogo [data-menos]")
    assert pg.locator("#carrito-dialogo .carrito-item").count() == 0
    assert pg.is_visible("#carrito-dialogo [data-carrito-vacio]")
    assert pg.evaluate("document.activeElement.id") == "carrito-t"
    assert pg.evaluate(f"JSON.parse(localStorage.getItem('{CLAVE}')).items") == []
    assert pg.text_content(".carrito-anuncio") == "Sacaste Key Lime Pie del pedido."


def test_pide_fecha_y_nombre(abrir):
    pg = abrir(init=UNO)
    abrir_pedido(pg)
    pg.click("#carrito-dialogo [type=submit]")
    assert pg.text_content("#carrito-dialogo [data-falta]") == "Elegí para cuándo lo querés."
    assert pg.evaluate("document.activeElement.id") == "carrito-fecha"
    pg.fill("#carrito-fecha", "2026-11-07")
    pg.click("#carrito-dialogo [type=submit]")
    assert pg.text_content("#carrito-dialogo [data-falta]") == "Decinos a nombre de quién."
    assert pg.evaluate("document.activeElement.id") == "carrito-nombre"


def test_el_mensaje_con_envio_y_algo_mas(abrir):
    pg = abrir(init=guardado([{"slug": "key-lime-pie", "nombre": "Key Lime Pie", "cant": 1},
                              {"slug": "alfajores-maicena", "nombre": "Alfajores de maicena", "cant": 12}]))
    abrir_pedido(pg)
    pg.check("#carrito-dialogo input[name=entrega][value=envio]")
    pg.fill("#carrito-ademas", "sin nuez, por favor")
    url = mandar(pg)
    assert url.startswith("https://wa.me/5491158300787?text=")
    q = url.split("?text=", 1)[1]
    assert "+" not in q
    assert unquote(q) == "\n".join([
        "Hola SENTIDA, quiero hacer este pedido:",
        "• Key Lime Pie × 1",
        "• Alfajores de maicena × 12",
        "Para: sábado 7/11",
        "Entrega: envío en Zona Norte",
        "A nombre de: Laura",
        "Además: sin nuez, por favor",
        "¿Me confirman precio y disponibilidad?",
    ])
    assert pg.is_visible("#carrito-dialogo [data-listo]")
    assert pg.is_hidden("#carrito-dialogo .carrito-form")
    assert pg.evaluate("document.activeElement.hasAttribute('data-vaciar')")


def test_lo_escrito_queda_guardado(abrir, sitio):
    pg = abrir()
    pg.evaluate("Carrito.cambiar('marquise', 'Marquise', 1)")
    abrir_pedido(pg)
    pg.fill("#carrito-nombre", "Laura")
    pg.check("#carrito-dialogo input[name=entrega][value=envio]")
    pg.goto(sitio + "decoradas/")
    pg.wait_for_load_state("networkidle")
    abrir_pedido(pg)
    assert pg.input_value("#carrito-nombre") == "Laura"
    assert pg.is_checked("#carrito-dialogo input[name=entrega][value=envio]")


def test_vaciar_despues_de_mandar(abrir):
    pg = abrir(init=UNO)
    abrir_pedido(pg)
    mandar(pg)
    pg.click("#carrito-dialogo [data-vaciar]")
    assert not pg.evaluate("document.getElementById('carrito-dialogo').open")
    assert pg.is_hidden(".cab .mi-pedido-n")
    assert pg.evaluate(f"JSON.parse(localStorage.getItem('{CLAVE}')).items") == []


def test_todavia_no_vuelve_al_formulario(abrir):
    pg = abrir(init=UNO)
    abrir_pedido(pg)
    mandar(pg)
    pg.click("#carrito-dialogo [data-todavia]")
    assert pg.is_visible("#carrito-dialogo .carrito-form")
    assert pg.is_hidden("#carrito-dialogo [data-listo]")
    assert pg.text_content(".cab .mi-pedido-n") == "1"


def test_pestana_bloqueada_va_en_la_misma(abrir):
    pg = abrir(init=UNO + " window.open = () => null;")
    abrir_pedido(pg)
    pg.fill("#carrito-fecha", "2026-11-07")
    pg.fill("#carrito-nombre", "Laura")
    with pg.expect_navigation():
        pg.click("#carrito-dialogo [type=submit]")
    assert pg.url.startswith("https://wa.me/5491158300787?text=")


def test_datos_raros_no_se_interpretan(abrir):
    raros = guardado([{"slug": "x", "nombre": "<img src=x onerror=window.__roto=1>", "cant": 2},
                      {"slug": "<b>", "nombre": "Mal", "cant": 1},
                      {"slug": "marquise", "nombre": "Marquise", "cant": "3"}], fecha="2020-01-01")
    pg = abrir(init=raros)
    abrir_pedido(pg)
    assert pg.evaluate("window.__roto") is None
    assert pg.locator("#carrito-dialogo .carrito-lista img").count() == 0
    assert pg.eval_on_selector_all("#carrito-dialogo .carrito-nombre", "es => es.map(e => e.textContent)") == \
        ["<img src=x onerror=window.__roto=1>", "Marquise"]
    assert pg.text_content(".cab .mi-pedido-n") == "5"
    assert pg.input_value("#carrito-fecha") == ""
    assert pg.errores == []


def test_guardado_roto_no_rompe(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', '{{roto');")
    assert pg.errores == []
    assert pg.is_hidden(".cab .mi-pedido-n")


def test_dos_pestanas_se_sincronizan(abrir, sitio):
    pg = abrir()
    otra = pg.context.new_page()
    otra.goto(sitio + "decoradas/")
    otra.wait_for_load_state("networkidle")
    pg.evaluate("Carrito.cambiar('marquise', 'Marquise', 2)")
    otra.wait_for_function("document.querySelector('.cab .mi-pedido-n').textContent === '2'")


def test_no_pasa_de_99(abrir):
    pg = abrir(init=guardado([{"slug": "chupitos", "nombre": "Chupitos", "cant": 99}]))
    abrir_pedido(pg)
    assert pg.is_disabled("#carrito-dialogo [data-mas]")
    pg.evaluate("Carrito.cambiar('chupitos', 'Chupitos', 1)")
    assert pg.text_content(".cab .mi-pedido-n") == "99"


def test_nadia_lleva_el_mismo_pedido(abrir):
    pg = abrir(init=UNO)
    abrir_pedido(pg)
    href = pg.get_attribute("#carrito-dialogo [data-nadia]", "href")
    assert href.startswith("https://wa.me/5491131459646?text=")
    assert "• Key Lime Pie × 1" in unquote(href.split("?text=", 1)[1])
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `python -m pytest tests/comun -q -p no:cacheprovider`
Expected: FAIL (no existe `#carrito-dialogo`; `Carrito` no está definido).

- [ ] **Step 3: `comun/carrito.js`**

```js
/* SENTIDA · el pedido de la tienda.
   Guarda lo elegido en el navegador, lo muestra en «Mi pedido» y en los
   tickets de la página, y lo manda en un solo mensaje de WhatsApp a Anto.
   Sin este archivo, cada producto se pide con su propio enlace. */
(function () {
  'use strict';
  var S = window.Sentida, P = window.PedidoMensaje;
  if (!S || !P || !window.JSON) return;
  var CLAVE = 'sentida-pedido-v1';
  var script = document.currentScript;
  var raiz = (script && script.getAttribute('data-raiz')) || '';
  var oyentes = [];
  var modo = 'form';       // 'form', o 'listo' después de mandar
  var volverA = null;
  var estado = leer();

  function leer() {
    try { return P.normalizar(JSON.parse(localStorage.getItem(CLAVE) || 'null'), S.hoyISO()); }
    catch (err) { return P.vacio(); }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (err) { /* sin lugar o bloqueado */ }
  }

  var anuncio = document.createElement('p');
  anuncio.className = 'carrito-anuncio';
  anuncio.setAttribute('aria-live', 'polite');
  document.body.appendChild(anuncio);
  function anunciar(t) { anuncio.textContent = t; }

  function icono(id, clase) {
    return '<svg class="ico' + (clase ? ' ' + clase : '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
  }

  var dialogo = document.createElement('dialog');
  dialogo.className = 'carrito-dialogo';
  dialogo.id = 'carrito-dialogo';
  dialogo.setAttribute('aria-labelledby', 'carrito-t');
  dialogo.innerHTML =
    '<div class="carrito-in">' +
      '<button type="button" class="carrito-cerrar" data-cerrar aria-label="Cerrar">' + icono('i-cerrar') + '</button>' +
      '<div class="ticket"><div class="papel">' +
        '<div class="ticket-cab"><span>SENTIDA · Pastelería</span><span>Pedido</span></div>' +
        '<p class="ticket-t display" id="carrito-t" tabindex="-1">Tu pedido</p>' +
        '<ul class="carrito-lista" role="list" data-carrito-lista></ul>' +
        '<p class="carrito-vacio" data-carrito-vacio>Todavía no agregaste nada.</p>' +
        '<p class="ticket-fijo">Precio y disponibilidad te los confirmamos por WhatsApp.</p>' +
      '</div></div>' +
      '<p class="carrito-ir botones" data-si-vacio>' +
        '<a class="btn btn-2" href="' + raiz + 'tortas/">Nuestras tortas</a>' +
        '<a class="btn btn-2" href="' + raiz + 'antojos/">Antojos</a>' +
      '</p>' +
      '<form class="carrito-form" novalidate>' +
        '<div class="cf"><label class="cf-t" for="carrito-fecha">¿Para cuándo?</label>' +
          '<input type="date" id="carrito-fecha" name="fecha"></div>' +
        '<fieldset class="cf"><legend class="cf-t">¿Retiro o envío?</legend>' +
          '<label class="cf-op"><input type="radio" name="entrega" value="retiro"> Retiro en Martínez</label>' +
          '<label class="cf-op"><input type="radio" name="entrega" value="envio"> Envío en Zona Norte</label>' +
        '</fieldset>' +
        '<div class="cf"><label class="cf-t" for="carrito-nombre">¿A nombre de quién?</label>' +
          '<input type="text" id="carrito-nombre" name="nombre" autocomplete="name"></div>' +
        '<div class="cf"><label class="cf-t" for="carrito-ademas">¿Algo más?</label>' +
          '<textarea id="carrito-ademas" name="ademas" rows="2"></textarea></div>' +
        '<p class="carrito-falta" data-falta aria-live="assertive"></p>' +
        '<button class="btn btn-1" type="submit">' + icono('i-whatsapp', 'ico-wa') + 'Mandar pedido por WhatsApp a Anto</button>' +
        '<a class="carrito-nadia" data-nadia href="#" target="_blank" rel="noopener" aria-describedby="nueva-pestana">¿Preferís escribirle a Nadia? 11&nbsp;3145&#8209;9646</a>' +
      '</form>' +
      '<div class="carrito-listo" data-listo hidden>' +
        '<p>¿Se abrió WhatsApp con tu pedido? Cuando lo mandes, vaciá el ticket para no repetirlo.</p>' +
        '<p class="botones"><button type="button" class="btn btn-1" data-vaciar>Vaciar el pedido</button>' +
        '<button type="button" class="btn btn-2" data-todavia>Todavía no</button></p>' +
      '</div>' +
      '<p class="carrito-decorada"><a href="' + raiz + 'decoradas/">¿Querés una torta decorada? Armala acá</a></p>' +
    '</div>';
  document.body.appendChild(dialogo);

  var form = dialogo.querySelector('.carrito-form');
  var falta = dialogo.querySelector('[data-falta]');
  var listo = dialogo.querySelector('[data-listo]');
  var nadia = dialogo.querySelector('[data-nadia]');
  form.elements.fecha.min = S.hoyISO();

  // Los nombres se escriben siempre como texto: nada de lo guardado se interpreta como HTML.
  function contador(i) {
    var c = document.createElement('span');
    c.className = 'contador';
    c.setAttribute('data-slug', i.slug);
    c.setAttribute('data-nombre', i.nombre);
    var menos = document.createElement('button');
    menos.type = 'button';
    menos.setAttribute('data-menos', '');
    menos.setAttribute('aria-label', 'Uno menos de ' + i.nombre);
    menos.textContent = '−';
    var cant = document.createElement('output');
    cant.setAttribute('aria-live', 'off');
    cant.textContent = i.cant;
    var mas = document.createElement('button');
    mas.type = 'button';
    mas.setAttribute('data-mas', '');
    mas.setAttribute('aria-label', 'Uno más de ' + i.nombre);
    mas.textContent = '+';
    mas.disabled = i.cant >= P.MAXIMO;
    c.appendChild(menos);
    c.appendChild(cant);
    c.appendChild(mas);
    return c;
  }

  function pintarLista(ul, nueva) {
    ul.textContent = '';
    estado.items.forEach(function (i) {
      var li = document.createElement('li');
      li.className = 'carrito-item' + (i.slug === nueva ? ' nueva' : '');
      var nombre = document.createElement('span');
      nombre.className = 'carrito-nombre';
      nombre.textContent = i.nombre;
      li.appendChild(nombre);
      li.appendChild(contador(i));
      ul.appendChild(li);
    });
  }

  function pintarCabecera() {
    var n = P.total(estado);
    document.querySelectorAll('[data-mi-pedido]').forEach(function (a) {
      var badge = a.querySelector('.mi-pedido-n');
      if (badge) { badge.textContent = n; badge.hidden = n === 0; }
      a.setAttribute('aria-label', n ? 'Mi pedido, ' + n + (n === 1 ? ' producto' : ' productos') : 'Mi pedido, vacío');
      a.setAttribute('aria-haspopup', 'dialog');
    });
  }

  function pintar(nueva) {
    var hay = estado.items.length > 0;
    if (!hay) modo = 'form';
    document.querySelectorAll('[data-carrito-lista]').forEach(function (ul) { pintarLista(ul, nueva); });
    document.querySelectorAll('[data-carrito-vacio]').forEach(function (p) {
      p.hidden = hay;
      p.textContent = 'Todavía no agregaste nada.';
    });
    document.querySelectorAll('[data-carrito-abrir]').forEach(function (b) { b.hidden = !hay; });
    dialogo.querySelector('[data-si-vacio]').hidden = hay;
    form.hidden = !hay || modo !== 'form';
    listo.hidden = modo !== 'listo';
    nadia.href = P.url(S.NADIA, estado);
    pintarCabecera();
    oyentes.forEach(function (fn) { fn(estado, nueva || null); });
  }

  function llenarFormulario() {
    var f = form.elements;
    f.fecha.value = estado.fecha;
    f.nombre.value = estado.nombre;
    f.ademas.value = estado.ademas;
    form.querySelectorAll('[name="entrega"]').forEach(function (r) { r.checked = r.value === estado.entrega; });
  }
  function leerFormulario() {
    var f = form.elements;
    var entrega = form.querySelector('[name="entrega"]:checked');
    estado.fecha = f.fecha.value;
    estado.nombre = f.nombre.value;
    estado.ademas = f.ademas.value;
    estado.entrega = entrega && entrega.value === 'envio' ? 'envio' : 'retiro';
    guardar();
    nadia.href = P.url(S.NADIA, estado);
    falta.textContent = '';
  }
  form.addEventListener('input', leerFormulario);
  form.addEventListener('change', leerFormulario);

  function cambiar(slug, nombre, delta) {
    var antes = P.cantidad(estado, slug);
    estado = P.cambiar(estado, slug, nombre, delta);
    var ahora = P.cantidad(estado, slug);
    if (ahora === antes) return;
    guardar();
    pintar(ahora > antes ? slug : null);
    anunciar(ahora ? nombre + ': ' + ahora + ' en tu pedido.' : 'Sacaste ' + nombre + ' del pedido.');
  }

  function abrir(desde) {
    if (typeof dialogo.showModal !== 'function') { location.href = raiz + 'tortas/#pedido'; return; }
    volverA = desde || document.activeElement;
    modo = 'form';
    falta.textContent = '';
    llenarFormulario();
    pintar();
    if (!dialogo.open) dialogo.showModal();
    dialogo.querySelector('#carrito-t').focus();
  }
  dialogo.addEventListener('close', function () {
    if (volverA && volverA.focus && document.contains(volverA)) volverA.focus();
    volverA = null;
  });
  dialogo.addEventListener('click', function (ev) {
    if (ev.target === dialogo || ev.target.closest('[data-cerrar]')) dialogo.close();
  });

  document.addEventListener('click', function (ev) {
    var abre = ev.target.closest('[data-mi-pedido], [data-carrito-abrir]');
    if (abre) { ev.preventDefault(); abrir(abre); return; }
    var b = ev.target.closest('.carrito-lista .contador button');
    if (!b) return;
    var c = b.parentNode, lista = c.closest('[data-carrito-lista]');
    var cual = b.hasAttribute('data-mas') ? 'data-mas' : 'data-menos';
    var slug = c.getAttribute('data-slug');
    cambiar(slug, c.getAttribute('data-nombre'), cual === 'data-mas' ? 1 : -1);
    // El foco vuelve al mismo botón o, si el producto salió, al título del ticket.
    var fila = lista.querySelector('.contador[data-slug="' + slug + '"]');
    var destino = fila && (fila.querySelector('[' + cual + ']:not(:disabled)') || fila.querySelector('[data-menos]'));
    (destino || lista.closest('.papel').querySelector('.ticket-t')).focus();
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    leerFormulario();
    var f = P.falta(estado);
    if (f) {
      falta.textContent = P.FALTA[f];
      if (form.elements[f]) form.elements[f].focus();
      return;
    }
    var destino = P.url(S.ANTO, estado);
    var w = window.open(destino, '_blank');
    if (w) { try { w.opener = null; } catch (err) { /* otra ventana */ } }
    else { window.location.href = destino; return; }  // navegador que bloquea pestañas nuevas
    modo = 'listo';
    pintar();
    dialogo.querySelector('[data-vaciar]').focus();
  });
  dialogo.querySelector('[data-vaciar]').addEventListener('click', function () {
    estado = P.vacio();
    guardar();
    modo = 'form';
    pintar();
    anunciar('Vaciamos tu pedido.');
    dialogo.close();
  });
  dialogo.querySelector('[data-todavia]').addEventListener('click', function () {
    modo = 'form';
    pintar();
    form.querySelector('[type="submit"]').focus();
  });

  // Otra pestaña cambió el pedido.
  window.addEventListener('storage', function (ev) {
    if (ev.key !== CLAVE && ev.key !== null) return;
    estado = leer();
    pintar();
  });

  window.Carrito = {
    MAXIMO: P.MAXIMO,
    cantidad: function (slug) { return P.cantidad(estado, slug); },
    total: function () { return P.total(estado); },
    cambiar: cambiar,
    abrir: abrir,
    alCambiar: function (fn) { oyentes.push(fn); fn(estado, null); }
  };
  pintar();
})();
```

- [ ] **Step 4: El CSS del pedido**

Agregar al final de `comun/ticket.css`:
```css
/* ------------------------------------------------------------
   El pedido de la tienda: contador, lista y diálogo
   ------------------------------------------------------------ */
.carrito-anuncio{position:absolute!important; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap}
.contador{display:inline-flex; align-items:center; border:1px solid var(--marron); border-radius:2px; background:var(--blanco); color:var(--marron)}
.contador button{width:44px; height:44px; display:grid; place-items:center; background:none; border:0; border-radius:2px; color:var(--marron); font-family:var(--ui); font-size:20px; line-height:1; cursor:pointer}
.contador button:hover:not(:disabled){background:var(--crema)}
.contador button:disabled{color:var(--marron-medio); background:var(--crema); cursor:default}
.contador button:focus-visible{outline:2px solid var(--celeste-profundo); outline-offset:-2px}
.contador output{min-width:32px; text-align:center; font-family:var(--ui); font-size:15px; font-weight:600; font-variant-numeric:tabular-nums}
.carrito-lista{list-style:none; margin:6px 0 0; padding:0}
.carrito-item{display:flex; align-items:center; justify-content:space-between; gap:12px; padding:6px 0; border-bottom:1px dashed var(--beige); font-size:14px; line-height:1.35}
.carrito-nombre{font-weight:600; overflow-wrap:anywhere}
.carrito-item .contador button{width:40px; height:40px; font-size:18px}
.mov .carrito-item.nueva{animation:imprimir .3s cubic-bezier(.16,1,.3,1)}
.carrito-vacio{padding:10px 0; font-size:14px; line-height:1.5; color:var(--marron-medio)}

.carrito-dialogo{border:0; padding:0; background:transparent; color:var(--marron); font-family:var(--ui); width:min(460px, calc(100vw - 24px)); max-height:calc(100dvh - 24px)}
.carrito-dialogo::backdrop{background:var(--velo, rgba(64,45,33,.45))}
.carrito-in{position:relative; display:flex; flex-direction:column; gap:16px; padding:20px 16px 16px; max-height:inherit; overflow:auto; background:var(--crema); border-radius:2px}
.carrito-cerrar{position:absolute; top:8px; right:8px; z-index:1; width:44px; height:44px; display:grid; place-items:center; background:var(--blanco); color:var(--marron); border:1px solid var(--beige); border-radius:2px; cursor:pointer}
.carrito-cerrar .ico{width:18px; height:18px}
.carrito-form{display:flex; flex-direction:column; align-items:flex-start; gap:14px}
.cf{display:flex; flex-direction:column; gap:6px; width:100%; min-width:0; margin:0; padding:0; border:0}
.cf-t{padding:0; font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; line-height:1.5; color:var(--marron-medio)}
.cf input[type=date],.cf input[type=text],.cf textarea{width:100%; min-height:48px; padding:10px 12px; font-family:var(--ui); font-size:16px; color:var(--marron); background:var(--blanco); border:1px solid var(--marron); border-radius:2px}
.cf textarea{min-height:72px; line-height:1.5; resize:vertical}
.cf-op{display:flex; align-items:center; gap:10px; min-height:44px; font-size:15px; cursor:pointer}
.cf-op input{width:20px; height:20px; margin:0; accent-color:var(--marron)}
.carrito-falta{font-size:14px; font-weight:600; line-height:1.5; color:var(--marron)}
.carrito-falta:empty{display:none}
.carrito-nadia{display:inline-flex; align-items:center; min-height:44px; font-size:14px; color:var(--marron); text-decoration:underline; text-underline-offset:5px}
.carrito-listo{display:flex; flex-direction:column; gap:12px; font-size:15px; line-height:1.5}
.carrito-decorada{font-size:14px; line-height:1.5}
.carrito-decorada a{display:inline-flex; align-items:center; min-height:44px; text-decoration:underline; text-underline-offset:5px}
.carrito-dialogo :is(a,button,input,textarea):focus-visible{outline:2px solid var(--celeste-profundo); outline-offset:3px}
```

- [ ] **Step 5: Cargar el carrito en Decoradas**

En `decoradas/index.html`, reemplazar:
```html
<script src="movimiento.js" defer></script>
```
por:
```html
<script src="movimiento.js" defer></script>
<script src="../comun/pedido-mensaje.js" defer></script>
<script src="../comun/carrito.js" data-raiz="../" defer></script>
```

- [ ] **Step 6: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde, incluidas las 14 pruebas nuevas del carrito.

---

### Task 8: La tienda: Nuestras tortas y Antojos

**Files:**
- Create: `herramientas/preparar_foto.py`
- Create: `assets/fotos/{cheesecake-marroc,brownie-chantilly,chocotorta,torta-matilda,torta-havannet,cupcakes-decorados,galletas-tematicas,chupitos}{,-800,-480}.webp` (las que pasen la revisión del Step 1)
- Create: `datos/catalogo.json`
- Create: `herramientas/generar_tienda.py`
- Create: `comun/tienda.css`, `comun/tienda.js`
- Create (generados): `tortas/index.html`, `antojos/index.html`
- Create: `tests/tienda/conftest.py`, `tests/tienda/test_tienda.py`, `tests/tienda/test_generador.py`

**Interfaces:**
- Consumes: `window.Carrito` (`cantidad`, `total`, `cambiar`, `alCambiar`, `MAXIMO`), `comun/base.css`, `comun/ticket.css`, `comun/menu.js`.
- Produces: en cada página de la tienda, `li.producto#<slug>[data-producto=<slug>][data-nombre]` con `.producto-foto` (o `.producto-foto.sin-foto`), `h3`, `.producto-wa` (enlace de WhatsApp), `.producto-agregar[hidden]` y `.contador[hidden]` (`[data-menos]`, `output`, `[data-mas]`); el panel `aside.tienda-panel#pedido` con `h2#pedido-t.ticket-t[tabindex=-1]`, `[data-carrito-lista]`, `[data-carrito-vacio]` y `button.tienda-terminar[data-carrito-abrir][hidden]`; la tira `.tira-pedido[hidden]` con `.tira-pedido-n` y `button[data-carrito-abrir]`.
- Produces: `herramientas/preparar_foto.py <archivo> <nombre>` y `herramientas/generar_tienda.py` (los usa el brief de fotos de Task 11).
- Slugs que usa la home (Task 9): `key-lime-pie`, `cheesecake-new-york`, `marquise`, `frutillas-con-crema`, `sablee`, `pavlova-lima`, `choco-oreo`.

- [ ] **Step 1: Revisar las fotos viejas antes de usarlas**

Mirar cada una con la herramienta de lectura de imágenes: `assets/producto-cheesecake-marroc.webp`, `assets/producto-brownie-chantilly.webp`, `assets/producto-chocotorta.webp`, `assets/producto-torta-matilda.webp`, `assets/producto-havannet.webp`, `assets/past-cupcakes.webp`, `assets/deco-galletas-dino.webp`, `assets/past-chupitos.webp`.
Si alguna muestra el sello, el sticker o el nombre de «tienda de pasteles», un personaje con marca o el nombre de un chico, **no se prepara**: ese producto queda sin foto (tarjeta crema) y se anota para el brief de fotos (Task 11). Anotar cuáles quedaron afuera.

- [ ] **Step 2: `herramientas/preparar_foto.py`**

```python
"""Pasa una foto a las variantes que usa el sitio, en assets/fotos/:
<nombre>.webp (hasta 1000 px de ancho), <nombre>-800.webp y <nombre>-480.webp.

Uso, desde sentida-site/:
    python herramientas/preparar_foto.py <archivo> <nombre>

<nombre> es el slug del producto (o el campo «foto» del catálogo). Después
de preparar una foto, correr python herramientas/generar_tienda.py.
"""
import pathlib
import sys

from PIL import Image, ImageOps

RAIZ = pathlib.Path(__file__).resolve().parents[1]
FOTOS = RAIZ / "assets" / "fotos"
ANCHO_MAXIMO = 1000


def preparar(origen, nombre):
    with Image.open(origen) as abierta:
        im = ImageOps.exif_transpose(abierta).convert("RGB")
    if im.width > ANCHO_MAXIMO:
        im = im.resize((ANCHO_MAXIMO, round(im.height * ANCHO_MAXIMO / im.width)), Image.LANCZOS)
    im.save(FOTOS / f"{nombre}.webp", "WEBP", quality=78, method=6)
    for w in (800, 480):
        if im.width > w:
            chica = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            chica.save(FOTOS / f"{nombre}-{w}.webp", "WEBP", quality=76, method=6)
    return im.size


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    print(preparar(sys.argv[1], sys.argv[2]))
```

- [ ] **Step 3: Preparar las fotos que pasaron la revisión**

Run (desde `sentida-site/`, salteando las que el Step 1 dejó afuera):
```bash
python herramientas/preparar_foto.py assets/producto-cheesecake-marroc.webp cheesecake-marroc
python herramientas/preparar_foto.py assets/producto-brownie-chantilly.webp brownie-chantilly
python herramientas/preparar_foto.py assets/producto-chocotorta.webp chocotorta
python herramientas/preparar_foto.py assets/producto-torta-matilda.webp torta-matilda
python herramientas/preparar_foto.py assets/producto-havannet.webp torta-havannet
python herramientas/preparar_foto.py assets/past-cupcakes.webp cupcakes-decorados
python herramientas/preparar_foto.py assets/deco-galletas-dino.webp galletas-tematicas
python herramientas/preparar_foto.py assets/past-chupitos.webp chupitos
```
Expected: cada línea imprime el tamaño final, p. ej. `(1000, 1160)`, `(864, 1080)`, `(774, 1032)`.

- [ ] **Step 4: `datos/catalogo.json`**

```json
{
  "_nota": "Fuente única de la tienda (Nuestras tortas y Antojos). herramientas/generar_tienda.py arma tortas/index.html y antojos/index.html con esto. «foto» es el nombre en assets/fotos/ sin .webp; si no está, se usa el slug, y si no hay archivo la tarjeta sale sin foto. «visible»: false la deja cargada pero fuera de la página. No se agregan productos que las dueñas no hayan pasado, ni descripciones inventadas.",
  "_pendiente": "Confirmar con las dueñas: los tamaños de las tortas de la casa (hoy se piden por cantidad); cuántos shots trae cada caja de chupitos y cómo se vende cada antojo (unidad, docena, caja); los precios; que la Marquise es el «Brownie con dulce de leche y frutos rojos» de su lista; que la Torta Matilda es la de chocolate de la foto. Los vasitos no se venden sueltos: van solo en la mesa dulce.",
  "secciones": {
    "tortas": {
      "titulo": "Nuestras tortas.",
      "bajada": "Las tortas de la casa, hechas a mano y por encargo. Sumalas a tu pedido y te confirmamos precio y disponibilidad por WhatsApp.",
      "title": "Nuestras tortas · SENTIDA Pastelería",
      "descripcion": "Las tortas de la casa de SENTIDA Pastelería, hechas a mano por encargo en Martínez. Armá tu pedido y mandalo por WhatsApp."
    },
    "antojos": {
      "titulo": "Antojos.",
      "bajada": "Alfajores, galletas, cupcakes y chupitos, para regalar o para la mesa dulce. Sumalos a tu pedido y te confirmamos precio y disponibilidad por WhatsApp.",
      "title": "Antojos · SENTIDA Pastelería",
      "descripcion": "Alfajores, galletas, cupcakes y chupitos de SENTIDA Pastelería, por encargo en Martínez. Armá tu pedido y mandalo por WhatsApp."
    }
  },
  "tipos": {
    "alfajores": "Alfajores",
    "galletas": "Galletas",
    "cupcakes": "Cupcakes",
    "chupitos": "Chupitos"
  },
  "productos": [
    {"slug": "key-lime-pie", "nombre": "Key Lime Pie", "seccion": "tortas", "descripcion": "Base crocante de galletitas, curd de lima y crema chantilly."},
    {"slug": "cheesecake-new-york", "nombre": "Cheesecake estilo New York", "seccion": "tortas", "foto": "cheesecake-ny", "descripcion": "Base de galletitas de vainilla, salsa de frutos rojos y crema chantilly."},
    {"slug": "marquise", "nombre": "Marquise", "seccion": "tortas", "descripcion": "Base de brownie, dulce de leche, crema y frutos rojos."},
    {"slug": "frutillas-con-crema", "nombre": "Frutillas con crema", "seccion": "tortas", "descripcion": "Frutillas frescas sobre crema, en base sablée de vainilla."},
    {"slug": "sablee", "nombre": "Sablée", "seccion": "tortas", "foto": "sablee-ddl", "descripcion": "Con dulce de leche, crema y frutos rojos."},
    {"slug": "pavlova-lima", "nombre": "Pavlova de lima", "seccion": "tortas", "foto": "pavlova", "descripcion": "Con crema, curd de lima y frutas de estación."},
    {"slug": "choco-oreo", "nombre": "Choco Oreo", "seccion": "tortas", "descripcion": "Base de galletitas Oreo, dulce de leche y crema chantilly."},
    {"slug": "carrot-cake", "nombre": "Carrot cake", "seccion": "tortas", "descripcion": ""},
    {"slug": "cheesecake-marroc", "nombre": "Cheesecake Marroc", "seccion": "tortas", "descripcion": "Cobertura de chocolate con trozos de Marroc."},
    {"slug": "chocotorta", "nombre": "Chocotorta", "seccion": "tortas", "descripcion": "Capas de galleta de chocolate y crema de dulce de leche."},
    {"slug": "brownie-chantilly", "nombre": "Brownie con dulce de leche y crema chantilly", "seccion": "tortas", "descripcion": ""},
    {"slug": "torta-matilda", "nombre": "Torta Matilda", "seccion": "tortas", "descripcion": ""},
    {"slug": "torta-havannet", "nombre": "Torta Havannet", "seccion": "tortas", "descripcion": ""},
    {"slug": "cheesecake-dulce-de-leche", "nombre": "Cheesecake de dulce de leche", "seccion": "tortas", "descripcion": ""},
    {"slug": "pavlova-dulce-de-leche", "nombre": "Pavlova de dulce de leche y frutos rojos", "seccion": "tortas", "descripcion": "Con crema chantilly, dulce de leche y frutos rojos."},
    {"slug": "alfajores-maicena", "nombre": "Alfajores de maicena", "seccion": "antojos", "tipo": "alfajores", "foto": "alfajores", "descripcion": "Rellenos de dulce de leche."},
    {"slug": "galletas-corazon", "nombre": "Galletas corazón", "seccion": "antojos", "tipo": "galletas", "foto": "galletas-te-amo", "descripcion": "Con mensaje escrito a mano."},
    {"slug": "galletas-tematicas", "nombre": "Galletas temáticas", "seccion": "antojos", "tipo": "galletas", "descripcion": "Para acompañar la torta del cumpleaños."},
    {"slug": "galletas-decoradas", "nombre": "Galletas decoradas", "seccion": "antojos", "tipo": "galletas", "descripcion": "Con glasé, a tema o con el nombre."},
    {"slug": "cupcakes-decorados", "nombre": "Cupcakes decorados", "seccion": "antojos", "tipo": "cupcakes", "descripcion": "Decorados a mano, en la paleta que elijas."},
    {"slug": "cupcakes-tematicos", "nombre": "Cupcakes temáticos", "seccion": "antojos", "tipo": "cupcakes", "descripcion": "Con figuras en pasta de azúcar, a tema."},
    {"slug": "chupitos", "nombre": "Chupitos", "seccion": "antojos", "tipo": "chupitos", "descripcion": "Postres en vaso, en distintos sabores."},
    {"slug": "pan-dulce", "nombre": "Pan dulce", "seccion": "temporada", "visible": false, "descripcion": "Frutos secos tostados y chips de chocolate, glaseado con aroma a naranja. Aprox. 700 g."},
    {"slug": "rosca-de-pascua", "nombre": "Rosca de Pascua", "seccion": "temporada", "visible": false, "descripcion": ""}
  ]
}
```

- [ ] **Step 5: Escribir las pruebas de la tienda**

`tests/tienda/conftest.py`:
```python
import pytest


@pytest.fixture
def ruta():
    return "tortas/"
```

`tests/tienda/test_generador.py`:
```python
import json
import pathlib
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
PAGINAS = [RAIZ / "tortas" / "index.html", RAIZ / "antojos" / "index.html"]


def test_el_html_generado_esta_al_dia():
    antes = [p.read_bytes() for p in PAGINAS]
    subprocess.run([sys.executable, "herramientas/generar_tienda.py"], cwd=RAIZ, check=True, capture_output=True)
    despues = [p.read_bytes() for p in PAGINAS]
    assert despues == antes, "Corré python herramientas/generar_tienda.py: el HTML de la tienda no está al día"


def test_cada_producto_visible_aparece_una_vez():
    datos = json.loads((RAIZ / "datos" / "catalogo.json").read_text(encoding="utf-8"))
    for seccion, pagina in (("tortas", PAGINAS[0]), ("antojos", PAGINAS[1])):
        html = pagina.read_text(encoding="utf-8")
        for p in datos["productos"]:
            veces = html.count(f'data-producto="{p["slug"]}"')
            esperado = 1 if p["seccion"] == seccion and p.get("visible", True) else 0
            assert veces == esperado, (seccion, p["slug"], veces)
```

`tests/tienda/test_tienda.py`:
```python
from urllib.parse import unquote

CEL = dict(is_mobile=True, has_touch=True)
CLAVE = "sentida-pedido-v1"
KEY = '[data-producto="key-lime-pie"]'


def test_las_tortas_de_la_casa(abrir):
    pg = abrir()
    assert pg.text_content("h1") == "Nuestras tortas."
    assert pg.locator("[data-producto]").count() == 15
    assert pg.locator('[data-producto="pan-dulce"]').count() == 0
    assert pg.get_attribute('.cab-nav a[aria-current="page"]', "href") == "../tortas/"
    for slug in ("key-lime-pie", "cheesecake-new-york", "marquise", "frutillas-con-crema",
                 "sablee", "pavlova-lima", "choco-oreo"):
        assert pg.locator(f"#{slug}").count() == 1, slug
    sin_foto = pg.locator(".producto .sin-foto").count()
    con_foto = pg.locator(".producto .producto-foto img").count()
    assert sin_foto + con_foto == 15
    assert pg.errores == []


def test_los_antojos_y_la_mesa_dulce(abrir):
    pg = abrir(pagina="antojos/")
    assert pg.text_content("h1") == "Antojos."
    assert pg.locator("[data-producto]").count() == 7
    assert pg.text_content('[data-producto="chupitos"] .producto-tipo') == "Chupitos"
    assert pg.locator(".mesa-fotos img").count() == 4
    href = pg.get_attribute(".mesa-dulce .enlace", "href")
    assert unquote(href.split("?text=", 1)[1]) == "Hola SENTIDA, quiero consultar por una mesa dulce.\nFecha:\nInvitados:"


def test_agregar_suma_al_ticket_y_a_la_cabecera(abrir):
    pg = abrir()
    assert pg.is_hidden(KEY + " .producto-wa")
    pg.click(KEY + " .producto-agregar")
    assert pg.is_hidden(KEY + " .producto-agregar")
    assert pg.text_content(KEY + " .contador output") == "1"
    assert pg.evaluate("document.activeElement.hasAttribute('data-mas')")
    assert pg.text_content(".tienda-panel .carrito-nombre") == "Key Lime Pie"
    assert pg.is_visible(".tienda-panel .tienda-terminar")
    assert pg.text_content(".cab .mi-pedido-n") == "1"


def test_sumar_y_restar_hasta_sacar(abrir):
    pg = abrir()
    t = '[data-producto="marquise"]'
    pg.click(t + " .producto-agregar")
    pg.click(t + " [data-mas]")
    pg.click(t + " [data-mas]")
    assert pg.text_content(t + " output") == "3"
    assert pg.text_content(".cab .mi-pedido-n") == "3"
    for _ in range(3):
        pg.click(t + " [data-menos]")
    assert pg.is_visible(t + " .producto-agregar")
    assert pg.evaluate("document.activeElement.classList.contains('producto-agregar')")
    assert pg.locator(".tienda-panel .carrito-item").count() == 0
    assert pg.is_hidden(".cab .mi-pedido-n")
    assert pg.is_hidden(".tienda-panel .tienda-terminar")


def test_el_pedido_pasa_de_tortas_a_antojos(abrir, sitio):
    pg = abrir()
    pg.click(KEY + " .producto-agregar")
    pg.goto(sitio + "antojos/")
    pg.wait_for_load_state("networkidle")
    pg.click('[data-producto="alfajores-maicena"] .producto-agregar')
    assert pg.locator(".tienda-panel .carrito-item").count() == 2
    assert pg.text_content(".cab .mi-pedido-n") == "2"


def test_mi_pedido_en_todas_las_paginas(abrir, sitio):
    pg = abrir()
    pg.click(KEY + " .producto-agregar")
    for ruta in ("decoradas/", "antojos/", "tortas/"):  # Task 9 suma la home ("")
        pg.goto(sitio + ruta)
        pg.wait_for_load_state("networkidle")
        assert pg.text_content(".cab [data-mi-pedido] .mi-pedido-n") == "1", ruta
        pg.click(".cab [data-mi-pedido]")
        assert pg.evaluate("document.getElementById('carrito-dialogo').open"), ruta
        assert pg.text_content("#carrito-dialogo .carrito-nombre") == "Key Lime Pie"
        pg.keyboard.press("Escape")
        assert pg.evaluate("document.activeElement.hasAttribute('data-mi-pedido')"), ruta


def test_el_mensaje_sale_como_la_especificacion(abrir, sitio):
    pg = abrir()
    pg.click(KEY + " .producto-agregar")
    pg.goto(sitio + "antojos/")
    pg.wait_for_load_state("networkidle")
    t = '[data-producto="alfajores-maicena"]'
    pg.click(t + " .producto-agregar")
    for _ in range(11):
        pg.click(t + " [data-mas]")
    pg.click(".tienda-panel .tienda-terminar")
    pg.fill("#carrito-fecha", "2026-11-07")
    pg.fill("#carrito-nombre", "Laura")
    pg.fill("#carrito-ademas", "sin nuez, por favor")
    with pg.context.expect_page() as nueva:
        pg.click("#carrito-dialogo [type=submit]")
    url = nueva.value.url
    assert url.startswith("https://wa.me/5491158300787?text=")
    q = url.split("?text=", 1)[1]
    assert "+" not in q
    assert unquote(q) == "\n".join([
        "Hola SENTIDA, quiero hacer este pedido:",
        "• Key Lime Pie × 1",
        "• Alfajores de maicena × 12",
        "Para: sábado 7/11",
        "Entrega: retiro en Martínez",
        "A nombre de: Laura",
        "Además: sin nuez, por favor",
        "¿Me confirman precio y disponibilidad?",
    ])


def test_el_contador_de_la_tarjeta_no_pasa_de_99(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', JSON.stringify({{items: [{{slug: 'marquise', nombre: 'Marquise', cant: 99}}]}}));")
    assert pg.text_content('[data-producto="marquise"] output') == "99"
    assert pg.is_disabled('[data-producto="marquise"] [data-mas]')


def test_llegar_con_ancla_marca_la_tarjeta(abrir):
    pg = abrir(pagina="tortas/#marquise")
    assert "marcada" in pg.get_attribute('[data-producto="marquise"]', "class")


def test_la_tira_del_celular(abrir):
    pg = abrir(390, 844, **CEL)
    assert pg.is_hidden(".tira-pedido")
    pg.click(KEY + " .producto-agregar")
    assert pg.is_visible(".tira-pedido")
    assert pg.text_content(".tira-pedido-n") == "1 producto"
    pg.click(".tira-pedido button")
    assert pg.evaluate("document.getElementById('carrito-dialogo').open")


def test_sin_js_cada_tarjeta_tiene_su_whatsapp(abrir):
    pg = abrir(java_script_enabled=False)
    n = pg.locator("[data-producto]").count()
    assert n == 15
    assert pg.locator("[data-producto] .producto-wa:visible").count() == n
    assert pg.locator("[data-producto] .producto-agregar:visible").count() == 0
    href = pg.get_attribute(KEY + " .producto-wa", "href")
    assert unquote(href.split("?text=", 1)[1]) == "Hola SENTIDA, quiero pedir: Key Lime Pie.\nPara:\nCantidad:"
    assert "+" not in href
    assert pg.get_attribute(".cab [data-mi-pedido]", "href") == "../tortas/#pedido"
    assert pg.is_visible(".tienda-panel [data-carrito-vacio]")
```

- [ ] **Step 6: Correrlas y ver que fallan**

Run: `python -m pytest tests/tienda -q -p no:cacheprovider`
Expected: FAIL (no existen `tortas/index.html`, `antojos/index.html` ni el generador).

- [ ] **Step 7: `herramientas/generar_tienda.py`**

```python
"""Genera las páginas de la tienda, tortas/index.html y antojos/index.html,
a partir de datos/catalogo.json.

Uso, desde sentida-site/:
    python herramientas/generar_tienda.py

El HTML generado se sube al repo y GitHub Pages lo sirve tal cual: no hay
build. Esas páginas no se editan a mano: se cambia el catálogo (o se suma
una foto con preparar_foto.py) y se vuelve a correr esto.
"""
import html
import json
import pathlib
from urllib.parse import quote

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[1]
FOTOS = RAIZ / "assets" / "fotos"
SITIO = "https://tramaid.github.io/sentida-pasteleria/"
ANTO = "5491158300787"
TAMANOS_TARJETA = "(max-width: 1099px) 45vw, 24vw"
TAMANOS_MESA = "(max-width: 899px) 45vw, 18vw"

MENU = [
    ("tortas", "Nuestras tortas", "../tortas/"),
    ("decoradas", "Decoradas", "../decoradas/"),
    ("antojos", "Antojos", "../antojos/"),
    ("nosotras", "Nosotras", "../#nosotras"),
]

# La mesa dulce de Antojos: (foto, epígrafe, texto alternativo).
MESA = [
    ("vasitos-flores", "Vasitos con flores", "Vasitos de postre con crema y flores comestibles"),
    ("carrot-mini", "Carrot cake en cuadraditos", "Cuadraditos de carrot cake con rosetas de frosting"),
    ("vasitos-frutillas", "Vasitos de frutillas", "Vasitos con frutillas, crema y merengue"),
    ("vasitos-maracuya", "Vasitos de maracuyá", "Vasitos de maracuyá con chocolate blanco"),
]

ICONOS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-flecha" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></symbol>
  <symbol id="i-izq" viewBox="0 0 24 24"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5"/></symbol>
  <symbol id="i-diagonal" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-cerrar" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>
  <symbol id="i-bolsa" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.5H6.2L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></symbol>
  <symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.17.25-.63.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06s.89 2.39 1.01 2.56c.13.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.46-.6 1.67-1.18.2-.57.2-1.07.14-1.17-.06-.11-.22-.17-.47-.29Z"/></symbol>
</svg>"""

PANEL = """    <aside class="tienda-panel" id="pedido" aria-labelledby="pedido-t">
      <div class="ticket">
        <div class="papel">
          <div class="ticket-cab"><span>SENTIDA · Pastelería</span><span>Pedido</span></div>
          <h2 class="ticket-t display" id="pedido-t" tabindex="-1">Tu pedido</h2>
          <ul class="carrito-lista" role="list" data-carrito-lista></ul>
          <p class="carrito-vacio" data-carrito-vacio>Para juntar todo en un solo pedido hace falta JavaScript. Mientras, pedí cada producto con su enlace de WhatsApp.</p>
          <p class="ticket-fijo">Precio y disponibilidad te los confirmamos por WhatsApp.</p>
          <p class="ticket-pie"><a href="../decoradas/">¿Querés una torta decorada? Armala acá</a></p>
        </div>
      </div>
      <button type="button" class="btn btn-1 tienda-terminar" data-carrito-abrir hidden>Terminar pedido</button>
    </aside>"""

PIE = """<footer class="pie">
  <div class="pie-in envoltorio">
    <div class="pie-marca">
      <img src="../assets/SENTIDASELLO.svg" alt="" width="88" height="88" loading="lazy">
      <p class="display">Lo soñás,<br>lo creamos.</p>
    </div>
    <nav class="pie-links" aria-label="Pie">
      <ul role="list">
        <li><a href="../tortas/">Nuestras tortas</a></li>
        <li><a href="../decoradas/">Decoradas</a></li>
        <li><a href="../antojos/">Antojos</a></li>
        <li><a href="../#nosotras">Nosotras</a></li>
      </ul>
      <ul role="list">
        <li><a href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido." target="_blank" rel="noopener" aria-describedby="nueva-pestana">WhatsApp</a></li>
        <li><a href="https://www.instagram.com/sentidapasteleria/" target="_blank" rel="noopener" aria-describedby="nueva-pestana">@sentidapasteleria</a></li>
      </ul>
      <p>Martínez, San Isidro<br>Solo por encargo</p>
    </nav>
  </div>
  <div class="pie-fin envoltorio"><span>© 2026 SENTIDA Pastelería</span><span>Propuesta de TRAMA</span></div>
</footer>"""

TIRA = """<div class="tira-pedido" hidden>
  <span class="tira-pedido-t">Tu pedido</span>
  <span class="tira-pedido-n">0 productos</span>
  <button type="button" data-carrito-abrir aria-label="Ver tu pedido">Ver</button>
</div>"""


def esc(texto):
    return html.escape(texto, quote=True)


def wa(texto):
    return f"https://wa.me/{ANTO}?text={quote(texto, safe='')}"


def img(nombre, alt, sizes):
    """<img> con las variantes que existan de assets/fotos/<nombre>.webp; '' si no hay foto."""
    base = FOTOS / f"{nombre}.webp"
    if not base.exists():
        return ""
    with Image.open(base) as im:
        ancho, alto = im.size
    srcset = [f"../assets/fotos/{nombre}-{w}.webp {w}w" for w in (480, 800)
              if w < ancho and (FOTOS / f"{nombre}-{w}.webp").exists()]
    srcset.append(f"../assets/fotos/{nombre}.webp {ancho}w")
    src = srcset[0].split(" ")[0]
    return (f'<img src="{src}" srcset="{", ".join(srcset)}" sizes="{sizes}" '
            f'width="{ancho}" height="{alto}" alt="{esc(alt)}" loading="lazy" decoding="async">')


def enlaces(actual, ancho):
    out = []
    for clave, texto, href in MENU:
        extra = ' aria-current="page"' if clave == actual else ""
        if ancho and clave == "nosotras":
            extra += ' class="solo-ancho"'
        out.append(f'<a href="{href}"{extra}>{texto}</a>')
    return out


def cabecera(actual):
    nav = "".join(enlaces(actual, ancho=True))
    menu = "\n          ".join(enlaces(actual, ancho=False))
    return f"""<header class="cab">
  <div class="cab-in">
    <nav class="cab-nav" aria-label="Secciones">
      {nav}
    </nav>
    <a class="cab-marca" href="../" aria-label="SENTIDA Pastelería, inicio"><img src="../assets/logo-sentida.svg" alt="SENTIDA Pastelería" width="116" height="44"></a>
    <div class="cab-acc">
      <a class="mi-pedido" href="../tortas/#pedido" data-mi-pedido><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-bolsa"/></svg><span class="mi-pedido-t">Mi pedido</span><span class="mi-pedido-n" hidden>0</span></a>
      <details class="menu">
        <summary><span class="menu-abrir">Menú</span><span class="menu-cerrar">Cerrar</span><svg class="ico menu-i-abrir" aria-hidden="true" focusable="false"><use href="#i-menu"/></svg><svg class="ico menu-i-cerrar" aria-hidden="true" focusable="false"><use href="#i-cerrar"/></svg></summary>
        <nav aria-label="Menú">
          {menu}
        </nav>
      </details>
    </div>
  </div>
</header>"""


def tarjeta(p, tipos):
    nombre = esc(p["nombre"])
    foto = img(p.get("foto") or p["slug"], "", TAMANOS_TARJETA)
    if foto:
        partes = [f'<div class="producto-foto">{foto}</div>']
    else:
        partes = [f'<div class="producto-foto sin-foto" aria-hidden="true"><span class="display">{nombre}</span></div>']
    if p.get("tipo"):
        partes.append(f'<p class="producto-tipo">{esc(tipos[p["tipo"]])}</p>')
    partes.append(f'<h3 class="display">{nombre}</h3>')
    if p.get("descripcion"):
        partes.append(f'<p class="producto-desc">{esc(p["descripcion"])}</p>')
    pedir = wa(f"Hola SENTIDA, quiero pedir: {p['nombre']}.\nPara:\nCantidad:")
    partes.append(f"""<div class="producto-acc">
          <a class="enlace producto-wa" href="{pedir}" target="_blank" rel="noopener" aria-describedby="nueva-pestana">Pedir por WhatsApp <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-diagonal"/></svg></a>
          <button type="button" class="btn btn-1 producto-agregar" aria-label="Agregar al pedido: {nombre}" hidden>Agregar al pedido</button>
          <span class="contador" hidden><button type="button" data-menos aria-label="Uno menos de {nombre}">−</button><output aria-live="off">0</output><button type="button" data-mas aria-label="Uno más de {nombre}">+</button></span>
        </div>""")
    cuerpo = "\n        ".join(partes)
    return f"""      <li class="producto" id="{p['slug']}" data-producto="{p['slug']}" data-nombre="{nombre}">
        {cuerpo}
      </li>"""


def mesa_dulce():
    fotos = "\n".join(
        f'          <li><figure><div class="foto">{img(nombre, alt, TAMANOS_MESA)}</div>'
        f'<figcaption>{esc(epigrafe)}</figcaption></figure></li>'
        for nombre, epigrafe, alt in MESA)
    consulta = wa("Hola SENTIDA, quiero consultar por una mesa dulce.\nFecha:\nInvitados:")
    return f"""
      <section class="mesa-dulce" aria-labelledby="mesa-t">
        <h2 class="display" id="mesa-t">¿Es para una<br>mesa dulce?</h2>
        <div class="mesa-dulce-txt">
          <p>Vasitos, carrot cake en cuadraditos, galletas con tu mensaje y alfajores. Armamos la mesa con vos, según los invitados.</p>
          <a class="enlace" href="{consulta}" target="_blank" rel="noopener" aria-describedby="nueva-pestana">Consultar por una mesa dulce <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-diagonal"/></svg></a>
        </div>
        <ul class="mesa-fotos" role="list">
{fotos}
        </ul>
      </section>"""


def pagina(clave, datos):
    sec = datos["secciones"][clave]
    productos = [p for p in datos["productos"] if p["seccion"] == clave and p.get("visible", True)]
    tarjetas = "\n".join(tarjeta(p, datos["tipos"]) for p in productos)
    extra = mesa_dulce() if clave == "antojos" else ""
    return f"""<!doctype html>
<!-- Generada por herramientas/generar_tienda.py desde datos/catalogo.json: no editar a mano. -->
<html lang="es-AR" class="sin-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex">
<title>{esc(sec["title"])}</title>
<meta name="description" content="{esc(sec["descripcion"])}">
<meta name="theme-color" content="#FEFAF8">
<link rel="canonical" href="{SITIO}{clave}/">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
<link rel="preload" href="../assets/fuentes/erode-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fuentes/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../comun/base.css">
<link rel="stylesheet" href="../comun/ticket.css">
<link rel="stylesheet" href="../comun/tienda.css">
<script>
/* Sin JavaScript la página se ve completa: cada producto se pide con su
   enlace de WhatsApp. «js» habilita el pedido; «mov», el movimiento. */
(function (r) {{
  r.classList.remove('sin-js'); r.classList.add('js');
  if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) r.classList.add('mov');
}})(document.documentElement);
</script>
<script src="../comun/base.js" defer></script>
<script src="../comun/menu.js" defer></script>
<script src="../comun/pedido-mensaje.js" defer></script>
<script src="../comun/carrito.js" data-raiz="../" defer></script>
<script src="../comun/tienda.js" defer></script>
</head>
<body>
{ICONOS}
<a class="saltar" href="#contenido">Saltar al contenido</a>
<p id="nueva-pestana" hidden>Se abre WhatsApp o Instagram en otra pestaña.</p>

{cabecera(clave)}

<main id="contenido">
<section class="tienda" aria-labelledby="tienda-t">
  <div class="tienda-in">
    <div class="tienda-col">
      <div class="tienda-cab">
        <h1 class="display" id="tienda-t">{esc(sec["titulo"])}</h1>
        <p>{esc(sec["bajada"])}</p>
      </div>
      <ul class="productos" role="list">
{tarjetas}
      </ul>{extra}
    </div>
{PANEL}
  </div>
</section>
</main>

{PIE}

{TIRA}
</body>
</html>
"""


def main():
    datos = json.loads((RAIZ / "datos" / "catalogo.json").read_text(encoding="utf-8"))
    for clave in ("tortas", "antojos"):
        destino = RAIZ / clave / "index.html"
        destino.parent.mkdir(exist_ok=True)
        destino.write_text(pagina(clave, datos), encoding="utf-8", newline="\n")
        print(destino.relative_to(RAIZ).as_posix())


if __name__ == "__main__":
    main()
```

Después de escribirlo, comprobar que el símbolo de WhatsApp de `ICONOS` es idéntico al de `decoradas/index.html`:
```bash
python -X utf8 -c "import re;a=open('decoradas/index.html',encoding='utf-8').read();b=open('herramientas/generar_tienda.py',encoding='utf-8').read();r=r'<symbol id=\"i-whatsapp\".*?</symbol>';print(re.search(r,a).group(0)==re.search(r,b).group(0))"
```
Expected: `True`.

- [ ] **Step 8: `comun/tienda.css`**

```css
/* ============================================================
   SENTIDA · la tienda: Nuestras tortas y Antojos (TRAMA, 24/09/2026)
   Grilla de productos y, al costado, el ticket «Tu pedido». Sin
   JavaScript, cada tarjeta se pide con su enlace de WhatsApp.
   ============================================================ */
.tienda{margin-top:var(--cab)}
.tienda-in{max-width:var(--ancho); margin:0 auto; padding:clamp(40px,7vh,80px) var(--lateral) clamp(72px,12vh,120px); display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:clamp(24px,4vw,64px); align-items:start}
.tienda-cab{display:flex; flex-wrap:wrap; justify-content:space-between; align-items:end; gap:16px 40px; margin-bottom:clamp(28px,5vh,48px)}
.tienda-cab h1{font-size:clamp(3rem,6vw,5.5rem); line-height:.9; letter-spacing:-.03em}
.tienda-cab p{font-size:16px; line-height:1.6; color:var(--marron-medio); max-width:44ch}

.productos{list-style:none; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(28px,3vw,40px) clamp(14px,1.6vw,24px)}
.producto{display:flex; flex-direction:column; gap:8px}
.producto-foto{aspect-ratio:4/5; overflow:hidden; border-radius:2px; background:var(--crema); outline:2px solid transparent; outline-offset:4px; transition:outline-color .3s}
.producto-foto img{width:100%; height:100%; object-fit:cover}
.sin-foto{display:flex; align-items:flex-end; padding:clamp(14px,1.6vw,22px)}
.sin-foto span{font-size:clamp(22px,2.2vw,32px); line-height:1.05; letter-spacing:-.01em; color:var(--marron)}
.producto-tipo{margin-top:6px; font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--celeste-profundo)}
.producto h3{margin-top:4px; font-size:clamp(20px,1.7vw,24px); line-height:1.1}
.producto-desc{font-size:14px; line-height:1.5; color:var(--marron-medio)}
.producto-acc{margin-top:auto; padding-top:8px; display:flex; align-items:center; min-height:56px}
.producto-agregar{width:100%; height:auto; padding:8px 12px; line-height:1.3; text-align:center}
.producto.en-pedido .producto-foto{outline-color:var(--beige)}
.producto.marcada .producto-foto{outline-color:var(--marron)}

.tienda-panel{position:sticky; top:calc(var(--cab) + 24px); display:flex; flex-direction:column; gap:14px}
.tienda-terminar{width:100%}

.mesa-dulce{margin-top:clamp(72px,12vh,120px); padding-top:clamp(40px,6vh,64px); border-top:1px solid var(--beige); display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.3fr); gap:24px 48px; align-items:end}
.mesa-dulce h2{font-size:clamp(2.25rem,4vw,3.5rem); line-height:.95; letter-spacing:-.025em}
.mesa-dulce-txt{display:flex; flex-direction:column; align-items:flex-start; gap:12px}
.mesa-dulce-txt p{font-size:15px; line-height:1.6; color:var(--marron-medio); max-width:44ch}
.mesa-fotos{grid-column:1 / -1; list-style:none; padding:0; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px}
.mesa-fotos .foto{aspect-ratio:4/5; overflow:hidden; border-radius:2px; background:var(--crema)}
.mesa-fotos img{width:100%; height:100%; object-fit:cover}
.mesa-fotos figcaption{margin-top:8px; font-size:13px; line-height:1.4; color:var(--marron-medio)}

.tira-pedido{display:none}

@media (max-width:1099px){
  .tienda-in{grid-template-columns:minmax(0,1fr) 300px}
  .productos{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:899px){
  .tienda-in{grid-template-columns:minmax(0,1fr); padding-bottom:120px}
  .tienda-panel{position:static; max-width:440px}
  .mesa-dulce{grid-template-columns:minmax(0,1fr); align-items:start}
  .mesa-fotos{grid-template-columns:repeat(2,minmax(0,1fr))}
  /* Con algo en el pedido, una tira abajo lo muestra y lo abre. */
  .tira-pedido{
    position:fixed; left:12px; right:12px; bottom:calc(12px + env(safe-area-inset-bottom)); z-index:55;
    display:flex; align-items:center; gap:12px; min-height:56px; padding:6px 6px 6px 16px;
    background:var(--marron); color:var(--blanco); border-radius:2px; box-shadow:0 10px 24px -10px var(--sombra);
  }
  .tira-pedido-t{font-family:var(--display); font-size:18px}
  .tira-pedido-n{flex:1; font-size:13px; font-weight:600; color:var(--crema)}
  .tira-pedido button{min-height:44px; padding:0 16px; background:var(--blanco); color:var(--marron); border:0; border-radius:2px; font-family:var(--ui); font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; cursor:pointer}
  .tira-pedido button:focus-visible{outline:2px solid var(--crema); outline-offset:2px}
  html{scroll-padding-bottom:88px}
}
```

- [ ] **Step 9: `comun/tienda.js`**

```js
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
```

- [ ] **Step 10: Generar las páginas**

Run: `python herramientas/generar_tienda.py`
Expected:
```text
tortas/index.html
antojos/index.html
```

- [ ] **Step 11: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde.

---

### Task 9: La home se conecta con Decoradas y la tienda

**Files:**
- Modify: `index.html` (con un script de reemplazos)
- Modify: `home.css`
- Delete: `tienda-v3/`
- Create: `tests/home/conftest.py`, `tests/home/test_home.py`
- Modify: `tests/tienda/test_tienda.py` (suma la home a `test_mi_pedido_en_todas_las_paginas`)

**Interfaces:**
- Consumes: la cabecera común (Task 3), `comun/ticket.css`, `comun/base.js`, `comun/pedido-mensaje.js`, `comun/carrito.js` con `data-raiz=""`, los slugs de la tienda (Task 8), `?ref=` de Decoradas (Task 5).
- Produces: en la home, `section#antojos` (antes `#mesas`) y `.caminos` con tres `.camino` dentro de `#pedido`.

- [ ] **Step 1: Escribir las pruebas de la home**

`tests/home/conftest.py`:
```python
import pytest


@pytest.fixture
def ruta():
    return ""
```

`tests/home/test_home.py`:
```python
from urllib.parse import unquote

CASA = ["key-lime-pie", "cheesecake-new-york", "marquise", "frutillas-con-crema", "sablee", "pavlova-lima", "choco-oreo"]


def hrefs(pg, sel):
    return pg.eval_on_selector_all(sel, "as => as.map(a => a.getAttribute('href'))")


def test_menu_nuevo(abrir):
    pg = abrir()
    assert hrefs(pg, ".cab-nav a") == ["tortas/", "decoradas/", "antojos/", "#nosotras"]
    assert pg.eval_on_selector_all(".cab-nav a", "as => as.map(a => a.textContent)") == \
        ["Nuestras tortas", "Decoradas", "Antojos", "Nosotras"]
    assert hrefs(pg, ".menu nav a") == ["tortas/", "decoradas/", "antojos/", "#nosotras", "#madre", "#pedido"]
    assert pg.get_attribute(".cab [data-mi-pedido]", "href") == "tortas/#pedido"
    assert pg.locator(".cab-pedido").count() == 0


def test_hero_lleva_a_decoradas_y_a_la_tienda(abrir):
    pg = abrir()
    assert pg.get_attribute(".hero .btn-1", "href") == "decoradas/"
    assert pg.text_content(".hero .btn-1") == "Armá tu torta"
    assert pg.get_attribute(".hero .btn-2", "href") == "tortas/"
    assert pg.text_content(".hero .btn-2") == "Ver nuestras tortas"


def test_las_de_la_casa_van_a_su_torta_en_la_tienda(abrir, sitio):
    pg = abrir()
    assert hrefs(pg, ".carta-fila .plato > a") == [f"tortas/#{s}" for s in CASA]
    assert hrefs(pg, ".carta-otra a") == ["tortas/"]
    assert pg.locator(".carta-fila .plato-cta").first.text_content().strip() == "Ver en la tienda"
    tienda = abrir(pagina="tortas/")
    for s in CASA:
        assert tienda.locator(f'[data-producto="{s}"]').count() == 1, s


def test_las_decoradas_abren_la_comanda_con_su_referencia(abrir):
    pg = abrir()
    assert hrefs(pg, ".deco-mosaico a:not(.btn)") == [
        "decoradas/?ref=petalos", "decoradas/?ref=letras", "decoradas/?ref=letras",
        "decoradas/?ref=mensaje", "decoradas/", "decoradas/?ref=letras"]
    assert pg.get_attribute(".deco-texto .btn", "href") == "decoradas/"
    assert pg.text_content(".deco-texto .btn").strip() == "Armá tu torta"


def test_antojos_en_la_home(abrir):
    pg = abrir()
    assert pg.locator("#mesas").count() == 0
    assert pg.text_content("#mesas-t") == "Antojos,para compartir."
    enlaces = hrefs(pg, "#antojos .mesas-cab a")
    assert enlaces[0] == "antojos/"
    assert unquote(enlaces[1].split("?text=", 1)[1]) == "Hola SENTIDA, quiero consultar por una mesa dulce.\nFecha:\nInvitados:"


def test_como_pedir_tres_caminos(abrir):
    pg = abrir()
    assert pg.locator("#pedido .caminos > .camino").count() == 3
    assert hrefs(pg, "#pedido .camino .btn") == ["tortas/", "antojos/", "decoradas/"]
    wa = hrefs(pg, "#pedido .camino-wa a")
    assert wa[0].startswith("https://wa.me/5491158300787?text=")
    assert wa[1].startswith("https://wa.me/5491131459646?text=")
    assert wa[2] == "https://www.instagram.com/sentidapasteleria/"


def test_el_pie_lleva_a_las_tres_partes(abrir):
    pg = abrir()
    assert hrefs(pg, ".pie-links a")[:4] == ["tortas/", "decoradas/", "antojos/", "#madre"]


def test_la_barra_del_celular_sigue_siendo_whatsapp(abrir):
    pg = abrir(390, 844, is_mobile=True, has_touch=True)
    assert pg.get_attribute(".barra-pedido", "href").startswith("https://wa.me/5491158300787?text=")


def test_no_queda_nada_de_la_tienda_v3(abrir):
    pg = abrir()
    assert pg.locator("a[href*='tienda-v3']").count() == 0
    assert pg.errores == []
```

En `tests/tienda/test_tienda.py`, en `test_mi_pedido_en_todas_las_paginas`, reemplazar:
```python
    for ruta in ("decoradas/", "antojos/", "tortas/"):  # Task 9 suma la home ("")
```
por:
```python
    for ruta in ("", "decoradas/", "antojos/", "tortas/"):
```

- [ ] **Step 2: Correrlas y ver que fallan**

Run: `python -m pytest tests/home tests/tienda/test_tienda.py -q -p no:cacheprovider`
Expected: FAIL (el menú viejo, los enlaces a WhatsApp, `#mesas`, la home sin carrito).

- [ ] **Step 3: Los cambios de `index.html`**

Guardar en el scratchpad como `t9_home.py` y correr desde `sentida-site/` con `python -X utf8 <ruta>/t9_home.py`:
```python
import os
import re

os.chdir(r'E:/E descargas/SENTIDA-sitio-web/sentida-site')
p = 'index.html'
s = open(p, encoding='utf-8').read()


def uno(viejo, nuevo):
    global s
    assert s.count(viejo) == 1, viejo[:80]
    s = s.replace(viejo, nuevo)


def patron(regex, nuevo, n=1):
    global s
    s, hechos = re.subn(regex, nuevo, s, flags=re.S)
    assert hechos == n, (regex[:60], hechos)


WA_ICONO = '<svg class="ico ico-wa" aria-hidden="true" focusable="false"><use href="#i-whatsapp"/></svg>'
FLECHA = '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-flecha"/></svg>'
DIAGONAL = '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-diagonal"/></svg>'

# Cabeza: descripción, el ticket y el carrito.
uno('Tortas hechas a mano por Anto y Nadia: la carta de la casa, tortas decoradas y mesas dulces. Pedidos por WhatsApp.',
    'Tortas hechas a mano por Anto y Nadia: nuestras tortas, decoradas a pedido y antojos. Armá tu pedido y mandalo por WhatsApp.')
uno('<link rel="stylesheet" href="home.css">',
    '<link rel="stylesheet" href="home.css">\n<link rel="stylesheet" href="comun/ticket.css">')
uno('<script src="home.js" defer></script>',
    '<script src="home.js" defer></script>\n<script src="comun/base.js" defer></script>\n'
    '<script src="comun/pedido-mensaje.js" defer></script>\n<script src="comun/carrito.js" data-raiz="" defer></script>')
uno('<symbol id="i-cerrar" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>',
    '<symbol id="i-cerrar" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>\n'
    '  <symbol id="i-bolsa" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.5H6.2L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></symbol>')

# Cabecera común.
patron(r'<header class="cab">.*?</header>', '''<header class="cab">
  <div class="cab-in">
    <nav class="cab-nav" aria-label="Secciones">
      <a href="tortas/">Nuestras tortas</a><a href="decoradas/">Decoradas</a><a href="antojos/">Antojos</a><a href="#nosotras" class="solo-ancho">Nosotras</a>
    </nav>
    <a class="cab-marca" href="#inicio" aria-label="SENTIDA Pastelería, inicio"><img src="assets/logo-sentida.svg" alt="SENTIDA Pastelería" width="116" height="44"></a>
    <div class="cab-acc">
      <a class="mi-pedido" href="tortas/#pedido" data-mi-pedido><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-bolsa"/></svg><span class="mi-pedido-t">Mi pedido</span><span class="mi-pedido-n" hidden>0</span></a>
      <details class="menu">
        <summary><span class="menu-abrir">Menú</span><span class="menu-cerrar">Cerrar</span><svg class="ico menu-i-abrir" aria-hidden="true" focusable="false"><use href="#i-menu"/></svg><svg class="ico menu-i-cerrar" aria-hidden="true" focusable="false"><use href="#i-cerrar"/></svg></summary>
        <nav aria-label="Menú">
          <a href="tortas/">Nuestras tortas</a>
          <a href="decoradas/">Decoradas</a>
          <a href="antojos/">Antojos</a>
          <a href="#nosotras">Nosotras</a>
          <a href="#madre">Día de la Madre</a>
          <a href="#pedido">Cómo pedir</a>
        </nav>
      </details>
    </div>
  </div>
</header>''')

# Hero.
uno('      <a class="btn btn-1" href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido.%0AFecha%3A%0APorciones%3A%0ATorta%3A" target="_blank" rel="noopener" aria-describedby="nueva-pestana">' + WA_ICONO + 'Hacer un pedido</a>\n'
    '      <a class="btn btn-2" href="#carta">Ver la carta</a>',
    '      <a class="btn btn-1" href="decoradas/">Armá tu torta' + FLECHA + '</a>\n'
    '      <a class="btn btn-2" href="tortas/">Ver nuestras tortas</a>')

# Las de la casa: cada torta, a la misma torta en la tienda.
CASA = {'Key%20Lime%20Pie': 'key-lime-pie', 'Cheesecake%20estilo%20New%20York': 'cheesecake-new-york',
        'Marquise': 'marquise', 'Frutillas%20con%20crema': 'frutillas-con-crema', 'Sabl%C3%A9e': 'sablee',
        'Pavlova': 'pavlova-lima', 'Choco%20Oreo': 'choco-oreo'}
patron(r'href="https://wa\.me/5491158300787\?text=Hola%20SENTIDA%2C%20quiero%20consultar%20por%20la%20torta%20([^"]+?)\." '
       r'target="_blank" rel="noopener" aria-describedby="nueva-pestana"',
       lambda m: f'href="tortas/#{CASA[m.group(1)]}"', n=7)
patron(re.escape('<span class="plato-cta">Consultar ' + DIAGONAL + '</span>'),
       '<span class="plato-cta">Ver en la tienda ' + FLECHA + '</span>', n=7)
uno('<a href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20consultar%20por%20una%20torta%20que%20no%20est%C3%A1%20en%20la%20carta." target="_blank" rel="noopener" aria-describedby="nueva-pestana"><span class="display">¿Buscás otra? Preguntanos.</span>' + DIAGONAL + '</a>',
    '<a href="tortas/"><span class="display">Ver todas nuestras tortas.</span>' + FLECHA + '</a>')
uno('role="region" aria-label="La carta"', 'role="region" aria-label="Nuestras tortas"')

# Una torta para cada historia: a la comanda, con su referencia.
REF = {'p%C3%A9talos': '?ref=petalos', 'letras': '?ref=letras', 'macarons%20y%20rosas': '?ref=letras',
       'con%20mensaje': '?ref=mensaje', 'dos%20pisos': '', 'tonos%20celestes': '?ref=letras'}
patron(r'href="https://wa\.me/5491158300787\?text=Hola%20SENTIDA%2C%20quiero%20una%20torta%20decorada%20como%20la%20de%20([^"]+?)\.%0AFecha%3A%0APorciones%3A" '
       r'target="_blank" rel="noopener" aria-describedby="nueva-pestana"',
       lambda m: f'href="decoradas/{REF[m.group(1)]}"', n=6)
patron(r'(<span class="deco-cap">[^<]+ )' + re.escape(DIAGONAL), lambda m: m.group(1) + FLECHA, n=6)
uno('<a class="btn btn-claro" href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20una%20torta%20decorada.%0AFecha%3A%0APorciones%3A%0AIdea%20o%20tem%C3%A1tica%3A" target="_blank" rel="noopener" aria-describedby="nueva-pestana">' + WA_ICONO + 'Contanos tu idea</a>',
    '<a class="btn btn-claro" href="decoradas/">Armá tu torta' + FLECHA + '</a>')

# Mesas dulces -> Antojos.
uno('<section class="mesas" id="mesas" aria-labelledby="mesas-t">', '<section class="mesas" id="antojos" aria-labelledby="mesas-t">')
uno('<h2 class="display" id="mesas-t">Mesas dulces<br>para compartir.</h2>', '<h2 class="display" id="mesas-t">Antojos,<br>para compartir.</h2>')
uno('<p>Vasitos, carrot cake en cuadraditos, galletas con tu mensaje y alfajores. Armamos la mesa con vos, según la cantidad de invitados.</p>',
    '<p>Alfajores, galletas con tu mensaje, cupcakes y chupitos. Y si es para una mesa dulce, la armamos con vos según los invitados.</p>\n'
    '      <a class="enlace" href="antojos/">Ver los antojos ' + FLECHA + '</a>')
uno('role="region" aria-label="Mesas dulces"', 'role="region" aria-label="Antojos y mesa dulce"')

# Cómo pedir: tres caminos.
uno('<span>Algo de la carta, o nos contás la torta que imaginás.</span>', '<span>De nuestras tortas y antojos, o armás tu torta decorada.</span>')
uno('<strong class="display">Nos escribís</strong><span>Por WhatsApp, con la fecha y para cuántas personas.</span>',
    '<strong class="display">Nos lo mandás</strong><span>Por WhatsApp, con la fecha: el mensaje sale armado.</span>')
patron(r'    <div class="wa dos">.*?\n    </div>\n  </div>\n</section>', '''    <div class="caminos">
      <div class="camino">
        <span class="camino-eti">La tienda</span>
        <strong class="display">Nuestras tortas y antojos</strong>
        <p>Elegís, lo sumás al pedido y sale en un solo WhatsApp. Te confirmamos precio y disponibilidad.</p>
        <p class="botones"><a class="btn btn-1" href="tortas/">Nuestras tortas</a><a class="btn btn-2" href="antojos/">Antojos</a></p>
      </div>
      <div class="camino">
        <span class="camino-eti">Decoradas</span>
        <strong class="display">Armá tu torta</strong>
        <p>En seis pasos: fecha, tamaño, bizcochuelo, rellenos y decoración. Te la cotizamos y la reservás con seña.</p>
        <p class="botones"><a class="btn btn-1" href="decoradas/">Armá tu torta</a></p>
      </div>
      <div class="camino camino-wa">
        <span class="camino-eti">WhatsApp directo</span>
        <strong class="display">Escribinos</strong>
        <p>Si preferís contarnos con tus palabras.</p>
        <ul role="list">
          <li><a href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido." target="_blank" rel="noopener" aria-describedby="nueva-pestana">''' + WA_ICONO + '''<span>Anto · <span class="tel">11&nbsp;5830&#8209;0787</span></span></a></li>
          <li><a href="https://wa.me/5491131459646?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido." target="_blank" rel="noopener" aria-describedby="nueva-pestana">''' + WA_ICONO + '''<span>Nadia · <span class="tel">11&nbsp;3145&#8209;9646</span></span></a></li>
          <li><a href="https://www.instagram.com/sentidapasteleria/" target="_blank" rel="noopener" aria-describedby="nueva-pestana">''' + DIAGONAL + '''<span>Instagram: @sentidapasteleria</span></a></li>
        </ul>
      </div>
    </div>
  </div>
</section>''')

# Pie.
patron(r'<nav class="pie-links" aria-label="Pie">.*?</nav>', '''<nav class="pie-links" aria-label="Pie">
      <ul role="list">
        <li><a href="tortas/">Nuestras tortas</a></li>
        <li><a href="decoradas/">Decoradas</a></li>
        <li><a href="antojos/">Antojos</a></li>
        <li><a href="#madre">Día de la Madre</a></li>
      </ul>
      <ul role="list">
        <li><a href="#nosotras">Nosotras</a></li>
        <li><a href="#pedido">Cómo pedir</a></li>
        <li><a href="https://wa.me/5491158300787?text=Hola%20SENTIDA%2C%20quiero%20hacer%20un%20pedido.%0AFecha%3A%0APorciones%3A%0ATorta%3A" target="_blank" rel="noopener" aria-describedby="nueva-pestana">WhatsApp</a></li>
        <li><a href="https://www.instagram.com/sentidapasteleria/" target="_blank" rel="noopener" aria-describedby="nueva-pestana">@sentidapasteleria</a></li>
      </ul>
      <p>Martínez, San Isidro<br>Solo por encargo</p>
    </nav>''')

open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
```
Expected: `ok`. Si alguna aserción falla, el mensaje dice qué texto no apareció: abrir `index.html`, buscar esa parte y ajustar solo ese patrón (el resto del script no cambia).

- [ ] **Step 4: Los cambios de `home.css`**

Guardar en el scratchpad como `t9_css.py` y correr igual:
```python
import os
import re

os.chdir(r'E:/E descargas/SENTIDA-sitio-web/sentida-site')
p = 'home.css'
s = open(p, encoding='utf-8').read()


def uno(viejo, nuevo):
    global s
    assert s.count(viejo) == 1, viejo[:80]
    s = s.replace(viejo, nuevo)


# Menú: con cuatro secciones entra desde 1100 px; «Nosotras», desde 1280 px.
uno('''.cab-nav .solo-ancho{display:none}
@media (min-width:1200px){.cab-nav .solo-ancho{display:inline-flex}}
.cab-nav a,.cab-tienda{display:inline-flex; align-items:center; min-height:44px}''',
    '''.cab-nav .solo-ancho{display:none}
@media (min-width:1280px){.cab-nav .solo-ancho{display:inline-flex}}
.cab-nav a{display:inline-flex; align-items:center; min-height:44px; white-space:nowrap}''')
uno('''.menu nav a{
  font-family:var(--display); font-size:26px; line-height:1.1;
  display:flex; align-items:center; min-height:56px; border-bottom:1px solid var(--linea);
}''', '''.menu nav a{
  font-family:var(--display); font-size:26px; line-height:1.1;
  display:flex; align-items:center; min-height:56px; border-bottom:1px solid var(--linea);
}
@media (max-width:1099px){
  .cab-in{grid-template-columns:auto 1fr; gap:12px}
  .cab-nav{display:none}
  .menu{display:block}
}''')
uno('  .cab-nav,.cab-tienda,.cab-pedido{display:none}', '  .cab-nav{display:none}')
uno('''  /* Con 390 px de alto, la barra fija se come demasiado: el pedido
     vuelve a la cabecera. */
  .cab-in{grid-template-columns:auto 1fr auto}
  .cab-acc{display:contents}
  .cab-pedido{display:inline-flex; justify-self:end}
''', '''  /* Con 390 px de alto, la barra fija se come demasiado: se esconde. */
''')

# Cómo pedir: tres caminos en lugar del bloque de WhatsApp.
uno('   08 Pedido: un camino principal (WhatsApp de Anto) y el resto al lado',
    '   08 Pedido: tres caminos (la tienda, Decoradas y WhatsApp directo)')
s, n = re.subn(r'\.wa\{gap:12px; align-items:stretch\}.*?\.wa-otras \.ico\{width:16px; height:16px; color:var\(--marron-medio\)\}',
               '''.caminos{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px}
.camino{display:flex; flex-direction:column; gap:14px; padding:clamp(24px,3vw,40px); background:var(--blanco); border:1px solid var(--beige); border-radius:2px}
.camino-eti{font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--celeste-profundo)}
.camino strong{font-size:clamp(28px,2.6vw,40px); font-weight:500; line-height:1}
.camino p{font-size:15px; line-height:1.6; color:var(--marron-medio)}
.camino .botones{margin-top:auto}
.camino-wa{background:var(--marron); border-color:transparent; color:var(--blanco)}
.camino-wa .camino-eti,.camino-wa p{color:var(--crema)}
.camino-wa ul{list-style:none; padding:0; margin-top:auto; border-top:1px solid var(--marron-medio)}
.camino-wa li a{display:flex; align-items:center; gap:12px; min-height:52px; padding:10px 0; border-bottom:1px solid var(--marron-medio); color:var(--blanco); font-size:15px; line-height:1.4}
.camino-wa li a:hover{color:var(--crema); text-decoration:underline; text-underline-offset:5px}
.camino-wa .ico{width:16px; height:16px}
.camino-wa :focus-visible{outline-color:var(--crema)}
.tel{white-space:nowrap}''', s, flags=re.S)
assert n == 1
uno('  .nos figcaption{flex-direction:column; align-items:flex-start; gap:0}',
    '  .nos figcaption{flex-direction:column; align-items:flex-start; gap:0}\n  .caminos{grid-template-columns:minmax(0,1fr)}')

open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
```
Expected: `ok`. (El bloque `.wa…` que se reemplaza incluía `.tel{white-space:nowrap}`: por eso se vuelve a escribir al final del reemplazo.)

- [ ] **Step 5: Borrar la tienda v3**

Run: `git rm -r -q tienda-v3`
Expected: sin salida; `git status --short tienda-v3` muestra solo `D`.

`home-v1.html` (la home vieja de referencia, en `noindex`) tiene seis enlaces a la v3: cuatro a `catalogo.html`, uno a `decoradas.html` y uno a `pedido.html`. Pasarlos a las páginas nuevas:
```bash
sed -i 's#tienda-v3/catalogo\.html#tortas/#g; s#tienda-v3/decoradas\.html#decoradas/#g; s#tienda-v3/pedido\.html#tortas/\#pedido#g' home-v1.html
grep -rn "tienda-v3" --include=*.html --include=*.js --include=*.css --include=*.py --include=*.json . | grep -v "^./docs/"
```
Expected: el `grep` no imprime nada.

- [ ] **Step 6: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde.

---

### Task 10: Las mismas reglas en las cuatro páginas

**Files:**
- Create: `tests/reglas.py`
- Create: `tests/sitio/conftest.py`, `tests/sitio/test_sitio.py`
- Modify: `tests/decoradas/test_aceptacion.py` (reescrito: queda solo lo propio de la comanda)
- Modify: lo que las pruebas marquen (`comun/*.css`, `decoradas/decoradas.css`, `home.css`)

**Interfaces:**
- Produces: `tests/reglas.py` con `CEL`, `TAMANOS`, `TEXTO_CHICO`, `CELESTE_EN_TEXTO`, `ITALICAS` y `CONTRASTE` (snippets que se evalúan en la página).

- [ ] **Step 1: Las reglas compartidas**

`tests/reglas.py`:
```python
"""Comprobaciones que valen para todas las páginas del sitio. Cada una es un
snippet que se evalúa en la página y devuelve la lista de lo que la rompe."""

CEL = dict(is_mobile=True, has_touch=True)
TAMANOS = [(360, 740, CEL), (390, 844, CEL), (768, 1024, {}), (844, 390, CEL), (1440, 900, {}), (2560, 1080, {})]

TEXTO_CHICO = """[...document.querySelectorAll('body *')].filter(e =>
  [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
  e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11).map(e => e.className)"""
CELESTE_EN_TEXTO = """[...document.querySelectorAll('body *')].filter(e =>
  [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
  getComputedStyle(e).color === 'rgb(221, 230, 237)').map(e => e.className)"""
ITALICAS = """[...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).fontStyle === 'italic').length"""

CONTRASTE = r"""(() => {
  const lum = c => {
    const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
      v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const fondo = e => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor, a = c.match(/[\d.]+/g);
      if (a && (a.length < 4 || +a[3] > .9)) return c;
    }
    return 'rgb(254, 250, 248)';
  };
  const malos = [];
  for (const e of document.querySelectorAll('body *')) {
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!e.getClientRects().length || e.closest('[aria-hidden="true"], dialog:not([open]), .sr, [hidden]')) continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden') continue;
    const a = lum(cs.color), b = lum(fondo(e)), r = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
    if (r < (grande ? 3 : 4.5)) malos.push(e.className + ' ' + r.toFixed(2));
  }
  return malos;
})()"""
```

`tests/sitio/conftest.py`:
```python
import pytest


@pytest.fixture
def ruta():
    return ""
```

- [ ] **Step 2: Las pruebas del sitio**

`tests/sitio/test_sitio.py`:
```python
import pytest

from reglas import CEL, CELESTE_EN_TEXTO, CONTRASTE, ITALICAS, TAMANOS, TEXTO_CHICO

PAGINAS = ["", "decoradas/", "tortas/", "antojos/"]
VISIBLE = """(() => {
    const e = document.activeElement;
    if (e === document.body) return null;
    const r = e.getBoundingClientRect();
    return {que: (e.id || e.textContent || '').trim().slice(0, 24),
            visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth};
})()"""


@pytest.mark.parametrize("pagina", PAGINAS)
@pytest.mark.parametrize("w,h,kw", TAMANOS)
def test_sin_desborde_ni_reglas_rotas(abrir, pagina, w, h, kw):
    pg = abrir(w, h, pagina=pagina, **kw)
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0
    assert pg.evaluate(TEXTO_CHICO) == []
    assert pg.evaluate(CELESTE_EN_TEXTO) == []
    assert pg.evaluate(ITALICAS) == 0
    assert pg.errores == []


@pytest.mark.parametrize("pagina", PAGINAS)
@pytest.mark.parametrize("w,h,kw", [(390, 844, CEL), (1440, 900, {})])
def test_contraste_aa(abrir, pagina, w, h, kw):
    pg = abrir(w, h, pagina=pagina, **kw)
    pg.wait_for_timeout(400)
    assert pg.evaluate(CONTRASTE) == []


@pytest.mark.parametrize("pagina", PAGINAS)
def test_sin_javascript_se_ve_y_no_desborda(abrir, pagina):
    pg = abrir(390, 844, pagina=pagina, java_script_enabled=False, **CEL)
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0
    assert pg.locator("main").is_visible()


@pytest.mark.parametrize("pagina", PAGINAS)
def test_la_misma_cabecera(abrir, sitio, pagina):
    pg = abrir(pagina=pagina)
    assert pg.eval_on_selector_all(".cab-nav a", "as => as.map(a => a.href)") == \
        [sitio + "tortas/", sitio + "decoradas/", sitio + "antojos/", sitio + "#nosotras"]
    assert pg.eval_on_selector_all(".cab-nav a", "as => as.map(a => a.textContent)") == \
        ["Nuestras tortas", "Decoradas", "Antojos", "Nosotras"]
    assert pg.locator(".cab [data-mi-pedido]").count() == 1


@pytest.mark.parametrize("pagina", PAGINAS)
@pytest.mark.parametrize("w", [1100, 1280, 1440, 1920])
def test_la_cabecera_no_se_pisa(abrir, pagina, w):
    pg = abrir(w, 900, pagina=pagina)
    r = pg.evaluate("""(() => {
        const vis = [...document.querySelectorAll('.cab-nav a')].filter(a => a.getClientRects().length);
        const m = document.querySelector('.cab-marca').getBoundingClientRect();
        const p = document.querySelector('.cab [data-mi-pedido]').getBoundingClientRect();
        return {n: vis.length, der: Math.max(...vis.map(a => a.getBoundingClientRect().right)),
                marcaIzq: m.left, marcaDer: m.right, pedidoIzq: p.left};
    })()""")
    assert r["n"] == (4 if w >= 1280 else 3)
    assert r["der"] < r["marcaIzq"]
    assert r["marcaDer"] < r["pedidoIzq"]


@pytest.mark.parametrize("pagina", PAGINAS)
@pytest.mark.parametrize("w,h", [(360, 740), (1000, 800)])
def test_en_angosto_entran_el_logo_mi_pedido_y_el_menu(abrir, pagina, w, h):
    pg = abrir(w, h, pagina=pagina, **(CEL if w < 900 else {}))
    assert pg.is_hidden(".cab-nav")
    for sel in (".cab-marca", ".cab [data-mi-pedido]", ".menu summary"):
        b = pg.locator(sel).bounding_box()
        assert b and b["x"] >= 0 and b["x"] + b["width"] <= w, sel


@pytest.mark.parametrize("pagina", ["tortas/", "antojos/"])
def test_teclado_en_la_tienda(abrir, pagina):
    pg = abrir(pagina=pagina, reduced_motion="reduce")
    visitados = 0
    for _ in range(120):
        pg.keyboard.press("Tab")
        pg.wait_for_timeout(50)
        info = pg.evaluate(VISIBLE)
        if info is None:
            break
        assert info["visible"], info
        visitados += 1
    assert visitados > 20
```

`tests/decoradas/test_aceptacion.py` (reemplaza todo el archivo; lo genérico pasó a `tests/sitio/`):
```python
import pytest

from ayuda_decoradas import armar
from reglas import CEL, CONTRASTE


@pytest.mark.parametrize("w,h,kw", [(390, 844, CEL), (360, 740, CEL), (1440, 900, {})])
def test_primer_frame(abrir, w, h, kw):
    pg = abrir(w, h, **kw)
    for sel in (".ticket-portada h1", "#empezar"):
        b = pg.locator(sel).bounding_box()
        assert b["y"] >= 0 and b["y"] + b["height"] <= h, sel


def test_teclado_recorre_todo_con_foco_visible(abrir):
    pg = abrir()
    visitados = 0
    for _ in range(80):
        pg.keyboard.press("Tab")
        pg.wait_for_timeout(600)
        info = pg.evaluate("""(() => {
            const e = document.activeElement;
            if (e === document.body) return null;
            const r = e.getBoundingClientRect();
            return {que: (e.id || e.name || e.textContent || '').trim().slice(0, 24),
                    visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth};
        })()""")
        if info is None:
            break
        assert info["visible"], info
        visitados += 1
    assert visitados > 15  # un paso por vez: solo se recorre el paso actual


@pytest.mark.parametrize("w,h,kw", [(390, 844, CEL), (1440, 900, {})])
def test_contraste_aa_con_una_opcion_elegida(abrir, w, h, kw):
    pg = abrir(w, h, **kw)
    armar(pg, hasta=2)
    pg.check("input[name=tamano][value=mediana]")
    pg.wait_for_timeout(400)  # la opción elegida tiene una transición de 0,2 s
    assert pg.evaluate(CONTRASTE) == []
```

- [ ] **Step 3: Correr las pruebas del sitio**

Run: `python -m pytest tests/sitio tests/decoradas/test_aceptacion.py -q -p no:cacheprovider`
Expected: puede fallar. Cada falla nombra la clase del elemento y, en contraste, la relación medida.

- [ ] **Step 4: Arreglar lo que marquen, en el CSS de la página que corresponda**

Reglas para arreglar (no cambiar las pruebas para que pasen):
- **Desborde horizontal:** buscar el elemento más ancho que el viewport con `pg.evaluate("[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => e.className)")` y darle `min-width:0`, `max-width:100%` o `overflow-wrap:anywhere`, según sea una celda de grilla, una imagen o un texto largo.
- **Texto de menos de 11 px:** subirlo a 11 px o más.
- **Contraste:** en fondos claros usar `--marron` o `--marron-medio`; en `--marron`, usar `--blanco` o `--crema`. Nunca `--beige` ni `--celeste` para texto.
- **Cabecera pisada entre 1100 y 1279 px:** achicar `gap` de `.cab-nav` a 18 px en `@media (max-width:1279px)`, en `comun/base.css` y en `home.css`.
- Si lo que falla es de la home y ya estaba antes de este plan, se arregla igual (es una falla real) y se anota en el README, en la sección de la home.

- [ ] **Step 5: Correr toda la suite**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```
Expected: todo en verde.

---

### Task 11: El brief de fotos para GPT

**Files:**
- Create: `docs/fotos/brief-fotos.html`
- Create: `tests/sitio/test_brief.py`

**Interfaces:**
- Consumes: los nombres de archivo que espera el generador (el slug del producto) y `herramientas/preparar_foto.py`.
- Produces: una página con tres composiciones (A tortas, B antojos, C referencias de Decoradas) y doce fichas `article.ficha[data-archivo]`, cada una con su foto de referencia, el prompt en `textarea.prompt` y un botón `button.copiar`.

Si en Task 8 alguna foto quedó afuera por el sello viejo, su ficha pasa de «Rehacer para que combine» a «Falta».

- [ ] **Step 1: Escribir la prueba**

`tests/sitio/test_brief.py`:
```python
ARCHIVOS = ["cheesecake-dulce-de-leche", "pavlova-dulce-de-leche", "galletas-decoradas", "cupcakes-tematicos",
            "cheesecake-marroc", "brownie-chantilly", "chocotorta", "torta-matilda", "torta-havannet",
            "cupcakes-decorados", "galletas-tematicas", "chupitos"]


def test_el_brief_tiene_una_ficha_por_foto(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html")
    assert pg.eval_on_selector_all(".ficha", "fs => fs.map(f => f.dataset.archivo)") == ARCHIVOS
    for a in ARCHIVOS:
        prompt = pg.input_value(f'.ficha[data-archivo="{a}"] textarea.prompt')
        assert len(prompt) > 200, a
        assert "Sin texto" in prompt or "sin texto" in prompt, a
        assert pg.locator(f'.ficha[data-archivo="{a}"] .ficha-ref img').count() >= 1, a
        assert f"preparar_foto.py" in pg.text_content(f'.ficha[data-archivo="{a}"]'), a
    assert pg.locator(".composicion").count() == 3


def test_todas_las_fotos_de_referencia_cargan(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html")
    rotas = pg.evaluate("[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src'))")
    assert rotas == []
    assert pg.errores == []


def test_copiar_el_prompt(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html", permissions=["clipboard-read", "clipboard-write"])
    pg.click('.ficha[data-archivo="chupitos"] button.copiar')
    pg.wait_for_function("document.querySelector('.ficha[data-archivo=\"chupitos\"] button.copiar').textContent === 'Copiado'")
    assert pg.evaluate("navigator.clipboard.readText()") == pg.input_value('.ficha[data-archivo="chupitos"] textarea.prompt')
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `python -m pytest tests/sitio/test_brief.py -q -p no:cacheprovider`
Expected: FAIL (404).

- [ ] **Step 3: `docs/fotos/brief-fotos.html`**

```html
<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Brief de fotos · SENTIDA</title>
<style>
@font-face{font-family:Erode; src:url("../../assets/fuentes/erode-500.woff2") format("woff2"); font-weight:500; font-display:swap}
@font-face{font-family:Montserrat; src:url("../../assets/fuentes/montserrat-latin.woff2") format("woff2"); font-weight:100 900; font-display:swap}
:root{--blanco:#FEFAF8; --crema:#F8EADE; --beige:#CFB59E; --marron:#402D21; --marron-medio:#6C4D38; --celeste-profundo:#46627A}
*{box-sizing:border-box}
body{margin:0; background:var(--blanco); color:var(--marron); font:15px/1.6 Montserrat, Arial, sans-serif}
main{max-width:1100px; margin:0 auto; padding:48px 20px 96px}
h1,h2,h3{font-family:Erode, Georgia, serif; font-weight:500; line-height:1; margin:0}
h1{font-size:clamp(40px,6vw,72px); letter-spacing:-.02em}
h2{font-size:32px; margin:64px 0 20px}
h3{font-size:24px}
p{margin:0 0 12px; max-width:70ch}
code{font-size:13px; background:var(--crema); padding:2px 6px; border-radius:2px}
ol{padding-left:20px; max-width:70ch}
.baja{font-size:17px; color:var(--marron-medio); margin-top:16px}
.composiciones{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px}
.composicion{background:var(--crema); padding:20px; border-radius:2px}
.composicion ul{padding-left:18px; margin:8px 0 0}
.eti{font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--celeste-profundo)}
.ficha{display:grid; grid-template-columns:220px minmax(0,1fr); gap:24px; padding:28px 0; border-top:1px solid var(--beige)}
.ficha-ref{display:flex; flex-direction:column; gap:8px}
.ficha-ref img{width:100%; aspect-ratio:4/5; object-fit:cover; border-radius:2px; background:var(--crema)}
.ficha-ref small{font-size:12px; color:var(--marron-medio)}
.estado{display:inline-block; margin-left:8px; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; padding:2px 6px; border-radius:2px; background:var(--marron); color:var(--blanco)}
.estado.rehacer{background:var(--crema); color:var(--marron)}
textarea.prompt{width:100%; min-height:190px; margin:12px 0 8px; padding:12px; font:14px/1.5 Montserrat, Arial, sans-serif; color:var(--marron); background:var(--blanco); border:1px solid var(--marron); border-radius:2px; resize:vertical}
button.copiar{min-height:44px; padding:0 18px; font:600 11px Montserrat, Arial, sans-serif; letter-spacing:.18em; text-transform:uppercase; color:var(--blanco); background:var(--marron); border:0; border-radius:2px; cursor:pointer}
button.copiar:focus-visible,textarea.prompt:focus-visible{outline:2px solid var(--celeste-profundo); outline-offset:3px}
.letras{display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; margin-top:12px}
.letras img{width:100%; aspect-ratio:1; object-fit:cover; border-radius:2px}
@media (max-width:640px){ .ficha{grid-template-columns:1fr} .ficha-ref img{max-width:240px} }
</style>
</head>
<body>
<main>
  <p class="eti">SENTIDA · para TRAMA</p>
  <h1>Brief de fotos</h1>
  <p class="baja">Para generar con GPT las fotos de la tienda que faltan o que no combinan con el resto. Cada ficha trae la foto real de referencia, el prompt listo y el nombre con el que tiene que volver.</p>

  <h2>Cómo se usa</h2>
  <ol>
    <li>Guardá la foto de referencia de la ficha (clic derecho, «Guardar imagen») y subila a GPT.</li>
    <li>Tocá «Copiar» y pegá el prompt.</li>
    <li>Guardá el resultado con el nombre de la ficha, por ejemplo <code>cheesecake-dulce-de-leche.png</code>.</li>
    <li>Desde <code>sentida-site/</code>, corré <code>python herramientas/preparar_foto.py &lt;archivo&gt; &lt;nombre&gt;</code> y después <code>python herramientas/generar_tienda.py</code>.</li>
    <li>Mirá la tarjeta en <code>/tortas/</code> o <code>/antojos/</code>, y revisá que no tenga texto, logos ni sellos inventados.</li>
  </ol>

  <h2>Una composición por tipo</h2>
  <div class="composiciones">
    <section class="composicion">
      <p class="eti">A · tienda</p>
      <h3>Tortas de la casa</h3>
      <ul>
        <li>Vertical 4:5.</li>
        <li>La torta entera, centrada, ocupando dos tercios del alto, sobre un plato o una base simple.</li>
        <li>Cámara a tres cuartos (unos 30° sobre la mesa), lente normal.</li>
        <li>Pared lisa crema (#F8EADE) y mesa de madera clara.</li>
        <li>Luz natural de ventana desde la izquierda, sombras suaves.</li>
        <li>Como mucho un plato, un tenedor o un ingrediente real de la torta.</li>
        <li>Nunca: texto, carteles, logos, sellos o stickers (tampoco el de «tienda de pasteles»), personas ni manos.</li>
      </ul>
    </section>
    <section class="composicion">
      <p class="eti">B · tienda</p>
      <h3>Antojos</h3>
      <ul>
        <li>Vertical 4:5.</li>
        <li>Entre tres y seis piezas agrupadas, con aire alrededor; una puede estar partida para ver el relleno.</li>
        <li>Cámara cenital o a 45°.</li>
        <li>Papel manteca o bandeja clara sobre la misma mesa, con fondo crema.</li>
        <li>La misma luz que las tortas.</li>
        <li>Nunca: texto inventado, logos, sellos, personajes de marca, nombres propios, personas ni manos.</li>
      </ul>
    </section>
    <section class="composicion">
      <p class="eti">C · Decoradas</p>
      <h3>Referencias de la comanda</h3>
      <ul>
        <li>Cuadradas 1:1: la torta decorada de frente, a su altura, centrada, con fondo claro liso.</li>
        <li>No se generan: son tortas que hicieron ellas y sirven de referencia real.</li>
        <li>Para «Letras y números» hay tres letras además de los números: la F (la que se usa hoy), la S y la D.</li>
      </ul>
      <div class="letras">
        <img src="../../assets/fotos/letra-f-480.webp" alt="Torta con forma de letra F">
        <img src="../../assets/deco-letra-s.webp" alt="Torta con forma de letra S y flores">
        <img src="../../assets/deco-letra-d.webp" alt="Torta con forma de letra D con flores">
      </div>
    </section>
  </div>

  <h2>Fotos para generar</h2>

  <article class="ficha" data-archivo="cheesecake-dulce-de-leche">
    <div class="ficha-ref"><img src="../../assets/fotos/cheesecake-ny-480.webp" alt="Cheesecake estilo New York de la casa"><small>Referencia: el cheesecake de la casa.</small></div>
    <div>
      <h3>Cheesecake de dulce de leche <span class="estado">Falta</span></h3>
      <p>Composición A. Archivo: <code>cheesecake-dulce-de-leche</code> · <code>python herramientas/preparar_foto.py cheesecake-dulce-de-leche.png cheesecake-dulce-de-leche</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Cheesecake de dulce de leche">Un cheesecake entero, alto y liso, con base de galletitas, cubierto por una capa brillante de dulce de leche que cae apenas por el borde. Que parezca de la misma casa que la foto de referencia, pero con dulce de leche arriba en lugar de frutos rojos. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="pavlova-dulce-de-leche">
    <div class="ficha-ref"><img src="../../assets/fotos/pavlova-480.webp" alt="Pavlova de lima de la casa"><small>Referencia: la pavlova de lima.</small></div>
    <div>
      <h3>Pavlova de dulce de leche y frutos rojos <span class="estado">Falta</span></h3>
      <p>Composición A. Archivo: <code>pavlova-dulce-de-leche</code> · <code>python herramientas/preparar_foto.py pavlova-dulce-de-leche.png pavlova-dulce-de-leche</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Pavlova de dulce de leche y frutos rojos">Una pavlova entera: base de merengue crocante, crema chantilly, hilos de dulce de leche y frutos rojos frescos arriba (frutillas, arándanos y frambuesas). La misma familia que la pavlova de la foto de referencia. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="galletas-decoradas">
    <div class="ficha-ref"><img src="../../assets/fotos/galletas-te-amo-480.webp" alt="Galletas corazón con mensaje"><small>Referencia: el glasé de las galletas corazón.</small></div>
    <div>
      <h3>Galletas decoradas <span class="estado">Falta</span></h3>
      <p>Composición B. Archivo: <code>galletas-decoradas</code> · <code>python herramientas/preparar_foto.py galletas-decoradas.png galletas-decoradas</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Galletas decoradas">Seis galletas de manteca decoradas con glasé en colores suaves (crema, celeste pálido, rosa viejo y marrón claro), con motivos simples: flores, corazones, puntos y líneas. Sin letras ni personajes. El mismo estilo de glasé que las galletas de la foto de referencia. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda. Las piezas agrupadas con aire alrededor, sobre papel manteca, en una mesa de madera clara con fondo crema (#F8EADE); cámara cenital. Estética cálida y artesanal. Sin texto inventado, sin logos, sin sellos ni stickers, sin personajes de marca, sin nombres propios, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="cupcakes-tematicos">
    <div class="ficha-ref"><img src="../../assets/past-cupcakes.webp" alt="Cupcakes decorados de la casa"><small>Referencia: los cupcakes de la casa.</small></div>
    <div>
      <h3>Cupcakes temáticos <span class="estado">Falta</span></h3>
      <p>Composición B. Archivo: <code>cupcakes-tematicos</code> · <code>python herramientas/preparar_foto.py cupcakes-tematicos.png cupcakes-tematicos</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Cupcakes temáticos">Seis cupcakes con buttercream y figuras simples de pasta de azúcar de un mismo tema genérico, por ejemplo flores o dinosaurios en colores suaves. Sin personajes de marca ni nombres. El mismo tipo de cupcake que la foto de referencia. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda. Las piezas agrupadas con aire alrededor, sobre una bandeja clara, en una mesa de madera clara con fondo crema (#F8EADE); cámara a 45°. Estética cálida y artesanal. Sin texto inventado, sin logos, sin sellos ni stickers, sin personajes de marca, sin nombres propios, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="cheesecake-marroc">
    <div class="ficha-ref"><img src="../../assets/producto-cheesecake-marroc.webp" alt="Cheesecake Marroc, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Cheesecake Marroc <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición A. Archivo: <code>cheesecake-marroc</code> · <code>python herramientas/preparar_foto.py cheesecake-marroc.png cheesecake-marroc</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Cheesecake Marroc">El mismo cheesecake de la foto de referencia: cobertura de chocolate con trozos de bombón Marroc arriba, sin el envoltorio ni el logo de la golosina. Una toma nueva de la misma torta. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="brownie-chantilly">
    <div class="ficha-ref"><img src="../../assets/producto-brownie-chantilly.webp" alt="Brownie con dulce de leche y crema chantilly, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Brownie con dulce de leche y crema chantilly <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición A. Archivo: <code>brownie-chantilly</code> · <code>python herramientas/preparar_foto.py brownie-chantilly.png brownie-chantilly</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Brownie con dulce de leche y crema chantilly">La misma torta de la foto de referencia: brownie con dulce de leche y crema chantilly, sin cambiar sus capas ni su decoración. Una toma nueva de la misma torta. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="chocotorta">
    <div class="ficha-ref"><img src="../../assets/producto-chocotorta.webp" alt="Chocotorta, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Chocotorta <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición A. Archivo: <code>chocotorta</code> · <code>python herramientas/preparar_foto.py chocotorta.png chocotorta</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Chocotorta">La misma chocotorta de la foto de referencia (capas de galletitas de chocolate y crema de dulce de leche), sin cambiar su cobertura ni su decoración. Una toma nueva de la misma torta. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="torta-matilda">
    <div class="ficha-ref"><img src="../../assets/producto-torta-matilda.webp" alt="Torta Matilda, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Torta Matilda <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición A. Archivo: <code>torta-matilda</code> · <code>python herramientas/preparar_foto.py torta-matilda.png torta-matilda</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Torta Matilda">La misma torta de chocolate de la foto de referencia, sin cambiar su cobertura ni su decoración. Una toma nueva de la misma torta. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="torta-havannet">
    <div class="ficha-ref"><img src="../../assets/producto-havannet.webp" alt="Torta Havannet, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Torta Havannet <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición A. Archivo: <code>torta-havannet</code> · <code>python herramientas/preparar_foto.py torta-havannet.png torta-havannet</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Torta Havannet">La misma torta de la foto de referencia, sin cambiar sus capas, su cobertura ni su decoración. Una toma nueva de la misma torta. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda, sombras suaves. La torta entera, centrada, ocupando dos tercios del alto, sobre un plato simple; cámara a tres cuartos (unos 30° sobre la mesa), lente normal, sin deformar. Fondo: pared lisa color crema (#F8EADE) y mesa de madera clara. Estética cálida y artesanal, colores naturales. Sin texto, sin carteles, sin logos, sin sellos ni stickers, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="cupcakes-decorados">
    <div class="ficha-ref"><img src="../../assets/past-cupcakes.webp" alt="Cupcakes decorados, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Cupcakes decorados <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición B. Archivo: <code>cupcakes-decorados</code> · <code>python herramientas/preparar_foto.py cupcakes-decorados.png cupcakes-decorados</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Cupcakes decorados">Los mismos cupcakes de la foto de referencia, decorados a mano con buttercream, sin cambiar su decoración. Una toma nueva. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda. Entre cuatro y seis cupcakes agrupados con aire alrededor, sobre una bandeja clara, en una mesa de madera clara con fondo crema (#F8EADE); cámara a 45°. Estética cálida y artesanal. Sin texto inventado, sin logos, sin sellos ni stickers, sin personajes de marca, sin nombres propios, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="galletas-tematicas">
    <div class="ficha-ref"><img src="../../assets/deco-galletas-dino.webp" alt="Galletas de dinosaurios, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Galletas temáticas <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición B. Archivo: <code>galletas-tematicas</code> · <code>python herramientas/preparar_foto.py galletas-tematicas.png galletas-tematicas</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Galletas temáticas">Las mismas galletas de dinosaurios de la foto de referencia, sin cambiar su glasé ni sus colores y sin agregar nombres. Una toma nueva. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda. Las piezas agrupadas con aire alrededor, sobre papel manteca, en una mesa de madera clara con fondo crema (#F8EADE); cámara cenital. Estética cálida y artesanal. Sin texto inventado, sin logos, sin sellos ni stickers, sin personajes de marca, sin nombres propios, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>

  <article class="ficha" data-archivo="chupitos">
    <div class="ficha-ref"><img src="../../assets/past-chupitos.webp" alt="Chupitos, foto actual"><small>Referencia: la foto actual.</small></div>
    <div>
      <h3>Chupitos <span class="estado rehacer">Rehacer para que combine</span></h3>
      <p>Composición B. Archivo: <code>chupitos</code> · <code>python herramientas/preparar_foto.py chupitos.png chupitos</code></p>
      <textarea class="prompt" readonly aria-label="Prompt: Chupitos">Seis chupitos como los de la foto de referencia: postres en vasitos de shot, de distintos sabores, agrupados. Una toma nueva. Foto de producto vertical 4:5, luz natural suave de ventana desde la izquierda. Los vasitos agrupados con aire alrededor, sobre una bandeja clara, en una mesa de madera clara con fondo crema (#F8EADE); cámara a 45°. Estética cálida y artesanal. Sin texto inventado, sin logos, sin sellos ni stickers, sin personajes de marca, sin nombres propios, sin personas ni manos.</textarea>
      <button type="button" class="copiar">Copiar</button>
    </div>
  </article>
</main>
<script>
/* «Copiar»: el prompt de la ficha va al portapapeles. */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('button.copiar');
  if (!b) return;
  var t = b.closest('.ficha').querySelector('textarea.prompt');
  function listo() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 2000); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(listo, function () { t.select(); });
  else { t.select(); document.execCommand('copy'); listo(); }
});
</script>
</body>
</html>
```

- [ ] **Step 4: Correr la prueba del brief**

Run: `python -m pytest tests/sitio/test_brief.py -q -p no:cacheprovider`
Expected: PASS 3/3.

---

### Task 12: Limpieza, README y cierre

**Files:**
- Delete: los assets viejos que ya nada usa
- Modify: `README.md`
- Modify: memoria del proyecto (fuera del repo)

- [ ] **Step 1: Assets viejos sin uso**

Run (desde `sentida-site/`, en Git Bash):
```bash
for f in assets/producto-*.webp assets/past-*.webp assets/deco-*.webp; do
  n=$(basename "$f")
  grep -rqF --include=*.html --include=*.css --include=*.js --include=*.json --include=*.py "$n" . || echo "$f"
done
```
Expected: la lista de archivos que no nombra nadie (el brief sigue usando varios, que quedan). Borrarlos con `git rm -q <archivo>` uno por uno, y volver a correr el bucle: no debe imprimir nada.

- [ ] **Step 2: README**

Reemplazar desde la línea `## Propuesta «La comanda» (24/09/2026)` hasta el final del archivo por:
````markdown
## El sitio en tres partes (24/09/2026)

Propuesta para las dueñas: queda así hasta que ellas la revisen. Spec en
`docs/superpowers/specs/2026-09-24-sitio-tres-partes-design.md`; plan en
`docs/superpowers/plans/2026-09-24-sitio-tres-partes.md`.

| Menú | Dirección | Qué hay | Cómo se pide |
| --- | --- | --- | --- |
| Nuestras tortas | `/tortas/` | Las tortas de la casa | Carrito que termina en un WhatsApp |
| Decoradas | `/decoradas/` | La comanda, un paso por vez | Presupuesto por WhatsApp |
| Antojos | `/antojos/` | Alfajores, galletas, cupcakes, chupitos y la mesa dulce | Carrito; la mesa dulce, por WhatsApp |
| Nosotras | `/#nosotras` | La sección de la home | — |

- **La home** (`index.html`, `home.css`, `home.js`) es la v4. Su hero lleva a
  Decoradas y a Nuestras tortas; «Las de la casa» lleva a cada torta en la
  tienda; las fotos de decoradas abren la comanda con su referencia
  (`?ref=`); «Cómo pedir» ofrece la tienda, Decoradas y WhatsApp directo. El
  Día de la Madre y la barra de WhatsApp del celular siguen iguales.
- **La tienda** se genera: `python herramientas/generar_tienda.py` arma
  `tortas/index.html` y `antojos/index.html` desde `datos/catalogo.json`.
  No se editan a mano. Una foto nueva se prepara con
  `python herramientas/preparar_foto.py <archivo> <slug>` y se vuelve a
  generar. El brief para generar fotos con GPT está en
  `docs/fotos/brief-fotos.html`.
- **El pedido** (`comun/carrito.js`) se guarda en el navegador y se ve en
  «Mi pedido» desde cualquier página. Sin JavaScript, cada producto se pide
  con su propio enlace de WhatsApp.
- **Decoradas** (`decoradas/`) es la comanda: un paso por vez con Volver y
  Siguiente, sin «Lo charlamos»; lo especial va en «¿Algo más que tengamos
  que saber?». `/comanda/` redirige ahí. Sin JavaScript se ven los seis
  pasos juntos y el mensaje se escribe a mano.
- **Lo común** vive en `comun/`: `base.css` (tokens, cabecera y pie),
  `ticket.css`, `tienda.css`, `base.js`, `menu.js`, `pedido-mensaje.js`,
  `carrito.js` y `tienda.js`.
- `/tienda-v3/` se borró el 24/09/2026 (queda en el historial de git).
- Las páginas nuevas van en `noindex` hasta que las dueñas aprueben.

**Pruebas** (desde esta carpeta):

```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
```

**Para confirmar con las dueñas:** los tamaños de las tortas de la casa (hoy
se piden por cantidad); cuántos shots trae cada caja de chupitos y cómo se
vende cada antojo; los precios y la plataforma de pago; que la Marquise es el
«Brownie con dulce de leche y frutos rojos» de su lista; que la Torta Matilda
es la de chocolate de la foto; «Sin conservantes ni aditivos» (convive con la
Choco Oreo); las porciones que se superponen (Mediana 15 a 25, Grande 20 a
30); y quién atiende los pedidos entre Anto y Nadia.

**Para probar en un teléfono real:** el envío sin JavaScript (un formulario
GET manda los espacios como `+`), el selector de fecha en iPhone y el
navegador interno de Instagram.

**Para después:** el logo de la cabecera se pierde; la idea es una animación
en bucle «SENTIDA» → «Pastelería» → «Lo soñás, lo creamos».

Falsos positivos conocidos del detector de Impeccable: `cramped-padding` (el
motor estático no lee `padding-block` ni `clamp()`),
`clipped-overflow-container` en `html`/`body` (es el `overflow-x:clip` que
evita el desborde) y `overused-font` / `cream-palette` (Montserrat y `#FEFAF8`
son de marca).

La home anterior (v1) quedó en `home-v1.html`, en `noindex`, como referencia.
````

- [ ] **Step 3: Actualizar la memoria**

En `C:\Users\Usuario\.claude\projects\e--E-descargas-SENTIDA-sitio-web\memory\sentida-sitio-tres-partes.md`, agregar al final una línea con la fecha del día: `Implementado según docs/superpowers/plans/2026-09-24-sitio-tres-partes.md; las fotos que faltan se generan con docs/fotos/brief-fotos.html.`

- [ ] **Step 4: La suite completa, una última vez**

Run:
```bash
node --test "tests/**/*.test.mjs"
python -m pytest tests -q -p no:cacheprovider
git status --short
```
Expected: todo en verde; `git status` muestra los cambios sin commitear (los commits los pide el usuario).

- [ ] **Step 5: Mirarlo en el navegador**

Con el servidor local (`python -m http.server 8765` desde `sentida-site/`), recorrer a mano en escritorio y en 390 px: la home → «Armá tu torta» → los seis pasos con Siguiente y Volver → el cierre; la home → «Ver nuestras tortas» → agregar dos tortas → Antojos → agregar alfajores → «Mi pedido» → terminar. Anotar cualquier cosa que se vea mal y arreglarla antes de dar el trabajo por terminado.
