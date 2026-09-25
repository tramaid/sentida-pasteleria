ARCHIVOS = ["cheesecake-dulce-de-leche", "pavlova-dulce-de-leche", "galletas-decoradas", "cupcakes-tematicos",
            "cheesecake-marroc", "brownie-chantilly", "chocotorta", "torta-matilda", "torta-havannet",
            "cupcakes-decorados", "galletas-tematicas", "chupitos"]


def test_el_brief_tiene_una_ficha_por_foto(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html")
    assert pg.eval_on_selector_all(".ficha", "fs => fs.map(f => f.dataset.archivo)") == ARCHIVOS
    for a in ARCHIVOS:
        prompt = pg.input_value(f'.ficha[data-archivo="{a}"] textarea.prompt')
        assert len(prompt) > 200, a
        assert "Sin texto" in prompt or "sin texto" in prompt, a
        assert pg.locator(f'.ficha[data-archivo="{a}"] .ficha-ref img').count() >= 1, a
        assert f"preparar_foto.py" in pg.text_content(f'.ficha[data-archivo="{a}"]'), a
    assert pg.locator(".composicion").count() == 3


def test_todas_las_fotos_de_referencia_cargan(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html")
    assert pg.evaluate("document.images.length") >= 15
    rotas = pg.evaluate("[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src'))")
    assert rotas == []
    assert pg.errores == []


def test_copiar_el_prompt(abrir):
    pg = abrir(pagina="docs/fotos/brief-fotos.html", permissions=["clipboard-read", "clipboard-write"])
    pg.click('.ficha[data-archivo="chupitos"] button.copiar')
    pg.wait_for_function("document.querySelector('.ficha[data-archivo=\"chupitos\"] button.copiar').textContent === 'Copiado'")
    assert pg.evaluate("navigator.clipboard.readText()") == pg.input_value('.ficha[data-archivo="chupitos"] textarea.prompt')
