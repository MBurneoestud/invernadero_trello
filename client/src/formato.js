const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// «28 oct 2026», en hora local.
export function fechaCorta(valor) {
  const fecha = new Date(valor);
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

// «AAAA-MM-DD» de hoy en hora local, para el máximo del campo de fecha.
export function hoyIso() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// ¿La fecha cae en el mismo día de calendario que «ahora», en hora local?
export function esDeHoy(valor, ahora) {
  const fecha = new Date(valor);
  return (
    fecha.getFullYear() === ahora.getFullYear() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getDate() === ahora.getDate()
  );
}
