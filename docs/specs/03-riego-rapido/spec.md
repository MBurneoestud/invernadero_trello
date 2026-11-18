# Spec 03 · Registrar un riego rápido desde la lista

- **Historia:** HU-1.8 · Registrar un riego rápido desde la lista. Ver [docs/backlog/E1-plantas-y-riegos.md](../../backlog/E1-plantas-y-riegos.md).
- **Objetivo:** el cuidador anota un riego de hoy desde la pantalla «Plantas», sin abrir el detalle de la planta.
- **API:** `POST /api/riegos` y `GET /api/plantas/:id/riegos`, que ya existen (spec 01). Esta spec no cambia el backend.
- **Diseño:** [DESIGN.md](../../../DESIGN.md) y los [wireframes](wireframes/README.md) de esta carpeta. Si los wireframes y esta spec se contradicen, manda esta spec.
- **Estado:** lista para implementar.

## Reglas

### Panel

- **DEBE** añadir a cada planta de la lista un botón secundario «Regar». En el móvil va a todo el ancho, al final de la tarjeta; en escritorio, en una columna nueva a la derecha con el encabezado «Acción».
- **DEBE** desplegar al pulsar «Regar» un panel en línea: dentro de la tarjeta en el móvil y en una fila a todo el ancho justo debajo de la fila de la planta en escritorio.
- **DEBE** mostrar en el panel el nombre de la planta, el campo «Cantidad (ml)» con 500 ya escrito, el texto «Se anotará con fecha de hoy, <fecha corta>.» (con `fechaCorta` de `client/src/formato.js`) y las acciones «Guardar riego» y «Cancelar».
- **DEBE** tener como mucho un panel abierto. Abrir otro cierra el anterior sin guardar nada. Mientras un panel está abierto, su «Regar» se marca con `aria-expanded="true"` y fondo gris claro; pulsarlo otra vez hace lo mismo que «Cancelar».
- **DEBE** usar en el campo de cantidad `inputmode="numeric"` y un `<label>` visible.
- **DEBE** usar solo botones secundarios en el panel («Guardar riego», «Cancelar», «Sí, anotar otro»). El único botón primario de la pantalla sigue siendo «Registrar planta».
- **NO DEBE** pedir fecha ni cuidador. El riego se envía sin `fecha` (la API usa hoy) y sin `cuidador`.

### Guardar

- **DEBE** seguir este orden al pulsar «Guardar riego»:
  1. Pasar al estado «Guardando riego…» (solo texto). Se desactivan «Guardar riego», el campo de cantidad, «Cancelar» y los «Regar» de las demás plantas.
  2. Pedir `GET /api/plantas/:id/riegos`.
  3. Si algún riego tiene fecha de hoy, mostrar el aviso de riego de hoy y esperar la decisión del cuidador.
  4. Si no, o si el cuidador pulsa «Sí, anotar otro», enviar `POST /api/riegos` con `{ planta, cantidadMl }`.
- **DEBE** decidir si un riego es de hoy con una función pura `esDeHoy(fecha, ahora)` en `client/src/formato.js`: verdadero si la fecha cae en el mismo día de calendario que `ahora`, en hora local.
- **DEBE** enviar un solo `POST` por cada guardado, aunque el cuidador pulse varias veces o el aviso se confirme con varios clics. Mientras hay una petición en vuelo, un clic más no hace nada.
- **NO DEBE** validar la cantidad en el cliente. Las reglas son las de la API (HU-1.2), y sus mensajes se muestran tal como llegan.

### Resultados

| Estado | Qué se muestra |
|---|---|
| Guardando | «Guardando riego…» en el panel, con los controles desactivados según la regla de arriba |
| Éxito | El panel se cierra y en su lugar aparece el mensaje de éxito «Riego guardado para <nombre>.». La lista no se recarga y no cambia la posición de desplazamiento. El mensaje desaparece al abrir otro panel |
| Ya tiene riego hoy | Caja neutra, sin icono de error, encima de las acciones: «<nombre> ya tiene un riego hoy. ¿Quieres anotar otro?», con «Sí, anotar otro» y «Cancelar». La cantidad queda bloqueada mientras se decide |
| Error de cantidad (400 con `campo: "cantidadMl"`) | El mensaje de la API debajo del campo, con icono y borde de error de 2 px `--color-error`. El panel sigue abierto con el valor escrito. El mensaje desaparece al volver a guardar |
| Otro error de la API (400 con otro campo, 404) | El mensaje de la API arriba del panel, debajo de la fecha. Nunca un código HTTP |
| Error de conexión | Arriba del panel: «No pudimos guardar el riego. Revisa que la API esté encendida y vuelve a intentarlo.». El panel sigue abierto con la cantidad escrita y «Guardar riego» vuelve a estar activo |

- **DEBE** tratar como error de conexión **también** el fallo de la consulta del historial del paso 2: no se guarda el riego, se muestra el mismo mensaje y se puede reintentar. Así nunca se guarda un segundo riego del día sin que el cuidador lo confirme.
- **DEBE** usar los componentes `Campo` y `Mensaje` que ya existen, y colores, espacios, radios y fuentes solo de `client/src/styles/tokens.css`.

## Criterios de aceptación

Son los CA-1.8.1 a CA-1.8.7 de HU-1.8, más uno para la decisión de esta spec:

