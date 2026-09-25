# SENTIDA · El sitio en tres partes: Nuestras tortas, Decoradas y Antojos

Fecha: 24/09/2026 · Estado: aprobada · Autoría: TRAMA con Claude

## 1. Para qué es

Hasta ahora había dos cosas sueltas: la home v4 (`/`), que pide todo por WhatsApp, y la propuesta «La comanda» (`/comanda/`), que era una home alternativa. Este cambio las junta en **un solo sitio** con dos formas de comprar:

- **Decoradas:** la torta personalizada. Se arma con la comanda y se pide presupuesto por WhatsApp; se reserva con seña.
- **La tienda:** todo lo que no es personalizado, repartido en **Nuestras tortas** (las tortas de la casa) y **Antojos** (las cositas chiquitas). Se elige, se junta en un carrito y sale un solo mensaje de WhatsApp.

Es una propuesta para las dueñas: queda así hasta que ellas la revisen.

## 2. Decisiones tomadas

- La comanda pasa a ser **Decoradas**, y solo para tortas personalizadas.
- La comanda se recorre **un paso por vez, con Siguiente y Volver**: no se baja con el scroll.
- **Sin «Lo charlamos».** Es un producto con opciones fijas: cada paso pide una opción real. Lo que no entra en las opciones va al final, en «¿Algo más que tengamos que saber?».
- La tienda funciona con **carrito que termina en WhatsApp**: sin precios ni pago, porque todavía no hay precios cargados ni plataforma de pago elegida (PepperLabs no es seguro).
- La tienda es **nueva, con el lenguaje del ticket** de la comanda; no se recicla la tienda v3.
- Menú: **Nuestras tortas · Decoradas · Antojos · Nosotras**. «La carta» pasa a ser Nuestras tortas; «Mesas dulces» deja el menú y la mesa dulce pasa adentro de Antojos.
- La sección de las cositas chiquitas se llama **Antojos** (`/antojos/`).
- Los **vasitos no se venden sueltos**: aparecen solo como parte de la mesa dulce.
- Se revierte la regla «solo WhatsApp hasta PepperLabs, sin Tienda en el menú»: ahora la tienda está en el menú.

Siguen valiendo las reglas de siempre: paleta de siete tokens; el celeste `#DDE6ED` nunca en texto ni en grandes superficies; Erode 500 + Montserrat autoalojadas; sin itálicas; nada por debajo de 11 px; voseo y «nosotras»; no se inventan precios, fechas ni disponibilidad; solo fotos reales, sin personajes con marca registrada ni nombres de chicos; cada página se ve completa sin JavaScript y el movimiento va solo bajo `.mov`.

## 3. Alcance

**Dentro:** la comanda en pasos en `/decoradas/`; las páginas `/tortas/` y `/antojos/` con el carrito; «Mi pedido» en la cabecera de las cuatro páginas; los cambios de enlaces y secciones de la home; la redirección de `/comanda/`; el borrado de `tienda-v3/`; el brief de fotos para generar las que faltan (§11).

**Fuera:** precios, pagos, disponibilidad real por fecha, fichas de producto por separado, tamaños de las tortas de la casa, productos de temporada (no es la época) y la animación del logo (ver §10).

## 4. Mapa del sitio

| En el menú | Dirección | Qué hay | Cómo se pide |
| --- | --- | --- | --- |
| Nuestras tortas | `/tortas/` | Las tortas de la casa | Carrito |
| Decoradas | `/decoradas/` | La comanda en pasos | Presupuesto por WhatsApp |
| Antojos | `/antojos/` | Alfajores, galletas, cupcakes, chupitos y, al final, la mesa dulce | Carrito; la mesa dulce se consulta por WhatsApp |
| Nosotras | `/#nosotras` | La sección de la home | — |

**Cabecera** con el mismo contenido en las cuatro páginas: a la izquierda el menú, al centro el logo (lleva a `/`), a la derecha **«Mi pedido»** con la cantidad de productos del carrito. En celular: logo, «Mi pedido» y «Menú» (`<details>`, como hoy). El menú del celular suma, en la home, «Día de la Madre» y «Cómo pedir».

**Dos pedidos separados, a propósito.** La torta decorada no entra en el carrito: se presupuesta y se reserva con seña. Lo de la tienda es catálogo cerrado. Salen dos mensajes distintos.

