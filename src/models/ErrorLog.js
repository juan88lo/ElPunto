const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

class ErrorLog extends Model {}

ErrorLog.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    errorCode: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      comment: 'Código identificador del error (ej: FACTURA_DUPLICADA, STOCK_INSUFICIENTE)'
    },
    errorMessage: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Mensaje descriptivo del error'
    },
    stackTrace: { 
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Stack trace completo del error para debugging'
    },
    context: { 
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('context');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('context', value ? JSON.stringify(value) : null);
      },
      comment: 'Contexto adicional en formato JSON (usuarioId, cajaId, productos, etc.)'
    },
    severity: { 
      type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
      defaultValue: 'error',
      comment: 'Nivel de severidad del error'
    },
    resolved: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false,
      comment: 'Indica si el error ya fue revisado/resuelto'
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Usuarios', key: 'id' },
      comment: 'Usuario que marcó el error como resuelto'
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se resolvió el error'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales sobre la resolución del error'
    },
    timestamp: { 
      type: DataTypes.DATE, 
      defaultValue: Sequelize.NOW,
      allowNull: false,
      comment: 'Fecha y hora en que ocurrió el error'
    }
  },
  { 
    sequelize, 
    modelName: 'ErrorLog', 
    tableName: 'ErrorLogs', 
    timestamps: false,
    indexes: [
      { fields: ['errorCode'] },
      { fields: ['severity'] },
      { fields: ['resolved'] },
      { fields: ['timestamp'] }
    ]
  }
);

module.exports = ErrorLog;
