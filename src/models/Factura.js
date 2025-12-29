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
  // Idempotency key to avoid duplicate invoices
  idempotencyKey: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    // Transaction ID from WirePOS payment terminal (local)
    transactionId: { type: DataTypes.STRING(255), allowNull: true },
    // IDRequest from LARO API (comprobante de pago oficial)
    invoiceWireposId: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    // Invoice de Wirepos (subcampo 10) necesario para anulaciones
    wireposInvoice: { type: DataTypes.STRING(255), allowNull: true },
    // Datos adicionales de Wirepos
    wireposAuthCode: { type: DataTypes.STRING(255), allowNull: true },
    wireposResponseCode: { type: DataTypes.STRING(10), allowNull: true },
    wireposCardLast4: { type: DataTypes.STRING(4), allowNull: true },
    wireposCardType: { type: DataTypes.STRING(50), allowNull: true },
    estado: { type: DataTypes.ENUM('emitida', 'anulada', 'devuelta'), defaultValue: 'emitida' },
  },
  { sequelize, modelName: 'Factura', tableName: 'Facturas', timestamps: false }
);

module.exports = Factura;
