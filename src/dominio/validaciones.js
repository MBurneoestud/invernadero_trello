// Reglas de negocio puras: sin Mongoose ni base de datos.
// Los mensajes coinciden con los del modelo Planta, que sigue como segunda barrera.

const TEXTOS_OBLIGATORIOS_PLANTA = [
  ["nombre", "El nombre es obligatorio"],
  ["especie", "La especie es obligatoria"],
  ["ubicacion", "La ubicación es obligatoria"],
];

function estaVacio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

function errorIntervalo(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return "El intervalo de riego es obligatorio";
  }
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return "El intervalo de riego debe ser un número entero de días";
  }
  if (valor < 1) {
    return "El intervalo de riego debe ser de al menos 1 día";
  }
  return null;
}

function validarPlanta(datos) {
  const planta = datos ?? {};
  const detalles = [];

  for (const [campo, mensaje] of TEXTOS_OBLIGATORIOS_PLANTA) {
    if (estaVacio(planta[campo])) {
      detalles.push({ campo, mensaje });
    }
  }

  const mensajeIntervalo = errorIntervalo(planta.intervaloRiegoDias);
  if (mensajeIntervalo) {
    detalles.push({ campo: "intervaloRiegoDias", mensaje: mensajeIntervalo });
  }

  return detalles;
}

module.exports = { validarPlanta };
