const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

class PromocionRifa extends Model { }

PromocionRifa.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    titulo: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'Título de la promoción (ej: Televisor Samsung 50 pulgadas)'
    },
    descripcion: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Descripción adicional de la promoción'
    },
    fechaInicio: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Fecha de inicio de la promoción'
    },
    fechaSorteo: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Fecha del sorteo'
    },
    montoMinimo: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true,
      comment: 'Monto mínimo de compra para participar (opcional)'
    },
    cantidadProductosMin: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'Cantidad mínima de productos para participar (opcional)'
    },
    activo: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false,
      comment: 'Indica si la promoción está activa'
    },
    totalCupones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de cupones generados para esta promoción'
    },
    totalVentas: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total acumulado de ventas con cupón'
    },
    cuponesReimpresos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de cupones que han sido reimpresos'
    },
    cuponesMultiples: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Permite generar múltiples cupones según el monto de compra'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'fecha_creacion'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'fecha_modificacion'
    }
  },
  { 
    sequelize, 
    modelName: 'PromocionRifa', 
    tableName: 'promociones_rifas',
    timestamps: true
  }
);

module.exports = PromocionRifa;
