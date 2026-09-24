# SENTIDA · La comanda — especificación de diseño

Fecha: 24/09/2026 · Estado: para revisar · Autoría: TRAMA con Claude

## 1. Para qué es

Una home completamente nueva para SENTIDA Pastelería, pensada como **propuesta para mostrarles a Anto y Nadia**. Convive con la home v4 (`/index.html`), que no se toca. Si las dueñas eligen esta dirección, se lleva a producción en otra etapa.

La idea central: la página es una **comanda de pastelería**. La visitante arma su torta decorada paso a paso y cada elección se imprime como una línea en un ticket. Al final, ese ticket es el mensaje de WhatsApp que le llega a Anto. Es «Lo soñás, lo creamos» convertido en mecánica.

## 2. Decisiones tomadas

Lo que se decidió en la conversación:

- Concepto: **Capas / la comanda** (se descartaron «del mensaje a la torta» y «la mesa servida»).
- Forma de mostrar la torta que se arma: **C · la comanda**, un ticket sobre una foto real, no una ilustración.
- En celular: **B · el ticket arriba**, que reemplaza a la cabecera mientras se arma; se despliega al tocarlo; el botón de WhatsApp va al final del recorrido y dentro del ticket desplegado.
- Entrada: **B · la comanda es la portada**, con «Lo soñás, lo creamos.» impreso como encabezado del ticket y fotos reales a los costados.
- Estructura: armado primero; después, compacto, la carta, las mesas dulces y nosotras.
- **Sin Día de la Madre**: la propuesta es atemporal.
- Pedido solo por WhatsApp, al número de Anto.

Reglas que siguen valiendo (de la marca y de decisiones anteriores): paleta de siete tokens; el celeste `#DDE6ED` nunca en texto ni en grandes superficies; Erode 500 + Montserrat; sin itálicas; nada por debajo de 11 px; voseo y «nosotras»; no se inventan precios, fechas ni disponibilidad; solo fotos reales, sin personajes con marca registrada ni nombres de chicos.

## 3. Alcance

**Dentro:** una página nueva en `comanda/` con la entrada, el armado de seis pasos, el cierre por WhatsApp, la carta en grilla, las mesas dulces, nosotras y el pie.

**Fuera:** la tienda v3 (no se enlaza, sigue siendo prototipo), la carta con precios, pagos, disponibilidad real por fecha, el Día de la Madre, cambios en la v4.

## 4. Estructura de la página

1. **Cabecera.** Logo al centro. En escritorio: «La carta», «Mesas dulces», «Nosotras» y el botón «Empezar mi comanda» (lleva a `#comanda`). En celular: logo y «Menú» (`<details>`, igual que en la v4).
2. **Portada (la comanda en blanco).** Fondo crema. En el centro, un ticket grande con encabezado «SENTIDA · Pastelería · Comanda nº —», el título «Lo soñás, / lo creamos.» y las líneas vacías (Fecha, Tamaño, Bizcochuelo, Rellenos, Decoración). Dentro del ticket: «Empezar mi comanda» y «Ver la carta». A los costados, dos fotos reales (la torta número 15 y la letra F). Debajo, una línea: «Tortas hechas a mano por Anto y Nadia en Martínez, San Isidro. Armá la tuya y te la cotizamos por WhatsApp.»
3. **La comanda** (`#comanda`): seis pasos y el cierre (sección 5).
4. **¿Preferís una de la casa?** (`#carta`): las siete tortas de la carta en una grilla (4 × 2 en escritorio con una octava tarjeta «¿Buscás otra? Preguntanos»; 2 columnas en celular). Cada una con foto, nombre, descripción y «Consultar» por WhatsApp con su mensaje.
5. **Mesas dulces** (`#mesas`): título, una línea de texto, «Consultar por una mesa dulce» y una fila con desplazamiento propio de las siete fotos (con flechas en escritorio).
6. **Nosotras** (`#nosotras`): «Somos dos, y hacemos todo nosotras.», Anto y Nadia con sus números (links a WhatsApp), la etiqueta de la caja, el IAG y «Cuidamos el detalle hasta en la caja y la tarjeta.»
7. **Pie:** sello, «Lo soñás, lo creamos.», links a las secciones, WhatsApp, Instagram, «Martínez, San Isidro · Solo por encargo».

Sale respecto de la v4: el manifiesto palabra por palabra, la carta fija horizontal, los pasos 01–05, la sección «Hecho a mano» y el «SENTIDA» gigante del pie. La lista de «Hecho a mano» pasa como una línea al pie del ticket: «Sin conservantes · Por encargo · Retiro en Martínez o envío en Zona Norte».

## 5. La comanda

Todos los datos salen de `tienda-v3/datos.json` → `configurador`, que pasaron las dueñas.

