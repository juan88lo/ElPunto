// tareas/scheduler.js
const cron = require('node-cron');
const cerrarCajas = require('./cerrarCajas');
const actualizarVacacionesEmpleados = require('./actualizarVacaciones');

module.exports = (db) => {
  // Programación real (cada día a las 2:00 AM hora de Costa Rica) - DESACTIVADA
  // cron.schedule('0 2 * * *', () => {
  //   cerrarCajas(db).catch(err => {
  //     console.error('Error en tarea de cierre de cajas:', err);
  //   });
  // }, {
  //   timezone: 'America/Costa_Rica'
  // });

  // Programación de prueba: cada minuto (comentar en producción)
  // cron.schedule('*/1 * * * *', () => {
  //   cerrarCajas(db).catch(err => {
  //     console.error('Error en tarea de cierre de cajas:', err);
  //   });
  // }, {
  //   timezone: 'America/Costa_Rica'
  // });

  console.log('Tarea de cierre de cajas programada para las 2:00 AM.');

  // Tarea de vacaciones - primer día de cada mes a las 2:00 AM
  cron.schedule('0 2 1 * *', async () => {
    try {
      await actualizarVacacionesEmpleados();
    } catch (err) {
      console.error('Error en tarea de vacaciones:', err);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('Tarea de actualización de vacaciones programada.');

  console.log('Tarea de actualización de vacaciones programada para el 1er día de cada mes a las 2:00 AM.');
};
