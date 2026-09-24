import pytest

CEL = dict(is_mobile=True, has_touch=True)
TAMANOS = [(360, 740, CEL), (390, 844, CEL), (768, 1024, {}), (844, 390, CEL), (1440, 900, {}), (2560, 1080, {})]

TEXTO_CHICO = """[...document.querySelectorAll('body *')].filter(e =>
  [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
  e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11).map(e => e.className)"""
CELESTE_EN_TEXTO = """[...document.querySelectorAll('body *')].filter(e =>
  [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
  getComputedStyle(e).color === 'rgb(221, 230, 237)').map(e => e.className)"""
ITALICAS = """[...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).fontStyle === 'italic').length"""


@pytest.mark.parametrize("w,h,kw", TAMANOS)
def test_sin_desborde_ni_reglas_rotas(abrir, w, h, kw):
    pg = abrir(w, h, **kw)
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0
    assert pg.evaluate(TEXTO_CHICO) == []
    assert pg.evaluate(CELESTE_EN_TEXTO) == []
    assert pg.evaluate(ITALICAS) == 0
    assert pg.errores == []


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
    assert visitados > 30


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


@pytest.mark.parametrize("w,h,kw", [(390, 844, CEL), (1440, 900, {})])
def test_contraste_aa(abrir, w, h, kw):
    pg = abrir(w, h, **kw)
    assert pg.evaluate(CONTRASTE) == []
    pg.check("input[name=tamano][value=mediana]")
    pg.wait_for_timeout(400)  # la opción elegida tiene una transición de 0,2 s
    assert pg.evaluate(CONTRASTE) == []


def test_sin_js_en_celular_no_desborda(abrir):
    pg = abrir(390, 844, java_script_enabled=False, **CEL)
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0
