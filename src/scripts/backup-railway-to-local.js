// backup-railway-to-local.js - Script para hacer backup automático
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuración Railway (fuente)
const railwayConfig = {
    host: 'gondola.proxy.rlwy.net',
    user: 'root',
    password: 'gPIXKeiaZwkQrtlAJYrtUBVVqcMRQVcb',
    database: 'elpunto',
    port: 3306
};

// Configuración Local (destino) 
const localConfig = {
    host: 'localhost',
    user: 'root',
    password: 'ElPunto2024!',
    database: 'elpunto',
    port: 3306
};

async function backupDatabase() {
    console.log('🚀 INICIANDO BACKUP DE RAILWAY A LOCAL\n');
    
    let railwayConn, localConn;
    
    try {
        // Conectar a Railway
        console.log('🔄 Conectando a Railway...');
        railwayConn = await mysql.createConnection(railwayConfig);
        console.log('✅ Conectado a Railway');
        
        // Conectar a Local
        console.log('🔄 Conectando a MySQL Local...');
        localConn = await mysql.createConnection(localConfig);
        console.log('✅ Conectado a Local');
        
        // Obtener lista de tablas
        console.log('\n📋 Obteniendo lista de tablas...');
        const [tables] = await railwayConn.execute('SHOW TABLES');
        console.log(`✅ Encontradas ${tables.length} tablas`);
        
        let backupSQL = '';
        backupSQL += '-- BACKUP DE RAILWAY EL PUNTO\n';
        backupSQL += `-- Generado: ${new Date().toISOString()}\n`;
        backupSQL += '-- Fuente: gondola.proxy.rlwy.net\n\n';
        backupSQL += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';
        
        for (const tableRow of tables) {
            const tableName = tableRow[`Tables_in_${railwayConfig.database}`];
            console.log(`📦 Procesando tabla: ${tableName}`);
            
            // Obtener estructura de la tabla
            const [createTable] = await railwayConn.execute(`SHOW CREATE TABLE \`${tableName}\``);
            backupSQL += `-- Estructura para tabla \`${tableName}\`\n`;
            backupSQL += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            backupSQL += createTable[0]['Create Table'] + ';\n\n';
            
            // Obtener datos de la tabla
            const [rows] = await railwayConn.execute(`SELECT * FROM \`${tableName}\``);
            
            if (rows.length > 0) {
                backupSQL += `-- Datos para tabla \`${tableName}\`\n`;
                backupSQL += `INSERT INTO \`${tableName}\` VALUES\n`;
                
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(value => {
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return value;
                    });
                    return `(${rowValues.join(', ')})`;
                });
                
                backupSQL += values.join(',\n') + ';\n\n';
            }
        }
        
        backupSQL += 'SET FOREIGN_KEY_CHECKS = 1;\n';
        
        // Guardar backup
        const backupFileName = `backup_railway_${new Date().toISOString().split('T')[0]}.sql`;
        fs.writeFileSync(backupFileName, backupSQL);
        console.log(`\n💾 Backup guardado como: ${backupFileName}`);
        
        // Restaurar en local (opcional)
        console.log('\n❓ ¿Deseas restaurar automáticamente en local?');
        console.log('   Para restaurar manualmente: mysql -u root -p elpunto < ' + backupFileName);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (railwayConn) await railwayConn.end();
        if (localConn) await localConn.end();
    }
}

// Función para restaurar en local
async function restaurarEnLocal(archivoSQL) {
    console.log('🔄 Restaurando backup en base local...');
    
    try {
        const localConn = await mysql.createConnection({
            ...localConfig,
            multipleStatements: true
        });
        
        const sqlContent = fs.readFileSync(archivoSQL, 'utf8');
        await localConn.execute(sqlContent);
        
        console.log('✅ Backup restaurado exitosamente en local');
        await localConn.end();
        
    } catch (error) {
        console.error('❌ Error restaurando:', error.message);
    }
}

// Ejecutar backup
backupDatabase();