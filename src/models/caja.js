const { DataTypes, Model, Sequelize, Op } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
const Usuario = require('./Usuario');

class Caja extends Model { }

Caja.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // Allow null for testing; production should ensure valid user
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1, references: { model: Usuario, key: 'id' } },
    usuarioAperturaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Usuario, key: 'id' } },
    usuarioCierreId: { type: DataTypes.INTEGER },

    fechaApertura: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    fechaCierre: { type: DataTypes.DATE },

    montoInicial: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    montoSistema: { type: DataTypes.DECIMAL(10, 2) },
    montoReal: { type: DataTypes.DECIMAL(10, 2) },
    totalVentas: { type: DataTypes.DECIMAL(10, 2) },
    estado: { type: DataTypes.ENUM('abierta', 'cerrada', 'reabierta', 'abandonada'), defaultValue: 'abierta' },
    motivoReapertura: { type: DataTypes.STRING },
    fechaReapertura: { type: DataTypes.DATE },

    /** ← consecutivo diario 1-N */
    // Allow null/default for testing scenarios
    numeroDia: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: 'Caja',
    tableName: 'Cajas',
    timestamps: false,
    indexes: [ 
      {
        unique: true,
     fields : ['fechaApertura', 'numeroDia'],  
      },
    ],
  }
);

module.exports = Caja;
