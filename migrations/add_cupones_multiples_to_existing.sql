-- Migración para agregar columna cuponesMultiples a promociones_rifas
-- Ejecutar solo una vez en el servidor si la tabla ya existe

ALTER TABLE promociones_rifas 
ADD COLUMN IF NOT EXISTS cuponesMultiples BOOLEAN DEFAULT FALSE 
COMMENT 'Permite generar múltiples cupones según el monto de compra';