| Paso | Pregunta | Control | Opciones | Línea del ticket |
| --- | --- | --- | --- | --- |
| 1 | ¿Para cuándo? | fecha (`type=date`, mínimo hoy) + «Todavía no sé» | fecha libre | Fecha: sábado 7/11 |
| 2 | ¿Para cuántos? | opción única | Chica, 10 a 12 porciones · Mediana, 15 a 25 · Grande, 20 a 30 · Lo charlamos | Tamaño: mediana (15 a 25 porciones) |
| 3 | ¿Qué bizcochuelo? | opción única | Vainilla · Chocolate · Lo charlamos | Bizcochuelo: vainilla |
| 4 | ¿Con qué la rellenamos? | opción única + casillas | Dulce de leche · Butter choco · Lo charlamos. Agregados: bombón, merenguitos, chips, nuez, maní | Relleno: dulce de leche con chips y nuez |
| 5 | ¿Y el segundo relleno? | opción única | Frutos rojos · Crema Oreo · Crema Bon o Bon · Crema Chocotorta · Crema Kinder · Lo charlamos | Segundo relleno: frutos rojos |
| 6 | ¿Cómo la imaginás? | texto + referencia opcional + nombre + número | Idea libre; referencias con foto real: Pétalos, Flores naturales, Letras y números, Con mensaje; «Nombre en la torta»; «Número o edad» | Decoración: flores naturales en tonos pastel · Nombre: «Mamá» · Número: 60 |

Reglas:

- **Impreso desde el principio** en el ticket: «Cobertura: buttercream de vainilla» e «Incluye: nombre, número en chocolate, decoraciones básicas, velita y detalles en buttercream». Nota fija: «Flores naturales y figuras especiales se cotizan aparte».
- **«Lo charlamos»** (o «Todavía no sé») escribe «a definir». Un paso sin tocar también queda «a definir».
- **Decoración:** si hay texto y referencia, la línea es «texto (como la de referencia)»; solo referencia, «como la de referencia»; nada, «a definir». Nombre y número solo aparecen si se completaron.
- **Fecha escrita a mano:** si el navegador no tiene selector de fecha y la visitante escribe algo que no es una fecha ISO («7 de noviembre»), se respeta tal cual.
- **Fecha honesta:** debajo del campo, «Trabajamos con cupo por día: te confirmamos si la fecha está libre». Nunca se muestra disponibilidad.
- **Cierre:** el ticket completo y el cuadro de texto del mensaje (editable), con el botón «Mandar por WhatsApp a Anto» y «Empezar de nuevo». También, en chico: «¿Preferís escribirle a Nadia?» con su link.

Mensaje (una línea por dato, en este orden; las líneas «a definir» se incluyen):

```text
Hola SENTIDA, les paso mi comanda:
Fecha: sábado 7/11
Tamaño: mediana (15 a 25 porciones)
Bizcochuelo: vainilla
Relleno: dulce de leche con chips y nuez
Segundo relleno: frutos rojos
Decoración: flores naturales en tonos pastel (como la de flores naturales)
Nombre: Mamá
Número: 60
```

## 6. Diseño visual

- **Ticket:** papel `--blanco` con borde inferior dentado (clip-path), sombra suave con desplazamiento, filetes punteados `--beige` entre líneas, encabezado en Montserrat 600 con tracking, título en Erode. Valores en `--marron`; los vacíos como «…» en `--marron-medio` (el beige no llega al contraste AA). Los números con cifras tabulares.
- **Escritorio (≥ 900 px):** dos columnas. Izquierda, el paso actual (un paso por pantalla, títulos en Erode grande, opciones como botones de borde marrón que se rellenan al elegir). Derecha, fija, una foto real a sangre con pie («Hecha por nosotras · …») y el ticket encima. La foto cambia por paso: 1 flores naturales, 2 dos pisos, 3 carrot cake, 4 marquise, 5 sablée, 6 pétalos, cierre Anto con la torta.
- **Celular (< 900 px):** mientras la sección de la comanda está en pantalla, la cabecera se esconde y queda arriba una tira del ticket que muestra la última línea impresa y «Ver comanda». Al tocarla, el ticket se despliega hacia abajo (panel con foco atrapado y cierre con Escape). La foto del paso aparece chica debajo de las opciones. Fuera de la comanda vuelve la cabecera.
- **Portada:** como en la sección 4. En celular, el ticket ocupa el ancho con las fotos arriba en una fila.
- **Carta, mesas, nosotras, pie:** mismo lenguaje de la v4 corregida, más compacto.
- **Tokens y reglas:** los de `home.css` de la v4 (paleta, fuentes con respaldos métricos, `--lateral`, `--cab`). El celeste solo como relleno chico (por ejemplo, la marca de la opción elegida o la tarjeta «¿Buscás otra?»).

## 7. Comportamiento

