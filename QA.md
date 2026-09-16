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

## Resuelto en la auditoría del 16/09/2026

- Las seis tarjetas de «Nuestros favoritos» se rehicieron con la lista real de
  productos. Ya no hay una «Torta Oreo» que muestre una torta de limón ni un
  «Brownie con frutillas» que muestre una tarta de frutillas.
- **Sello de «tienda de pasteles»:** se revisaron las 40 fotos del repositorio
  una por una. Llevaban el sello cinco: tres en `assets/` (borradas o
  reemplazadas) y dos en `tienda-v2/fotos/` (`deco-letra-s` y
  `producto-pavlova-lima`, recortadas). Ninguna foto publicada lo lleva hoy.
- El catálogo de `/tienda/` se rehizo contra la misma lista real. Las porciones
  inventadas (8/12/16 por producto) se vaciaron.

## Pendiente de la sesión de fotos

- Ocho de las catorce tortas y dos productos de pastelería no tienen foto.
- Las fotos son verticales de celular recortadas; falta `object-position` por
  foto hasta tener tomas cuadradas.
- Los tres fondos (hero, celebraciones, proceso) siguen siendo provisorios.
- Falta el retrato de Anto y Nadia para Nosotras.

## Pendiente de decisión

- Tipografía display: Cormorant, una Didone, o el archivo original de la marca.
- Posicionamiento: pastelería de autor o tortas temáticas. Bloquea EST-02 y EST-03.
- Bloque «Cómo pedir» (EST-04): falta seña, anticipación, zonas y costo de envío.
- Horario de retiro y sello circular del pie (EST-06).
- Facebook: no se conectó porque no hay cuenta confirmada.
- Precio y detalle por producto.
- Porciones y tamaños de las tortas clásicas: nadie los definió.
- Si «Chocotorta» es el nombre correcto de la foto que la muestra con Oreos.
