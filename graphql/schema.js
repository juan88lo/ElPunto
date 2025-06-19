// src/graphql/schema.js

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLInt
} = require('graphql');
const {
  Usuario,
  TipoUsuario,
  Permiso,
  TipoUsuarioPermiso,
  Configuracion,
  Familia,
  Proveedor,
  Inventario,
  ConsecutivoFactura, NotaCredito, DetalleNotaCredito, PagoProveedor, Planilla, VacacionTomada
} = require('../models');
const { Empleado } = require('../models');
const { DetalleFactura: FacturaDetalle } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Caja, Factura, Bitacora } = require('../models');
const { sequelize, Sequelize } = require('../models/baseModel');
const { Op, fn, col, literal } = require('sequelize');
const e = require('cors');

const InventarioInputType = new GraphQLInputObjectType({
  name: 'InventarioInput',
  fields: () => ({
    nombre: { type: new GraphQLNonNull(GraphQLString) },
    codigoBarras: { type: new GraphQLNonNull(GraphQLString) },
    precioCostoSinImpuesto: { type: new GraphQLNonNull(GraphQLFloat) },
    impuestoPorProducto: { type: GraphQLFloat },
    precioFinalVenta: { type: new GraphQLNonNull(GraphQLFloat) },
    cantidadExistencias: { type: new GraphQLNonNull(GraphQLInt) },
    familiaId: { type: new GraphQLNonNull(GraphQLID) },
    proveedorId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

const DetalleNotaCreditoType = new GraphQLObjectType({
  name: 'DetalleNotaCredito',
  fields: () => ({
    id: { type: GraphQLInt },
    notaCreditoId: { type: GraphQLInt },
    productoId: { type: GraphQLInt },
    cantidad: { type: GraphQLFloat },
    precioUnitario: { type: GraphQLFloat },
    subtotal: { type: GraphQLFloat },
    impuesto: { type: GraphQLFloat },
    producto: {
      type: InventarioType,
      resolve: (detalle) => Inventario.findByPk(detalle.productoId),
    }
  }),
});

// Input type for DetalleNotaCredito
const DetalleNotaCreditoInput = new GraphQLInputObjectType({
  name: 'DetalleNotaCreditoInput',
  fields: {
    productoId: { type: new GraphQLNonNull(GraphQLInt) },
    cantidad: { type: new GraphQLNonNull(GraphQLFloat) },
    precioUnitario: { type: new GraphQLNonNull(GraphQLFloat) },
    impuesto: { type: GraphQLFloat },
  },
});

const NotaCreditoType = new GraphQLObjectType({
  name: 'NotaCredito',
  fields: () => ({
    id: { type: GraphQLInt },
    facturaId: { type: GraphQLInt },
    usuarioId: { type: GraphQLInt },
    fecha: { type: GraphQLString },
    motivo: { type: GraphQLString },
    total: { type: GraphQLFloat },
    estado: { type: GraphQLString },
    usuario: {
      type: UsuarioType,
      resolve: (nota) => Usuario.findByPk(nota.usuarioId),
    },
    factura: {
      type: FacturaType,
      resolve: (nota) => Factura.findByPk(nota.facturaId),
    },
    detalles: {
      type: new GraphQLList(DetalleNotaCreditoType),
      resolve: (nota) => DetalleNotaCredito.findAll({ where: { notaCreditoId: nota.id } }),
    },
  }),
});


const FormaPagoEnum = new GraphQLEnumType({
  name: 'FormaPago',
  values: {
    EFECTIVO: { value: 'EFECTIVO' },
    TARJETA: { value: 'TARJETA' },
  },
});


const EmpleadoType = new GraphQLObjectType({
  name: 'Empleado',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    apellido: { type: GraphQLString },
    cedula: { type: GraphQLString },
    puesto: { type: GraphQLString },
    salarioBase: { type: GraphQLFloat },
    fechaIngreso: { type: GraphQLString },
    diasVacaciones: { type: GraphQLFloat },
    estado: { type: GraphQLBoolean },
  }),
});

const PagoProveedorType = new GraphQLObjectType({
  name: 'PagoProveedor',
  fields: () => ({
    id: { type: GraphQLID },
    proveedorId: { type: GraphQLID },
    fechaPago: { type: GraphQLString },
    monto: { type: GraphQLFloat },
    metodo: { type: GraphQLString },
    referencia: { type: GraphQLString },
    pagado: { type: GraphQLBoolean },
    observacion: { type: GraphQLString },
    proveedor: { type: ProveedorOutputType },
  })
});

const PermisoType = new GraphQLObjectType({
  name: 'Permiso',
  fields: () => ({
    id: { type: GraphQLID },
    nombrePermiso: { type: GraphQLString },
    Pantalla: { type: GraphQLString },
    asignado: { type: GraphQLBoolean },
  }),
});

const PermisoInputType = new GraphQLInputObjectType({
  name: 'PermisoInput',
  fields: {
    nombrePermiso: { type: new GraphQLNonNull(GraphQLString) },
    Pantalla: { type: new GraphQLNonNull(GraphQLString) },
  },
});

// --- CajaType ---
const CajaType = new GraphQLObjectType({
  name: 'Caja',
  fields: () => ({
    id: { type: GraphQLID },

    usuarioApertura: {
      type: UsuarioType,
      resolve: parent => Usuario.findByPk(parent.usuarioAperturaId)
    },

    usuarioCierre: {
      type: UsuarioType,
      resolve: parent => Usuario.findByPk(parent.usuarioCierreId)
    },

    fechaApertura: { type: GraphQLString },
    fechaCierre: { type: GraphQLString },
    fechaReapertura: { type: GraphQLString },
    motivoReapertura: { type: GraphQLString },
    montoInicial: { type: GraphQLFloat },
    montoSistema: { type: GraphQLFloat },
    montoReal: { type: GraphQLFloat },
    diferencia: { type: GraphQLFloat },
    totalVentas: { type: GraphQLFloat },
    estado: { type: GraphQLString },
    numeroDia: { type: GraphQLInt },
  }),
});
////factura

const ProductoInputType = new GraphQLInputObjectType({
  name: 'ProductoInput',
  fields: {
    codigoBarras: { type: new GraphQLNonNull(GraphQLString) },
    cantidad: { type: new GraphQLNonNull(GraphQLInt) }
  }
});

/* INPUT de la factura completo */
const FacturaInputType = new GraphQLInputObjectType({
  name: 'FacturaInput',
  fields: {
    cajaId: { type: new GraphQLNonNull(GraphQLID) },
    usuarioId: { type: new GraphQLNonNull(GraphQLID) },
    // clienteId: { type: GraphQLID },
    formaPago: { type: new GraphQLNonNull(FormaPagoEnum) },
    productos: { type: new GraphQLNonNull(new GraphQLList(ProductoInputType)) },
  },
});

/* OUTPUT (sencillo) de la factura */
const FacturaType = new GraphQLObjectType({
  name: 'Factura',
  fields: () => ({
    id: { type: GraphQLID },
    consecutivo: { type: GraphQLString },
    fecha: { type: GraphQLString },
    subtotal: { type: GraphQLFloat },
    descuento: { type: GraphQLFloat },
    impuesto: { type: GraphQLFloat },
    total: { type: GraphQLFloat },
    formaPago: { type: GraphQLString },
    estado: { type: GraphQLString },
    usuario: {
      type: UsuarioType,
      resolve: parent => Usuario.findByPk(parent.usuarioId)
    },
    caja: {
      type: CajaType,
      resolve: parent => Caja.findByPk(parent.cajaId)
    },
    lineas: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'DetalleFactura',
        fields: {
          id: { type: GraphQLID },
          cantidad: { type: GraphQLInt },
          precio: { type: GraphQLFloat },
          total: { type: GraphQLFloat },
          producto: {
            type: InventarioType,
            resolve: parent => Inventario.findByPk(parent.inventarioId)
          }
        }
      })),
      resolve: parent => FacturaDetalle.findAll({ where: { facturaId: parent.id } })
    }
  })
});

