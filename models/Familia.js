// models/Familia.js
const { DataTypes } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

const Familia = sequelize.define('Familia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false, 
  }, 
  Observaciones: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Estado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  tableName: 'Familias',
  timestamps: false,
});

module.exports = Familia;
