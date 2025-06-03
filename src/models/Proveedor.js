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
    allowNull: false,
  },
  TelefonoAgente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Supervisor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TelSupervisor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Frecuencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DiasVisita: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DiaEntrega: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Simpe: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  SimpeNombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CuentaBancaria: {
    type: DataTypes.STRING,
    allowNull: false,
  
  },
  Banco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  NombrePropietarioCtaBancaria: {
    type: DataTypes.STRING,
    allowNull: false,
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