**Direcciones viejas:** `/comanda/` queda como una página mínima que redirige a `/decoradas/` (`<meta http-equiv="refresh">`, `rel=canonical` y un enlace visible). `tienda-v3/` se borra; queda en el historial de git.

## 5. Decoradas: la comanda en pasos

### 5.1 La página

Cabecera común, portada, la comanda y el pie. **Salen** de esta página la carta, las mesas y Nosotras: ya viven en el resto del sitio.

La portada es el ticket en blanco de hoy, con otro título: **«Armá tu torta.»** y la línea «En seis pasos, y te la cotizamos por WhatsApp.». Botones: «Empezar mi comanda» y **«Ver nuestras tortas»** (`/tortas/`). Si hay un borrador con un paso guardado, el primero dice **«Seguir mi comanda»** y lleva a ese paso. El gesto de entrada no cambia: el ticket viaja al panel (escritorio) o a la tira (celular).

### 5.2 Los pasos

| Paso | Pregunta | Para pasar hace falta | Opciones |
| --- | --- | --- | --- |
| 1 | ¿Para cuándo? | una fecha o «Todavía no sé» | fecha (mínimo hoy) |
| 2 | ¿Para cuántos? | un tamaño | Chica (10 a 12) · Mediana (15 a 25) · Grande (20 a 30) |
| 3 | ¿Qué bizcochuelo? | un bizcochuelo | Vainilla · Chocolate |
| 4 | ¿Con qué la rellenamos? | un relleno (los agregados son opcionales) | Dulce de leche · Butter choco; agregados: bombón, merenguitos, chips, nuez, maní |
| 5 | ¿Y el segundo relleno? | un segundo relleno | Frutos rojos · Crema Oreo · Crema Bon o Bon · Crema Chocotorta · Crema Kinder |
| 6 | ¿Cómo la imaginás? | nada: todo es opcional | idea, referencia (Pétalos, Flores naturales, Letras y números, Con mensaje, Sin referencia), nombre, número |
| 7 | Cierre: «Tu comanda está lista.» | — | «¿Algo más que tengamos que saber?», el mensaje, el envío |

«Todavía no sé» se queda en la fecha: no es una opción de la torta, y hay quien pide presupuesto antes de tener el día.

### 5.3 Cómo se mueve

- Se ve **un paso por vez**. Al pie del paso: **Volver** (desde el paso 2) y **Siguiente**. En el paso 6 el botón dice **«Ver mi comanda»**; en el cierre queda solo Volver.
- **Siguiente se ve inactivo** hasta que el paso tiene lo que hace falta. Si se toca igual, aparece una línea que dice qué falta («Elegí un tamaño para seguir.»), se anuncia y el foco va a las opciones. Se usa `aria-disabled`, no `disabled`, para que el botón siga siendo alcanzable y explique por qué no avanza.
- **Elegir no avanza solo.**
- **Cada línea del ticket lleva a su paso** (en el panel, en la tira desplegada y en el cierre), solo si ese paso ya se alcanzó.
- **El botón atrás del navegador vuelve un paso:** cada cambio de paso se guarda en el historial (`#paso-3`). Si se entra con `#paso-5` pero faltan pasos anteriores, se va al primero que falte.
- **Al cambiar de paso,** el foco va al título del paso (`tabindex="-1"`), así un lector de pantalla anuncia «Paso 3 de 6, ¿Qué bizcochuelo?». En celular la página vuelve al principio del paso.
- **Transición:** la pregunta nueva entra con un deslizamiento corto (solo bajo `.mov`); sin movimiento, el cambio es directo.
- **Encima del paso:** «Paso 3 de 6» y una barrita de seis tramos.
- **El borrador** guarda también el paso actual y el «¿Algo más?». Al volver, se retoma ahí.
- **Desde la home:** `/decoradas/?ref=petalos` (o `flores`, `letras`, `mensaje`) deja esa referencia elegida en el paso 6, sin pisar un borrador que ya tenga otra.

### 5.4 Cómo se ve

