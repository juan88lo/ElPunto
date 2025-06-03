const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

class TipoUsuario extends Model {}

TipoUsuario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'TipoUsuarios',
  modelName: 'TipoUsuario',
  timestamps: false,
});

module.exports = TipoUsuario;
