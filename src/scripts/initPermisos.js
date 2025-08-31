const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function initializePermisos() {
    try {
        // Leer el archivo SQL
        const sqlFile = path.join(__dirname, 'permisos_iniciales.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Ejecutar las consultas SQL
        await sequelize.query(sql);
        
        console.log('Permisos inicializados correctamente');
        
    } catch (error) {
        console.error('Error al inicializar permisos:', error);
    } finally {
        await sequelize.close();
    }
}

initializePermisos();
