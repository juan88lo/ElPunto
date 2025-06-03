// models/Inventario.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;
const Configuracion = require('./Configuracion');
const Familia = require('./Familia');
const Proveedor = require('./Proveedor');

class Inventario extends Model {
  // método para incrementar existencias
  async agregarExistencias(cantidad) {
    this.cantidadExistencias += cantidad;
    return this.save();
  }
}

Inventario.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigoBarras: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  precioCostoSinImpuesto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  impuestoPorProducto: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  precioFinalVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cantidadExistencias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Inventario',
  tableName: 'Inventarios',
  timestamps: false,
  hooks: {
    // Hook antes de guardar (crear o actualizar)
    async beforeSave(item) {
      const rate = item.tasaImpuesto ?? 0.13; // usa 0.13 si no viene definido
      const base = +(item.precioFinalVenta / (1 + rate)).toFixed(2);
      const tax = +(item.precioFinalVenta - base).toFixed(2);

      item.precioCostoSinImpuesto = base;
      // item.impuestoPorProducto = tax;
    },

    // Hook después de actualizar
    async afterUpdate(item, options) {
      const antes = item._previousDataValues.cantidadExistencias;
      const ahora = item.cantidadExistencias;

      if (antes >= 10 && ahora < 10) {
        await sequelize.models.AlertaStock.create({
          inventarioId: item.id,
          cantidadActual: ahora,
          enviado: false,
        });
      }
    },
  },
});

Inventario.prototype.agregarExistencias = async function (cant, opt) {
  this.cantidadExistencias += Number(cant);
  return this.save(opt);
};

Inventario.prototype.reducirExistencias = async function (cant, opt) {
  if (this.cantidadExistencias < cant) {
    throw new Error('Stock insuficiente para reversar');
  }
  this.cantidadExistencias -= Number(cant);
  return this.save(opt);
};

// Relaciones
Inventario.belongsTo(Familia, { foreignKey: 'familiaId', as: 'familia' });
Familia.hasMany(Inventario, { foreignKey: 'familiaId' });

Inventario.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
Proveedor.hasMany(Inventario, { foreignKey: 'proveedorId' });

module.exports = Inventario;
