const { DataTypes, Model } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

/**
 * Modelo para guardar TODAS las transacciones WirePOS (aprobadas, rechazadas, timeout)
 * Útil para:
 * - Auditoría completa
 * - Debugging de errores
 * - Reportes de transacciones
 * - Conciliación bancaria
 * - Reimpresión de vouchers
 */
class WireposTransaccion extends Model {}

WireposTransaccion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    // IDs de referencia
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'ID interno generado por nuestro sistema'
    },
    
    invoiceWireposId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'IDRequest retornado por LARO API'
    },
    
    facturaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Facturas',
        key: 'id'
      },
      comment: 'Factura asociada (null si transacción falló)'
    },
    
    // Datos de la solicitud
    deviceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'ID del dispositivo WirePOS (ej: 2084)'
    },
    
    frontendDeviceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID enviado por frontend (ej: DEV_TERM_001)'
    },
    
    transactionType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Tipo de transacción: V (Venta), AN (Anulación), SE (Cierre)'
    },
    
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto de la transacción'
    },
    
    invoice: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Número de factura o referencia enviado al iniciar transacción'
    },
    
    wireposInvoice: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Invoice generado por WirePOS (subcampo 10 del responseString)'
    },
    
    // Estado de la transacción
    status: {
      type: DataTypes.ENUM('PENDING', 'DONE', 'TIMEOUT', 'ERROR'),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'Estado actual de la transacción'
    },
    
    // Respuesta de LARO AddRequest
    addRequestResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Respuesta completa de AddRequest (IDRequest, ResponseCode, etc.)'
    },
    
    // Respuesta de LARO CheckRequest (resultado final)
    checkRequestResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Respuesta completa de CheckRequest (ResponseString con datos de tarjeta)'
    },
    
    // Datos parseados del ResponseString
    responseCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código de respuesta (00=Aprobado, 01=Rechazado, etc.)'
    },
    
    responseMessage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Mensaje descriptivo de la respuesta'
    },
    
    authCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código de autorización del banco'
    },
    
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: 'Últimos 4 dígitos de la tarjeta'
    },
    
    cardType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de tarjeta (VISA, MASTERCARD, etc.)'
    },
    
    // Timestamps
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento en que se creó la transacción'
    },
    
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Momento en que se completó (DONE/TIMEOUT/ERROR)'
    },
    
    pollingAttempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Número de intentos de polling realizados'
    },
    
    // Datos adicionales para debugging
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Mensaje de error si la transacción falló'
    },
    
    environment: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Ambiente usado: DEV, STAGING, PROD'
    }
  },
  {
    sequelize,
    modelName: 'WireposTransaccion',
    tableName: 'WireposTransacciones',
    timestamps: false, // Usamos createdAt manual
    indexes: [
      { fields: ['transactionId'] },
      { fields: ['invoiceWireposId'] },
      { fields: ['facturaId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['deviceId'] }
    ]
  }
);

module.exports = WireposTransaccion;
