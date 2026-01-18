-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS actualizar_stats_promocion;
DROP TRIGGER IF EXISTS actualizar_reimpresos;

-- Crear trigger para actualizar estadísticas cuando se genera un cupón
DELIMITER $$
CREATE TRIGGER actualizar_stats_promocion
AFTER INSERT ON cupones_rifa
FOR EACH ROW
BEGIN
  UPDATE promociones_rifas 
  SET totalCupones = totalCupones + 1,
      totalVentas = totalVentas + NEW.montoFactura
  WHERE id = NEW.promocionId;
END$$
DELIMITER ;

-- Crear trigger para actualizar reimpresiones
DELIMITER $$
CREATE TRIGGER actualizar_reimpresos
AFTER UPDATE ON cupones_rifa
FOR EACH ROW
BEGIN
  IF NEW.vecesImpreso > OLD.vecesImpreso THEN
    UPDATE promociones_rifas 
    SET cuponesReimpresos = cuponesReimpresos + 1
    WHERE id = NEW.promocionId;
  END IF;
END$$
DELIMITER ;
