const Empleado = require('./Empleado'); 
const { DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');

const VacacionTomada = sequelize.define('VacacionTomada', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empleadoId: { type: DataTypes.INTEGER, allowNull: false },
  dias: { type: DataTypes.FLOAT, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pendiente' }
}, {
  tableName: 'VacacionesTomadas',
  timestamps: false,
});
VacacionTomada.belongsTo(Empleado, { foreignKey: 'empleadoId', as: 'empleado' });
Empleado.hasMany(VacacionTomada, { foreignKey: 'empleadoId', as: 'vacacionesTomadas' });

module.exports = VacacionTomada;