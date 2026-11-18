const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { esIdValido, validarRiego } = require("../../src/dominio/validaciones");

// Las fechas se construyen en hora local para que los tests no dependan de TZ.
const ahora = new Date(2026, 9, 28, 10, 0);
const plantaValida = "665f1c2a9b1e8a0012345678";

function mensajesDe(errores, campo) {
  return errores.filter((e) => e.campo === campo).map((e) => e.mensaje);
}

describe("validarRiego", () => {
  test("CA-05.1: planta válida y 500 ml sin fecha no tiene errores", () => {
    assert.deepEqual(
      validarRiego({ planta: plantaValida, cantidadMl: 500 }, ahora),
      [],
    );
  });

  describe("CA-05.2: cantidad de agua", () => {
    for (const cantidadMl of [0, -5]) {
      test(`${cantidadMl} ml debe ser mayor que 0`, () => {
        const errores = validarRiego(
          { planta: plantaValida, cantidadMl },
          ahora,
        );
        assert.deepEqual(mensajesDe(errores, "cantidadMl"), [
          "La cantidad de agua debe ser mayor que 0",
        ]);
      });
    }

    test("2.5 ml debe ser un número entero", () => {
      const errores = validarRiego(
        { planta: plantaValida, cantidadMl: 2.5 },
        ahora,
      );
      assert.deepEqual(mensajesDe(errores, "cantidadMl"), [
        "La cantidad de agua debe ser un número entero de mililitros",
      ]);
    });

    test("un texto no numérico debe ser un número entero", () => {
      const errores = validarRiego(
        { planta: plantaValida, cantidadMl: "mucha" },
        ahora,
      );
      assert.deepEqual(mensajesDe(errores, "cantidadMl"), [
        "La cantidad de agua debe ser un número entero de mililitros",
      ]);
    });

    test("sin cantidad es obligatoria", () => {
      const errores = validarRiego({ planta: plantaValida }, ahora);
      assert.deepEqual(mensajesDe(errores, "cantidadMl"), [
        "La cantidad de agua es obligatoria",
      ]);
    });
  });

  test("CA-05.3: la fecha de mañana es futura", () => {
    const errores = validarRiego(
      { planta: plantaValida, cantidadMl: 500, fecha: "2026-10-29" },
      ahora,
    );
    assert.deepEqual(mensajesDe(errores, "fecha"), [
      "Un riego no puede tener fecha futura",
    ]);
  });

  test("CA-05.4: hoy a las 23:59 con ahora a las 00:01 no es futura", () => {
    const fecha = new Date(2026, 9, 28, 23, 59);
    const primerMinuto = new Date(2026, 9, 28, 0, 1);
    const errores = validarRiego(
      { planta: plantaValida, cantidadMl: 500, fecha },
      primerMinuto,
    );
    assert.deepEqual(mensajesDe(errores, "fecha"), []);
  });

  test("una fecha no interpretable no es válida", () => {
    const errores = validarRiego(
      { planta: plantaValida, cantidadMl: 500, fecha: "ayer" },
      ahora,
    );
    assert.deepEqual(mensajesDe(errores, "fecha"), ["La fecha no es válida"]);
  });

  test("CA-05.5: planta '123' no tiene un identificador válido", () => {
    const errores = validarRiego({ planta: "123", cantidadMl: 500 }, ahora);
    assert.deepEqual(mensajesDe(errores, "planta"), [
      "La planta no tiene un identificador válido",
    ]);
  });

  test("sin planta es obligatoria", () => {
    const errores = validarRiego({ cantidadMl: 500 }, ahora);
    assert.deepEqual(mensajesDe(errores, "planta"), [
      "La planta es obligatoria",
    ]);
  });

  test("sin datos devuelve los dos obligatorios", () => {
    assert.deepEqual(validarRiego(undefined, ahora), [
      { campo: "planta", mensaje: "La planta es obligatoria" },
      { campo: "cantidadMl", mensaje: "La cantidad de agua es obligatoria" },
    ]);
  });
});

describe("esIdValido", () => {
  test("CA-06.1: 24 caracteres hexadecimales es válido", () => {
    assert.equal(esIdValido("665f1c2a9b1e8a0012345678"), true);
  });

  for (const valor of ["123", "", null]) {
    test(`CA-06.1: ${JSON.stringify(valor)} no es válido`, () => {
      assert.equal(esIdValido(valor), false);
    });
  }

  test("24 caracteres no hexadecimales no es válido", () => {
    assert.equal(esIdValido("zzzzzzzzzzzzzzzzzzzzzzzz"), false);
  });

  test("un valor que no es texto no es válido", () => {
    assert.equal(esIdValido(665112345678), false);
  });
});
