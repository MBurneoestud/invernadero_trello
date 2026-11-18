import { useEffect, useRef, useState } from "react";
import { listarRiegos, registrarRiego } from "../api.js";
import { fechaCorta } from "../formato.js";
import { guardarRiegoRapido } from "../riegoRapido.js";
import Campo from "./Campo.jsx";
import Mensaje from "./Mensaje.jsx";

const SIN_CONEXION =
  "No pudimos guardar el riego. Revisa que la API esté encendida y vuelve a intentarlo.";

// Panel del riego rápido (spec 03). fase: editando | guardando | confirmar
export default function PanelRiego({
  planta,
  alCancelar,
  alGuardar,
  alOcupar,
}) {
  const [cantidad, setCantidad] = useState("500");
  const [fase, setFase] = useState("editando");
  const [errorCantidad, setErrorCantidad] = useState("");
  const [generales, setGenerales] = useState([]);
  const [hoy] = useState(() => new Date());
  const enVuelo = useRef(false);
  const campo = useRef(null);
  const idCampo = `cantidad-${planta._id}`;

  useEffect(() => {
    campo.current?.focus();
  }, []);

  async function guardar(confirmado) {
    // Un solo envío aunque se pulse varias veces (CA-1.8.2).
    if (enVuelo.current) return;
    enVuelo.current = true;
    setFase("guardando");
    setErrorCantidad("");
    setGenerales([]);
    alOcupar(true);

    const respuesta = await guardarRiegoRapido({
      planta: planta._id,
      cantidadMl: cantidad,
      confirmado,
      ahora: new Date(),
      listarRiegos,
      registrarRiego,
    });

    enVuelo.current = false;
    alOcupar(false);
    if (respuesta.resultado === "guardado") {
      alGuardar();
      return;
    }
    if (respuesta.resultado === "confirmar") {
      setFase("confirmar");
      return;
    }
    if (respuesta.resultado === "sin-conexion") {
      setGenerales([SIN_CONEXION]);
    } else {
      setErrorCantidad(respuesta.errorCantidad);
      setGenerales(respuesta.generales);
    }
    setFase("editando");
  }

  function enviar(evento) {
    evento.preventDefault();
    guardar(false);
  }

  const guardando = fase === "guardando";

  return (
    <div className="panel-riego" id={`panel-riego-${planta._id}`}>
      <h3 className="panel-riego-titulo">Regar {planta.nombre}</h3>
      <p className="texto-secundario">
        Se anotará con fecha de hoy, {fechaCorta(hoy)}.
      </p>
      {generales.map((mensaje) => (
        <Mensaje key={mensaje} tipo="error">
          {mensaje}
        </Mensaje>
      ))}
      <form onSubmit={enviar} noValidate>
        <Campo
          id={idCampo}
          etiqueta="Cantidad (ml)"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cantidad}
          onChange={(evento) => setCantidad(evento.target.value)}
          error={errorCantidad}
          disabled={fase !== "editando"}
          ref={campo}
        />
        {guardando && <p role="status">Guardando riego…</p>}
        {fase === "confirmar" ? (
          <>
            <div className="aviso-neutro" role="status">
              <p>{planta.nombre} ya tiene un riego hoy.</p>
              <p>¿Quieres anotar otro?</p>
            </div>
            <div className="panel-riego-acciones">
              <button
                type="button"
                className="boton-secundario"
                onClick={() => guardar(true)}
              >
                Sí, anotar otro
              </button>
              <button
                type="button"
                className="boton-secundario"
                onClick={alCancelar}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div className="panel-riego-acciones">
            <button
              type="submit"
              className="boton-secundario"
              disabled={guardando}
            >
              Guardar riego
            </button>
            <button
              type="button"
              className="boton-secundario"
              onClick={alCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
