const { sequelize, Usuario, TipoUsuario, Permiso, TipoUsuarioPermiso } = require('../../src/models');
const verificarPermiso = require('../../src/utils/permisos');

describe('verificarPermiso', () => {
  let usuario, permiso;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const tipo = await TipoUsuario.create({ nombre: 'User' });
    usuario = await Usuario.create({ nombre: 'u1', correo: 'u1@u.com', password: 'pw', tipoUsuarioId: tipo.id });
    permiso = await Permiso.create({ nombrePermiso: 'TEST', Pantalla: 'Test' });
    await TipoUsuarioPermiso.create({ tipoUsuarioId: tipo.id, permisoId: permiso.id });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('returns false if no user id', async () => {
    const result = await verificarPermiso('TEST', null);
    expect(result).toBe(false);
  });

  test('returns true if user has permiso', async () => {
    const result = await verificarPermiso('TEST', usuario.id);
    expect(result).toBe(true);
  });

  test('returns false if permiso does not exist', async () => {
    const result = await verificarPermiso('NOPE', usuario.id);
    expect(result).toBe(false);
  });
});
