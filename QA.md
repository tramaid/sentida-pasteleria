# Control de entrega

Estado: **base visual de TRAMA aplicada**. Última pasada: 16/09/2026.

## Verificado con mediciones

Nueve anchos (360, 390, 414, 620, 700, 768, 850, 1024, 1440), con el menú
abierto y cerrado, en ventanas de 900 y 2000 px de alto:

- Sin desborde horizontal: `scrollWidth === clientWidth` en los nueve.
- Ningún texto por debajo de 11 px.
- Ningún párrafo en Cormorant: la serif quedó solo en títulos y en la firma.
- Ningún target táctil por debajo de 24×24 (WCAG 2.5.8 AA).
- Ningún texto ni botón sobre fotografía por debajo de 850 px.
- Escape cierra el menú y devuelve el foco al botón.
- «Inicio» queda activo al cargar, también en ventanas altas.
- Sin `font-style: italic` ni Segoe Print en el CSS.
- Los únicos hex del CSS son los siete tokens de la paleta de marca.

## Pendiente de la sesión de fotos

- «Torta Oreo» muestra una torta de limón, que además repite el producto de
  la tarjeta 2. «Brownie con frutillas» muestra una tarta de frutillas.
- **Varias fotos del banco llevan el sello de «tienda de pasteles»**, la marca
  anterior: se ve en `producto-torta-frutas.webp`, en
  `producto-cheesecake-frutos-rojos.webp` y en
  `producto-brownie-frutos-rojos.webp`. Revisar todas antes de publicar.
- Las fotos son verticales 9:16 recortadas a 1:1; falta `object-position` por
  foto hasta tener tomas cuadradas.
- Los tres fondos (hero, celebraciones, proceso) siguen siendo provisorios.
- Falta el retrato de Anto y Nadia para Nosotras.

## Pendiente de decisión

- Tipografía display: Cormorant, una Didone, o el archivo original de la marca.
- Posicionamiento: pastelería de autor o tortas temáticas. Bloquea EST-02 y EST-03.
- Bloque «Cómo pedir» (EST-04): falta seña, anticipación, zonas y costo de envío.
- Horario de retiro y sello circular del pie (EST-06).
- Facebook: no se conectó porque no hay cuenta confirmada.
- Precio y detalle por producto: hoy las tarjetas no son clickeables.
