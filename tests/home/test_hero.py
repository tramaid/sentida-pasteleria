"""El hero de la home: texto quieto y cinco fotos que se turnan, a sangre con degradado."""
import pytest

CEL = dict(is_mobile=True, has_touch=True)
FOTOS = [
    ("Key Lime Pie", "Ver en la tienda", "tortas/#key-lime-pie", "hero-key-lime"),
    ("Cheesecake estilo New York", "Ver en la tienda", "tortas/#cheesecake-new-york", "hero-cheesecake"),
    ("Carrot cake", "Ver en la tienda", "tortas/#carrot-cake", "hero-carrot"),
    ("Torta con letra", "Armá la tuya", "decoradas/?ref=letras", "hero-letra-f"),
    ("Cheesecake Marroc", "Ver en la tienda", "tortas/#cheesecake-marroc", "hero-marroc"),
]
ACTUAL = "[...document.querySelectorAll('.hero-foto img')].findIndex(i => i.classList.contains('activa'))"


def con_reloj(abrir, sitio, **kw):
    """Una página de la home con el reloj controlado desde antes de cargar."""
    base = abrir(**kw)
    pg = base.context.new_page()
    pg.clock.install()
    pg.goto(sitio)
    pg.wait_for_load_state("networkidle")
    return pg


def etiqueta(pg):
    return (pg.text_content(".hero-etiqueta-n"), pg.text_content(".hero-etiqueta-ir"),
            pg.get_attribute(".hero-etiqueta", "href"))


def test_cinco_fotos_y_la_primera_carga_primero(abrir):
    pg = abrir()
    assert pg.locator(".hero-foto img").count() == len(FOTOS)
    fuentes = pg.eval_on_selector_all(".hero-foto img", "is => is.map(i => i.getAttribute('srcset') || i.dataset.srcset)")
    assert all(f[3] in fuente for f, fuente in zip(FOTOS, fuentes)), fuentes
    assert pg.locator(".hero-avance [data-foto]").count() == len(FOTOS)
    primera = pg.locator(".hero-foto img").first
    assert primera.get_attribute("fetchpriority") == "high"
    assert "hero-key-lime" in pg.evaluate("document.querySelector('.hero-foto img').currentSrc")
    assert "hero-key-lime" in pg.get_attribute('link[rel="preload"][as="image"]', "imagesrcset")
    assert etiqueta(pg) == FOTOS[0][:3]
    assert pg.errores == []


@pytest.mark.parametrize("w,h,dpr,kw", [(1440, 900, 1, {}), (1920, 1080, 1, {}), (1440, 900, 2, {}),
                                        (390, 844, 3, CEL), (2560, 1440, 1, {})])
def test_las_fotos_no_se_pixelan(abrir, w, h, dpr, kw):
    # Cada foto, ya cargada, no se estira más de un 10 % por encima de su tamaño real.
    pg = abrir(w, h, device_scale_factor=dpr, **kw)
    estiramientos = pg.evaluate("""async () => {
        const out = [];
        for (const img of document.querySelectorAll('.hero-foto img')) {
            if (!img.currentSrc || img.currentSrc.startsWith('data:')) await new Promise(r => img.addEventListener('load', r, {once: true}));
            const real = new Image(); real.src = img.currentSrc; await real.decode();
            const r = img.getBoundingClientRect();
            const escala = Math.max(r.width / real.naturalWidth, r.height / real.naturalHeight) * devicePixelRatio;
            out.push([img.currentSrc.split('/').pop(), Math.round(escala * 100) / 100]);
        }
        return out;
    }""")
    assert all(e <= 1.1 for _, e in estiramientos), estiramientos


def test_las_fotos_cambian_solas(abrir, sitio):
    pg = con_reloj(abrir, sitio)
    assert pg.evaluate(ACTUAL) == 0
    pg.clock.run_for(6600)
    assert pg.evaluate(ACTUAL) == 1
    assert etiqueta(pg) == FOTOS[1][:3]
    assert pg.get_attribute(".hero-foto img:nth-child(2)", "aria-hidden") is None
    assert pg.get_attribute(".hero-foto img:nth-child(1)", "aria-hidden") == "true"
    pg.clock.run_for(6600 * (len(FOTOS) - 1))
    assert pg.evaluate(ACTUAL) == 0


