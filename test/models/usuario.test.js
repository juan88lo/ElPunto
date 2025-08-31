const { sequelize, Usuario, TipoUsuario } = require('../../src/models');
const { expect } = require('@jest/globals');

describe('Usuario Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await TipoUsuario.create({ nombre: 'Admin' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should create a user with valid data', async () => {
    const tipo = await TipoUsuario.findOne();
    const user = await Usuario.create({
      nombre: 'testuser',
      correo: 'test@user.com',
      password: 'password123',
      tipoUsuarioId: tipo.id
    });
    expect(user.nombre).toBe('testuser');
    expect(user.correo).toBe('test@user.com');
    expect(user.tipoUsuarioId).toBe(tipo.id);
  });

  test('should fail without username', async () => {
    await expect(Usuario.create({ password: 'pw', tipoUsuarioId: 1 })).rejects.toThrow();
  });
});
