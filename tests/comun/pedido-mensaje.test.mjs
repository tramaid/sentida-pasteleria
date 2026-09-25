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
  e = P.cambiar(e, 'shots', 'Shots', 1);
  assert.equal(P.total(e), 4);
  e = P.cambiar(e, 'marquise', 'Marquise', -3);
  assert.equal(P.cantidad(e, 'marquise'), 0);
  assert.deepEqual(e.items.map(i => i.slug), ['shots']);
  assert.deepEqual(P.cambiar(e, 'no-esta', 'No', -1).items, e.items);
});

test('no pasa de 99', () => {
  let e = P.cambiar(P.vacio(), 'shots', 'Shots', 98);
  e = P.cambiar(e, 'shots', 'Shots', 5);
  assert.equal(P.cantidad(e, 'shots'), 99);
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

test('una fecha que ya pasó no se puede mandar', () => {
  const uno = {...P.cambiar(P.vacio(), 'marquise', 'Marquise', 1), nombre: 'Lu'};
  assert.equal(P.falta({...uno, fecha: '2026-09-23'}, '2026-09-24'), 'pasada');
  assert.equal(P.falta({...uno, fecha: '2026-09-24'}, '2026-09-24'), '');
  assert.equal(P.FALTA.pasada, 'Elegí una fecha de hoy en adelante.');
});
