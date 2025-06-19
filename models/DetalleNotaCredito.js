const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
const Inventario = require('./Inventario'); 

class DetalleNotaCredito extends Model {}

DetalleNotaCredito.init(
  {
    id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    notaCreditoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'NotasCredito', key: 'id' } },
    productoId:    { type: DataTypes.INTEGER, allowNull: false, references: { model: Inventario, key: 'id' } },
    cantidad:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precioUnitario:{ type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal:      { type: DataTypes.DECIMAL(10, 2) },
    impuesto:      { type: DataTypes.DECIMAL(10, 2) },
  },
  { sequelize, modelName: 'DetalleNotaCredito', tableName: 'DetalleNotasCredito', timestamps: false }
);
module.exports = DetalleNotaCredito;
 