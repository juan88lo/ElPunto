const { sequelize, Inventario, Familia, Proveedor } = require('../../src/models');
const { expect } = require('@jest/globals');

describe('Inventario Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const familia = await Familia.create({ nombre: 'Electrónica' });
    const proveedor = await Proveedor.create({ nombre: 'Proveedor1', TelCelular: '1234567890' });
    global.familiaId = familia.id;
    global.proveedorId = proveedor.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should create inventory item with valid relations', async () => {
    const item = await Inventario.create({
      nombre: 'TV 32"',
      codigoBarras: 'CODE123',
      precioCostoSinImpuesto: 800,
      impuestoPorProducto: 0,
      precioFinalVenta: 1000,
      cantidadExistencias: 10,
      familiaId: global.familiaId,
      proveedorId: global.proveedorId
    });
    expect(item.nombre).toBe('TV 32"');
  });

  test('should fail without nombre', async () => {
    await expect(Inventario.create({
      codigoBarras: 'CODE456',
      precioCostoSinImpuesto: 500,
      impuestoPorProducto: 0,
      precioFinalVenta: 600,
      cantidadExistencias: 5,
      familiaId: global.familiaId,
      proveedorId: global.proveedorId
    })).rejects.toThrow();
  });
});
