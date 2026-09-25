"""Pasa una foto a las variantes que usa el sitio, en assets/fotos/.

Uso, desde sentida-site/:
    python herramientas/preparar_foto.py <archivo> <nombre>
    python herramientas/preparar_foto.py --hero <archivo> <nombre>

Sin --hero (fotos de productos): <nombre>.webp (hasta 1000 px de ancho),
<nombre>-800.webp y <nombre>-480.webp. <nombre> es el slug del producto (o el
campo «foto» del catálogo); después, correr python herramientas/generar_tienda.py.

Con --hero (las fotos grandes de la home): <nombre>-2200.webp, -1400.webp y
-800.webp, sin agrandar nunca una foto más chica: si mide menos de 2200 px de
ancho, la grande sale en su ancho real (una de 2048 x 3072 da -2048, -1400 y
-800). Antes borra los tamaños que hubiera de esa foto. Los nombres que usa la
home son hero-key-lime, hero-cheesecake, hero-carrot, hero-letra-f y
hero-marroc; si cambian los tamaños, hay que actualizar el srcset, el width y
el height de esa foto en index.html.

Acepta JPEG, PNG o WebP.
"""
import pathlib
import re
import sys

from PIL import Image, ImageOps

RAIZ = pathlib.Path(__file__).resolve().parents[1]
FOTOS = RAIZ / "assets" / "fotos"
ANCHO_MAXIMO = 1000
ANCHOS_HERO = (2200, 1400, 800)


def _achicar(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def preparar(origen, nombre, destino=FOTOS, hero=False):
    destino = pathlib.Path(destino)
    with Image.open(origen) as abierta:
        im = ImageOps.exif_transpose(abierta).convert("RGB")
    if hero:
        for vieja in destino.glob(f"{nombre}-*.webp"):
            if re.fullmatch(re.escape(nombre) + r"-\d+\.webp", vieja.name):
                vieja.unlink()
        anchos = {w for w in ANCHOS_HERO if w <= im.width}
        if im.width < ANCHOS_HERO[0]:
            anchos.add(im.width)
        for w in sorted(anchos, reverse=True):
            _achicar(im, w).save(destino / f"{nombre}-{w}.webp", "WEBP", quality=80, method=6)
        return im.size
    if im.width > ANCHO_MAXIMO:
        im = _achicar(im, ANCHO_MAXIMO)
    im.save(destino / f"{nombre}.webp", "WEBP", quality=78, method=6)
    for w in (800, 480):
        if im.width > w:
            _achicar(im, w).save(destino / f"{nombre}-{w}.webp", "WEBP", quality=76, method=6)
    return im.size


if __name__ == "__main__":
    argumentos = sys.argv[1:]
    hero = "--hero" in argumentos
    if hero:
        argumentos.remove("--hero")
    if len(argumentos) != 2:
        sys.exit(__doc__)
    print(preparar(argumentos[0], argumentos[1], hero=hero))
