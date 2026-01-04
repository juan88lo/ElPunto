const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

class CuponRifa extends Model { }

CuponRifa.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    promocionId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: { 
        model: 'promociones_rifas', 
        key: 'id' 
      },
      comment: 'ID de la promoción asociada'
    },
    facturaId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: { 
        model: 'Facturas', 
        key: 'id' 
      },
      comment: 'ID de la factura que generó el cupón'
    },
    numeroCupon: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      unique: true,
      comment: 'Número único del cupón (ej: RIFA-2025-00001)'
    },
    nombreCliente: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Nombre del cliente participante'
    },
    telefono: { 
      type: DataTypes.STRING(20), 
      allowNull: true,
      comment: 'Teléfono del cliente'
    },
    montoFactura: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
      comment: 'Monto total de la factura asociada'
    },
    fechaEmision: { 
      type: DataTypes.DATE, 
      defaultValue: Sequelize.NOW,
      comment: 'Fecha y hora de emisión del cupón'
    },
    vecesImpreso: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Cantidad de veces que se ha impreso el cupón'
    },
    ultimaImpresion: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      comment: 'Fecha y hora de la última impresión'
    },
    impresoporUsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      comment: 'ID del usuario que imprimió por última vez'
    }
  },
  { 
    sequelize, 
    modelName: 'CuponRifa', 
    tableName: 'cupones_rifa',
    timestamps: false
  }
);

module.exports = CuponRifa;
