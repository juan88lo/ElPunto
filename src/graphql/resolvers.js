const { Usuario, TipoUsuario, Permiso, TipoUsuarioPermiso } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarPermiso } = require('../utils/permisos');

const resolvers = {
  Query: {
    usuario: async (_, { id }, {  usuario }) => {
      if (!usuario) throw new Error('No autenticado');
      if (!(await verificarPermiso('ver_usuario'))) throw new Error('Sin permiso');
      return Usuario.findByPk(id);
    },
    me: async (_, __, { usuario }) => {
      if (!usuario) throw new Error('No autenticado');
      return Usuario.findByPk(usuario.id);
    },
  },

  Mutation: {
    register: async (_, { nombre, correo, password, tipoUsuarioId }) => {
      if (!(await verificarPermiso('crear_usuario'))) {
        throw new Error('Sin permiso para crear usuarios');
      }
      if (await Usuario.findOne({ where: { correo } })) {
        throw new Error('Correo ya en uso');
      }
      const hashed = await bcrypt.hash(password, 10);
      return Usuario.create({ nombre, correo, password: hashed, tipoUsuarioId });
    },

    login: async (_, { correo, password }) => {
      const user = await Usuario.findOne({ where: { correo } });
      if (!user) throw new Error('Usuario no encontrado');
      if (!(await bcrypt.compare(password, user.password))) {
        throw new Error('Contraseña incorrecta');
      }
      const token = jwt.sign(
        { id: user.id, tipoUsuarioId: user.tipoUsuarioId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return { token, mensaje: 'Login exitoso' };
    },

    asignarPermisoARol: async (_, { tipoUsuarioId, permisoId }, {  usuario }) => {
      if (!usuario) throw new Error('No autenticado');
      if (!(await verificarPermiso('asignar_permiso'))) {
        throw new Error('Sin permiso para asignar permisos');
      }

      const [rol, permiso] = await Promise.all([
        TipoUsuario.findByPk(tipoUsuarioId),
        Permiso.findByPk(permisoId),
      ]);
      if (!rol) throw new Error('Rol no encontrado');
      if (!permiso) throw new Error('Permiso no encontrado');

      const existe = await TipoUsuarioPermiso.findOne({
        where: { tipoUsuarioId, permisoId },
      });
      if (!existe) {
        await TipoUsuarioPermiso.create({ tipoUsuarioId, permisoId });
      }

      return TipoUsuario.findByPk(tipoUsuarioId, {
        include: [{ model: Permiso, as: 'permisos' }],
      });
    },
  },

  Usuario: {
    tipoUsuario: (parent) => parent.getTipoUsuario(),
    permisos: async (parent) => {
      if (parent.tipoUsuario && parent.tipoUsuario.permisos) {
        return parent.tipoUsuario.permisos;
      }
      const rol = await parent.getTipoUsuario();
      return rol ? rol.getPermisos() : [];
    },
  },

  TipoUsuario: {
    permisos: (parent) => parent.getPermisos(),
  },
};

module.exports = resolvers;
