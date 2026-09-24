def test_empezar_lleva_a_la_comanda_y_enfoca_la_fecha(abrir):
    pg = abrir()
    pg.click("#empezar")
    pg.wait_for_timeout(80)
    assert pg.evaluate("document.activeElement.id") == "fecha"
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
    assert pg.evaluate("document.activeElement.id") == "fecha"


def test_sin_movimiento_no_anima(abrir):
    pg = abrir(reduced_motion="reduce")
    assert "mov" not in pg.evaluate("document.documentElement.className").split()
    pg.click("#empezar")
    pg.wait_for_timeout(50)
    assert pg.evaluate("document.querySelector('.panel .ticket').getAnimations().length") == 0
    assert pg.evaluate("document.activeElement.id") == "fecha"


def test_la_linea_nueva_se_imprime(abrir):
    pg = abrir()
    pg.check("input[name=bizcochuelo][value=vainilla]")
    assert pg.get_attribute('.panel [data-clave="bizcochuelo"]', "class") == "nueva"


def test_flechas_de_las_mesas(abrir):
    pg = abrir()
    pg.evaluate("document.getElementById('mesas').scrollIntoView({behavior:'instant'})")
    assert pg.is_visible('.fila-ctrl[data-fila="fila-mesas"]')
    assert pg.is_disabled('.fila-ctrl [data-dir="-1"]')
    pg.click('.fila-ctrl [data-dir="1"]')
    pg.wait_for_timeout(900)
    assert pg.evaluate("document.getElementById('fila-mesas').scrollLeft") > 0
    assert pg.is_enabled('.fila-ctrl [data-dir="-1"]')


def test_menu_se_cierra_al_elegir_y_con_escape(abrir):
    pg = abrir(390, 844, is_mobile=True, has_touch=True)
    pg.click(".menu summary")
    assert pg.evaluate("document.querySelector('.menu').open")
    pg.keyboard.press("Escape")
    assert not pg.evaluate("document.querySelector('.menu').open")
    pg.click(".menu summary")
    pg.click(".menu nav a[href='#carta']")
    assert not pg.evaluate("document.querySelector('.menu').open")
