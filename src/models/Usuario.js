const { DataTypes } = require('sequelize');
const sequelize = require('../models/baseModel').sequelize;

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoUsuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // references: {
    //   model: 'TipoUsuarios', // Nombre de la tabla en la base de datos
    //   key: 'id',
    // },
  },
}, {
  sequelize,
  tableName: 'Usuarios',
  modelName: 'Usuario',
  timestamps: false,
});

 
module.exports = Usuario;