// Verificador de zonas horarias simple (sin dependencias)
console.log('🌍 VERIFICACIÓN DE ZONAS HORARIAS\n');

// Hora actual en diferentes zonas
const ahora = new Date();

console.log('📅 Hora actual:');
console.log(`   🌍 UTC:               ${ahora.toISOString()}`);
console.log(`   🇨🇷 Costa Rica:       ${ahora.toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);
console.log(`   🇺🇸 Virginia (EDT):   ${ahora.toLocaleString('en-US', { timeZone: 'America/New_York' })}`);

// Calcular diferencia horaria
const costaRicaDate = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
const virginiaDate = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/New_York' }));
const diferenciaHoras = (virginiaDate.getTime() - costaRicaDate.getTime()) / (1000 * 60 * 60);

console.log('\n⏰ Diferencias horarias:');
console.log(`   Virginia adelante de Costa Rica: ~${Math.round(diferenciaHoras)} horas`);

console.log('\n🔧 Tu configuración actual (scheduler_nuevo.js):');
console.log('   ❌ Tiene tareas que se ejecutan cada minuto');
console.log('   ❌ Puede estar cerrando cajas constantemente');

console.log('\n✅ SOLUCIÓN RECOMENDADA:');
console.log('1. Reemplazar scheduler_nuevo.js con scheduler_fixed.js');
console.log('2. La tarea se ejecutará a las 2:00 AM Costa Rica');
console.log('3. Railway automáticamente ajustará la zona horaria');

console.log('\n🕐 Para verificar en Railway:');
console.log('   - Revisa los logs para ver a qué hora se ejecutan las tareas');
console.log('   - Busca mensajes con timestamps de Costa Rica');

// Simular próxima ejecución
const mañana2AM = new Date();
mañana2AM.setDate(mañana2AM.getDate() + 1);
mañana2AM.setHours(2, 0, 0, 0);

console.log('\n🔮 Próxima ejecución estimada (2:00 AM Costa Rica):');
console.log(`   ${mañana2AM.toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);

console.log('\n⚠️  URGENTE: Tu scheduler actual tiene estas tareas problemáticas:');
console.log('   - "* * * * *" → Se ejecuta CADA MINUTO');
console.log('   - "*/1 * * * *" → Se ejecuta CADA MINUTO (duplicada)');
console.log('   - Esto cierra cajas 1440 veces por día');

console.log('\n🚀 ACCIÓN INMEDIATA:');
console.log('   Usa el archivo scheduler_fixed.js que te creé');