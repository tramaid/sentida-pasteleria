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
