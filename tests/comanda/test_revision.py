"""Hallazgos de la revisión final: cada prueba reproduce uno."""
from urllib.parse import unquote

CEL = dict(is_mobile=True, has_touch=True)


def centrar(pg, selector):
    pg.evaluate(f"document.querySelector('{selector}').scrollIntoView({{block:'center', behavior:'instant'}})")
    pg.wait_for_timeout(500)


def test_la_tira_no_corta_lo_elegido_en_360(abrir):
    pg = abrir(360, 740, **CEL)
    centrar(pg, '.paso[data-n="4"]')
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
    pg.check("input[name=tamano][value=chica]")
    pg.fill("#mensaje", "Hola, quiero una chica")
    pg.check("input[name=tamano][value=grande]")
    centrar(pg, '.paso[data-n="2"]')
    pg.click(".tira-ver")
    assert pg.is_visible("#comanda-dialogo .dialogo-editado")
    assert pg.is_hidden("#comanda-dialogo button[type=submit]")
    pg.click("#comanda-dialogo .dialogo-revisar")
    pg.wait_for_timeout(1500)  # el scroll suave hasta el cierre tarda alrededor de un segundo
    assert not pg.evaluate("document.getElementById('comanda-dialogo').open")
    assert pg.evaluate("document.getElementById('mensaje').getBoundingClientRect().top < innerHeight")


def test_dialogo_sin_edicion_manda_directo(abrir):
    pg = abrir(390, 844, **CEL)
    centrar(pg, '.paso[data-n="2"]')
    pg.check("input[name=tamano][value=chica]")
    pg.click(".tira-ver")
    assert pg.is_hidden("#comanda-dialogo .dialogo-editado")
    assert pg.is_visible("#comanda-dialogo button[type=submit]")


def test_la_referencia_se_puede_sacar(abrir):
    pg = abrir()
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
    assert pg.is_hidden("#reiniciar")
    pg.check("input[name=bizcochuelo][value=vainilla]")
    assert pg.is_visible("#reiniciar")
    sin_js = abrir(java_script_enabled=False)
    assert sin_js.is_hidden("#reiniciar")
    assert sin_js.is_hidden("#reescribir")


def test_si_la_pestana_nueva_esta_bloqueada_va_en_la_misma(abrir):
    pg = abrir(390, 844, init="window.open = () => null;", **CEL)
    pg.check("input[name=bizcochuelo][value=vainilla]")
    with pg.expect_navigation():
        pg.click("#envio button[type=submit]")
    assert pg.url.startswith("https://wa.me/5491158300787?text=")
    assert "Bizcochuelo: vainilla" in unquote(pg.url.split("?text=", 1)[1])
