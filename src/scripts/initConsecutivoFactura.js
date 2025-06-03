// scripts/initConsecutivoFactura.js
const { ConsecutivoFactura, sequelize } = require('../models');

(async () => {
  try {
    await sequelize.sync(); // Asegura conexión

    const existente = await ConsecutivoFactura.findOne();
    if (!existente) {
      await ConsecutivoFactura.create({ ultimo: 0 });
      console.log('ConsecutivoFactura inicializado con éxito');
    } else {
      console.log('ConsecutivoFactura ya tiene un registro');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error inicializando ConsecutivoFactura:', err);
    process.exit(1);
  }
})();
