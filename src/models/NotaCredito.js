const { DataTypes, Model, Sequelize } = require('sequelize'); // Sequelize para usar Sequelize.NOW
const sequelize = require('./baseModel').sequelize;           // Asegurate de apuntar al archivo correcto
const Usuario = require('./Usuario'); 
const Factura = require('./Factura'); 

class NotaCredito extends Model {}
NotaCredito.init(
  {
    id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    facturaId:   { type: DataTypes.INTEGER, references: { model:  Factura, key: 'id' } },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Usuario, key: 'id' } },
    fecha:     { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    motivo:    { type: DataTypes.STRING },
    total:     { type: DataTypes.DECIMAL(10, 2) },
    estado:    { type: DataTypes.ENUM('emitida', 'anulada'), defaultValue: 'emitida' },
  },
  { sequelize, modelName: 'NotaCredito', tableName: 'NotasCredito', timestamps: false }
);
module.exports = NotaCredito;