/* ---- INPUT para crear/actualizar roles ---- */
const TipoUsuarioInputType = new GraphQLInputObjectType({
  name: 'TipoUsuarioInput',
  fields: {
    nombre: { type: new GraphQLNonNull(GraphQLString) },
    descripcion: { type: GraphQLString }
  }
});

const TipoUsuarioType = new GraphQLObjectType({
  name: 'TipoUsuario',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    descripcion: { type: GraphQLString },
    permisos: {
      type: new GraphQLList(PermisoType),
      resolve: parent => parent.getPermisos()
    },
  }),
});

const UsuarioType = new GraphQLObjectType({
  name: 'Usuario',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    correo: { type: GraphQLString },
    tipoUsuario: {
      type: TipoUsuarioType,
      resolve: parent => parent.getTipoUsuario()
    },
    permisos: {
      type: new GraphQLList(PermisoType),
      resolve: async parent => {
        const rol = await parent.getTipoUsuario();
        return rol ? rol.getPermisos() : [];
      }
    },
    estado: {
      type: GraphQLBoolean,
      resolve: (parent) => parent.estado === true || parent.estado === 1 || parent.estado === '1'
    },
    empleado: {
      type: EmpleadoType,
      resolve: (parent) => parent.getEmpleado() ? parent.getEmpleado() : null
    },
  }),
});

