const { Usuario } = require('../models/Usuario');
const { Permiso } = require('../models/Permiso');

class Context {
  constructor() {
    this.usuario = null;
  }

  async verificarPermiso(permiso) {
    // Aquí iría la lógica para verificar el permiso
    return true; // Ejemplo: devolver true si el permiso es válido
  }
}

module.exports = Context;
