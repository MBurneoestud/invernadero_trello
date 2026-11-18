// Flujo de guardado del riego rápido (spec 03). Las llamadas a la API llegan como
// parámetros para poder probarlo sin red.
import { repartirErrores } from "./api.js";
import { esDeHoy } from "./formato.js";

// Un número escrito se envía como número; cualquier otra cosa, tal cual,
// para que la API devuelva su propio mensaje.
function aCantidad(texto) {
  const limpio = String(texto ?? "").trim();
  const numero = Number(limpio);
  return limpio !== "" && Number.isFinite(numero) ? numero : limpio;
}

// Devuelve { resultado: "guardado" | "confirmar" | "sin-conexion" | "error", ... }.
export async function guardarRiegoRapido({
  planta,
  cantidadMl,
  confirmado,
  ahora,
  listarRiegos,
  registrarRiego,
}) {
  if (!confirmado) {
    let riegos;
    try {
      riegos = await listarRiegos(planta);
    } catch {
      // CA-03.8: sin historial no sabemos si ya se regó hoy; no se guarda.
      return { resultado: "sin-conexion" };
    }
    if (riegos.some((riego) => esDeHoy(riego.fecha, ahora))) {
      return { resultado: "confirmar" };
    }
  }

  try {
    const riego = await registrarRiego({
      planta,
      cantidadMl: aCantidad(cantidadMl),
    });
    return { resultado: "guardado", riego };
  } catch (error) {
    if (error.estado === 400) {
      const { porCampo, generales } = repartirErrores(error, ["cantidadMl"]);
      const errorCantidad = porCampo.cantidadMl ?? "";
      // Un 400 sin detalles muestra el mensaje general de la API.
      if (!errorCantidad && generales.length === 0) {
        generales.push(error.message);
      }
      return { resultado: "error", errorCantidad, generales };
    }
    if (error.estado === 404) {
      return {
        resultado: "error",
        errorCantidad: "",
        generales: [error.message],
      };
    }
    return { resultado: "sin-conexion" };
  }
}
