// tareas/scheduler.js
const cron = require('node-cron');
const cerrarCajas = require('./cerrarCajas');
const actualizarVacacionesEmpleados = require('./actualizarVacaciones');

module.exports = (db) => {
  // TAREA PRINCIPAL: Cierre de cajas diario a las 2:00 AM hora de Costa Rica
  cron.schedule('0 2 * * *', async () => {
    console.log(`[${new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}] Ejecutando cierre automático de cajas...`);
    try {
      await cerrarCajas(db);
      console.log('✅ Cierre de cajas completado exitosamente');
    } catch (err) {
      console.error('❌ Error en tarea de cierre de cajas:', err);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  // SOLO PARA DESARROLLO/PRUEBAS: Descomenta para probar (cada 5 minutos)
  // cron.schedule('*/5 * * * *', async () => {
  //   console.log(`[${new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}] 🧪 PRUEBA: Cierre de cajas...`);
  //   try {
  //     await cerrarCajas(db);
  //     console.log('✅ Prueba de cierre completada');
  //   } catch (err) {
  //     console.error('❌ Error en prueba de cierre:', err);
  //   }
  // }, {
  //   timezone: 'America/Costa_Rica'
  // });

  console.log(`🕐 Tarea "cierre de cajas" programada para las 2:00 AM (Costa Rica)`);
  console.log(`🌍 Hora actual del servidor: ${new Date().toLocaleString()}`);
  console.log(`🇨🇷 Hora actual de Costa Rica: ${new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);

  // Tarea de vacaciones - primer día de cada mes a las 3:00 AM (después del cierre de cajas)
  cron.schedule('0 3 1 * *', async () => {
    console.log(`[${new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}] Ejecutando actualización de vacaciones...`);
    try {
      await actualizarVacacionesEmpleados();
      console.log('✅ Actualización de vacaciones completada');
    } catch (err) {
      console.error('❌ Error en tarea de vacaciones:', err);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log(`📅 Tarea "actualizar vacaciones" programada para el 1er día de cada mes a las 3:00 AM (Costa Rica)`);

  // Función para verificar la hora actual de ambas zonas
  const verificarHoras = () => {
    const horaServidor = new Date();
    const horaCostaRica = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
    const horaVirginia = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    
    console.log('⏰ Verificación de zonas horarias:');
    console.log(`   🖥️  Servidor (UTC): ${horaServidor.toISOString()}`);
    console.log(`   🇺🇸 Virginia (EDT): ${horaVirginia}`);
    console.log(`   🇨🇷 Costa Rica (CST): ${horaCostaRica}`);
  };

  // Mostrar información inicial de zonas horarias
  verificarHoras();

  // Verificar zonas horarias cada hora (opcional, para debugging)
  // cron.schedule('0 * * * *', verificarHoras, { timezone: 'America/Costa_Rica' });
};