- **Mejora progresiva.** El armado es un `<form action="https://wa.me/5491158300787" method="get" target="_blank">`. Sin JavaScript, cada paso se ve completo y el cierre es un `<textarea name="text">` con la plantilla del mensaje para completar a mano; enviar abre WhatsApp. Con JavaScript, el `textarea` se llena solo con cada elección y el envío arma la URL con `encodeURIComponent` (espacios como `%20`, tildes y saltos de línea correctos).
- **Controles nativos:** `fieldset`/`legend` por paso, radios, casillas, `input type=date`, `input` de texto y `textarea`. Nada de controles inventados.
- **Lectores de pantalla:** región `aria-live="polite"` que anuncia la línea recién impresa («Relleno: dulce de leche»). El ticket desplegado en celular es un diálogo con nombre, foco atrapado y Escape.
- **Borrador:** las elecciones se guardan en `localStorage` (con `try/catch`); al volver, el ticket se reconstruye. «Empezar de nuevo» lo borra. Nada sale del navegador.
- **Movimiento (un solo gesto):** al tocar «Empezar mi comanda», el ticket de la portada viaja a su lugar fijo (FLIP con `transform`). Cada línea nueva entra con un avance corto del papel (translateY + opacidad, 250 ms). Todo bajo `.mov` (JavaScript activo y sin «reducir movimiento»), con la misma regla de la v4: sin clases, la página se ve completa y quieta.
- **Cabecera ↔ tira del ticket en celular:** `IntersectionObserver` sobre `#comanda`.
- **Doble toque en «Empezar mi comanda»:** la animación anterior se cancela; nunca hay dos superpuestas.
- **Estados:** paso sin elegir (ticket con «…»), elección, «Lo charlamos», cierre, borrador restaurado, error de `localStorage` (se sigue sin guardar).

## 8. Archivos

- `comanda/index.html` — la página (`noindex`, `lang="es-AR"`, canónica a sí misma).
- `comanda/comanda.css` — estilos; copia los tokens de `home.css` (no se comparte archivo con la v4 para no acoplarlas).
- `comanda/mensaje.js` — funciones puras: del estado a las líneas del ticket y al texto de WhatsApp (probadas en Node).
- `comanda/comanda.js` — núcleo: lee el formulario, pinta los tickets, escribe el mensaje y lo manda; expone `window.Comanda`.
- `comanda/borrador.js` — el borrador en `localStorage`.
- `comanda/panel.js` — foto por paso en escritorio; tira y diálogo en celular.
- `comanda/movimiento.js` — el gesto de la comanda, las flechas de la fila y el menú.
- Usa `assets/fotos/`, `assets/fuentes/`, `assets/logo-sentida.svg`, `assets/SENTIDASELLO.svg`, `assets/favicon.svg`. Todas las fotos ya existen en `assets/fotos/` salvo la carrot cake entera, que está en `assets/producto-carrot-cake.webp`: se agrega a `assets/fotos/carrot-cake.webp` con sus variantes de 480 y 800 px.

## 9. Criterios de aceptación

- Sin desborde horizontal en 360, 390, 768, 844 × 390 (apaisado), 1440 y 2560.
- Primer frame en celular: el ticket con el título y «Empezar mi comanda» a la vista.
- El recorrido completo se hace solo con teclado; el foco siempre visible.
- Sin JavaScript: se ven los seis pasos, el cuadro de mensaje con la plantilla y el botón funciona (abre `wa.me` con el texto).
- Con JavaScript: la URL de WhatsApp contiene exactamente el mensaje de la sección 5 (se verifica decodificando la URL), con tildes y saltos de línea.
- El borrador sobrevive a una recarga; «Empezar de nuevo» lo borra.
- Con «reducir movimiento» no hay animaciones y todo funciona.
- Ningún texto por debajo de 11 px, ningún celeste en texto, contraste AA en todo el texto.
- Detector de Impeccable sin hallazgos reales (los falsos positivos conocidos se documentan).

## 10. Riesgos y preguntas abiertas

- **Formulario sin JavaScript y los espacios:** un formulario GET codifica los espacios como `+`. Hay que confirmar en un teléfono real que `wa.me` los muestra como espacios; si no, el modo sin JavaScript pide copiar el texto y usa un link común.
- **Marcas en los rellenos** (Oreo, Bon o Bon, Chocotorta, Kinder): son sabores del configurador de las dueñas, en texto; no hay imágenes de marca.
- **Pendientes con las dueñas** (heredados): «Sin conservantes ni aditivos», porciones que se superponen (Mediana 15 a 25, Grande 20 a 30), si Anto es el contacto principal, y si los pedidos por WhatsApp aceptan este formato de comanda.
- **Fotos por paso:** son referencias de su trabajo, no la torta que se arma; el pie de foto lo aclara.
