// Verificador de zonas horarias para Railway
const moment = require('moment-timezone');

console.log('🌍 VERIFICACIÓN DE ZONAS HORARIAS\n');

// Hora actual en diferentes zonas
const ahora = new Date();
const utc = moment().utc();
const costaRica = moment().tz('America/Costa_Rica');
const virginia = moment().tz('America/New_York');

console.log('📅 Hora actual:');
console.log(`   UTC:               ${utc.format('YYYY-MM-DD HH:mm:ss')} UTC`);
console.log(`   🇨🇷 Costa Rica:     ${costaRica.format('YYYY-MM-DD HH:mm:ss')} (${costaRica.format('z')})`);
console.log(`   🇺🇸 Virginia:       ${virginia.format('YYYY-MM-DD HH:mm:ss')} (${virginia.format('z')})`);

console.log('\n⏰ Diferencias horarias:');
console.log(`   Virginia vs Costa Rica: ${virginia.utcOffset() - costaRica.utcOffset()} minutos`);
console.log(`   Virginia vs Costa Rica: ${(virginia.utcOffset() - costaRica.utcOffset()) / 60} horas`);

console.log('\n🔧 Configuración de cron para 2:00 AM Costa Rica:');
console.log(`   Expresión cron: "0 2 * * *"`);
console.log(`   Timezone: "America/Costa_Rica"`);

console.log('\n⚠️  PROBLEMAS DETECTADOS:');
if (virginia.utcOffset() - costaRica.utcOffset() !== 120) {
    console.log('   ❌ La diferencia horaria no es exactamente 2 horas');
} else {
    console.log('   ✅ Diferencia horaria correcta: 2 horas');
}

console.log('\n🕐 Próxima ejecución de 2:00 AM Costa Rica:');
const proximaEjecucion = costaRica.clone().add(1, 'day').hour(2).minute(0).second(0);
const proximaEnVirginia = proximaEjecucion.clone().tz('America/New_York');
const proximaEnUTC = proximaEjecucion.clone().utc();

console.log(`   🇨🇷 Costa Rica: ${proximaEjecucion.format('YYYY-MM-DD HH:mm:ss z')}`);
console.log(`   🇺🇸 Virginia:   ${proximaEnVirginia.format('YYYY-MM-DD HH:mm:ss z')}`);
console.log(`   🌍 UTC:         ${proximaEnUTC.format('YYYY-MM-DD HH:mm:ss')} UTC`);

console.log('\n📋 RECOMENDACIONES:');
console.log('1. ✅ Usar timezone: "America/Costa_Rica" en node-cron');
console.log('2. ✅ Eliminar tareas que se ejecutan cada minuto');
console.log('3. ✅ Verificar logs de Railway para confirmar hora de ejecución');
console.log('4. ⚠️  Considerar usar UTC fijo si persisten problemas');

console.log('\n🛠️  Si necesitas usar UTC fijo:');
const horaUTCEquivalente = costaRica.clone().hour(2).minute(0).utc();
console.log(`   Para 2:00 AM Costa Rica usar: ${horaUTCEquivalente.hour()}:00 UTC`);
console.log(`   Expresión cron UTC: "0 ${horaUTCEquivalente.hour()} * * *"`);