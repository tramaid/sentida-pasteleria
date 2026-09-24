import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../../comanda/mensaje.js');

const COMPLETO = {
  fecha: '2026-11-07', sinFecha: false, tamano: 'mediana', bizcochuelo: 'vainilla',
  relleno: 'ddl', agregados: ['chips', 'nuez'], relleno2: 'frutos-rojos',
  idea: 'flores naturales en tonos pastel', referencia: 'flores', nombreTorta: 'Mamá', numero: '60'
};

test('fecha en palabras', () => {
  assert.equal(M.fecha('2026-11-07'), 'sábado 7/11');
  assert.equal(M.fecha('2026-10-18'), 'domingo 18/10');
  assert.equal(M.fecha('2026-02-30'), '');
  assert.equal(M.fecha(''), '');
  assert.equal(M.fecha(undefined), '');
});

test('lista con «y»', () => {
  assert.equal(M.lista([]), '');
  assert.equal(M.lista(['nuez']), 'nuez');
  assert.equal(M.lista(['chips', 'nuez']), 'chips y nuez');
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

test('«Lo charlamos» escribe a definir pero no queda vacío', () => {
  const l = M.lineas({tamano: 'charlamos'}).find(x => x.clave === 'tamano');
  assert.equal(l.valor, 'a definir');
  assert.equal(l.vacio, false);
});

test('«Todavía no sé» la fecha', () => {
  const l = M.lineas({fecha: '2026-11-07', sinFecha: true})[0];
  assert.deepEqual([l.valor, l.vacio], ['a definir', false]);
});

test('fecha escrita a mano se respeta', () => {
  assert.equal(M.lineas({fecha: '7 de noviembre'})[0].valor, '7 de noviembre');
});

test('agregados sin relleno elegido', () => {
  const l = M.lineas({relleno: 'charlamos', agregados: ['nuez']}).find(x => x.clave === 'relleno');
  assert.equal(l.valor, 'a definir, con nuez');
});

test('decoración solo con referencia, e idea con espacios de más', () => {
  assert.equal(M.lineas({referencia: 'petalos'})[5].valor, 'como la de pétalos');
  assert.equal(M.lineas({idea: '  rosa   y  dorado '})[5].valor, 'rosa y dorado');
});

test('nombre y número solo si se completaron', () => {
  assert.equal(M.lineas({nombreTorta: '  ', numero: ''}).length, 6);
  assert.deepEqual(M.lineas({nombreTorta: 'Lu', numero: '5'}).slice(6).map(l => l.valor), ['Lu', '5']);
});

test('url de WhatsApp codificada, sin «+» y con caracteres raros', () => {
  const u = M.url('5491158300787', 'Hola & chau #1\nrosa 🌸 á');
  assert.ok(u.startsWith('https://wa.me/5491158300787?text='));
  const q = u.split('?text=')[1];
  assert.ok(!q.includes('+') && !q.includes(' ') && !q.includes('&') && !q.includes('#'));
  assert.equal(decodeURIComponent(q), 'Hola & chau #1\nrosa 🌸 á');
});
