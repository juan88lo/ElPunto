const { DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');
const Empleado = require('./Empleado');

const Planilla = sequelize.define('Planilla', {
  id:          { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
  empleadoId:  { type: DataTypes.INTEGER,  allowNull: false, references: { model: Empleado, key: 'id' } },
  fechaInicio: { type: DataTypes.DATEONLY, allowNull: false },
  fechaFin:    { type: DataTypes.DATEONLY, allowNull: false },
  salarioBruto:{ type: DataTypes.DECIMAL(15,2), allowNull: false },
  deducciones: { type: DataTypes.DECIMAL(15,2), allowNull: false, defaultValue: 0 },
  salarioNeto: { type: DataTypes.DECIMAL(15,2), allowNull: false },
  pagado:      { type: DataTypes.BOOLEAN,      allowNull: false, defaultValue: false },
}, {
  tableName: 'Planillas',
  timestamps: true,
});

Empleado.hasMany(Planilla, { foreignKey: 'empleadoId' });
Planilla.belongsTo(Empleado, { foreignKey: 'empleadoId' });

module.exports = Planilla;
