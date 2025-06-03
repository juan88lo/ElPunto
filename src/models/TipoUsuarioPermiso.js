// src/models/TipoUsuarioPermiso.js
const { DataTypes } = require('sequelize');
const sequelize      = require('./baseModel').sequelize;

const TipoUsuarioPermiso = sequelize.define('TipoUsuarioPermiso', {
  tipoUsuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'TipoUsuarios', key: 'id' },
  },
  permisoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Permisos', key: 'id' },
  },
}, {
  tableName: 'TipoUsuarioPermisos',
  timestamps: false,
});

module.exports = TipoUsuarioPermiso;
