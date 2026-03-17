/**
 * Sistema de migraciones automáticas
 * Se ejecuta al iniciar el servidor para asegurar que las columnas críticas existan
 */

const { sequelize } = require('../models/baseModel');
const { QueryTypes } = require('sequelize');

/**
 * Verifica y crea la tabla ErrorLogs para logging de errores del sistema
 */
async function migrateErrorLogsTable() {
  try {
    console.log('🔍 Verificando tabla ErrorLogs...');
    
    // Verificar si la tabla ya existe
    const [results] = await sequelize.query(
      `SHOW TABLES LIKE 'ErrorLogs'`
    );
    
    if (results && results.length > 0) {
      console.log('✅ Tabla ErrorLogs ya existe');
      return;
    }
    
    console.log('📝 Tabla ErrorLogs no existe, creando...');
    
    // Crear la tabla
    await sequelize.query(`
      CREATE TABLE ErrorLogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        errorCode VARCHAR(100) NOT NULL COMMENT 'Código identificador del error',
        errorMessage TEXT NOT NULL COMMENT 'Mensaje descriptivo del error',
        stackTrace TEXT NULL COMMENT 'Stack trace completo del error',
        context TEXT NULL COMMENT 'Contexto adicional en formato JSON',
        severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'error' COMMENT 'Nivel de severidad',
        resolved BOOLEAN DEFAULT FALSE COMMENT 'Indica si el error fue revisado',
        resolvedBy INT NULL COMMENT 'Usuario que resolvió el error',
        resolvedAt DATETIME NULL COMMENT 'Fecha de resolución',
        notes TEXT NULL COMMENT 'Notas sobre la resolución',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del error',
        INDEX idx_errorCode (errorCode),
        INDEX idx_severity (severity),
        INDEX idx_resolved (resolved),
        INDEX idx_timestamp (timestamp),
        FOREIGN KEY (resolvedBy) REFERENCES Usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Log de errores del sistema para debugging y auditoría'
    `);
    
    console.log('✅ Tabla ErrorLogs creada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al migrar ErrorLogs:', error.message);
    // No lanzar el error para no detener el servidor
  }
}

/**
 * Verifica y crea la columna idempotencyKey en la tabla Facturas
 * Previene duplicación de facturas por problemas de red/latencia
 */
async function migrateIdempotencyKey() {
  try {
    console.log('🔍 Verificando columna idempotencyKey en tabla Facturas...');
    
    // Verificar si la columna ya existe
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM Facturas LIKE 'idempotencyKey'`,
      { type: QueryTypes.SELECT }
    );
    
    if (columns) {
      console.log('✅ Columna idempotencyKey ya existe');
      return;
    }
    
    console.log('📝 Columna idempotencyKey no existe, creando...');
    
    // Crear la columna
    await sequelize.query(`
      ALTER TABLE Facturas 
      ADD COLUMN idempotencyKey VARCHAR(255) NULL 
      COMMENT 'UUID único para prevenir duplicación de facturas por problemas de red'
    `);
    
    console.log('✅ Columna idempotencyKey creada exitosamente');
    
    // Verificar si el índice único ya existe
    const [indexes] = await sequelize.query(
      `SHOW INDEX FROM Facturas WHERE Key_name = 'idx_facturas_idempotency_key'`,
      { type: QueryTypes.SELECT }
    );
    
    if (!indexes) {
      console.log('📝 Creando índice único para idempotencyKey...');
      await sequelize.query(`
        CREATE UNIQUE INDEX idx_facturas_idempotency_key 
        ON Facturas(idempotencyKey)
      `);
      console.log('✅ Índice único creado exitosamente');
    } else {
      console.log('✅ Índice único ya existe');
    }
    
  } catch (error) {
    console.error('❌ Error al migrar idempotencyKey:', error.message);
    // No lanzar el error para no detener el servidor
    // La columna se puede crear manualmente si es necesario
  }
}

/**
 * Ejecuta todas las migraciones automáticas necesarias
 */
async function runAutoMigrations() {
  console.log('\n🚀 Ejecutando migraciones automáticas...\n');
  
  try {
    // Migración 1: Tabla ErrorLogs para logging de errores
    await migrateErrorLogsTable();
    
    // Migración 2: Campo idempotencyKey para prevenir duplicados
    await migrateIdempotencyKey();
    
    // Aquí se pueden agregar más migraciones en el futuro
    // await migrateOtraColumna();
    
    console.log('\n✅ Todas las migraciones automáticas completadas\n');
  } catch (error) {
    console.error('\n❌ Error en migraciones automáticas:', error.message);
    // No detener el servidor por errores de migración
  }
}

module.exports = runAutoMigrations;
