 
const cron      = require('node-cron');
const nodemailer= require('nodemailer');
const { AlertaStock, Inventario } = require('../../models');

// transport con tu SMTP
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'juan-luis3@hotmail.com',
    pass: 'Juan18061992lo'
  }
});

cron.schedule('0 * * * *', async () => { // cada hora
  // Trae las alertas no enviadas
  const alertas = await AlertaStock.findAll({
    where: { enviado:false },
    include:[{ model: Inventario, as:'Inventario' }]
  });

  if (!alertas.length) return;

  // Construir lista HTML
  const filas = alertas.map(a => `
    <tr>
      <td style="padding:6px 12px">${a.Inventario.nombre}</td>
      <td style="padding:6px 12px" align="right">${a.cantidadActual}</td>
    </tr>`).join('');

  const html = `
    <h2 style="font-family:sans-serif;color:#1976d2">Alerta: Stock bajo</h2>
    <p>Los siguientes ítems tienen menos de <b>10 unidades</b>:</p>
    <table style="border-collapse:collapse;font-family:sans-serif">
      <thead>
        <tr style="background:#e3f2fd">
          <th style="padding:6px 12px;text-align:left">Producto</th>
          <th style="padding:6px 12px;text-align:right">Existencias</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="font-size:12px;color:#555">Enviado automáticamente ${new Date().toLocaleString()}</p>
  `;

  await transporter.sendMail({
    from: '"Alertas Stock" <alertas@tu-dominio.com>',
    to:   'encargado@tu-dominio.com',
    subject: 'Productos con existencias bajas',
    html,
  });

  // Marcar como enviadas
  await AlertaStock.update({enviado:true},{ where:{ id: alertas.map(a=>a.id) } });
});
