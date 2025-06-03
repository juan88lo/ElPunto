const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
 
class Factura extends Model { }
Factura.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cajaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Cajas', key: 'id' } },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Usuarios', key: 'id' } },
    // clienteId: { type: DataTypes.INTEGER }, // opcional
    consecutivo: { type: DataTypes.STRING, unique: true },
    fecha: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    subtotal: { type: DataTypes.DECIMAL(10, 2) },
    descuento: { type: DataTypes.DECIMAL(10, 2) },
    impuesto: { type: DataTypes.DECIMAL(10, 2) },
    total: { type: DataTypes.DECIMAL(10, 2) },
    formaPago: { type: DataTypes.ENUM('efectivo', 'tarjeta', 'sinpe', 'mixto') },
    estado: { type: DataTypes.ENUM('emitida', 'anulada', 'devuelta'), defaultValue: 'emitida' },
  },
  { sequelize, modelName: 'Factura', tableName: 'Facturas', timestamps: false }
);

module.exports = Factura;
