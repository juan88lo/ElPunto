const { DataTypes, Model } = require('sequelize');
const sequelize  = require('./baseModel').sequelize;
const Inventario = require('./Inventario');

class AlertaStock extends Model {}
AlertaStock.init({
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inventarioId:   { type: DataTypes.INTEGER, allowNull: false, references:{ model: Inventario, key:'id' } },
  cantidadActual: { type: DataTypes.INTEGER },
  enviado:        { type: DataTypes.BOOLEAN, defaultValue:false },
}, { sequelize, modelName:'AlertaStock', tableName:'AlertasStock', timestamps:false });

Inventario.hasMany(AlertaStock,{foreignKey:'inventarioId'});
AlertaStock.belongsTo(Inventario,{foreignKey:'inventarioId'});
module.exports = AlertaStock;