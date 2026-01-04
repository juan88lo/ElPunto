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
    // Campos para pago mixto
    montoEfectivo: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    montoTarjeta: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    estado: { type: DataTypes.ENUM('emitida', 'anulada', 'devuelta'), defaultValue: 'emitida' },
    // Campo para cupón de rifa (la foreign key se crea en la migración)
    cuponRifaId: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID del cupón de rifa asociado a esta factura'
    }
  },
  { sequelize, modelName: 'Factura', tableName: 'Facturas', timestamps: false }
);

module.exports = Factura;