const ConfiguracionType = new GraphQLObjectType({
  name: 'Configuracion',
  fields: () => ({
    id: { type: GraphQLID },
    clave: { type: GraphQLString },
    valor: { type: GraphQLFloat },
    prioridad: { type: GraphQLInt },
    estado: { type: GraphQLBoolean },
    pantalla: { type: GraphQLString },
  }),
});

const ConfiguracionInput = new GraphQLInputObjectType({
  name: 'ConfiguracionInput',
  fields: {
    clave: { type: new GraphQLNonNull(GraphQLString) },
    valor: { type: new GraphQLNonNull(GraphQLFloat) },
    prioridad: { type: new GraphQLNonNull(GraphQLInt) },
    estado: { type: new GraphQLNonNull(GraphQLBoolean) },
    pantalla: { type: new GraphQLNonNull(GraphQLString) },
  },
});
const FamiliaType = new GraphQLObjectType({
  name: 'Familia',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    Observaciones: { type: GraphQLString },
    Estado: { type: GraphQLBoolean }
  }),
});

const ProveedorOutputType = new GraphQLObjectType({
  name: 'Proveedor',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    TelCelular: { type: GraphQLString },
    TelOtro: { type: GraphQLString },
    AgenteAsignado: { type: GraphQLString },
    TelefonoAgente: { type: GraphQLString },
    Supervisor: { type: GraphQLString },
    TelSupervisor: { type: GraphQLString },
    Frecuencia: { type: GraphQLString },
    DiasVisita: { type: GraphQLString },
    DiaEntrega: { type: GraphQLString },
    Simpe: { type: GraphQLString },
    SimpeNombre: { type: GraphQLString },
    CuentaBancaria: { type: GraphQLString },
    Banco: { type: GraphQLString },
    NombrePropietarioCtaBancaria: { type: GraphQLString },
    Otros: { type: GraphQLString },
    Observaciones: { type: GraphQLString },
    Estado: { type: GraphQLBoolean },
  }),
});

const ProveedorInputType = new GraphQLInputObjectType({
  name: 'ProveedorInput',
  fields: () => ({
    nombre: { type: new GraphQLNonNull(GraphQLString) },
    TelCelular: { type: new GraphQLNonNull(GraphQLString) },
    TelOtro: { type: GraphQLString },
    AgenteAsignado: { type: GraphQLString },
    TelefonoAgente: { type: GraphQLString },
    Supervisor: { type: GraphQLString },
    TelSupervisor: { type: GraphQLString },
    Frecuencia: { type: GraphQLString },
    DiasVisita: { type: GraphQLString },
    DiaEntrega: { type: GraphQLString },
    Simpe: { type: GraphQLString },
    SimpeNombre: { type: GraphQLString },
    CuentaBancaria: { type: GraphQLString },
    Banco: { type: GraphQLString },
    NombrePropietarioCtaBancaria: { type: GraphQLString },
    Otros: { type: GraphQLString },
    Observaciones: { type: GraphQLString },
    Estado: {
      type: GraphQLBoolean
    },
  }),
});


