// tareas/scheduler.js
const cron = require('node-cron');
const cerrarCajas = require('./cerrarCajas');
const actualizarVacacionesEmpleados = require('./actualizarVacaciones');

module.exports = (db) => {
  // —programación real (cada día a las 12-00 hora de Costa Rica)—
  cron.schedule('0 2 * * *', () => cerrarCajas(db), {
    timezone: 'America/Costa_Rica'
  });

  // —programación de prueba: cada minuto—
  // cron.schedule('*/1 * * * *', () => cerrarCajas(db), {
  //   timezone: 'America/Costa_Rica'
  // });

  console.log('Tarea “cierre de cajas” programada.');

  cron.schedule('0 2 1 * *', async () => {
    await actualizarVacacionesEmpleados();
  });

  console.log('Tarea “actualizar vacaciones” programada.');
};
