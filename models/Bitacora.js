const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
const Usuario = require('./Usuario');
class Bitacora extends Model { }

Bitacora.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    entidad: { type: DataTypes.STRING(30), allowNull: false },
    entidadId: { type: DataTypes.INTEGER, allowNull: false },
    accion: { type: DataTypes.STRING }, // 'crear', 'anular', 'reabrir', etc.
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Usuario, key: 'id' } },
    fecha: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    detalle: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'Bitacora',
    tableName: 'Bitacoras',
    timestamps: false,
  }
);

module.exports = Bitacora;