const InventarioType = new GraphQLObjectType({
  name: 'Inventario',
  fields: () => ({
    id: { type: GraphQLID },
    nombre: { type: GraphQLString },
    codigoBarras: { type: GraphQLString },
    precioCostoSinImpuesto: { type: GraphQLFloat },
    impuestoPorProducto: { type: new GraphQLNonNull(GraphQLFloat) },
    precioFinalVenta: { type: GraphQLFloat },
    cantidadExistencias: { type: GraphQLInt },
    familia: {
      type: FamiliaType,
      resolve: parent => parent.getFamilia()
    },
    proveedor: {
      type: ProveedorOutputType,
      resolve: parent => parent.getProveedor()
    },
  }),
});

const LoginResponseType = new GraphQLObjectType({
  name: 'LoginResponse',
  fields: {
    token: { type: GraphQLString },
    mensaje: { type: GraphQLString },
    usuario: { type: UsuarioType },
  },
});


const TotalPorDiaType = new GraphQLObjectType({
  name: 'TotalPorDia',
  fields: {
    fecha: { type: GraphQLString },
    total: { type: GraphQLFloat },
  }
});
const ventasPorDia = async () => {
  const resultados = await Factura.findAll({
    attributes: [
      [fn('DATE', col('fecha')), 'fecha'],
      [fn('SUM', col('total')), 'total']
    ],
    where: { estado: 'emitida' },
    group: [fn('DATE', col('fecha'))],
    order: [[fn('DATE', col('fecha')), 'ASC']]
  });

  return resultados.map(r => ({
    fecha: r.get('fecha'),
    total: parseFloat(r.get('total'))
  }));
};

const UtilidadPorDiaType = new GraphQLObjectType({
  name: 'UtilidadPorDia',
  fields: {
    fecha: { type: GraphQLString },
    utilidad: { type: GraphQLFloat }
  }
});

const InventarioReporteItemType = new GraphQLObjectType({
  name: 'InventarioReporteItem',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    nombre: { type: new GraphQLNonNull(GraphQLString) },
    codigoBarras: { type: new GraphQLNonNull(GraphQLString) },
    familia: { type: GraphQLString },
    proveedor: { type: GraphQLString },
    existencias: { type: new GraphQLNonNull(GraphQLInt) },
    costoUnitario: { type: new GraphQLNonNull(GraphQLFloat) },
    costoTotal: { type: new GraphQLNonNull(GraphQLFloat) },
    precioVenta: { type: new GraphQLNonNull(GraphQLFloat) },
    margenUnitario: { type: new GraphQLNonNull(GraphQLFloat) }
  }
});

const PlanillaType = new GraphQLObjectType({
  name: 'Planilla',
  fields: () => ({
    id: { type: GraphQLID },
    empleado: { type: EmpleadoType },
    empleadoId: { type: GraphQLID },
    fechaInicio: { type: GraphQLString },
    fechaFin: { type: GraphQLString },
    salarioBruto: { type: GraphQLFloat },
    deducciones: { type: GraphQLFloat },
    salarioNeto: { type: GraphQLFloat },
    pagado: { type: GraphQLBoolean }
  })
});

const VacacionTomadaType = new GraphQLObjectType({
  name: 'VacacionTomada',
  fields: () => ({
    id: { type: GraphQLID },
    empleado: { type: EmpleadoType },
    empleadoId: { type: GraphQLID },
    dias: { type: GraphQLFloat },
    fecha: { type: GraphQLString },
    estado: { type: GraphQLString },
  }),
});


