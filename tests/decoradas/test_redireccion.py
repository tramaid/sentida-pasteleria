def test_la_comanda_vieja_redirige_a_decoradas(abrir):
    # #inicio no es un paso: pasos.js no lo toca, así se ve que el # llega entero.
    pg = abrir(pagina="comanda/?ref=letras#inicio")
    pg.wait_for_url(lambda u: u.endswith("/decoradas/?ref=letras#inicio"))
    assert pg.errores == []


def test_la_redireccion_funciona_sin_javascript(abrir):
    pg = abrir(pagina="comanda/", java_script_enabled=False)
    pg.wait_for_url(lambda u: u.endswith("/decoradas/"))
