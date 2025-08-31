const { sequelize, Empleado, VacacionTomada } = require('../../src/models');
const actualizarVacaciones = require('../../src/tareas/actualizarVacaciones');

describe('Actualizar Vacaciones', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await Empleado.create({ nombre: 'John', apellido: 'Doe', cedula: '123', puesto: 'Dev', salarioBase: 1000, fechaIngreso: '2024-01-01', diasVacaciones: 0, estado: true });
    await VacacionTomada.create({ empleadoId: 1, dias: 2, fecha: '2024-02-01', estado: 'pendiente' });
  });
  afterAll(async () => {
    await sequelize.close();
  });
  test('should update diasVacaciones based on taken days', async () => {
    await actualizarVacaciones();
    const emp = await Empleado.findByPk(1);
    // meses trabajados a jul-2-2025 es 18, diasPorMes=1 -> 18 - 2 = 16
    expect(emp.diasVacaciones).toBeGreaterThanOrEqual(16);
  });
});
