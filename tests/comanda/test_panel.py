CEL = dict(is_mobile=True, has_touch=True)


def centrar(pg, selector):
    pg.evaluate(f"document.querySelector('{selector}').scrollIntoView({{block:'center', behavior:'instant'}})")
    pg.wait_for_timeout(500)


def test_foto_del_panel_sigue_al_paso(abrir):
    pg = abrir()
    for n in (1, 4, 6):
        centrar(pg, f'.paso[data-n="{n}"]')
        assert pg.get_attribute(".panel-foto", "data-activo") == str(n)
    assert pg.text_content("#panel-pie") == "Hecha por nosotras · torta de pétalos"
    caja = pg.locator(".panel .ticket").bounding_box()
    assert caja["y"] >= 0 and caja["y"] + caja["height"] <= 900


def test_tira_reemplaza_la_cabecera(abrir):
    pg = abrir(390, 844, **CEL)
    assert pg.locator("#tira").is_hidden()
    centrar(pg, '.paso[data-n="2"]')
    assert pg.locator("#tira").is_visible()
    assert pg.evaluate("getComputedStyle(document.querySelector('.cab')).visibility") == "hidden"
    pg.check("input[name=tamano][value=chica]")
    assert pg.text_content(".tira-et") == "Tamaño"
    assert pg.text_content(".tira-val") == "chica (10 a 12 porciones)"
    centrar(pg, ".pie")
    assert pg.locator("#tira").is_hidden()


def test_dialogo_de_la_comanda(abrir):
    pg = abrir(390, 844, **CEL)
    centrar(pg, '.paso[data-n="3"]')
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
    centrar(pg, '.paso[data-n="3"]')
    pg.check("input[name=bizcochuelo][value=vainilla]")
    pg.click(".tira-ver")
    with pg.context.expect_page() as nueva:
        pg.click("#comanda-dialogo button[type=submit]")
    assert "Bizcochuelo%3A%20vainilla" in nueva.value.url
