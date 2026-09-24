CLAVE = "sentida-comanda-v1"


def test_el_borrador_sobrevive_la_recarga(abrir):
    pg = abrir()
    pg.check("input[name=tamano][value=grande]")
    pg.fill("#idea", "unicornio")
    pg.reload()
    pg.wait_for_load_state("networkidle")
    assert pg.is_checked("input[name=tamano][value=grande]")
    assert pg.input_value("#idea") == "unicornio"
    assert "Tamaño: grande (20 a 30 porciones)" in pg.input_value("#mensaje")
    assert pg.inner_text('.panel [data-clave="tamano"] dd') == "grande (20 a 30 porciones)"


def test_empezar_de_nuevo_lo_borra(abrir):
    pg = abrir()
    pg.check("input[name=tamano][value=grande]")
    pg.click("#reiniciar")
    assert not pg.is_checked("input[name=tamano][value=grande]")
    assert pg.evaluate(f"localStorage.getItem('{CLAVE}')") is None
    pg.reload()
    pg.wait_for_load_state("networkidle")
    assert not pg.is_checked("input[name=tamano][value=grande]")
    assert pg.evaluate("document.activeElement.id") != "reiniciar"


def test_borrador_con_fecha_pasada(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', JSON.stringify({{fecha:'2020-01-01', tamano:'chica'}}))")
    assert pg.input_value("#fecha") == ""
    assert pg.is_checked("input[name=tamano][value=chica]")
    assert pg.errores == []


def test_borrador_roto_no_rompe_nada(abrir):
    pg = abrir(init=f"localStorage.setItem('{CLAVE}', '{{roto')")
    assert pg.errores == []
    assert pg.input_value("#mensaje").startswith("Hola SENTIDA, les paso mi comanda:")
