const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/db');  // Importamos la instancia de sequelize

// Exportar sequelize, Sequelize (clase), Model y DataTypes
module.exports = { sequelize, Sequelize, Model, DataTypes };
