import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ErrorApi } from "../../client/src/api.js";
import { guardarRiegoRapido } from "../../client/src/riegoRapido.js";

const ID = "665f1c2a9b1e8a0012345678";
const ahora = new Date(2026, 10, 18, 12, 0);
const hoy = new Date(2026, 10, 18, 8, 0).toISOString();
const ayer = new Date(2026, 10, 17, 8, 0).toISOString();

// API falsa: guarda las llamadas y responde lo que se le diga.
function apiFalsa({ riegos = [], fallaListar, fallaRegistrar } = {}) {
  const llamadas = { listar: [], registrar: [] };
  return {
    llamadas,
    listarRiegos: async (id) => {
      llamadas.listar.push(id);
      if (fallaListar) throw fallaListar;
      return riegos;
    },
    registrarRiego: async (datos) => {
      llamadas.registrar.push(datos);
      if (fallaRegistrar) throw fallaRegistrar;
      return { _id: "r1", ...datos };
    },
  };
}

function guardar(api, extra = {}) {
  return guardarRiegoRapido({
    planta: ID,
    cantidadMl: "500",
    confirmado: false,
    ahora,
    listarRiegos: api.listarRiegos,
    registrarRiego: api.registrarRiego,
    ...extra,
  });
}

describe("guardarRiegoRapido", () => {
  it("CA-1.8.3: sin riegos de hoy, envía un solo riego sin fecha ni cuidador", async () => {
    const api = apiFalsa({ riegos: [{ fecha: ayer, cantidadMl: 300 }] });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "guardado");
    assert.deepEqual(api.llamadas.listar, [ID]);
    assert.deepEqual(api.llamadas.registrar, [{ planta: ID, cantidadMl: 500 }]);
  });

  it("CA-1.8.7: con un riego de hoy, pide confirmación y no envía nada", async () => {
    const api = apiFalsa({ riegos: [{ fecha: hoy, cantidadMl: 300 }] });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "confirmar");
    assert.equal(api.llamadas.registrar.length, 0);
  });

  it("CA-1.8.7: confirmado, envía un solo riego sin volver a consultar el historial", async () => {
    const api = apiFalsa({ riegos: [{ fecha: hoy, cantidadMl: 300 }] });
    const resultado = await guardar(api, { confirmado: true });
    assert.equal(resultado.resultado, "guardado");
    assert.equal(api.llamadas.listar.length, 0);
    assert.equal(api.llamadas.registrar.length, 1);
  });

  it("CA-03.8: si falla la consulta del historial, es error de conexión y no envía nada", async () => {
    const api = apiFalsa({ fallaListar: new ErrorApi("sin-conexion") });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "sin-conexion");
    assert.equal(api.llamadas.registrar.length, 0);
  });

  it("CA-03.8: también si la consulta responde con un error del servidor", async () => {
    const api = apiFalsa({
      fallaListar: new ErrorApi("error", { estado: 500 }),
    });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "sin-conexion");
    assert.equal(api.llamadas.registrar.length, 0);
  });

  it("CA-1.8.4: separa el error de la cantidad de los demás", async () => {
    const api = apiFalsa({
      fallaRegistrar: new ErrorApi("Datos no válidos", {
        estado: 400,
        detalles: [
          {
            campo: "cantidadMl",
            mensaje: "La cantidad de agua debe ser mayor que 0",
          },
          {
            campo: "planta",
            mensaje: "La planta no tiene un identificador válido",
          },
        ],
      }),
    });
    const resultado = await guardar(api, { cantidadMl: "0" });
    assert.equal(resultado.resultado, "error");
    assert.equal(
      resultado.errorCantidad,
      "La cantidad de agua debe ser mayor que 0",
    );
    assert.deepEqual(resultado.generales, [
      "La planta no tiene un identificador válido",
    ]);
  });

  it("CA-1.8.4: envía la cantidad tal como se escribió si no es un número", async () => {
    const api = apiFalsa();
    await guardar(api, { cantidadMl: "2,5" });
    assert.deepEqual(api.llamadas.registrar, [
      { planta: ID, cantidadMl: "2,5" },
    ]);
  });

  it("CA-1.8.4: un 404 se muestra con el mensaje de la API, sin código HTTP", async () => {
    const api = apiFalsa({
      fallaRegistrar: new ErrorApi("Planta no encontrada", { estado: 404 }),
    });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "error");
    assert.equal(resultado.errorCantidad, "");
    assert.deepEqual(resultado.generales, ["Planta no encontrada"]);
  });

  it("CA-1.8.5: si falla el envío por conexión, es error de conexión", async () => {
    const api = apiFalsa({ fallaRegistrar: new ErrorApi("sin-conexion") });
    const resultado = await guardar(api);
    assert.equal(resultado.resultado, "sin-conexion");
  });
});
