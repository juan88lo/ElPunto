/**
 * 🔧 SIMULADOR DEL .EXE WIREPOS (VERSIÓN CORRECTA)
 * 
 * FLUJO REAL DEL .EXE (basado en código VB.NET):
 * 1. Frontend invoca wirepos:// → .exe se abre
 * 2. .exe RECIBE el transactionId (vía parámetros del protocolo)
 * 3. .exe HACE CheckRequest cada 5 segundos:
 *    GET /api/wirepos/CheckRequest/:transactionId
 * 4. Mientras ResponseString === "" → seguir consultando
 * 5. Cuando ResponseString !== "" → procesa tarjeta
 * 6. Responde POST /api/wirepos/response con resultado
 * 
 * USO:
 *   node scripts/simulate-wirepos-exe.js TXN_1764558651743_abc123
 */

const axios = require('axios');

const BACKEND_BASE = 'http://localhost:4000';
const API_BASE = `${BACKEND_BASE}/api/wirepos`;
const CHECKREQUEST_INTERVAL_MS = 5000; // CheckRequest cada 5 segundos
const PROCESSING_MIN_MS = 2000;
const PROCESSING_MAX_MS = 5000;

console.log('\n🎬 SIMULADOR WIREPOS INICIADO');
console.log(`📍 Backend: ${API_BASE}`);
console.log(`⏱️  CheckRequest interval: ${CHECKREQUEST_INTERVAL_MS}ms`);
console.log('-----------------------------------\n');

/**
 * PASO 1: El .exe hace CheckRequest en loop
 */
async function checkRequestLoop(transactionId) {
  console.log(`[EXE_SIM] 🔄 CheckRequest loop para: ${transactionId}\n`);

  let checkCount = 0;
  let maxChecks = 24; // 24 * 5s = 120 segundos max

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      checkCount++;
      
      if (checkCount > maxChecks) {
        clearInterval(checkInterval);
        reject(new Error('Timeout: 120 segundos sin respuesta'));
        return;
      }

      try {
        console.log(`[EXE_SIM] 📍 CheckRequest #${checkCount}: GET /CheckRequest/${transactionId}`);
        
        const response = await axios.get(`${API_BASE}/CheckRequest/${transactionId}`, {
          timeout: 5000
        });

        const responseString = response.data?.ResponseString || '';
        
        if (responseString === '') {
          console.log(`[EXE_SIM] ⏳ Vacío - reintentar en ${CHECKREQUEST_INTERVAL_MS}ms`);
          return;
        }

        // Respuesta recibida!
        console.log(`[EXE_SIM] ✅ RESPUESTA RECIBIDA: ${responseString}`);
        clearInterval(checkInterval);

        // Procesar transacción
        await processTransaction(transactionId, responseString);
        resolve();

      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`[EXE_SIM] ⚠️  404 - Transacción aún no existe`);
        } else {
          console.error(`[EXE_SIM] ❌ Error: ${err.message}`);
        }
      }
    }, CHECKREQUEST_INTERVAL_MS);
  });
}

/**
 * PASO 2: Procesar transacción (simula terminal)
 */
async function processTransaction(transactionId, responseString) {
  try {
    console.log(`\n[EXE_SIM] 💳 PROCESANDO EN TERMINAL`);
    console.log(`[EXE_SIM] Datos: ${responseString}`);
    
    // Parsear: deviceId|amount|invoice|command
    const [deviceId, amount, invoice, command] = responseString.split('|');
    console.log(`[EXE_SIM]   Device: ${deviceId}`);
    console.log(`[EXE_SIM]   Monto: ${amount}`);
    console.log(`[EXE_SIM]   Factura: ${invoice}`);
    
    // Simular procesamiento
    const delay = PROCESSING_MIN_MS + Math.floor(Math.random() * (PROCESSING_MAX_MS - PROCESSING_MIN_MS));
    console.log(`[EXE_SIM] ⏳ Procesando... (${delay}ms)`);
    await new Promise(r => setTimeout(r, delay));

    // Generar resultado
    const result = {
      transactionId: transactionId,
      status: 'APPROVED',
      responseCode: '00',
      authCode: 'AUTH' + Math.floor(Math.random() * 9000 + 1000),
      batchNumber: String(Math.floor(Math.random() * 9000 + 1000)),
      sequenceNumber: String(Math.floor(Math.random() * 999 + 1)),
      cardLast4: String(Math.floor(Math.random() * 9000 + 1000)),
      message: 'Transacción aprobada',
      timestamp: new Date().toISOString()
    };

    console.log(`\n[EXE_SIM] ✅ APROBADA`);
    console.log(`[EXE_SIM]   Auth: ${result.authCode}`);
    console.log(`[EXE_SIM]   Card: ****${result.cardLast4}`);

    // Enviar respuesta
    console.log(`\n[EXE_SIM] 📤 POST /response`);
    await axios.post(`${API_BASE}/response`, result, { timeout: 5000 });
    
    console.log(`[EXE_SIM] ✅ COMPLETADO\n`);

  } catch (err) {
    console.error(`[EXE_SIM] ❌ Error: ${err.message}`);
    throw err;
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('[EXE_SIM] ❌ USO:');
    console.log('[EXE_SIM]   node scripts/simulate-wirepos-exe.js <transactionId>');
    console.log('[EXE_SIM]');
    console.log('[EXE_SIM] EJEMPLO:');
    console.log('[EXE_SIM]   node scripts/simulate-wirepos-exe.js TXN_1764558651743_abc123');
    process.exit(1);
  }

  const transactionId = args[0];
  
  try {
    await checkRequestLoop(transactionId);
    console.log('[EXE_SIM] 🎉 ÉXITO');
    process.exit(0);
  } catch (err) {
    console.error(`[EXE_SIM] ❌ ERROR: ${err.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n[EXE_SIM] 🛑 Cancelado (Ctrl+C)');
  process.exit(0);
});

main();
