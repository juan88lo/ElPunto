const sequelize = require('../src/models/baseModel').sequelize;

/**
 * Crea los triggers para actualizar estadísticas de promociones
 * Los triggers no se pueden crear con Sequelize, se deben crear manualmente
 */
async function createPromocionTriggers() {
  try {
    console.log('🎁 Creando triggers de promociones...');

    // Trigger 1: Actualizar estadísticas cuando se genera un cupón
    await sequelize.query(`DROP TRIGGER IF EXISTS actualizar_stats_promocion`);
    await sequelize.query(`
      CREATE TRIGGER actualizar_stats_promocion
      AFTER INSERT ON cupones_rifa
      FOR EACH ROW
      BEGIN
        UPDATE promociones_rifas 
        SET totalCupones = totalCupones + 1,
            totalVentas = totalVentas + NEW.montoFactura
        WHERE id = NEW.promocionId;
      END
    `);
    console.log('✅ Trigger actualizar_stats_promocion creado');

    // Trigger 2: Actualizar contador de reimpresiones
    await sequelize.query(`DROP TRIGGER IF EXISTS actualizar_reimpresos`);
    await sequelize.query(`
      CREATE TRIGGER actualizar_reimpresos
      AFTER UPDATE ON cupones_rifa
      FOR EACH ROW
      BEGIN
        IF NEW.vecesImpreso > OLD.vecesImpreso THEN
          UPDATE promociones_rifas 
          SET cuponesReimpresos = cuponesReimpresos + 1
          WHERE id = NEW.promocionId;
        END IF;
      END
    `);
    console.log('✅ Trigger actualizar_reimpresos creado');

  } catch (error) {
    console.error('❌ Error creando triggers:', error.message);
    // No lanzamos el error para no detener el servidor
  }
}

module.exports = createPromocionTriggers;
