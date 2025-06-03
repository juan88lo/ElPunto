import jwt from 'jsonwebtoken';
import { Usuario, TipoUsuario, Permiso } from './models/index.js';

export async function crearContexto({ req }) {
  const token = req.headers.authorization?.split(' ')[1];
  let usuario = null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      usuario = await Usuario.findByPk(payload.id, {
        include: {
          model: TipoUsuario,
          include: {
            model: Permiso,
            as: 'permisos',
          },
        },
      });
    } catch (err) {
      console.error('Token inválido', err);
    }
  }

  const verificarPermiso = async (permisoRequerido) => {
    if (!usuario) return false;
    const permisos = usuario.tipoUsuario?.permisos?.map(p => p.nombre) || [];
    return permisos.includes(permisoRequerido);
  };

  return {
    usuario,
    verificarPermiso,
  };
}