- **Computadora:** a la izquierda, el paso a toda la altura de la pantalla (debajo de la cabecera), con Volver y Siguiente siempre al pie. A la derecha, el panel de hoy: la foto de cada paso y el ticket encima. La foto cambia según el paso, no según el scroll.
- **Celular:** arriba, la tira del ticket (lo último que se eligió y «Ver»); Volver y Siguiente en una barra fija abajo. El paso 6 es largo y se recorre dentro de la página, con la barra siempre visible.
- **Sin JavaScript:** todos los pasos uno abajo del otro, sin Volver ni Siguiente, y el mensaje se escribe a mano (como hoy).

### 5.5 El mensaje

Igual que hoy, con dos cambios: desaparece «charlamos» y se suma, si se completó, la línea **«Además: …»** al final. Un paso sin tocar sigue quedando «a definir».

## 6. La tienda: Nuestras tortas y Antojos

### 6.1 Las páginas

`/tortas/` y `/antojos/` tienen la misma forma:

1. Cabecera común.
2. Título («Nuestras tortas.» / «Antojos.») y una línea de presentación.
3. Grilla de productos: foto, nombre, descripción y **«Agregar al pedido»**. En Antojos, cada tarjeta dice además el tipo (Alfajores, Galletas, Cupcakes, Chupitos). Sin filtros: son pocos.
4. **Productos sin foto:** tarjeta crema con el nombre en Erode grande, en vez de ocultarlos.
5. **Solo en Antojos, al final, la mesa dulce:** la fila de fotos de hoy (vasitos, carrot en cuadraditos, galletas, alfajores), «Armamos la mesa con vos, según los invitados» y «Consultar por una mesa dulce» por WhatsApp.
6. Pie común.

Cada tarjeta tiene `id` con su slug (`/tortas/#key-lime-pie`); al llegar con ese ancla, la tarjeta se marca un momento.

### 6.2 Los productos

Salen de `datos/catalogo.json` (el `datos.json` de la v3, limpio). Donde la home ya usa un nombre corto, manda ese nombre y la composición va en la descripción. Los productos de temporada (`pan dulce`, `rosca de Pascua`) quedan cargados pero no se muestran (`"visible": false`).

**Nuestras tortas (15):** Key Lime Pie · Cheesecake estilo New York · Cheesecake Marroc · Cheesecake de dulce de leche · Marquise · Brownie con dulce de leche y crema chantilly · Frutillas con crema · Sablée · Pavlova de lima · Pavlova de dulce de leche y frutos rojos · Chocotorta · Choco Oreo · Carrot cake · Torta Matilda · Torta Havannet.

**Antojos (7):** Alfajores de maicena · Galletas corazón · Galletas decoradas · Galletas temáticas · Cupcakes decorados · Cupcakes temáticos · Chupitos.

Fotos: se usan las de `assets/fotos/` cuando existen (con sus variantes 480/800); las que solo existen en `assets/producto-*.webp` o `assets/past-*.webp` se pasan a variantes 480/800 y se revisan una por una por si llevan el sello viejo de «tienda de pasteles». Sin foto hoy: Cheesecake de dulce de leche, Pavlova de dulce de leche y frutos rojos, Galletas decoradas y Cupcakes temáticos.

### 6.3 El carrito es el ticket

- **«Agregar al pedido»** se convierte en un contador **− 1 +** y el producto se imprime en el ticket «Tu pedido» con la misma animación de la comanda. Bajar a 0 lo saca.
- **Computadora:** el ticket queda fijo a la derecha de la grilla, con la lista, «Precio y disponibilidad te los confirmamos por WhatsApp.» y **«Terminar pedido»**. **Celular:** una tira abajo, «Tu pedido · 3 productos · Ver», que abre el ticket en un diálogo.
- **«Terminar pedido»** abre un diálogo con el ticket y cuatro preguntas: **¿Para cuándo?** (fecha, mínimo hoy, obligatoria), **¿Retiro o envío?** (Retiro en Martínez · Envío en Zona Norte; viene elegido Retiro), **¿A nombre de quién?** (obligatoria) y **¿Algo más?** (opcional). Después, **«Mandar pedido por WhatsApp a Anto»**, y abajo el enlace a Nadia.
- **El mensaje:**

  ```text
  Hola SENTIDA, quiero hacer este pedido:
  • Key Lime Pie × 1
  • Alfajores de maicena × 12
  Para: sábado 7/11
  Entrega: retiro en Martínez
  A nombre de: Laura
  Además: sin nuez, por favor
  ¿Me confirman precio y disponibilidad?
  ```

