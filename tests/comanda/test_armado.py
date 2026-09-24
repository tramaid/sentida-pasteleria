from urllib.parse import unquote

ESPERADO = "\n".join([
    "Hola SENTIDA, les paso mi comanda:",
    "Fecha: sábado 7/11",
    "Tamaño: mediana (15 a 25 porciones)",
    "Bizcochuelo: vainilla",
    "Relleno: dulce de leche con chips y nuez",
    "Segundo relleno: frutos rojos",
    "Decoración: flores naturales en tonos pastel (como la de flores naturales)",
    "Nombre: Mamá",
    "Número: 60",
])


def armar(pg):
    pg.fill("#fecha", "2026-11-07")
    pg.check("input[name=tamano][value=mediana]")
    pg.check("input[name=bizcochuelo][value=vainilla]")
    pg.check("input[name=relleno][value=ddl]")
    pg.check("input[name=agregado][value=nuez]")
    pg.check("input[name=agregado][value=chips]")
    pg.check("input[name=relleno2][value=frutos-rojos]")
    pg.fill("#idea", "flores naturales en tonos pastel")
    pg.check("input[name=referencia][value=flores]")
    pg.fill("#nombre-torta", "Mamá")
    pg.fill("#numero", "60")


def texto_de(url):
    assert url.startswith("https://wa.me/5491158300787?text=")
    q = url.split("?text=", 1)[1]
    assert "+" not in q
    return unquote(q)


def test_ticket_y_mensaje_en_vivo(abrir):
    pg = abrir()
    assert pg.inner_text('.panel [data-clave="tamano"] dd') == "…"
    armar(pg)
    assert pg.input_value("#mensaje") == ESPERADO
    assert pg.inner_text('.panel [data-clave="relleno"] dd') == "dulce de leche con chips y nuez"
    assert pg.inner_text('.panel [data-clave="nombre"] dd') == "Mamá"
    pg.keyboard.press("Tab")  # el anuncio de un campo de texto llega al terminar de escribirlo
    assert pg.text_content("#anuncio") == "Número: 60"
    assert pg.errores == []


def test_mandar_abre_whatsapp_con_el_mensaje(abrir):
    pg = abrir()
    armar(pg)
    with pg.context.expect_page() as nueva:
        pg.click("#envio button[type=submit]")
    assert texto_de(nueva.value.url) == ESPERADO


def test_lo_charlamos(abrir):
    pg = abrir()
    pg.check("input[name=tamano][value=charlamos]")
    assert pg.inner_text('.panel [data-clave="tamano"] dd') == "a definir"
    assert "Tamaño: a definir" in pg.input_value("#mensaje")


def test_sin_fecha_limpia_la_fecha(abrir):
    pg = abrir()
    pg.fill("#fecha", "2026-11-07")
    pg.check("#sin-fecha")
    assert pg.input_value("#fecha") == ""
    assert "Fecha: a definir" in pg.input_value("#mensaje")
    pg.fill("#fecha", "2026-11-07")
    assert not pg.is_checked("#sin-fecha")


def test_mensaje_editado_a_mano_no_se_pisa(abrir):
    pg = abrir()
    pg.fill("#mensaje", "Hola, quiero algo especial")
    pg.check("input[name=bizcochuelo][value=chocolate]")
    assert pg.input_value("#mensaje") == "Hola, quiero algo especial"
    assert pg.is_visible("#reescribir")
    pg.click("#reescribir")
    assert "Bizcochuelo: chocolate" in pg.input_value("#mensaje")
    assert pg.is_hidden("#reescribir")


def test_caracteres_raros_llegan_enteros(abrir):
    pg = abrir()
    pg.fill("#idea", 'rosa & dorado #1, "vintage" 🌸')
    with pg.context.expect_page() as nueva:
        pg.click("#envio button[type=submit]")
    assert 'Decoración: rosa & dorado #1, "vintage" 🌸' in texto_de(nueva.value.url)


def test_fecha_minima_es_hoy(abrir):
    pg = abrir()
    assert pg.get_attribute("#fecha", "min") == pg.evaluate(
        "(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()")