def test_las_barritas_saltan_y_frenan(abrir, sitio):
    pg = con_reloj(abrir, sitio)
    pg.click(".hero-avance [data-foto='3']")
    assert pg.evaluate(ACTUAL) == 3
    assert etiqueta(pg) == FOTOS[3][:3]
    assert pg.get_attribute(".hero-avance [data-foto='3']", "aria-current") == "true"
    assert pg.get_attribute(".hero-pausa", "aria-label") == "Seguir con las fotos"
    pg.mouse.move(5, 5)
    pg.evaluate("document.activeElement.blur()")
    pg.clock.run_for(20000)
    assert pg.evaluate(ACTUAL) == 3


def test_pausa_y_sigue(abrir, sitio):
    pg = con_reloj(abrir, sitio)
    pg.click(".hero-pausa")
    pg.mouse.move(5, 5)
    pg.evaluate("document.activeElement.blur()")
    pg.clock.run_for(20000)
    assert pg.evaluate(ACTUAL) == 0
    pg.click(".hero-pausa")
    assert pg.get_attribute(".hero-pausa", "aria-label") == "Pausar las fotos"
    pg.mouse.move(5, 5)
    pg.evaluate("document.activeElement.blur()")
    pg.clock.run_for(6600)
    assert pg.evaluate(ACTUAL) == 1


def test_el_mouse_encima_frena(abrir, sitio):
    pg = con_reloj(abrir, sitio)
    pg.hover(".hero-foto")
    pg.clock.run_for(20000)
    assert pg.evaluate(ACTUAL) == 0
    pg.mouse.move(5, 5)
    pg.clock.run_for(6600)
    assert pg.evaluate(ACTUAL) == 1


def test_el_foco_del_teclado_frena(abrir, sitio):
    pg = con_reloj(abrir, sitio)
    pg.focus(".hero-etiqueta")
    pg.clock.run_for(20000)
    assert pg.evaluate(ACTUAL) == 0


def test_con_movimiento_reducido_queda_quieta_pero_se_puede_cambiar(abrir, sitio):
    pg = con_reloj(abrir, sitio, reduced_motion="reduce")
    pg.clock.run_for(20000)
    assert pg.evaluate(ACTUAL) == 0
    pg.click(".hero-avance [data-foto='1']")
    assert pg.evaluate(ACTUAL) == 1


def test_sin_javascript_se_ve_la_primera(abrir):
    pg = abrir(java_script_enabled=False)
    assert pg.is_hidden(".hero-avance")
    opacidades = pg.eval_on_selector_all(".hero-foto img", "is => is.map(i => getComputedStyle(i).opacity)")
    assert opacidades == ["1"] + ["0"] * (len(FOTOS) - 1)
    assert etiqueta(pg) == FOTOS[0][:3]


@pytest.mark.parametrize("w,h,kw", [(360, 740, CEL), (390, 844, CEL), (844, 390, CEL), (1440, 900, {})])
def test_primer_frame(abrir, w, h, kw):
    pg = abrir(w, h, **kw)
    for sel in ("#hero-t", ".hero .btn-1", ".hero-etiqueta"):
        b = pg.locator(sel).bounding_box()
        assert b["y"] >= 0 and b["y"] + b["height"] <= h, sel


@pytest.mark.parametrize("w", [900, 1100, 1440, 1920])
def test_el_texto_no_pisa_la_foto(abrir, w):
    # En escritorio la foto se funde con el crema: el texto termina antes de donde la foto ya es opaca.
    pg = abrir(w, 900)
    r = pg.evaluate("""(() => {
        const f = document.querySelector('.hero-foto').getBoundingClientRect();
        const der = Math.max(...[...document.querySelectorAll('.hero-txt > *')].map(e => e.getBoundingClientRect().right));
        return {opaca: f.left + f.width * 0.34, der};
    })()""")
    assert r["der"] < r["opaca"], r


@pytest.mark.parametrize("w,h,kw", [(900, 800, {}), (1100, 800, {}), (1440, 900, {}), (1825, 831, {}),
                                    (1920, 1080, {}), (2560, 1440, {}), (390, 844, CEL), (844, 390, CEL)])
def test_el_titulo_va_en_dos_lineas(abrir, w, h, kw):
    # «Lo soñás, / lo creamos.»: en pantallas anchas el margen izquierdo no puede comerse el ancho del texto.
    pg = abrir(w, h, **kw)
    lineas = pg.evaluate("""(() => {
        const t = document.getElementById('hero-t'), cs = getComputedStyle(t);
        return Math.round(t.getBoundingClientRect().height / parseFloat(cs.lineHeight));
    })()""")
    assert lineas == 2
