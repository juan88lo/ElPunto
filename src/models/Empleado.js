const { DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');

const Empleado = sequelize.define('Empleado', {
  id:            { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
  nombre:        { type: DataTypes.STRING,   allowNull: false },
  apellido:      { type: DataTypes.STRING,   allowNull: false },
  cedula:        { type: DataTypes.STRING,   allowNull: false, unique: true },
  puesto:        { type: DataTypes.STRING,   allowNull: false },
  salarioBase:   { type: DataTypes.DECIMAL(15,2), allowNull: false },
  fechaIngreso:  { type: DataTypes.DATEONLY, allowNull: false },
  diasVacaciones:{ type: DataTypes.FLOAT,  allowNull: false, defaultValue: 0 }, 
  estado:        { type: DataTypes.BOOLEAN,  allowNull: false, defaultValue: true },
}, {
  tableName: 'Empleados',
  timestamps: false,
});



module.exports = Empleado;
