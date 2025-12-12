/**
 * TEST - WirePOS GraphQL Integration
 * 
 * Script para probar addRequest y checkRequest via GraphQL
 * 
 * USO:
 *   node test-wirepos-graphql.js
 */

const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:4000/graphql';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Paso 1: Crear transacción con addRequest
 */
async function testAddRequest() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('PASO 1: addRequest (Crear Transacción)', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const mutation = `
    mutation {
      addRequest(
        deviceId: "TERM_TEST_001"
        command: "V"
        amount: 5000
        invoice: "TEST-${Date.now()}"
        idTransaction: 1
      ) {
        idRequest
        responseCode
        responseCodeDescription
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(GRAPHQL_URL, { query: mutation });
    
    if (response.data.errors) {
      log('❌ Error en GraphQL:', 'red');
      console.log(response.data.errors);
      return null;
    }

    const result = response.data.data.addRequest;
    log('✅ Transacción creada exitosamente', 'green');
    log(`   Request ID: ${result.idRequest}`, 'yellow');
    log(`   Response Code: ${result.responseCode}`);
    log(`   Description: ${result.responseCodeDescription}`);
    log(`   Timestamp: ${result.timestamp}`);
    
    return result.idRequest;
  } catch (error) {
    log('❌ Error en addRequest:', 'red');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Paso 2: Consultar estado con checkRequest (polling)
 */
async function testCheckRequest(requestId, maxAttempts = 5) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('PASO 2: checkRequest (Polling Estado)', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const query = `
    query {
      checkRequest(requestId: "${requestId}") {
        idRequest
        responseCode
        responseCodeDescription
        responseString
        timestamp
      }
    }
  `;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      log(`\n🔍 Intento ${attempt}/${maxAttempts}...`, 'yellow');
      
      const response = await axios.post(GRAPHQL_URL, { query });
      
      if (response.data.errors) {
        log('❌ Error en GraphQL:', 'red');
        console.log(response.data.errors);
        return;
      }

      const result = response.data.data.checkRequest;
      
      log(`   Response Code: ${result.responseCode}`);
      log(`   Description: ${result.responseCodeDescription}`);
      
      if (result.responseCode === '00') {
        // Transacción COMPLETADA
        log('\n✅ TRANSACCIÓN COMPLETADA', 'green');
        log(`   Request ID: ${result.idRequest}`, 'yellow');
        log(`   Response String: ${result.responseString}`);
        log(`   Timestamp: ${result.timestamp}`);
        return;
      } else if (result.responseCode === '01') {
        // Transacción PENDIENTE
        log('   ⏳ Estado: PENDING - Esperando respuesta del .exe');
        
        if (attempt < maxAttempts) {
          log('   💤 Esperando 2 segundos...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        // ERROR
        log(`\n❌ ERROR: ${result.responseCodeDescription}`, 'red');
        return;
      }
    } catch (error) {
      log('❌ Error en checkRequest:', 'red');
      console.error(error.message);
      return;
    }
  }

  log('\n⚠️  TIMEOUT: La transacción no se completó en el tiempo esperado', 'yellow');
  log('   Posibles causas:', 'yellow');
  log('   - El .exe simulador no está corriendo', 'yellow');
  log('   - La transacción está realmente pendiente', 'yellow');
  log('   - Hay un problema con el backend en puerto 8765', 'yellow');
}

/**
 * Verificar conectividad del servidor
 */
async function checkServerHealth() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('VERIFICANDO SERVIDORES', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // Check GraphQL (puerto 4000)
  try {
    await axios.post(GRAPHQL_URL, { query: '{ __typename }' });
    log('✅ GraphQL Server (puerto 4000): OK', 'green');
  } catch (error) {
    log('❌ GraphQL Server (puerto 4000): ERROR', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }

  // Check WirePOS REST (puerto 8765)
  try {
    await axios.get('http://localhost:8765/');
    log('✅ WirePOS Server (puerto 8765): OK', 'green');
  } catch (error) {
    log('❌ WirePOS Server (puerto 8765): ERROR', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }

  return true;
}

/**
 * Main
 */
async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════╗', 'blue');
  log('║   TEST - WIREPOS GRAPHQL INTEGRATION           ║', 'blue');
  log('╚══════════════════════════════════════════════════╝\n', 'blue');

  // Verificar servidores
  const serversOk = await checkServerHealth();
  if (!serversOk) {
    log('\n⚠️  Por favor, inicia los servidores:', 'yellow');
    log('   npm run dev', 'yellow');
    return;
  }

  // Test addRequest
  const requestId = await testAddRequest();
  if (!requestId) {
    log('\n❌ Test abortado: No se pudo crear la transacción', 'red');
    return;
  }

  // Test checkRequest (polling)
  await testCheckRequest(requestId);

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('TEST COMPLETADO', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('📝 NOTA:', 'yellow');
  log('   Si la transacción quedó PENDING, asegúrate de que el .exe simulador esté corriendo:', 'yellow');
  log('   npm run wirepos:simulator', 'yellow');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
