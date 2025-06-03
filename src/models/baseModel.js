const { Model,DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Importamos la instancia de sequelize

// Exportar sequelize y DataTypes
module.exports = { sequelize,Model, DataTypes };
