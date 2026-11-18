import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { esDeHoy } from "../../client/src/formato.js";

describe("esDeHoy", () => {
  const ahora = new Date(2026, 10, 18, 12, 0);

  it("es verdadero a las 00:01 y a las 23:59 del mismo día", () => {
    assert.equal(esDeHoy(new Date(2026, 10, 18, 0, 1), ahora), true);
    assert.equal(esDeHoy(new Date(2026, 10, 18, 23, 59), ahora), true);
  });

  it("acepta la fecha como texto ISO, como llega de la API", () => {
    const fecha = new Date(2026, 10, 18, 9, 30).toISOString();
    assert.equal(esDeHoy(fecha, ahora), true);
  });

  it("es falso para ayer y para mañana", () => {
    assert.equal(esDeHoy(new Date(2026, 10, 17, 23, 59), ahora), false);
    assert.equal(esDeHoy(new Date(2026, 10, 19, 0, 0), ahora), false);
  });

  it("es falso para el mismo día y mes de otro año", () => {
    assert.equal(esDeHoy(new Date(2025, 10, 18, 12, 0), ahora), false);
  });
});