- **Después de mandar,** el diálogo ofrece **«Vaciar el pedido»** y «Todavía no», para que no se mande dos veces.
- **El pedido se guarda en el navegador** (`localStorage`, clave `sentida-pedido-v1`: slug, nombre y cantidad de cada producto, más las respuestas del diálogo), así pasa de Nuestras tortas a Antojos sin perderse. Datos rotos o con forma rara se descartan sin romper nada.
- **«Mi pedido» en la cabecera** muestra la cantidad y abre el mismo diálogo desde cualquier página, incluida la home y Decoradas. Con el pedido vacío, el diálogo dice «Todavía no agregaste nada» y ofrece Nuestras tortas y Antojos.
- En el ticket, abajo: **«¿Querés una torta decorada? Armala acá»** (`/decoradas/`).
- Si el navegador bloquea la pestaña nueva, WhatsApp se abre en la misma (como la comanda).

### 6.4 Sin JavaScript

Cada tarjeta muestra **«Pedir por WhatsApp»** con el producto ya escrito en el mensaje (`Hola SENTIDA, quiero pedir: Key Lime Pie.` + `Para:` y `Cantidad:`). No aparecen el contador ni el diálogo. «Mi pedido» es un enlace a `/tortas/#pedido`, donde el ticket del panel explica que sin JavaScript se pide producto por producto.

## 7. Cambios en la home v4

- **Cabecera:** el menú nuevo y «Mi pedido» en lugar de «Hacer un pedido».
- **Hero:** botón principal **«Armá tu torta»** (`/decoradas/`), segundo **«Ver nuestras tortas»** (`/tortas/`).
- **Las de la casa:** cada torta lleva a esa torta en `/tortas/#slug`, con «Ver en la tienda» en lugar de «Consultar». La última tarjeta («¿Buscás otra?») pasa a ser «Ver todas».
- **Una torta para cada historia:** las fotos abren `/decoradas/` con la referencia que les corresponde: Pétalos → `?ref=petalos`; Letras, Macarons y rosas (número 15) y Tonos celestes (número 16) → `?ref=letras`; Con mensaje → `?ref=mensaje`; Dos pisos, sin referencia. «Contanos tu idea» pasa a ser **«Armá tu torta»**.
- **Mesas dulces → Antojos:** la sección conserva la fila de fotos y pasa a presentar los antojos («Ver los antojos», `/antojos/`) y la mesa dulce («Consultar por una mesa dulce», WhatsApp). El ancla pasa a `#antojos`.
- **Cómo pedir:** tres opciones: la tienda (Nuestras tortas y Antojos, carrito), Decoradas (presupuesto) y WhatsApp directo (Anto, Nadia, Instagram).
- **Sin cambios:** el Día de la Madre y la barra de WhatsApp del celular.
- La home carga `comun/ticket.css` y `comun/carrito.js` para que «Mi pedido» abra el ticket.

## 8. Cómo se construye

```text
comun/
  base.css            tokens, tipografías, cabecera, pie, botones (para decoradas, tortas y antojos)
  ticket.css          el ticket de papel, el diálogo, el contador (para las cuatro páginas)
  pedido-mensaje.js   funciones puras: del pedido al texto de WhatsApp (se prueban en Node)
  carrito.js          el pedido guardado, «Mi pedido», el diálogo, el envío
  tienda.css          la grilla, las tarjetas y el panel de la tienda (para tortas y antojos)
decoradas/            la comanda mudada desde comanda/
  index.html, decoradas.css
  mensaje.js          sin «charlamos», con «Además»
  comanda.js, borrador.js, panel.js, movimiento.js
  pasos.js            paso actual, Siguiente/Volver, validación, historial, saltos desde el ticket
tortas/index.html     generadas; no se editan a mano
antojos/index.html
datos/catalogo.json   fuente única de los productos
herramientas/generar_tienda.py   lee el catálogo y escribe tortas/ y antojos/
comanda/index.html    redirección a /decoradas/
```

