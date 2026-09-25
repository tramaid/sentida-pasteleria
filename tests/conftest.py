import functools
import http.server
import pathlib
import socketserver
import threading

import pytest
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parents[1]


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        pass  # el navegador corta conexiones al cerrar contextos: no es un error de la página


@pytest.fixture(scope="session")
def sitio():
    """La raíz del sitio, servida en un puerto libre, con barra final."""
    srv = Servidor(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}/"
    srv.shutdown()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def ruta():
    """La página que abre `abrir` si no se le pasa otra. Cada carpeta la cambia."""
    return ""


@pytest.fixture
def abrir(browser, sitio, ruta):
    """abrir(ancho, alto, init=None, pagina=None, **opciones_de_contexto) -> page con .errores.

    `init` corre antes de los scripts de la página en cada navegación del contexto.
    """
    contextos = []

    def _abrir(w=1440, h=900, init=None, pagina=None, **kw):
        ctx = browser.new_context(viewport={"width": w, "height": h}, **kw)
        contextos.append(ctx)
        ctx.route("https://wa.me/**", lambda r: r.fulfill(body="ok"))
        if init:
            ctx.add_init_script(init)
        pg = ctx.new_page()
        pg.errores = []
        pg.on("pageerror", lambda e: pg.errores.append(str(e)))
        pg.on("console", lambda m: pg.errores.append(m.text) if m.type == "error" and "404" not in m.text else None)
        pg.goto(sitio + (ruta if pagina is None else pagina))
        pg.wait_for_load_state("networkidle")
        return pg

    yield _abrir
    for c in contextos:
        c.close()
