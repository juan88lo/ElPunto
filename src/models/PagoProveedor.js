const { DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');
const Proveedor = require('./Proveedor');

const PagoProveedor = sequelize.define('PagoProveedor', {
  id:          { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
  proveedorId: { type: DataTypes.INTEGER,  allowNull: false, references: { model: Proveedor, key: 'id' } },
  fechaPago:   { type: DataTypes.DATEONLY, allowNull: false },
  monto:       { type: DataTypes.DECIMAL(15,2), allowNull: false },
  metodo:      { type: DataTypes.STRING,   allowNull: false },         // Transferencia / SIMPE / Efectivo…
  referencia:  { type: DataTypes.STRING,   allowNull: true },
  pagado:      { type: DataTypes.BOOLEAN,  allowNull: false, defaultValue: false },
  observacion: { type: DataTypes.STRING,   allowNull: true },
}, {
  tableName: 'PagosProveedores',
  timestamps: true,
});

Proveedor.hasMany(PagoProveedor, { foreignKey: 'proveedorId' });
PagoProveedor.belongsTo(Proveedor, { foreignKey: 'proveedorId' });

module.exports = PagoProveedor;
