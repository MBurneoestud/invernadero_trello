// Reglas de formato puras, sin base de datos ni Mongoose.
// Los mensajes coinciden con los de los modelos Planta y Riego, que siguen
// como segunda barrera.
const { interpretarFecha, esFechaFutura } = require("./fechas");

const ID_HEXADECIMAL = /^[0-9a-fA-F]{24}$/;

const MENSAJE_CANTIDAD_ENTERA =
  "La cantidad de agua debe ser un número entero de mililitros";

const TEXTOS_OBLIGATORIOS_PLANTA = [
  ["nombre", "El nombre es obligatorio"],
  ["especie", "La especie es obligatoria"],
  ["ubicacion", "La ubicación es obligatoria"],
];

function esIdValido(valor) {
  return typeof valor === "string" && ID_HEXADECIMAL.test(valor);
}

function estaVacio(valor) {
  return valor === undefined || valor === null || valor === "";
}

// Un texto con solo espacios cuenta como vacío.
function esTextoVacio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

function errorIntervalo(valor) {
  if (estaVacio(valor)) {
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
    if (esTextoVacio(planta[campo])) {
      detalles.push({ campo, mensaje });
    }
  }

  const mensajeIntervalo = errorIntervalo(planta.intervaloRiegoDias);
  if (mensajeIntervalo) {
    detalles.push({ campo: "intervaloRiegoDias", mensaje: mensajeIntervalo });
  }

  return detalles;
}

function validarIdPlanta(planta) {
  if (estaVacio(planta)) {
    return "La planta es obligatoria";
  }
  if (!esIdValido(planta)) {
    return "La planta no tiene un identificador válido";
  }
  return null;
}

function validarCantidad(cantidadMl) {
  if (estaVacio(cantidadMl)) {
    return "La cantidad de agua es obligatoria";
  }
  const esNumeroOTexto =
    typeof cantidadMl === "number" ||
    (typeof cantidadMl === "string" && cantidadMl.trim() !== "");
  const numero = esNumeroOTexto ? Number(cantidadMl) : NaN;
  if (!Number.isFinite(numero)) {
    return MENSAJE_CANTIDAD_ENTERA;
  }
  if (numero < 1) {
    return "La cantidad de agua debe ser mayor que 0";
  }
  if (!Number.isInteger(numero)) {
    return MENSAJE_CANTIDAD_ENTERA;
  }
  return null;
}

function aFecha(valor) {
  const interpretada = interpretarFecha(valor);
  if (interpretada instanceof Date) {
    return interpretada;
  }
  if (typeof interpretada === "string" || typeof interpretada === "number") {
    return new Date(interpretada);
  }
  return null;
}

function validarFecha(fecha, ahora) {
  if (estaVacio(fecha)) {
    return null;
  }
  const valor = aFecha(fecha);
  if (!valor || Number.isNaN(valor.getTime())) {
    return "La fecha no es válida";
  }
  if (esFechaFutura(valor, ahora)) {
    return "Un riego no puede tener fecha futura";
  }
  return null;
}

function validarRiego(datos, ahora) {
  const { planta, cantidadMl, fecha } = datos ?? {};
  const comprobaciones = [
    ["planta", validarIdPlanta(planta)],
    ["fecha", validarFecha(fecha, ahora)],
    ["cantidadMl", validarCantidad(cantidadMl)],
  ];
  return comprobaciones
    .filter(([, mensaje]) => mensaje)
    .map(([campo, mensaje]) => ({ campo, mensaje }));
}

module.exports = { esIdValido, validarPlanta, validarRiego };
