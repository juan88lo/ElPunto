// models/Proveedor.js
const { DataTypes } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  TelCelular: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  TelOtro: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  AgenteAsignado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  TelefonoAgente: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Supervisor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  TelSupervisor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Frecuencia: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  DiasVisita: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  DiaEntrega: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Simpe: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  SimpeNombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  CuentaBancaria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Banco: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  NombrePropietarioCtaBancaria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Otros: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Observaciones: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

}, {
  tableName: 'Proveedores',
  timestamps: false,
});


module.exports = Proveedor;
