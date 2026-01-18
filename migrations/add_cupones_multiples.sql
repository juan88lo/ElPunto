-- Migración: Agregar funcionalidad de cupones múltiples
-- Fecha: 2025-12-30
-- Descripción: Permitir generar múltiples cupones basados en el monto de compra

-- Agregar columna para habilitar cupones múltiples (ignorar si ya existe)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'promociones_rifas' 
               AND COLUMN_NAME = 'cuponesMultiples');

SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE promociones_rifas ADD COLUMN cuponesMultiples BOOLEAN DEFAULT FALSE COMMENT ''Permite generar múltiples cupones por factura basados en el monto''',
  'SELECT ''La columna cuponesMultiples ya existe'' AS message');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar la estructura actualizada
SELECT 
  COLUMN_NAME as columna,
  DATA_TYPE as tipo,
  COLUMN_DEFAULT as valorPorDefecto,
  IS_NULLABLE as nullable,
  COLUMN_COMMENT as comentario
FROM information_schema.columns
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'promociones_rifas'
  AND COLUMN_NAME = 'cuponesMultiples';

-- Nota: Cuando cuponesMultiples = true:
-- - Si montoMinimo = 5000 y total factura = 15000, genera 3 cupones (15000/5000 = 3)
-- - Cada cupón tendrá un número único consecutivo
-- - Los triggers automáticos actualizarán los contadores correctamente