- **Sin build:** el HTML generado se sube al repo y GitHub Pages lo sirve como hoy. Para cambiar un producto se edita `datos/catalogo.json` y se corre `python herramientas/generar_tienda.py`.
- La home conserva `home.css` (ya auditado); solo suma estilos para «Mi pedido» y los cambios de secciones. La cabecera tiene el mismo contenido en las cuatro páginas aunque la home la estilice con su propio CSS.
- `comun/ticket.css` usa los mismos nombres de tokens que `home.css` y `base.css`.
- El diálogo del pedido lo crea `carrito.js` (sin JavaScript no hay carrito, así que no hace falta en el HTML); el ticket del panel de la tienda sí está en el HTML, con el aviso para quien no tiene JavaScript.

## 9. Pruebas

- **Node:** `mensaje.test.mjs` (sin «charlamos», con «Además») y `pedido-mensaje.test.mjs` (lista, fecha, entrega, nombre, además, vacío).
- **Playwright, Decoradas:** Siguiente inactivo con su aviso y foco; Volver; atrás del navegador; saltos desde el ticket solo a pasos alcanzados; retomar en el paso guardado; «Seguir mi comanda»; `?ref=` sin pisar un borrador; «Además» en el ticket y el mensaje; foto del panel por paso; sin JavaScript se ven los seis pasos y el envío manda solo el texto.
- **Playwright, tienda:** agregar, sumar y restar hasta sacar; el pedido pasa de `/tortas/` a `/antojos/`; el número de «Mi pedido» en las cuatro páginas; el diálogo pide fecha y nombre; el mensaje exacto; vaciar después de mandar; pestaña bloqueada; datos rotos en `localStorage`; sin JavaScript cada tarjeta tiene su WhatsApp.
- **Playwright, home:** los enlaces nuevos (menú, hero, tortas a `/tortas/#slug`, decoradas con `?ref=`, antojos), la redirección de `/comanda/`.
- **En las cuatro páginas:** sin desborde horizontal en 360 px, ningún texto por debajo de 11 px, nada de texto en celeste, contraste AA, recorrido con teclado, página completa sin JavaScript, sin errores en consola.
- **Generador:** correrlo dos veces da el mismo HTML; cada producto visible aparece una vez y con su `id`.

## 10. Pendientes

**Con las dueñas:**

- Tamaños de las tortas de la casa (hoy se piden por cantidad).
- Cuántos shots trae cada caja de chupitos y cómo se vende cada antojo (unidad, docena, caja).
- Precios y plataforma de pago.
- Que la Marquise es el mismo producto que el «Brownie con dulce de leche y frutos rojos» de su lista; que la Torta Matilda es la de chocolate de la foto.
- Lo de antes: «Sin conservantes ni aditivos», los rangos de porciones que se pisan, si Anto es el contacto principal.

**Para después (acordado):** el logo de la cabecera se pierde. Idea: una animación en bucle que muestre primero «SENTIDA», después «Pastelería» y después «Lo soñás, lo creamos». Se diseña aparte.

**En un teléfono real:** el envío sin JavaScript (espacios como «+»), el selector de fecha en iPhone, el navegador de Instagram.

## 11. Brief de fotos

Un archivo para que el usuario genere con GPT las fotos que faltan o que no combinan, con la foto real como referencia. Va en `docs/fotos/brief-fotos.html` (se abre con el servidor local o desde GitHub Pages) y tiene:

- **Una composición por tipo**, para que todas las fotos de un mismo tipo se vean de la misma familia: tortas de la casa, antojos y referencias de decoradas. Para cada tipo: formato (4:5 en la tienda, 1:1 en las referencias), encuadre, altura de cámara, fondo, luz, props permitidos y lo que no puede aparecer (sellos o stickers de «tienda de pasteles», personajes con marca, nombres de chicos, texto inventado).
- **Una ficha por foto a generar,** con la foto de referencia que ya tenemos al lado, el prompt listo para copiar y el nombre de archivo con el que tiene que volver (para que el generador de la tienda la tome sin tocar nada más).
- **Qué fotos:** las cuatro que no existen (Cheesecake de dulce de leche, Pavlova de dulce de leche y frutos rojos, Galletas decoradas, Cupcakes temáticos) y las de la tienda que solo existen en baja o con otra estética (`assets/producto-*.webp`, `assets/past-*.webp`).
- **Letras:** en la comanda, la referencia se llama «Letras y números»; además de la F hay tortas con S y con D (`assets/deco-letra-s.webp`, `assets/deco-letra-d.webp`). El brief las usa como referencia de esa familia.
