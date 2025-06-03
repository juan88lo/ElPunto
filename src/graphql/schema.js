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
  ConsecutivoFactura, NotaCredito, DetalleNotaCredito
} = require('../models');
const { Empleado } = require('../models');
const { DetalleFactura: FacturaDetalle } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Caja, Factura, Bitacora } = require('../models');
const { sequelize, Sequelize } = require('../models/baseModel');
const { Op, fn, col, literal } = require('sequelize');


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
    diasVacaciones: { type: GraphQLInt },
    estado: { type: GraphQLBoolean },
  }),
});

const PagoProveedorType = new GraphQLObjectType({
  name: 'PagoProveedor',
  fields: () => ({
    id: { type: GraphQLID },
    proveedorId: { type: GraphQLID },
    fechaPago: { type: GraphQLString }, // o GraphQLDate si usás una lib externa
    monto: { type: GraphQLFloat },
    metodo: { type: GraphQLString },
    referencia: { type: GraphQLString },
    pagado: { type: GraphQLBoolean },
    observacion: { type: GraphQLString },
    proveedor: { type: ProveedorOutputType }, // Relación con el proveedor
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
    pantalla: { type: new GraphQLNonNull(GraphQLString) },          //  ⬅️  añadir si lo usas
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
    AgenteAsignado: { type: new GraphQLNonNull(GraphQLString) },
    TelefonoAgente: { type: new GraphQLNonNull(GraphQLString) },
    Supervisor: { type: new GraphQLNonNull(GraphQLString) },
    TelSupervisor: { type: new GraphQLNonNull(GraphQLString) },
    Frecuencia: { type: new GraphQLNonNull(GraphQLString) },
    DiasVisita: { type: new GraphQLNonNull(GraphQLString) },
    DiaEntrega: { type: new GraphQLNonNull(GraphQLString) },
    Simpe: { type: new GraphQLNonNull(GraphQLString) },
    SimpeNombre: { type: new GraphQLNonNull(GraphQLString) },
    CuentaBancaria: { type: new GraphQLNonNull(GraphQLString) },
    Banco: { type: new GraphQLNonNull(GraphQLString) },
    NombrePropietarioCtaBancaria: { type: new GraphQLNonNull(GraphQLString) },
    Otros: { type: GraphQLString },
    Observaciones: { type: GraphQLString },
    Estado: { type: GraphQLBoolean },
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
  }
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // — User / Auth —
    register: {
      type: UsuarioType,
      args: {
        nombre: { type: new GraphQLNonNull(GraphQLString) },
        correo: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        tipoUsuarioId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { nombre, correo, password, tipoUsuarioId }, context) => {
        if (!await context.verificarPermiso('crear_usuario')) throw new Error('Sin permiso');
        if (await Usuario.findOne({ where: { correo } })) throw new Error('Correo ya en uso');
        const hashed = await bcrypt.hash(password, 10);
        return Usuario.create({ nombre, correo, password: hashed, tipoUsuarioId });
      }
    },

    actualizarUsuario: {
      type: UsuarioType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        nombre: { type: GraphQLString },
        correo: { type: GraphQLString },
        password: { type: GraphQLString },
        tipoUsuarioId: { type: GraphQLID },
      },
      resolve: async (_, { id, nombre, correo, password, tipoUsuarioId }, context) => {
        if (!await context.verificarPermiso('editar_usuario')) throw new Error('Sin permiso');

        const usuario = await Usuario.findByPk(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        if (correo && correo !== usuario.correo) {
          const existente = await Usuario.findOne({ where: { correo } });
          if (existente) throw new Error('Correo ya en uso');
        }

        if (password) password = await bcrypt.hash(password, 10);

        await usuario.update({ nombre, correo, password, tipoUsuarioId });

        return usuario;
      }
    },

    eliminarUsuario: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }, context) => {
        if (!await context.verificarPermiso('eliminar_usuario')) throw new Error('Sin permiso para eliminar usuario');

        const usuario = await Usuario.findByPk(id);
        if (!usuario) throw new Error('Usuario no encontrado');

        await usuario.destroy();
        return 'Usuario eliminado';
      }
    },

    login: {
      type: LoginResponseType,
      args: {
        correo: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { correo, password }) => {
        // const user = await Usuario.findOne({ where: { correo } });

        const user = await Usuario.findOne({
          where: { correo },
          include: [
            {                      // rol  → para luego exponer permisos en UsuarioType
              model: TipoUsuario,
              include: [{ model: Permiso, as: 'permisos' }],
            },
          ],
        });
        if (!user) throw new Error('Usuario no encontrado');
        if (!await bcrypt.compare(password, user.password)) throw new Error('Contraseña incorrecta');
        const token = jwt.sign(
          { id: user.id, tipoUsuarioId: user.tipoUsuarioId },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        return { token, mensaje: 'Login exitoso', usuario: user };
      }
    },


    asignarPermisoARol: {
      type: TipoUsuarioType,
      args: {
        tipoUsuarioId: { type: new GraphQLNonNull(GraphQLID) },
        permisoId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { tipoUsuarioId, permisoId }, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        if (!await context.verificarPermiso('asignar_permiso')) throw new Error('Sin permiso');
        const [rol, permiso] = await Promise.all([
          TipoUsuario.findByPk(tipoUsuarioId),
          Permiso.findByPk(permisoId),
        ]);
        if (!rol) throw new Error('Rol no encontrado');
        if (!permiso) throw new Error('Permiso no encontrado');
        const existe = await TipoUsuarioPermiso.findOne({ where: { tipoUsuarioId, permisoId } });
        if (!existe) await TipoUsuarioPermiso.create({ tipoUsuarioId, permisoId });
        return TipoUsuario.findByPk(tipoUsuarioId, {
          include: [{ model: Permiso, as: 'permisos' }]
        });
      }
    },




    /* ─────── configuracion ─────── */
    crearConfiguracion: {
      type: ConfiguracionType,
      args: { datos: { type: new GraphQLNonNull(ConfiguracionInput) } },
      resolve: async (_, { datos }, context) => {
        if (!(await context.verificarPermiso('crear_configuracion'))) {
          throw new Error('Sin permiso para crear configuraciones');
        }
        return Configuracion.create(datos);
      },
    },

    /* ─────── Actualizar configuracion─────── */
    actualizarConfiguracion: {
      type: ConfiguracionType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        datos: { type: new GraphQLNonNull(ConfiguracionInput) },
      },
      resolve: async (_, { id, datos }, context) => {
        if (!(await context.verificarPermiso('editar_configuracion'))) {
          throw new Error('Sin permiso para editar configuraciones');
        }
        const cfg = await Configuracion.findByPk(id);
        if (!cfg) throw new Error('Configuración no encontrada');
        Object.assign(cfg, datos);   // solo sobre-escribe los campos presentes
        return cfg.save();
      },
    },

    /* ─────── Eliminar configuracion ─────── */
    eliminarConfiguracion: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_configuracion'))) {
          throw new Error('Sin permiso para eliminar configuraciones');
        }
        const deleted = await Configuracion.destroy({ where: { id } });
        return !!deleted;   // true si se borró 1 fila
      },
    },

    // — Familia CRUD —
    crearFamilia: {
      type: FamiliaType,
      args: {
        nombre: { type: new GraphQLNonNull(GraphQLString) },
        Observaciones: { type: GraphQLString },
        Estado: { type: GraphQLBoolean },
      },
      resolve: async (_, args, context) => {
        if (!(await context.verificarPermiso('crear_categoria'))) {
          throw new Error('Sin permiso para crear una categoria');
        }


        return Familia.create({
          nombre: args.nombre,
          Observaciones: args.Observaciones || '',
          Estado: args.Estado !== undefined ? args.Estado : true,
        });
      }
    },

    // ACTUALIZAR
    actualizarFamilia: {
      type: FamiliaType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        nombre: { type: GraphQLString },
        Observaciones: { type: GraphQLString },
        Estado: { type: GraphQLBoolean }
      },
      resolve: async (_, { id, ...data }, ctx) => {
        if (!await ctx.verificarPermiso('editar_categoria')) throw new Error('Sin permiso para editar la categoría');
        const fam = await Familia.findByPk(id);
        if (!fam) throw new Error('Categoría No encontrada');
        await fam.update(data);
        return fam;
      }
    },

    // ELIMINAR
    eliminarFamilia: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, ctx) => {
        if (!await ctx.verificarPermiso('eliminar_categoria')) throw new Error('Sin permiso para eliminar la categoría');
        const deleted = await Familia.destroy({ where: { id } });
        return !!deleted;
      }
    },

    // — Proveedor CRUD —
    crearProveedor: {
      type: ProveedorOutputType,
      args: {
        input: { type: new GraphQLNonNull(ProveedorInputType) },
      },
      resolve: async (_, { input }, context) => {
        if (!(await context.verificarPermiso('crear_proveedor'))) {
          throw new Error('Sin permiso para crear proveedor');
        }
        try {
          return await Proveedor.create(input);
        } catch (err) {

          throw new Error(`Error al crear proveedor: ${err.message}`);
        }
      },
    },

    actualizarProveedor: {
      type: ProveedorOutputType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        input: { type: new GraphQLNonNull(ProveedorInputType) },
      },
      resolve: async (_, { id, input }, context) => {
        if (!(await context.verificarPermiso('editar_proveedor'))) {
          throw new Error('Sin permiso para actualizar proveedor');
        }

        const proveedor = await Proveedor.findByPk(id);
        if (!proveedor) {
          throw new Error('Proveedor no encontrado');
        }
        try {
          await proveedor.update(input);
          return proveedor;
        } catch (err) {
          throw new Error(`Error al actualizar proveedor: ${err.message}`);
        }
      },
    },

    eliminarProveedor: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_proveedor'))) {
          throw new Error('Sin permiso para eliminar proveedor');
        }
        const rows = await Proveedor.destroy({ where: { id } });
        return rows > 0;
      },
    },


    // — Inventario CRUD —
    crearInventario: {
      type: InventarioType,
      args: {
        nombre: { type: new GraphQLNonNull(GraphQLString) },
        codigoBarras: { type: new GraphQLNonNull(GraphQLString) },
        precioCostoSinImpuesto: { type: new GraphQLNonNull(GraphQLFloat) },
        impuestoPorProducto: { type: new GraphQLNonNull(GraphQLFloat) },
        precioFinalVenta: { type: new GraphQLNonNull(GraphQLFloat) },
        cantidadExistencias: { type: new GraphQLNonNull(GraphQLInt) },
        familiaId: { type: new GraphQLNonNull(GraphQLID) },
        proveedorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, args, context) => {
        try {
          // console.log('Usuario dentro del resolver:', context.usuario);
          if (!(await context.verificarPermiso('crear_inventario'))) {
            throw new Error('Sin permiso para crear productos');
          }
          console.log(' input:', args);
          const existente = await Inventario.findOne({ where: { codigoBarras: args.codigoBarras } });
          if (existente) {
            throw new Error('Ya existe un producto con ese código de barras');
          }

          const familia = await Familia.findByPk(args.familiaId);
          if (!familia) throw new Error('La familia no existe');

          const proveedor = await Proveedor.findByPk(args.proveedorId);
          if (!proveedor) throw new Error('El proveedor no existe');

          const nuevoInventario = await Inventario.create(args);
          return await Inventario.findByPk(nuevoInventario.id, {
            include: [{ model: Familia, as: 'familia' }, { model: Proveedor, as: 'proveedor' }]
          });
        } catch (error) {
          throw new Error(`Error al crear el inventario: ${error.message}`);
        }
      },

    },
    actualizarInventario: {
      type: InventarioType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        nombre: { type: GraphQLString },
        codigoBarras: { type: GraphQLString },
        precioCostoSinImpuesto: { type: GraphQLFloat },
        impuestoPorProducto: { type: GraphQLFloat },
        precioFinalVenta: { type: GraphQLFloat },
        cantidadExistencias: { type: GraphQLInt },
        familiaId: { type: GraphQLID },
        proveedorId: { type: GraphQLID },
      },
      resolve: async (_, args, context) => {
        try {
          if (!(await context.verificarPermiso('actualizar_inventario'))) {
            throw new Error('Sin permiso para actualizar productos');
          }

          console.log('args:', args);
          const inventario = await Inventario.findByPk(args.id);
          if (!inventario) {
            throw new Error('Inventario no encontrado');
          }

          // Validaciones opcionales si se proveen familiaId o proveedorId
          if (args.familiaId) {
            const familia = await Familia.findByPk(args.familiaId);
            if (!familia) throw new Error('La familia no existe');
          }

          if (args.proveedorId) {
            const proveedor = await Proveedor.findByPk(args.proveedorId);
            if (!proveedor) throw new Error('El proveedor no existe');
          }

          await inventario.update({
            nombre: args.nombre ?? inventario.nombre,
            codigoBarras: args.codigoBarras ?? inventario.codigoBarras,
            precioCostoSinImpuesto: args.precioCostoSinImpuesto ?? inventario.precioCostoSinImpuesto,
            impuestoPorProducto: args.impuestoPorProducto ?? inventario.impuestoPorProducto,
            precioFinalVenta: args.precioFinalVenta ?? inventario.precioFinalVenta,
            cantidadExistencias: args.cantidadExistencias ?? inventario.cantidadExistencias,
            familiaId: args.familiaId ?? inventario.familiaId,
            proveedorId: args.proveedorId ?? inventario.proveedorId,
          });

          return await Inventario.findByPk(args.id, {
            include: [{ model: Familia, as: 'familia' }, { model: Proveedor, as: 'proveedor' }]
          });
        } catch (error) {
          throw new Error(`Error al actualizar el inventario: ${error.message}`);
        }
      },
    },

    actualizarExistencias: {
      type: InventarioType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        cantidad: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id, cantidad }, context) => {
        if (!(await context.verificarPermiso('act_existencias'))) {
          throw new Error('Sin permiso para actualizar existencias');
        }

        const item = await Inventario.findByPk(id);
        if (!item) throw new Error('Ítem no encontrado');
        return item.agregarExistencias(cantidad);
      }
    },

    // roles

    crearTipoUsuario: {
      type: TipoUsuarioType,
      args: { input: { type: new GraphQLNonNull(TipoUsuarioInputType) } },

      resolve: async (_, args, context) => {
        try {
          if (!(await context.verificarPermiso('crear_rol'))) {
            throw new Error('Sin permiso para crear rol');
          }

          const existente = await TipoUsuario.findOne({ where: { nombre: args.nombre } });
          if (existente) {
            throw new Error('Ya existe un rol con este nombre');
          }

          return TipoUsuario.create(input);
        } catch (error) {
          throw new Error(`Error al crear el rol: ${error.message}`);
        }
      }
    },

    actualizarTipoUsuario: {
      type: TipoUsuarioType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(TipoUsuarioInputType) }
      },
      resolve: async (_, { id, input }, ctx) => {
        if (!await ctx.verificarPermiso('editar_rol')) throw new Error('Sin permiso');
        const rol = await TipoUsuario.findByPk(id);
        if (!rol) throw new Error('Rol no encontrado');
        return rol.update(input);
      }
    },

    eliminarTipoUsuario: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, ctx) => {
        if (!await ctx.verificarPermiso('eliminar_rol')) throw new Error('Sin permiso');
        return !!(await TipoUsuario.destroy({ where: { id } }));
      }
    },

    ///permisos
    quitarPermisoARol: {
      type: TipoUsuarioType,          // o un objeto { success, message }
      args: {
        tipoUsuarioId: { type: new GraphQLNonNull(GraphQLID) },
        permisoId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { tipoUsuarioId, permisoId }, context) => {
        if (!context.usuario) throw new Error('No autenticado');
        if (!await context.verificarPermiso('revocar_permiso')) throw new Error('Sin permiso');

        await TipoUsuarioPermiso.destroy({ where: { tipoUsuarioId, permisoId } });
        return TipoUsuario.findByPk(tipoUsuarioId, {
          include: [{ model: Permiso, as: 'permisos' }],
        });
      },
    },

    //cajas
    abrirCaja: {
      type: CajaType,
      args: { montoInicial: { type: new GraphQLNonNull(GraphQLFloat) } },

      resolve: async (_, { montoInicial }, context) => {
        if (!context?.usuario) throw new Error('No autenticado');

        //  verifica caja abierta del usuario
        const abierta = await Caja.findOne({
          where: { usuarioAperturaId: context.usuario.id, estado: 'abierta' },
        });
        if (abierta) throw new Error('Ya tienes una caja abierta');

        //   calcula el consecutivo del día (numeroDia)
        const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
        const hoyF = new Date(); hoyF.setHours(23, 59, 59, 999);

        const maxNum = await Caja.max('numeroDia', {
          where: { fechaApertura: { [Op.between]: [hoy0, hoyF] } },
        });

        const numeroDia = (maxNum || 0) + 1;


        return await Caja.create({
          usuarioId: context.usuario.id,
          usuarioAperturaId: context.usuario.id,
          fechaApertura: new Date(),
          montoInicial,
          montoSistema: montoInicial,
          estado: 'abierta',
          numeroDia,                             // ← consecutivo diario
        });
      },
    },

    reabrirCaja: {
      type: CajaType,
      args: {
        cajaId: { type: new GraphQLNonNull(GraphQLID) },
        motivo: { type: GraphQLString },
      },
      async resolve(_, { cajaId, motivo }, ctx) {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('reabrir_caja')))
          throw new Error('Sin permiso');

        const caja = await Caja.findByPk(cajaId);
        if (!caja) throw new Error('Caja no encontrada');
        if (caja.estado !== 'cerrada') throw new Error('Solo se reabren cajas cerradas');

        await caja.update({
          estado: 'reabierta',
          fechaReapertura: new Date(),
          motivoReapertura: motivo ?? 'Sin detalle',
        });

        await Bitacora.create({
          entidad: 'caja',
          entidadId: caja.id,
          accion: 'reabrir',
          usuarioId: ctx.usuario.id,
          detalle: motivo ?? '',
        });

        return caja;
      },
    },

    cerrarCaja: {
      type: CajaType,
      args: {
        cajaId: { type: new GraphQLNonNull(GraphQLID) },
        montoReal: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (_, { cajaId, montoReal }, context) => {
        if (!context?.usuario) throw new Error('No autenticado');

        const caja = await Caja.findByPk(cajaId);
        if (!caja) throw new Error('Caja no encontrada');
        if (!['abierta', 'reabierta'].includes(caja.estado))
          throw new Error('La caja ya está cerrada o no puede cerrarse');

        // 1️⃣ total ventas
        const ventas = await Factura.sum('total', { where: { cajaId } });

        // 2️⃣ fuerza ambos operandos a número
        const montoInicial = Number(caja.montoInicial) || 0;   // o parseFloat
        const totalVentas = Number(ventas) || 0;
        const montoSistema = montoInicial + totalVentas;

        const diferencia = Number(montoReal) - montoSistema;

        // 3️⃣ actualizar caja (ahora con valores válidos)
        await caja.update({
          fechaCierre: new Date(),
          usuarioCierreId: context.usuario.id,
          montoSistema,
          montoReal,
          diferencia,
          estado: 'cerrada',
        });

        // 4️⃣ bitácora
        await Bitacora.create({
          entidad: 'caja',
          entidadId: caja.id,
          accion: 'cerrar',
          usuarioId: context.usuario.id,
          detalle: `montoSistema=${montoSistema}, montoReal=${montoReal}, diff=${diferencia}`,
        });

        return caja;
      },
    },

    ajustarCaja: {
      type: CajaType,
      args: {
        cajaId: { type: new GraphQLNonNull(GraphQLID) },
        montoReal: { type: new GraphQLNonNull(GraphQLFloat) },
        comentario: { type: GraphQLString },
      },
      resolve: async (_, { cajaId, montoReal, comentario }, context) => {
        if (!context?.usuario) throw new Error('No autenticado');

        const caja = await Caja.findByPk(cajaId);
        if (!caja) throw new Error('Caja no encontrada');
        if (caja.estado !== 'cerrada')
          throw new Error('Solo se pueden ajustar cajas ya cerradas');

        const nuevaDiferencia = montoReal - caja.montoSistema;

        await caja.update({ montoReal, diferencia: nuevaDiferencia });

        await Bitacora.create({
          entidad: 'caja',
          entidadId: caja.id,
          accion: 'ajustar',
          usuarioId: context?.usuario?.id,
          detalle: comentario || `Ajuste. nuevoMontoReal=${montoReal}, diff=${nuevaDiferencia}`,
        });

        return caja;
      },
    },


    //crear permisos

    crearPermiso: {
      type: PermisoType,
      args: { input: { type: new GraphQLNonNull(PermisoInputType) } },
      async resolve(_, { input }, ctx) {
        // ▸ 1) RBAC
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!await ctx.verificarPermiso('crear_permiso')) throw new Error('Sin permiso');

        // ▸ 2) Unicidad por nombre
        const existe = await Permiso.findOne({ where: { nombrePermiso: input.nombrePermiso } });
        if (existe) throw new Error('Ya existe un permiso con ese nombre');

        return Permiso.create(input);
      },
    },

    actualizarPermiso: {
      type: PermisoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(PermisoInputType) },
      },
      async resolve(_, { id, input }, ctx) {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!await ctx.verificarPermiso('editar_permiso')) throw new Error('Sin permiso');

        const permiso = await Permiso.findByPk(id);
        if (!permiso) throw new Error('Permiso no encontrado');

        // Si cambia el nombre, validar unicidad
        if (input.nombrePermiso && input.nombrePermiso !== permiso.nombrePermiso) {
          const dup = await Permiso.findOne({ where: { nombrePermiso: input.nombrePermiso } });
          if (dup) throw new Error('Ya existe otro permiso con ese nombre');
        }

        await permiso.update(input);
        return permiso;
      },
    },

    eliminarPermiso: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, { id }, ctx) {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!await ctx.verificarPermiso('eliminar_permiso')) throw new Error('Sin permiso');

        const deleted = await Permiso.destroy({ where: { id } });
        return !!deleted;
      },
    },

    eliminarInventario: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_inventario'))) {
          throw new Error('Sin permiso para eliminar productos');
        }
        const deleted = await Inventario.destroy({ where: { id } });
        return !!deleted;
      }
    },


    ///factura
    crearFactura: {
      type: FacturaType,
      args: { input: { type: new GraphQLNonNull(FacturaInputType) } },
      async resolve(_, { input }, ctx) {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('crear_factura')))
          throw new Error('Sin permiso');

        const { cajaId, usuarioId, formaPago, productos } = input;

        const t = await sequelize.transaction();
        try {
          /* ─── 1. calcular totales e insertar factura ─── */
          let subtotal = 0;
          const detalles = [];

          for (const p of productos) {
            const item = await Inventario.findOne({
              where: { codigoBarras: p.codigoBarras },
              transaction: t,
            });

            if (!item) {
              throw new Error(`Producto con código ${p.codigoBarras} no existe`);
            }
            if (item.cantidadExistencias < p.cantidad) {
              throw new Error(
                `Producto ${item.nombre} — stock ${item.cantidadExistencias}, solicitado ${p.cantidad}`
              );
            }

            const precio = parseFloat(item.precioFinalVenta);
            const totalLinea = +(precio * p.cantidad).toFixed(2);
            subtotal += totalLinea;

            detalles.push({
              inventarioId: item.id,
              cantidad: p.cantidad,
              precio: precio,
              total: totalLinea,
            });
          }

          const descuento = 0;
          const impuesto = 0;
          const totalFact = subtotal - descuento + impuesto;
          const formaPagoOk = formaPago.toLowerCase();

          // ─── 2. Generar consecutivo ───
          const consecutivoRow = await ConsecutivoFactura.findOne({
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          if (!consecutivoRow) {
            throw new Error('No se encontró el consecutivo de facturas');
          }

          consecutivoRow.ultimo += 1;
          await consecutivoRow.save({ transaction: t });

          const numero = consecutivoRow.ultimo;
          const consecutivo = `EP-${numero.toString().padStart(6, '0')}`;

          // ─── 3. Crear factura ───
          const factura = await Factura.create(
            {
              cajaId,
              usuarioId,
              consecutivo,
              fecha: new Date(),
              subtotal,
              descuento,
              impuesto,
              total: totalFact,
              formaPago: formaPagoOk,
              estado: 'emitida',
            },
            { transaction: t }
          );

          // ─── 4. Crear líneas + actualizar inventario ───
          for (const d of detalles) {

            await FacturaDetalle.create(
              {
                facturaId: factura.id,
                inventarioId: d.inventarioId,
                cantidad: d.cantidad,
                precio: d.precio,
                total: d.total,
              },
              { transaction: t }
            );

            await Inventario.decrement(
              { cantidadExistencias: d.cantidad },
              { where: { id: d.inventarioId }, transaction: t }
            );
          }

          // ─── 5. Sumar venta a la Caja ───
          await Caja.increment(
            { totalVentas: totalFact, montoSistema: totalFact },
            { where: { id: cajaId }, transaction: t }
          );

          // ─── 6. Bitácora opcional ───
          await Bitacora.create(
            {
              entidad: 'factura',
              entidadId: factura.id,
              accion: 'crear',
              usuarioId: ctx.usuario.id,
              detalle: `total=${totalFact}`,
            },
            { transaction: t }
          );

          await t.commit();
          return factura;
        } catch (err) {
          await t.rollback();

          const detalles =
            err.errors?.map((e) => `${e.path}: ${e.message}`).join(' | ') ||
            err.message;

          throw new Error(`Validación falló → ${detalles}`);
        }
      },
    },

    crearEmpleado: {
      type: EmpleadoType,
      args: {
        nombre: { type: new GraphQLNonNull(GraphQLString) },
        apellido: { type: new GraphQLNonNull(GraphQLString) },
        cedula: { type: new GraphQLNonNull(GraphQLString) },
        puesto: { type: new GraphQLNonNull(GraphQLString) },
        salarioBase: { type: new GraphQLNonNull(GraphQLFloat) },
        fechaIngreso: { type: new GraphQLNonNull(GraphQLString) },
        diasVacaciones: { type: GraphQLInt },
      },
      resolve: async (_, args, context) => {
        if (!(await context.verificarPermiso('crear_empleado'))) {
          throw new Error('Sin permiso para crear empleados');
        }
        return await Empleado.create(args);
      },
    },

    actualizarEmpleado: {
      type: EmpleadoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        nombre: { type: GraphQLString },
        apellido: { type: GraphQLString },
        puesto: { type: GraphQLString },
        salarioBase: { type: GraphQLFloat },
        diasVacaciones: { type: GraphQLInt },
        estado: { type: GraphQLBoolean },
      },
      resolve: async (_, { id, ...campos }, context) => {
        if (!(await context.verificarPermiso('editar_empleado'))) {
          throw new Error('Sin permiso para editar empleados');
        }
        await Empleado.update(campos, { where: { id } });
        return await Empleado.findByPk(id);
      },
    },

    eliminarEmpleado: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_empleado'))) {
          throw new Error('Sin permiso para eliminar empleados');
        }
        const deleted = await Empleado.destroy({ where: { id } });
        return !!deleted;
      },
    },

    pagarPlanilla: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('pagar_planilla'))) {
          throw new Error('Sin permiso para pagar planillas');
        }
        const actualizado = await Planilla.update(
          { pagado: true },
          { where: { id, pagado: false } }
        );
        return !!actualizado[0];
      },
    },

    eliminarPlanilla: {
      // evita borrar las ya pagadas
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_planilla'))) {
          throw new Error('Sin permiso para eliminar planillas');
        }
        const planilla = await Planilla.findByPk(id);
        if (!planilla || planilla.pagado) throw new Error('Planilla no existe o ya está pagada');
        const deleted = await Planilla.destroy({ where: { id } });
        return !!deleted;
      },
    },

    crearPagoProveedor: {
      type: PagoProveedorType,
      args: {
        proveedorId: { type: new GraphQLNonNull(GraphQLID) },
        fechaPago: { type: new GraphQLNonNull(GraphQLString) },
        monto: { type: new GraphQLNonNull(GraphQLFloat) },
        metodo: { type: new GraphQLNonNull(GraphQLString) },
        referencia: { type: GraphQLString },
      },
      resolve: async (_, args, context) => {
        if (!(await context.verificarPermiso('crear_pagoproveedor'))) {
          throw new Error('Sin permiso para crear pagos a proveedores');
        }
        return await PagoProveedor.create(args);
      },
    },

    pagarProveedor: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('pagar_proveedor'))) {
          throw new Error('Sin permiso para marcar pago');
        }
        const [filas] = await PagoProveedor.update(
          { pagado: true },
          { where: { id, pagado: false } }
        );
        return !!filas;
      },
    },

    eliminarPagoProveedor: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        if (!(await context.verificarPermiso('eliminar_pagoproveedor'))) {
          throw new Error('Sin permiso para eliminar el registro');
        }
        const deleted = await PagoProveedor.destroy({ where: { id } });
        return !!deleted;
      },
    },

    crearNotaCredito: {
      type: NotaCreditoType,
      args: {
        facturaId: { type: new GraphQLNonNull(GraphQLID) },
        motivo: { type: GraphQLString },
        detalles: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(DetalleNotaCreditoInput))
          )
        },
      },
      resolve: async (_, { facturaId, motivo, detalles }, { usuario, verificarPermiso }) => {
        if (!(await verificarPermiso('crear_nota_credito')))
          throw new Error('Sin permiso');

        // transacción para consistencia
        return sequelize.transaction(async (t) => {
          // calcular totales
          let total = 0;
          detalles.forEach(d => {
            d.subtotal = d.precioUnitario * d.cantidad;
            total += d.subtotal + (d.impuesto || 0);
          });

          // crear cabecera
          const nota = await NotaCredito.create({
            facturaId,
            usuarioId: usuario.id,
            fecha: new Date(),
            motivo,
            total,
            estado: 'emitida',
          }, { transaction: t });

          // crear renglones y devolver inventario
          for (const d of detalles) {
            const detalle = await DetalleNotaCredito.create(
              { ...d, notaCreditoId: nota.id },
              { transaction: t },
            );
            // sumar existencias
            const prod = await Inventario.findByPk(d.productoId, { transaction: t });
            if (!prod) throw new Error(`Producto ${d.productoId} no existe`);
            await prod.agregarExistencias(d.cantidad, { transaction: t });
          }
          return nota;
        });
      },
    },

    anularNotaCredito: {
      type: NotaCreditoType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, { verificarPermiso }) => {
        if (!(await verificarPermiso('anular_nota_credito')))
          throw new Error('Sin permiso');

        return sequelize.transaction(async (t) => {
          const nota = await NotaCredito.findByPk(id, {
            include: [DetalleNotaCredito],
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!nota) throw new Error('Nota no encontrada');
          if (nota.estado === 'anulada')
            throw new Error('Ya está anulada');

          // deshacer movimiento de inventario
          for (const d of nota.DetalleNotaCreditos) {
            const prod = await Inventario.findByPk(d.productoId, { transaction: t });
            await prod.reducirExistencias(d.cantidad, { transaction: t }); // o tu método inverso
          }

          await nota.update({ estado: 'anulada' }, { transaction: t });
          return nota;
        });
      },
    },

    //cancelar factura para nota de credito 
    cancelarFactura: {
      type: NotaCreditoType,
      args: {
        facturaId: { type: new GraphQLNonNull(GraphQLID) },
        motivo: { type: GraphQLString },
      },
      resolve: async (_, { facturaId, motivo }, ctx) => {
        if (!ctx.usuario) throw new Error('No autenticado');
        if (!(await ctx.verificarPermiso('crear_nota_credito')))
          throw new Error('Sin permiso');

        return sequelize.transaction(async (t) => {
          /* 1️⃣  Cargar factura + líneas */
          const factura = await Factura.findByPk(facturaId, {
            include: [{ model: FacturaDetalle, as: 'DetalleFacturas' }],
            lock: t.LOCK.UPDATE,
            transaction: t,
          });
          if (!factura) throw new Error('Factura no existe');
          if (factura.estado !== 'emitida') throw new Error('Solo facturas emitidas');

          /* 2️⃣  Crear cabecera NC */
          const nota = await NotaCredito.create({
            facturaId,
            usuarioId: ctx.usuario.id,
            fecha: new Date(),
            motivo: motivo ?? 'Anulación de factura',
            total: factura.total,
            estado: 'emitida',
          }, { transaction: t });

          /* 3️⃣  Crear renglones NC y devolver inventario */
          for (const l of factura.DetalleFacturas) {
            await DetalleNotaCredito.create({
              notaCreditoId: nota.id,
              productoId: l.inventarioId,
              cantidad: l.cantidad,
              precioUnitario: l.precio,
              subtotal: l.total,
              impuesto: 0,
            }, { transaction: t });

            const prod = await Inventario.findByPk(l.inventarioId, { transaction: t });
            await prod.agregarExistencias(l.cantidad, { transaction: t });
          }

          /* 4️⃣  Cambiar estado de factura */
          await factura.update({ estado: 'anulada' }, { transaction: t });

          /* 5️⃣  Ajustar caja (restar venta) */
          await Caja.decrement(
            { totalVentas: factura.total, montoSistema: factura.total },
            { where: { id: factura.cajaId }, transaction: t }
          );

          /* 6️⃣  Bitácora */
          await Bitacora.bulkCreate([
            {
              entidad: 'nota_credito',
              entidadId: nota.id,
              accion: 'crear',
              usuarioId: ctx.usuario.id,
              detalle: `anula factura ${factura.consecutivo}`,
            },
            {
              entidad: 'factura',
              entidadId: factura.id,
              accion: 'anular',
              usuarioId: ctx.usuario.id,
              detalle: `crea NC ${nota.id}`,
            }
          ], { transaction: t });

          return nota;
        });
      }
    },


    ///reporte inventario 
    // ✅ Esto es correcto:
    generarInventarioPDF: {
      type: GraphQLString, // o el tipo de dato que retorna (ej: URL como string)
      args: {
        // aquí puedes definir los argumentos si los necesitas
      },
      resolve: async (_, args, ctx) => {
        // 1⃣ reutiliza la lógica que ya arma los rows
        const items = await invQuery.reporteInventario(_, args, ctx);

        // 2⃣ renderiza HTML
        const html = await renderTemplate('inventario', {
          fecha: new Date().toLocaleString('es-CR'),
          items,
        });

        // 3⃣ genera archivo
        const fileName = `inventario_${uuid()}.pdf`;
        const outPath = path.join(__dirname, '../../generated', fileName);
        await generatePdf(html, outPath);

        // 4⃣ devuelve URL pública
        return `/archivos/${fileName}`;

      }
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
