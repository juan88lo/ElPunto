-- migrations/add_operador_logico_promociones.sql
-- Agregar campo operadorLogico a la tabla promociones_rifa
-- Este campo determina si los requisitos se evalúan con AND (ambos) o OR (al menos uno)

ALTER TABLE promociones_rifa 
ADD COLUMN operadorLogico ENUM('Y', 'O') DEFAULT 'Y' 
COMMENT 'Operador lógico para requisitos: Y=ambos deben cumplirse, O=al menos uno debe cumplirse'
AFTER cantidadProductosMin;

-- Actualizar promociones existentes para usar 'O' (comportamiento anterior)
UPDATE promociones_rifa 
SET operadorLogico = 'O' 
WHERE operadorLogico IS NULL OR operadorLogico = 'Y';

-- Comentario explicativo
-- Con operadorLogico = 'Y': Debe cumplir montoMinimo Y cantidadProductosMin
-- Con operadorLogico = 'O': Debe cumplir montoMinimo O cantidadProductosMin
