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
