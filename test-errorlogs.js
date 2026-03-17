// Script de prueba para verificar la tabla ErrorLogs
require('dotenv').config();
const { sequelize } = require('./src/models');

async function testErrorLogsTable() {
  try {
    console.log('🔍 Verificando tabla ErrorLogs...\n');
    
    // Verificar si la tabla existe
    const [results] = await sequelize.query(`SHOW TABLES LIKE 'ErrorLogs'`);
    
    if (results && results.length > 0) {
      console.log('✅ Tabla ErrorLogs existe\n');
      
      // Mostrar estructura de la tabla
      const [columns] = await sequelize.query(`DESCRIBE ErrorLogs`);
      console.log('📋 Estructura de la tabla ErrorLogs:');
      console.table(columns);
      
      // Contar registros
      const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM ErrorLogs`);
      console.log(`\n📊 Total de registros: ${count[0].total}`);
      
      // Mostrar últimos 5 registros si existen
      if (count[0].total > 0) {
        const [lastRecords] = await sequelize.query(
          `SELECT * FROM ErrorLogs ORDER BY timestamp DESC LIMIT 5`
        );
        console.log('\n📝 Últimos 5 registros:');
        console.table(lastRecords);
      }
      
    } else {
      console.log('❌ Tabla ErrorLogs NO existe');
      console.log('Esto significa que las auto-migraciones no se ejecutaron correctamente.');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testErrorLogsTable();
