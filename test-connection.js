// test-connection.js - Probar conexión a MySQL local
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔍 Probando conexión a MySQL local...\n');
    
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };
    
    console.log('📋 Configuración:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Usuario: ${config.user}`);
    console.log(`   Contraseña: ${config.password ? '***' + config.password.slice(-3) : 'VACÍA'}`);
    console.log(`   Base de datos: ${config.database}`);
    console.log(`   Puerto: ${config.port}\n`);
    
    try {
        console.log('🔄 Intentando conectar...');
        const connection = await mysql.createConnection(config);
        
        console.log('✅ ¡Conexión exitosa!');
        
        // Probar una consulta simple
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as fecha');
        console.log('✅ Consulta de prueba exitosa:', rows[0]);
        
        // Verificar si existe la base de datos
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('\n📂 Bases de datos disponibles:');
        databases.forEach(db => {
            const marca = db.Database === config.database ? '👉' : '  ';
            console.log(`${marca} ${db.Database}`);
        });
        
        await connection.end();
        console.log('\n🎉 ¡Todo funciona correctamente!');
        console.log('   Puedes iniciar tu aplicación con: npm start');
        
    } catch (error) {
        console.error('\n❌ Error de conexión:');
        console.error(`   ${error.message}`);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 Soluciones sugeridas:');
            console.log('   1. Verificar usuario y contraseña en MySQL Workbench');
            console.log('   2. Cambiar contraseña en MySQL Workbench');
            console.log('   3. Actualizar archivo .env con la contraseña correcta');
        }
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n🔧 Solución:');
            console.log('   1. Crear la base de datos "elpunto" en MySQL Workbench');
            console.log('   2. Ejecutar: CREATE DATABASE elpunto;');
        }
    }
}

testConnection();