const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // — RBAC Queries —
    usuarios: {
      type: new GraphQLList(UsuarioType),
      resolve: async (_, __, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        if (!await context.verificarPermiso('ver_usuario')) throw new Error('Sin permiso');
        return Usuario.findAll();
      }
    },
    me: {
      type: UsuarioType,
      resolve: (_, __, { usuario }) => {
        if (!usuario) throw new Error('No autenticado');
        return Usuario.findByPk(usuario.id);
      }
    },

    ///reportes 

    ventasPorDia: {
      type: new GraphQLList(TotalPorDiaType),
      resolve: ventasPorDia,
    },

    utilidadesPorDia: {
      type: new GraphQLList(UtilidadPorDiaType),
      args: {
        fechaInicio: { type: new GraphQLNonNull(GraphQLString) },
        fechaFin: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { fechaInicio, fechaFin }) => {
        const rows = await FacturaDetalle.findAll({
          attributes: [
            [fn('DATE', col('Factura.fecha')), 'fecha'],
            [
              fn(
                'SUM',
                literal('(DetalleFactura.precio - producto.precioCostoSinImpuesto) * DetalleFactura.cantidad')
              ),
              'utilidad'
            ]
          ],
          include: [
            {
              model: Factura,
              attributes: [],
              where: {
                estado: 'emitida',
                fecha: { [Op.between]: [fechaInicio, fechaFin] }
              }
            },
            {
              model: Inventario,
              as: 'producto',
              attributes: []
            }
          ],
          group: [fn('DATE', col('Factura.fecha'))],
          order: [[fn('DATE', col('Factura.fecha')), 'ASC']],
          raw: true
        });

        return rows.map(r => ({
          fecha: r.fecha,
          utilidad: parseFloat(r.utilidad)
        }));
      }
    },

    reporteInventario: {
      type: new GraphQLList(InventarioReporteItemType),
      args: {
        familiaId: { type: GraphQLInt },
        proveedorId: { type: GraphQLInt },
        stockMenorQue: { type: GraphQLInt },
        stockMayorQue: { type: GraphQLInt }
      },
      resolve: async (
        _,
        { familiaId, proveedorId, stockMenorQue, stockMayorQue }
      ) => {
        const where = {};
        if (familiaId) where.familiaId = familiaId;
        if (proveedorId) where.proveedorId = proveedorId;
        if (stockMenorQue) where.cantidadExistencias = { [Op.lt]: stockMenorQue };
        if (stockMayorQue) {
          where.cantidadExistencias = {
            ...(where.cantidadExistencias || {}),
            [Op.gt]: stockMayorQue,
          };
        }

        const rows = await Inventario.findAll({
          where,
          attributes: [
            'id',
            'nombre',
            'codigoBarras',
            'cantidadExistencias',
            'precioCostoSinImpuesto',
            'precioFinalVenta',
            [literal('cantidadExistencias * precioCostoSinImpuesto'), 'costoTotal'],
            [literal('precioFinalVenta - precioCostoSinImpuesto'), 'margenUnitario'],
          ],
          include: [
            { model: Familia, as: 'familia', attributes: ['nombre'] },
            { model: Proveedor, as: 'proveedor', attributes: ['nombre'] },
          ],
          raw: true,
        });

        return rows.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          codigoBarras: r.codigoBarras,
          familia: r['familia.nombre'],
          proveedor: r['proveedor.nombre'],
          existencias: r.cantidadExistencias,
          costoUnitario: parseFloat(r.precioCostoSinImpuesto),
          costoTotal: parseFloat(r.costoTotal),
          precioVenta: parseFloat(r.precioFinalVenta),
          margenUnitario: parseFloat(r.margenUnitario),
        }));
      }
    },
    // Resolver para ventas agrupadas por día


    // — Configuracion —

    configuraciones: {
      type: new GraphQLList(ConfiguracionType),
      args: {
        clave: { type: GraphQLString },
        estado: { type: GraphQLBoolean },
        prioridad: { type: GraphQLInt },
      },
      resolve: (_, args, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        const where = {};

        if (args.clave) {
          where.clave = Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('clave')),
            { [Op.like]: `%${args.clave.toLowerCase()}%` }
          );
        }

        if (args.estado !== undefined) {
          where.estado = args.estado;
        }

        if (args.prioridad !== undefined) {
          where.prioridad = args.prioridad;
        }

        return Configuracion.findAll({ where }).then(result => {
          return result;
        });
      },
    },
    // ‣ Una sola por id
    configuracion: {
      type: ConfiguracionType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => Configuracion.findByPk(id),
    },

    // — Familias —
    familias: {
      type: new GraphQLList(FamiliaType),
      resolve: () => Familia.findAll()
    },

    roles: {
      type: new GraphQLList(TipoUsuarioType),
      resolve: () => TipoUsuario.findAll()
    },

    //caja
    cajaAbierta: {
      type: CajaType,
      resolve: async (_, __, context) => {
        if (!context?.usuario) throw new Error('No autenticado');

        return await Caja.findOne({
          where: {
            usuarioAperturaId: context.usuario.id,
            estado: {
              [Op.in]: ['abierta', 'reabierta'],
            },
          },
        });
      },
    },

    cajasCerradasPorUsuario: {
      type: new GraphQLList(CajaType),
      args: { usuarioId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { usuarioId }, ctx) => Caja.findAll({
        where: { usuarioAperturaId: usuarioId, estado: { [Op.ne]: 'abierta' } },
      }),
    },
    cajas: {
      type: new GraphQLList(CajaType),
      resolve: async (_, __, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!await ctx.verificarPermiso('ver_cajas')) throw new Error('Sin permiso');

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);

        return await Caja.findAll({
          where: {
            fechaApertura: {
              [Op.gte]: hoy,
              [Op.lt]: mañana
            }
          },
          order: [['fechaApertura', 'DESC']]
        });
      }
    },
    //proveedores
    proveedores: {
      type: new GraphQLList(ProveedorOutputType),
      resolve: async (_, __, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        const { user } = context;

        return await Proveedor.findAll();
      }
    },

    //permisos
    permisos: {
      type: new GraphQLList(PermisoType),
      resolve: async (_, __, context) => {

        if (!context.usuario) throw new Error('No autenticado');
        if (!await context.verificarPermiso('ver_permiso', context.usuario.id)) throw new Error('Sin permiso');
        return Permiso.findAll();
      },
    },

    permisosPorTipoUsuario: {
      type: new GraphQLList(PermisoType),
      args: {
        tipoUsuarioId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { tipoUsuarioId }, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!await ctx.verificarPermiso('ver_permiso', ctx.usuario.id)) throw new Error('Sin permiso');

        const asignados = await TipoUsuarioPermiso.findAll({ where: { tipoUsuarioId } });
        const asignadosIds = asignados.map(r => r.permisoId);

        const todos = await Permiso.findAll();
        return todos.map(p => ({
          ...p.toJSON(),
          asignado: asignadosIds.includes(p.id),
        }));
      },
    },


    // // — Inventario —
    // inventarios: {
    //   type: new GraphQLList(InventarioType),
    //   resolve: () => Inventario.findAll()
    // },
    // inventario: {
    //   type: InventarioType,
    //   args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    //   resolve: (_, { id }) => Inventario.findByPk(id)
    // },

    inventarios: {
      type: new GraphQLList(InventarioType),
      args: {
        search: { type: GraphQLString }           // ← filtro opcional
      },
      resolve: (_, { search }) => {
        const where = search
          ? {
            [Op.or]: [
              { nombre: { [Op.iLike]: `%${search}%` } },
              { codigoBarras: { [Op.like]: `%${search}%` } }
            ]
          }
          : {};
        return Inventario.findAll({
          where,
          include: [{ model: Familia, as: 'familia' },
          { model: Proveedor, as: 'proveedor' }]
        });
      }
    },

    ultimasFacturas: {
      type: new GraphQLList(FacturaType),
      args: {
        limit: { type: GraphQLInt, defaultValue: 30 },
      },
      async resolve(_, { limit }, ctx) {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('ver_facturas')))
          throw new Error('Sin permiso');

        const facturas = await Factura.findAll({
          order: [['fecha', 'DESC']],
          limit,

        });

        if (!facturas || facturas.length === 0) {
          throw new Error('Aún no hay facturas registradas');
        }

        return facturas;
      },
    },

    notaCredito: {
      type: NotaCreditoType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('ver_nota_credito')))
          throw new Error('Sin permiso');

        return NotaCredito.findByPk(id, { include: [DetalleNotaCredito] });
      },
    },

    notasCredito: {
      type: new GraphQLList(NotaCreditoType),
      args: {
        offset: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: async (_, args, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('ver_nota_credito')))
          throw new Error('Sin permiso');
        return NotaCredito.findAll({
          offset: args.offset,
          limit: args.limit,
          order: [['fecha', 'DESC']],
          include: [DetalleNotaCredito],
        });
      },
    },


    // — facturas emitidas para notas de credito —
    facturasEmitidas: {
      type: new GraphQLList(FacturaType),
      resolve: async (_, __, context) => {
        if (!(await context.verificarPermiso('ver_facturas'))) {
          throw new Error('Sin permiso para ver facturas');
        }

        return Factura.findAll({
          where: { estado: 'emitida' },
          order: [['fecha', 'DESC']],
          limit: 100, // opcional
        });
      }
    },

    empleados: {
      type: new GraphQLList(EmpleadoType),
      resolve: async (_, __, context) => {
        if (!(await context.verificarPermiso('ver_empleados'))) {
          throw new Error('Sin permiso para ver empleados');
        }
        return await Empleado.findAll();
      },
    },

    pagosProveedores: {
      type: new GraphQLList(PagoProveedorType),
      resolve: async (_, __, context) => {
        if (!(await context.verificarPermiso('ver_pagoproveedores'))) {
          throw new Error('Sin permiso para ver pagos a proveedores');
        }
        return await PagoProveedor.findAll({
          include: [{ model: Proveedor, as: 'proveedor' }],
          order: [['fechaPago', 'DESC']],
        });
      },
    },

    planillas: {
      type: new GraphQLList(PlanillaType),
      resolve: async (_, __, context) => {
        if (!(await context.verificarPermiso('ver_planillas'))) {
          throw new Error('Sin permiso para ver planillas');
        }
        return await Planilla.findAll({ include: [{ model: Empleado, as: 'empleado' }] });
      }
    },

    vacacionesTomadas: {
      type: new GraphQLList(VacacionTomadaType),
      resolve: async (_, __, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        const usuario = await Usuario.findByPk(context.usuario.id, { include: ['empleado'] });

        // Si es admin, ve todas
        if (usuario.tipoUsuarioId === 1) {
          return VacacionTomada.findAll({ include: [{ model: Empleado, as: 'empleado' }] });
        }

        // Si no, solo las del empleado relacionado
        if (!usuario.empleadoId) throw new Error('No tiene empleado asociado');
        return VacacionTomada.findAll({
          where: { empleadoId: usuario.empleadoId },
          include: [{ model: Empleado, as: 'empleado' }]
        });
      }
    },
  }
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // ... (todas las mutaciones anteriores)

    cargarInventarioMasivo: {
      type: new GraphQLList(InventarioType),
      args: {
        productos: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(InventarioInputType))) }
      },
      resolve: async (_, { productos }, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        if (!(await context.verificarPermiso('cargar_inventario_masivo'))) throw new Error('Sin permiso');

        // Procesa cada producto: si existe, actualiza; si no, crea
        const resultados = [];
        for (const prod of productos) {
          const existente = await Inventario.findOne({ where: { codigoBarras: prod.codigoBarras } });
          if (existente) {
            await existente.update(prod);
            resultados.push(existente);
          } else {
            const nuevo = await Inventario.create(prod);
            resultados.push(nuevo);
          }
        }
        return resultados;
      }
    },

    // ... (el resto de mutaciones)
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
