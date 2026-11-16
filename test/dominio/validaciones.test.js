const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { validarPlanta } = require("../../src/dominio/validaciones");

const MENSAJE_ENTERO =
  "El intervalo de riego debe ser un número entero de días";

function plantaValida(cambios = {}) {
  return {
    nombre: "Mandrágora",
    especie: "Mandragora officinarum",
    ubicacion: "Estante norte",
    intervaloRiegoDias: 3,
    ...cambios,
  };
}

function mensajes(detalles) {
  return detalles.map((detalle) => detalle.mensaje);
}

describe("validarPlanta", () => {
  test("CA-04.1: una planta completa con intervalo 3 no tiene errores", () => {
    assert.deepEqual(validarPlanta(plantaValida()), []);
  });

  test("CA-04.2: sin especie y con intervalo 0 devuelve dos detalles en orden", () => {
    const datos = plantaValida({ intervaloRiegoDias: 0 });
    delete datos.especie;
    assert.deepEqual(validarPlanta(datos), [
      { campo: "especie", mensaje: "La especie es obligatoria" },
      {
        campo: "intervaloRiegoDias",
        mensaje: "El intervalo de riego debe ser de al menos 1 día",
      },
    ]);
  });

  test("CA-04.3: un nombre con solo espacios cuenta como vacío", () => {
    assert.deepEqual(validarPlanta(plantaValida({ nombre: "   " })), [
      { campo: "nombre", mensaje: "El nombre es obligatorio" },
    ]);
  });

  test("CA-04.4: un intervalo de 2.5 no es un número entero de días", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: 2.5 }))),
      [MENSAJE_ENTERO],
    );
  });

  test("CA-04.4: un intervalo «tres» no es un número entero de días", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: "tres" }))),
      [MENSAJE_ENTERO],
    );
  });

  test("devuelve los errores en el orden nombre, especie, ubicación e intervalo", () => {
    assert.deepEqual(validarPlanta({}), [
      { campo: "nombre", mensaje: "El nombre es obligatorio" },
      { campo: "especie", mensaje: "La especie es obligatoria" },
      { campo: "ubicacion", mensaje: "La ubicación es obligatoria" },
      {
        campo: "intervaloRiegoDias",
        mensaje: "El intervalo de riego es obligatorio",
      },
    ]);
  });

  test("trata unos datos ausentes como una planta vacía", () => {
    assert.equal(validarPlanta(undefined).length, 4);
    assert.equal(validarPlanta(null).length, 4);
  });

  test("un intervalo negativo debe ser de al menos 1 día", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: -2 }))),
      ["El intervalo de riego debe ser de al menos 1 día"],
    );
  });
});
