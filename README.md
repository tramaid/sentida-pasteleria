# SENTIDA — réplica funcional del home

Sitio estático, responsive y sin proceso de compilación.

## Abrir

Ejecutar un servidor local desde esta carpeta, por ejemplo:

```bash
python -m http.server 8080
```

Luego visitar `http://localhost:8080`.

## Estructura

- `index.html`: contenido y estructura semántica.
- `styles.css`: sistema visual y responsive.
- `app.js`: menú mobile y navegación activa.
- `assets/`: logo, fotografías y recursos originales.

## Datos de contacto

SENTIDA elabora en Martínez, Buenos Aires, y no tiene local a la calle. Los pedidos se toman por WhatsApp:

- Anto: `https://wa.me/5491158300787` (11 5830-0787)
- Nadia: `https://wa.me/5491131459646` (11 3145-9646)
- Instagram: `https://www.instagram.com/sentidapasteleria/`

El prefijo `54 9` es obligatorio para que WhatsApp resuelva móviles argentinos; no quitarlo al editar.

## Pendientes comerciales

- Varias fotos del banco llevan el sello de la marca anterior y dos tarjetas muestran un producto distinto al de su título (ver `QA.md`).
- No hay definición sobre precios, detalle por producto ni zona de entrega.

## Propuesta «La comanda» (24/09/2026)

`/comanda/` es una home alternativa para mostrarles a las dueñas: la
visitante arma su torta decorada en seis pasos, cada elección se imprime
en un ticket y el ticket se manda como mensaje de WhatsApp a Anto. Va en
`noindex` y no reemplaza a la v4. Especificación en
`docs/superpowers/specs/2026-09-24-comanda-design.md`; pruebas en
`tests/comanda/` (`node --test "tests/comanda/*.test.mjs"` y
`python -m pytest tests/comanda/`).

Sin JavaScript funciona igual: el mensaje se escribe a mano en el cuadro
del final y el formulario lo manda a `wa.me`. **Falta probar en un teléfono
real** que WhatsApp muestre bien los espacios en ese modo (un formulario
GET los manda como `+`).

Falsos positivos conocidos del detector de Impeccable en esta página:
`cramped-padding` (el motor estático no lee `padding-block` ni `clamp()`),
`clipped-overflow-container` en `html`/`body` (es el `overflow-x:clip`
que evita el desborde) y `overused-font` / `cream-palette` (Montserrat y
`#FEFAF8` son de marca).

## Home v4 (24/09/2026)

`/index.html` es la home v4, implementada desde «SENTIDA Home.dc.html» de
Claude Design (handoff «Sitio web mil dólares») y corregida tras la auditoría
del mismo día: `index.html`, `home.css` y `home.js`, con fotos en
`assets/fotos/` (cada una en 480 px y en tamaño completo) y fuentes alojadas
en `assets/fuentes/`.

- **Sin JavaScript la página se ve completa y quieta.** El movimiento vive bajo
  `.mov` (JS activo y sin «reducir movimiento»). La carta fija que avanza en
  horizontal vive bajo `.pin` (además, pantalla de 900 × 620 o más); en el
  resto es una fila con desplazamiento propio y flechas.
- **Hasta que exista la tienda de PepperLabs se pide solo por WhatsApp.** Todos
  los «Hacer un pedido» abren el WhatsApp de Anto con un mensaje que pide fecha,
  porciones y torta; cada torta de la carta y cada foto de Decoradas trae su
  propio mensaje. La home no enlaza a `tienda-v3/`, que sigue siendo prototipo
  (disponibilidad de ejemplo, precios sin cargar). En celular hay una barra fija
  de pedido que se esconde en el hero, en el pedido y en el pie.
- **Día de la Madre (domingo 18/10):** franja propia debajo del hero, con su
  mensaje de WhatsApp y tres piezas.
- «Hecho a mano» usa una foto real del proceso; ya no hay imágenes generadas
  en la home.

La home anterior (v1) quedó en `home-v1.html`, en `noindex`, como referencia.

**Para confirmar con las dueñas:** «Sin conservantes ni aditivos» (convive con
la Choco Oreo, que lleva galletitas Oreo), las porciones que se superponen
(Mediana 15 a 25, Grande 20 a 30), si la Marquise es el brownie con dulce de
leche y frutos rojos, y quién atiende los pedidos entre Anto y Nadia.

**Marcas y nombres:** la galería y la pastelería de la tienda ya no muestran
tortas con personajes con marca registrada ni con nombres de chicos (ver
`_marcas_y_nombres` en `tienda-v3/datos.json`). `/tienda/` y `/tienda-v2/` se
borraron el 24/09/2026 junto con esas fotos (quedan en el historial de git).

## Versión definitiva (23/09/2026)

**La home es la de la raíz (v1) y la tienda es `/tienda-v3/`.**

- `/index.html` — la home v1, con las fotos reales de la sesión nueva (hero,
  celebraciones y el retrato de Anto y Nadia en «Nosotras») y la display en
  Erode, igual que la tienda. Todos sus enlaces de catálogo, pedido y
  «Crear mi torta» van a la v3.
- `/tienda-v3/` — catálogo, ficha, tortas decoradas, cómo comprar y pedido.
  «Inicio», «Nosotras» y «Contacto» vuelven a la home de la raíz.
  `tienda-v3/index.html` quedó como redirección a la raíz.
- `/tienda/` (catálogo v1) y `/tienda-v2/` se borraron el 24/09/2026.
- Los banners generados (`hero-sentida-*`, `celebraciones-30-*`,
  `proceso-crema-*`) se borraron el 24/09/2026.
