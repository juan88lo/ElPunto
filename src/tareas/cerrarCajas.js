// tareas/cerrarCajas.js
const { Op } = require('sequelize');

/**
 * @param {{ Caja, Factura, Bitacora }} models
 */
module.exports = async function cerrarCajasAutomaticamente(models) {
  const { Caja, Factura, Bitacora } = models;

  const ahora = new Date();
  const hoy12 = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 12, 0, 0);

  const cajas = await Caja.findAll({
    where: {
      estado: { [Op.in]: ['abierta', 'reabierta'] },
      fechaApertura: { [Op.lt]: hoy12 }
    }
  });
  
  if (cajas.length === 0) {
    return;
  }
  
  for (const caja of cajas) {
    const ventas = await Factura.sum('total', { where: { cajaId: caja.id } });
    const montoSistema = (caja.montoInicial || 0) + (ventas || 0);

    await caja.update({
      fechaCierre: new Date(),
      estado: 'cerrada',
      usuarioCierreId: process.env.UsuarioSystem,
      montoSistema,
      montoReal: montoSistema,
      diferencia: 0
    });

    await Bitacora.create({
      entidad: 'caja',
      entidadId: caja.id,
      accion: 'cerrar',
      usuarioId: process.env.UsuarioSystem,
      detalle: 'Cerrado automáticamente por el sistema'
    });
  }

  console.log(`${cajas.length} cajas cerradas automáticamente.`);
};
