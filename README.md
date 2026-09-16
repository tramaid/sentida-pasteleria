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

## Las tres versiones

- **`/` + `/tienda/`** — v1. La home indexable con su JSON-LD y el catálogo
  con el motor de CARVAN. Congelada como referencia.
- **`/tienda-v2/`** — v2. La arquitectura editorial, Erode y el configurador
  de nueve pasos. Congelada como referencia. Va en `noindex`: es maqueta.
- **`/tienda-v3/`** — **la consolidación, y la que se sigue.** Composición y
  tipografía de la v2 sobre el motor de la v1, con un solo sistema de tokens
  (`v3.css`), un solo archivo de datos (`datos.json`), una sola biblioteca de
  fotos (`assets/`) y **un solo pedido**: lo que se elige del catálogo y la
  torta que sale del configurador terminan en la misma solicitud y en un único
  mensaje de WhatsApp. Indexable.

La duplicación que queda es deliberada y temporal: la v1 y la v2 siguen con su
copia de fotos porque tienen que seguir renderizando. Cuando la v3 tome la raíz
se borran las dos.
