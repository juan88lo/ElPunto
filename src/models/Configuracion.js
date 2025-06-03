const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

class Configuracion extends Model { }
Configuracion.init({
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clave:     { type: DataTypes.STRING, allowNull: true },

  valor:     { type: DataTypes.DECIMAL(10,2), allowNull: true }, 
  pantalla:  { type: DataTypes.STRING,  allowNull: true, field: 'Pantalla'  }, 
  prioridad: { type: DataTypes.INTEGER, allowNull: true, field: 'Prioridad' },  
  estado:    { type: DataTypes.BOOLEAN, allowNull: true, field: 'Estado'    },  
}, {
  sequelize,
  modelName: 'Configuracion',
  tableName: 'Configuraciones',
  timestamps: false,
});

module.exports = Configuracion;
