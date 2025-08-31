// tareas/scheduler.js
const cron = require('node-cron');
const cerrarCajas = require('./cerrarCajas');
const actualizarVacacionesEmpleados = require('./actualizarVacaciones');

module.exports = (db) => {
  // —programación real (cada día a las 2:00 AM hora de Costa Rica)—
  cron.schedule('* * * * *', () => {
    console.log('Ejecutando tarea programada de cierre de cajas...');
    cerrarCajas(db).catch(err => {
      console.error('Error en tarea de cierre de cajas:', err);
    });
  }, {
    timezone: 'America/Costa_Rica'
  });

  // —programación de prueba: cada minuto— (descomentado para probar)
  cron.schedule('*/1 * * * *', () => {
    console.log('Ejecutando tarea de prueba de cierre de cajas...');
    cerrarCajas(db).catch(err => {
      console.error('Error en tarea de cierre de cajas:', err);
    });
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('Tarea "cierre de cajas" programada para las 2:00 AM (Costa Rica).');

  // Tarea de vacaciones - primer día de cada mes a las 2:00 AM
  cron.schedule('0 2 1 * *', async () => {
    console.log('Ejecutando tarea de actualización de vacaciones...');
    try {
      await actualizarVacacionesEmpleados();
    } catch (err) {
      console.error('Error en tarea de vacaciones:', err);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('Tarea "actualizar vacaciones" programada para el 1er día de cada mes a las 2:00 AM.');
};
