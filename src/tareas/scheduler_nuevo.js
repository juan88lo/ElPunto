// tareas/scheduler.js - Configurado para Railway (Virginia) con horarios de Costa Rica
const cron = require('node-cron');
const cerrarCajas = require('./cerrarCajas');
const actualizarVacacionesEmpleados = require('./actualizarVacaciones');

module.exports = (db) => {
  console.log('🚀 Iniciando Sistema de Tareas Automatizadas - El Punto');
  console.log('🌍 Servidor: Railway Virginia (America/New_York)');
  console.log('🇨🇷 Zona objetivo: Costa Rica (America/Costa_Rica)');
  
  // Mostrar información de zonas horarias al iniciar
  const mostrarHorariosIniciales = () => {
    const ahora = new Date();
    const horaCostaRica = ahora.toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
    const horaVirginia = ahora.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const horaUTC = ahora.toISOString();
    
    console.log('\n⏰ Información de Zonas Horarias:');
    console.log(`   🌍 UTC:          ${horaUTC}`);
    console.log(`   🇺🇸 Virginia:    ${horaVirginia}`);
    console.log(`   🇨🇷 Costa Rica:  ${horaCostaRica}`);
    console.log('');
  };

  mostrarHorariosIniciales();

  // ==========================================
  // TAREA 1: CIERRE AUTOMÁTICO DE CAJAS
  // Ejecutar DIARIAMENTE a las 2:00 AM Costa Rica
  // ==========================================
  cron.schedule('0 2 * * *', async () => {
    const timestamp = new Date().toLocaleString('es-CR', { 
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log(`\n🕐 [${timestamp}] INICIANDO CIERRE AUTOMÁTICO DE CAJAS`);
    console.log('📍 Hora objetivo: 2:00 AM Costa Rica');
    
    try {
      await cerrarCajas(db);
      console.log('✅ Cierre de cajas completado exitosamente');
      console.log(`✅ Ejecutado a las ${timestamp} (Costa Rica)\n`);
    } catch (err) {
      console.error('❌ Error en cierre automático de cajas:', err);
      console.error(`❌ Falló a las ${timestamp} (Costa Rica)\n`);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('✅ Tarea "Cierre de Cajas" programada:');
  console.log('   📅 Frecuencia: Diaria');
  console.log('   🕐 Hora: 2:00 AM Costa Rica (4:00 AM Virginia)');

  // ==========================================
  // TAREA 2: ACTUALIZACIÓN DE VACACIONES
  // Ejecutar el PRIMER DÍA de cada mes a las 3:00 AM Costa Rica
  // ==========================================
  cron.schedule('0 3 1 * *', async () => {
    const timestamp = new Date().toLocaleString('es-CR', { 
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log(`\n📅 [${timestamp}] INICIANDO ACTUALIZACIÓN DE VACACIONES`);
    console.log('📍 Hora objetivo: 3:00 AM Costa Rica (primer día del mes)');
    
    try {
      await actualizarVacacionesEmpleados();
      console.log('✅ Actualización de vacaciones completada exitosamente');
      console.log(`✅ Ejecutado a las ${timestamp} (Costa Rica)\n`);
    } catch (err) {
      console.error('❌ Error en actualización de vacaciones:', err);
      console.error(`❌ Falló a las ${timestamp} (Costa Rica)\n`);
    }
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('✅ Tarea "Actualización de Vacaciones" programada:');
  console.log('   📅 Frecuencia: Mensual (día 1)');
  console.log('   🕐 Hora: 3:00 AM Costa Rica (5:00 AM Virginia)');

  // ==========================================
  // TAREA 3: VERIFICACIÓN HORARIA (OPCIONAL)
  // Monitorea que las zonas horarias funcionen correctamente
  // ==========================================
  cron.schedule('0 * * * *', () => {
    const horaCostaRica = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
    const horaVirginia = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    
    console.log(`🕐 Verificación horaria: CR=${horaCostaRica} | VA=${horaVirginia}`);
  }, {
    timezone: 'America/Costa_Rica'
  });

  console.log('✅ Tarea "Verificación Horaria" programada:');
  console.log('   📅 Frecuencia: Cada hora');
  console.log('   🕐 Propósito: Monitoreo de zonas horarias');

  // ==========================================
  // PRÓXIMAS EJECUCIONES CALCULADAS
  // ==========================================
  const calcularProximasEjecuciones = () => {
    const ahora = new Date();
    
    // Próximo cierre de cajas (2:00 AM mañana)
    const proximoCierre = new Date(ahora);
    proximoCierre.setDate(proximoCierre.getDate() + 1);
    proximoCierre.setHours(2, 0, 0, 0);
    
    // Próxima actualización de vacaciones (primer día del próximo mes, 3:00 AM)
    const proximasVacaciones = new Date(ahora);
    proximasVacaciones.setMonth(proximasVacaciones.getMonth() + 1, 1);
    proximasVacaciones.setHours(3, 0, 0, 0);
    
    console.log('\n🔮 Próximas Ejecuciones Programadas:');
    console.log(`   💰 Cierre de Cajas: ${proximoCierre.toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);
    console.log(`   📅 Vacaciones: ${proximasVacaciones.toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);
  };

  calcularProximasEjecuciones();

  console.log('\n🎯 Sistema de Tareas Configurado y Listo');
  console.log('📋 Total de tareas activas: 3');
  console.log('🔄 Todas las tareas usan timezone: America/Costa_Rica');
  console.log('✅ Railway ejecutará automáticamente en horarios correctos\n');
};