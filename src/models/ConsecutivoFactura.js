// models/ConsecutivoFactura.js
const { DataTypes } = require('sequelize');
const sequelize = require('./baseModel').sequelize;

const ConsecutivoFactura = sequelize.define('ConsecutivoFactura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ultimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'ConsecutivoFactura',
    timestamps: false
});

module.exports = ConsecutivoFactura;
