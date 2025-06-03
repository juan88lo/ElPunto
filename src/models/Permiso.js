const { Model, DataTypes } = require('./baseModel');  
const sequelize = require('../config/db');
// Definición del modelo Permiso
class Permiso extends Model {}

// Inicializar el modelo Permiso
Permiso.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombrePermiso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       Pantalla: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,  
    modelName: 'Permiso',  
    tableName: 'permisos',  
    timestamps: false,  
  }
);

module.exports = Permiso;  
