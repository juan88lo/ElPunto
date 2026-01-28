 require('../tareas/scheduler');
const { sequelize } = require('./baseModel');

const TipoUsuario = require('./TipoUsuario');
const Permiso = require('./Permiso');
const TipoUsuarioPermiso = require('./TipoUsuarioPermiso');
const Configuracion = require('./Configuracion');
const Familia = require('./Familia');
const Proveedor = require('./Proveedor');
const Inventario = require('./Inventario');
const Usuario = require('./Usuario');
const Caja = require('./caja');
const Factura = require('./Factura');
const Bitacora = require('./Bitacora');
const DetalleFactura = require('./DetalleFactura');
const NotaCredito = require('./NotaCredito');
const DetalleNotaCredito = require('./DetalleNotaCredito');
const Empleado = require('./Empleado');
const PagoProveedor = require('./PagoProveedor');
const Planilla = require('./Planilla');
const ConsecutivoFactura = require('./ConsecutivoFactura');
const VacacionTomada = require('./VacacionesTomadas');
const PromocionRifa = require('./PromocionRifa');
const CuponRifa = require('./CuponRifa');
// Relaciones existentes
TipoUsuario.hasMany(Usuario, { foreignKey: 'tipoUsuarioId' });
Usuario.belongsTo(TipoUsuario, { foreignKey: 'tipoUsuarioId' });

TipoUsuario.belongsToMany(Permiso, {
  through: TipoUsuarioPermiso,
  foreignKey: 'tipoUsuarioId',
  otherKey: 'permisoId',
  as: 'permisos',
});
Permiso.belongsToMany(TipoUsuario, {
  through: TipoUsuarioPermiso,
  foreignKey: 'permisoId',
  otherKey: 'tipoUsuarioId',
  as: 'roles',
});

Familia.hasMany(Inventario, { foreignKey: 'familiaId' });
Inventario.belongsTo(Familia, { foreignKey: 'familiaId' });

Proveedor.hasMany(Inventario, { foreignKey: 'proveedorId' });
Inventario.belongsTo(Proveedor, { foreignKey: 'proveedorId' });

Caja.hasMany(Factura, { foreignKey: 'cajaId' });
Factura.belongsTo(Caja, { foreignKey: 'cajaId' });

Usuario.hasMany(Factura, { foreignKey: 'usuarioId' });
Factura.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Factura.hasMany(DetalleFactura, { foreignKey: 'facturaId' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'facturaId' });

Factura.hasMany(NotaCredito, { foreignKey: 'facturaId' });
NotaCredito.belongsTo(Factura, { foreignKey: 'facturaId' });

NotaCredito.hasMany(DetalleNotaCredito, { foreignKey: 'notaCreditoId' });
DetalleNotaCredito.belongsTo(NotaCredito, { foreignKey: 'notaCreditoId' });

Factura.hasMany(Bitacora, { foreignKey: 'entidadId', constraints: false, scope: { entidad: 'factura' } });

NotaCredito.hasMany(Bitacora, { foreignKey: 'entidadId', constraints: false, scope: { entidad: 'notaCredito' } });
NotaCredito.belongsTo(Factura,   { foreignKey: 'facturaId' });
Factura.hasMany(NotaCredito,     { foreignKey: 'facturaId' });

NotaCredito.hasMany(DetalleNotaCredito, { foreignKey: 'notaCreditoId' });
DetalleNotaCredito.belongsTo(NotaCredito,{ foreignKey: 'notaCreditoId' });


Bitacora.belongsTo(Factura, { foreignKey: 'entidadId', constraints: false });
Bitacora.belongsTo(NotaCredito, { foreignKey: 'entidadId', constraints: false });


Empleado.hasMany(Planilla, { foreignKey: 'empleadoId' });
Planilla.belongsTo(Empleado, { foreignKey: 'empleadoId' });

// Relaciones de Promociones y Cupones de Rifa
PromocionRifa.hasMany(CuponRifa, { foreignKey: 'promocionId' });
CuponRifa.belongsTo(PromocionRifa, { foreignKey: 'promocionId' });

Factura.hasOne(CuponRifa, { foreignKey: 'facturaId' });
CuponRifa.belongsTo(Factura, { foreignKey: 'facturaId' });

Usuario.hasMany(CuponRifa, { foreignKey: 'impresoporUsuarioId' });
CuponRifa.belongsTo(Usuario, { foreignKey: 'impresoporUsuarioId', as: 'usuarioImpresion' });

module.exports = {
  sequelize,
  Usuario,
  TipoUsuario,
  Permiso,
  TipoUsuarioPermiso,
  Configuracion,
  Familia,
  Proveedor,
  Inventario,
  Caja,
  DetalleFactura,
  Factura,
  NotaCredito,
  DetalleNotaCredito,
  Bitacora,
  Empleado,
  PagoProveedor,
  Planilla,
  ConsecutivoFactura,
  VacacionTomada,
  PromocionRifa,
  CuponRifa
};
