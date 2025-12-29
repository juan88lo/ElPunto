/**
 * Migración automática de columnas Wirepos
 * Se ejecuta al iniciar el servidor para asegurar que las columnas existan
 */

const sequelize = require('./db');

async function migrateWireposColumns() {
  try {
    // Obtener información de columnas existentes
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'facturas'
        AND COLUMN_NAME LIKE 'wirepos%'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Definir columnas requeridas
    const requiredColumns = [
      {
        name: 'wireposInvoice',
        sql: `ALTER TABLE facturas ADD COLUMN wireposInvoice VARCHAR(255) NULL COMMENT 'Invoice de Wirepos (subcampo 10) usado para anulaciones en datafono'`
      },
      {
        name: 'wireposAuthCode',
        sql: `ALTER TABLE facturas ADD COLUMN wireposAuthCode VARCHAR(255) NULL COMMENT 'Código de autorización de la transacción Wirepos'`
      },
      {
        name: 'wireposResponseCode',
        sql: `ALTER TABLE facturas ADD COLUMN wireposResponseCode VARCHAR(10) NULL COMMENT 'Código de respuesta de Wirepos (00=Aprobado)'`
      },
      {
        name: 'wireposCardLast4',
        sql: `ALTER TABLE facturas ADD COLUMN wireposCardLast4 VARCHAR(4) NULL COMMENT 'Últimos 4 dígitos de la tarjeta usada'`
      },
      {
        name: 'wireposCardType',
        sql: `ALTER TABLE facturas ADD COLUMN wireposCardType VARCHAR(50) NULL COMMENT 'Tipo de tarjeta (VISA, MASTERCARD, etc.)'`
      }
    ];

    // Agregar columnas faltantes
    let columnsAdded = 0;
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        await sequelize.query(column.sql);
        columnsAdded++;
      }
    }

    // Migration completed

  } catch (error) {
    console.error('❌ Error en migración de Wirepos:', error.message);
    // No lanzamos el error para que el servidor pueda continuar iniciando
    // pero registramos el problema
    console.warn('⚠️ El servidor continuará, pero algunas funcionalidades de Wirepos pueden no funcionar');
  }
}

module.exports = migrateWireposColumns;
