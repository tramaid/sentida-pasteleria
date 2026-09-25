import importlib.util
import pathlib

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
_spec = importlib.util.spec_from_file_location("preparar_foto", RAIZ / "herramientas" / "preparar_foto.py")
preparar_foto = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(preparar_foto)


def foto(tmp_path, ancho, alto, formato="JPEG"):
    ruta = tmp_path / f"original.{'webp' if formato == 'WEBP' else 'jpg'}"
    Image.new("RGB", (ancho, alto), (200, 150, 120)).save(ruta, formato)
    return ruta


def anchos(carpeta, nombre):
    return {p.name: Image.open(p).width for p in sorted(carpeta.glob(f"{nombre}*.webp"))}


def test_producto_como_siempre(tmp_path):
    preparar_foto.preparar(foto(tmp_path, 2268, 4032), "torta", destino=tmp_path)
    assert anchos(tmp_path, "torta") == {"torta.webp": 1000, "torta-800.webp": 800, "torta-480.webp": 480}


def test_hero_en_tres_tamanos_grandes(tmp_path):
    # Una webp mejorada que llega directo: sale en 2200, 1400 y 800 px de ancho.
    preparar_foto.preparar(foto(tmp_path, 3000, 4000, "WEBP"), "hero-key-lime", destino=tmp_path, hero=True)
    assert anchos(tmp_path, "hero-key-lime") == {
        "hero-key-lime-1400.webp": 1400, "hero-key-lime-2200.webp": 2200, "hero-key-lime-800.webp": 800}


def test_hero_mas_angosta_que_2200_sale_tambien_en_su_ancho(tmp_path):
    # Las que arman en 2048 x 3072: la grande queda en 2048, sin agrandar, para las pantallas retina.
    preparar_foto.preparar(foto(tmp_path, 2048, 3072, "WEBP"), "hero-letra-f", destino=tmp_path, hero=True)
    assert anchos(tmp_path, "hero-letra-f") == {
        "hero-letra-f-1400.webp": 1400, "hero-letra-f-2048.webp": 2048, "hero-letra-f-800.webp": 800}


def test_hero_no_agranda_una_foto_chica(tmp_path):
    preparar_foto.preparar(foto(tmp_path, 1600, 2000), "hero-chica", destino=tmp_path, hero=True)
    assert anchos(tmp_path, "hero-chica") == {
        "hero-chica-1400.webp": 1400, "hero-chica-1600.webp": 1600, "hero-chica-800.webp": 800}


def test_hero_borra_los_tamanos_de_la_foto_anterior(tmp_path):
    # Si la foto nueva es más chica, no puede quedar la 2200 de la anterior (el srcset la tomaría).
    preparar_foto.preparar(foto(tmp_path, 3000, 4000), "hero-carrot", destino=tmp_path, hero=True)
    preparar_foto.preparar(foto(tmp_path, 3000, 4000), "hero-carrot-cake", destino=tmp_path, hero=True)
    preparar_foto.preparar(foto(tmp_path, 2048, 3072), "hero-carrot", destino=tmp_path, hero=True)
    assert anchos(tmp_path, "hero-carrot-") == {
        "hero-carrot-1400.webp": 1400, "hero-carrot-2048.webp": 2048, "hero-carrot-800.webp": 800,
        "hero-carrot-cake-1400.webp": 1400, "hero-carrot-cake-2200.webp": 2200, "hero-carrot-cake-800.webp": 800}
