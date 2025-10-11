// models/DetalleFactura.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
const Inventario = require('./Inventario');
const Factura = require('./Factura');
 
class DetalleFactura extends Model {}

 

DetalleFactura.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    facturaId:    { type: DataTypes.INTEGER, allowNull: false, references: { model: Factura,    key: 'id' } },
    inventarioId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Inventario, key: 'id' } },

    // datos de la línea
    cantidad:     { type: DataTypes.DECIMAL(10,3),  allowNull: false },
    precio:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
    descuentoPct: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 }, // %
    impuestoPct:  { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 }, // %
    subtotal:     { type: DataTypes.DECIMAL(10,2) }, // cantidad * precio
    descuento:    { type: DataTypes.DECIMAL(10,2) },
    impuesto:     { type: DataTypes.DECIMAL(10,2) },
    total:        { type: DataTypes.DECIMAL(10,2) },
  },
  { sequelize, modelName: 'DetalleFactura', tableName: 'DetalleFacturas', timestamps: false }
);

// Asociaciones (esto puede estar en el index.js también)
DetalleFactura.belongsTo(Factura, { foreignKey: 'facturaId' });
Factura.hasMany(DetalleFactura, { foreignKey: 'facturaId' });

DetalleFactura.belongsTo(Inventario, { foreignKey: 'inventarioId', as: 'producto' });
Inventario.hasMany(DetalleFactura, { foreignKey: 'inventarioId' });

module.exports = DetalleFactura;