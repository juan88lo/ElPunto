  const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'mysql',
//     logging: false,
//   }
// );

// // Verificar la conexión a la base de datos
// sequelize.authenticate()
//   .then(() => {
//     console.log('Conexión a la base de datos establecida correctamente.');
//   })
//   .catch((error) => {
//     console.error('No se pudo conectar a la base de datos:', error);
//   });


// module.exports = sequelize;
 

// No hace falta dotenv en Railway, pero sí en local
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: 'mysql',
    logging: false,
  }
);

// Verificar conexión
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  })
  .catch((error) => {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  });

module.exports = sequelize;
