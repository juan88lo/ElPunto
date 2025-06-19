const Empleado = require('../models/Empleado');
const VacacionTomada = require('../models/VacacionesTomadas');

async function actualizarVacacionesEmpleados() {
  const empleados = await Empleado.findAll();
  const diasPorMes = 1; // Cambia esto según tu política

  for (const empleado of empleados) {
    // Calcula meses trabajados
    const fechaIngreso = new Date(empleado.fechaIngreso);
    const hoy = new Date();
    const mesesTrabajados = (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 +
                            (hoy.getMonth() - fechaIngreso.getMonth()) +
                            (hoy.getDate() >= fechaIngreso.getDate() ? 0 : -1);

    const totalAcumulado = mesesTrabajados * diasPorMes;

    // Suma los días tomados
    const totalTomados = await VacacionTomada.sum('dias', {
      where: { empleadoId: empleado.id }
    }) || 0;

    // Saldo real
    empleado.diasVacaciones = Math.max(totalAcumulado - totalTomados, 0);

    await empleado.save();
  }
  console.log('✅ Vacaciones de empleados actualizadas');
}

module.exports = actualizarVacacionesEmpleados;