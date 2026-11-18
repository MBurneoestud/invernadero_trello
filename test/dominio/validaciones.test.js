const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { esIdValido } = require("../../src/dominio/validaciones");

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
