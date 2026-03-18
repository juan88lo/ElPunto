  const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use in-memory SQLite for tests
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

console.log(`[DB] Conectando a ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} (${process.env.NODE_ENV})`);

const sequelize = isTest
  ? new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        dialect: 'mysql',
        logging: false,
        dialectOptions: isProduction ? {
          connectTimeout: 60000,
          ssl: {
            rejectUnauthorized: false,
          },
        } : {},
        pool: {
          max: 5,
          min: 0,
          acquire: 60000,
          idle: 10000,
        },
      }
    );

// Verificar la conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos:', error.message);
  });


module.exports = sequelize;
 
 