"""Pasa una foto a las variantes que usa el sitio, en assets/fotos/:
<nombre>.webp (hasta 1000 px de ancho), <nombre>-800.webp y <nombre>-480.webp.

Uso, desde sentida-site/:
    python herramientas/preparar_foto.py <archivo> <nombre>

<nombre> es el slug del producto (o el campo «foto» del catálogo). Después
de preparar una foto, correr python herramientas/generar_tienda.py.
"""
import pathlib
import sys

from PIL import Image, ImageOps

RAIZ = pathlib.Path(__file__).resolve().parents[1]
FOTOS = RAIZ / "assets" / "fotos"
ANCHO_MAXIMO = 1000


def preparar(origen, nombre):
    with Image.open(origen) as abierta:
        im = ImageOps.exif_transpose(abierta).convert("RGB")
    if im.width > ANCHO_MAXIMO:
        im = im.resize((ANCHO_MAXIMO, round(im.height * ANCHO_MAXIMO / im.width)), Image.LANCZOS)
    im.save(FOTOS / f"{nombre}.webp", "WEBP", quality=78, method=6)
    for w in (800, 480):
        if im.width > w:
            chica = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            chica.save(FOTOS / f"{nombre}-{w}.webp", "WEBP", quality=76, method=6)
    return im.size


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    print(preparar(sys.argv[1], sys.argv[2]))
