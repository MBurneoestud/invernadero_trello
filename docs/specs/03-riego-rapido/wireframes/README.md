# Wireframes · HU-1.8 Registrar un riego rápido desde la lista

Wireframes de baja fidelidad (solo grises) sacados de los criterios de HU-1.8 en `docs/backlog/E1-plantas-y-riegos.md`. No usan los colores ni las fuentes de `DESIGN.md`: solo sus componentes y sus textos.

## Estados

| Estado | Archivos | Criterios |
|---|---|---|
| Lista base | [lista-movil.svg](lista-movil.svg), [lista-escritorio.svg](lista-escritorio.svg) | CA-1.8.1 (DADO), CA-1.8.6 |
| Panel abierto | [panel-abierto-movil.svg](panel-abierto-movil.svg), [panel-abierto-escritorio.svg](panel-abierto-escritorio.svg) | CA-1.8.1, CA-1.8.6 |
| Guardando | [guardando-movil.svg](guardando-movil.svg) | CA-1.8.2, CA-1.8.6 |
| Éxito | [exito-movil.svg](exito-movil.svg) | CA-1.8.3, CA-1.8.6 |
| Error de validación (y variante con error general) | [error-validacion-movil.svg](error-validacion-movil.svg) | CA-1.8.4, CA-1.8.6 |
| Error de conexión | [error-conexion-movil.svg](error-conexion-movil.svg) | CA-1.8.5, CA-1.8.6 |
| Ya tiene riego hoy | [riego-hoy-movil.svg](riego-hoy-movil.svg) | CA-1.8.7, CA-1.8.6 |

CA-1.8.6 (móvil a 390 px) aparece en todos los SVG móviles: tarjetas sin desplazamiento horizontal, botones de 44 px de alto y mensajes partidos en varias líneas, sin cortes.

## Decisiones

Cosas que deciden los wireframes y que los criterios no dicen:

1. **Dónde va «Regar».** En el móvil es un botón secundario a todo el ancho, al final de cada tarjeta. En escritorio va en una columna nueva a la derecha, con el encabezado «Acción».
2. **Un solo botón primario.** «Guardar riego» y «Sí, anotar otro» son secundarios. El único primario de la pantalla sigue siendo «Registrar planta». Esto cierra el punto abierto de `DESIGN.md` sin hacer una excepción.
3. **«Regar» mientras el panel está abierto.** Sigue visible y se marca como abierto (fondo gris claro; en el código, `aria-expanded="true"`). Pulsarlo otra vez hace lo mismo que «Cancelar».
4. **Posición del panel.** En el móvil, dentro de la tarjeta y debajo de «Regar». En escritorio, en una fila a todo el ancho justo debajo de la fila de la planta.
5. **Indicación de la fecha.** El panel dice «Se anotará con fecha de hoy, 18 nov 2026.», con la fecha en formato corto. No dice nada del cuidador.
6. **Guardando.** También se desactivan «Cancelar» y los «Regar» de las demás filas hasta que responda la API, para que no se cierre un panel con un riego en vuelo.
7. **Comprobación de CA-1.8.7.** El historial de hoy se consulta al pulsar «Guardar riego», no al abrir el panel. Mientras se consulta se ve el estado «Guardando riego…».
8. **Aviso de riego de hoy.** Se muestra como una caja neutra (sin icono de error) encima de las acciones. La cantidad queda bloqueada mientras se decide.
9. **Mensaje de éxito.** Aparece dentro de la tarjeta (o debajo de la fila), en el lugar del panel. Desaparece al abrir otro panel.
10. **Errores dentro del panel.** El error de conexión y los errores de la API que no son de la cantidad van arriba del panel, debajo de la fecha. El ejemplo de la variante usa el texto real de la API para una planta inexistente («Planta no encontrada»).
11. **Escritorio solo para los estados principales.** Guardando, éxito, errores y aviso usan en la fila de escritorio el mismo contenido que en el móvil.

## Lo que no se puede dibujar

- **Teclado numérico (CA-1.8.6)** y **un solo riego aunque se pulse dos veces (CA-1.8.2, CA-1.8.5):** son comportamiento. Quedan como notas en los SVG y hay que probarlos en la spec.
- **Riego visible en el detalle (CA-1.8.3):** está en otra pantalla, la del detalle de HU-1.2, que no cambia. Queda como nota.
- **Mantener la posición de desplazamiento (CA-1.8.3):** queda como nota en el estado de éxito.

## Pendiente para la spec

- ~~Qué hacer si falla la consulta del historial que necesita CA-1.8.7~~: resuelto en la [spec](../spec.md). Se trata como error de conexión ([error-conexion-movil.svg](error-conexion-movil.svg)) y no se guarda.
