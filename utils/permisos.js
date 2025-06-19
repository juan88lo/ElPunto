// utils/permisos.js
 
const { Usuario, TipoUsuarioPermiso, Permiso } = require('../models');
const verificarPermiso = async (nombrePermiso, usuarioId) => {
  try {
    if (!usuarioId) throw new Error('ID de usuario no proporcionado');

    const permiso = await Permiso.findOne({ where: { nombrePermiso } });
    if (!permiso) return false;

    // Busca usuario para obtener tipoUsuarioId
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return false;

    const existe = await TipoUsuarioPermiso.findOne({
      where: {
        tipoUsuarioId: usuario.tipoUsuarioId,
        permisoId: permiso.id,
      },
    });

    return !!existe;
  } catch (error) {
    console.error(error);
    return false;
  }
};


module.exports = 
    verificarPermiso;