- **CA-1.8.1 · Panel abierto:** DADO la lista con «Mandrágora» y «Helecho lunar» y ningún panel abierto, CUANDO pulsa «Regar» en «Mandrágora», ENTONCES se despliega debajo de esa fila el panel con su nombre, «Cantidad (ml)» con 500, la indicación de que el riego será de hoy y las acciones «Guardar riego» y «Cancelar», sin fecha ni cuidador. Pulsar «Regar» en «Helecho lunar» cierra el primer panel sin guardar y abre el segundo. «Cancelar» cierra el panel sin registrar ningún riego.
- **CA-1.8.2 · Guardando:** DADO el panel de «Mandrágora» con 500 ml, CUANDO pulsa «Guardar riego» y la API todavía no ha respondido, ENTONCES ve «Guardando riego…», el botón y el campo quedan desactivados, y aunque pulse otra vez se envía un solo riego.
- **CA-1.8.3 · Éxito:** DADO «Mandrágora» sin riegos de hoy y su panel con 500 ml, CUANDO pulsa «Guardar riego» y la API lo acepta, ENTONCES el panel se cierra, ve «Riego guardado para Mandrágora.» junto a la fila, sigue en la misma posición de desplazamiento, y en el detalle aparece un riego de hoy con 500 ml y «sin cuidador».
- **CA-1.8.4 · Error de validación:** DADO el panel abierto, CUANDO cambia la cantidad a 0, −50 o 2,5 y guarda, ENTONCES el panel sigue abierto con ese valor, el mensaje de la API aparece debajo del campo con icono y borde de error, y la planta no gana ningún riego. Al corregir y guardar, el mensaje desaparece. Un mensaje de otro campo va arriba del panel.
- **CA-1.8.5 · Error de conexión:** DADO el panel con 750 ml y la API detenida, CUANDO pulsa «Guardar riego», ENTONCES el panel sigue abierto con 750 ml, ve el mensaje de error de conexión y «Guardar riego» vuelve a estar activo. Al volver la API y reintentar, se registra un solo riego.
- **CA-1.8.6 · Móvil a 390 px:** DADO la lista a 390 px de ancho, CUANDO pulsa «Regar» en una tarjeta, ENTONCES el panel se despliega dentro de la tarjeta sin desplazamiento horizontal, el campo abre el teclado numérico, «Regar», «Guardar riego» y «Cancelar» miden al menos 44 px de alto, y los mensajes se leen completos.
- **CA-1.8.7 · Ya tiene riego hoy:** DADO «Mandrágora» con un riego de hoy, CUANDO abre su panel y pulsa «Guardar riego», ENTONCES no se guarda todavía: ve «Mandrágora ya tiene un riego hoy. ¿Quieres anotar otro?» con «Sí, anotar otro» y «Cancelar». «Sí, anotar otro» registra el riego como en CA-1.8.3; «Cancelar» cierra el panel sin registrar nada.
- **CA-03.8 · Falla la consulta del historial:** DADO el panel de «Mandrágora» abierto y `GET /api/plantas/:id/riegos` sin respuesta, CUANDO pulsa «Guardar riego», ENTONCES ve el mensaje de error de conexión, no se envía ningún `POST /api/riegos` y puede reintentar.

## Verificación

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-1.8.1 a CA-1.8.5 y CA-1.8.7 | En el navegador, contra la API con MongoDB. La cuenta de riegos se revisa en el detalle de la planta |
| CA-1.8.2 y CA-1.8.5 (un solo riego) | Pestaña Red del navegador, con la conexión limitada: un solo `POST /api/riegos` por guardado |
| CA-1.8.6 | Herramientas de desarrollo a 390 px y revisión del diff: `inputmode="numeric"` y altura mínima de 44 px |
| CA-03.8 | Pestaña Red: bloquear `/api/plantas/*/riegos` y comprobar que no sale ningún `POST` |
| `esDeHoy` | Revisión del diff: función pura, sin `Date.now()` dentro, y `ahora` recibido como parámetro |
| Diseño | Revisión contra DESIGN.md y los wireframes: solo tokens, un solo botón primario, estados de carga solo con texto |
| Backend sin cambios | `npm test` pasa y el diff no toca `src/` |

## Archivos

| Archivo | Qué cambia |
|---|---|
| `client/src/pantallas/Plantas.jsx` | Botón «Regar», columna «Acción» y estado del panel abierto |
| `client/src/componentes/PanelRiego.jsx` (nuevo) | El panel con sus estados |
| `client/src/formato.js` | `esDeHoy(fecha, ahora)` |
| `client/src/styles/app.css` | Estilos del panel, la columna y el «Regar» abierto, solo con variables |

Usa sin cambios `listarRiegos`, `registrarRiego` y `repartirErrores` de `client/src/api.js`.

## No-alcance

- **NO DEBE** cambiar el backend ni el detalle de la planta: el detalle sigue aceptando dos riegos el mismo día sin avisar (caso borde abierto de HU-1.2).
- **NO DEBE** permitir elegir la fecha ni el cuidador desde el panel. Para eso está el detalle.
- **NO DEBE** usar librerías de UI, de CSS ni de rutas.
- Sin tests automáticos del frontend, igual que en la spec 02.
