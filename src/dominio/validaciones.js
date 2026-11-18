// Reglas de formato puras, sin base de datos ni Mongoose.

const ID_HEXADECIMAL = /^[0-9a-fA-F]{24}$/;

function esIdValido(valor) {
  return typeof valor === "string" && ID_HEXADECIMAL.test(valor);
}

module.exports = { esIdValido };
