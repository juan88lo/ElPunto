/**
 * Test completo del flujo WirePOS con guardado en BD
 * 
 * Este script simula:
 * 1. Inicio de pago WirePOS (addRequest)
 * 2. Polling hasta aprobar
 * 3. Creación de factura con transactionId
 * 4. Verificación de que invoiceWireposId se guardó
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000';
const GRAPHQL_URL = `${API_URL}/graphql`;

// Token de autenticación (reemplazar con token real)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Obtener de login

async function testCompleteFlow() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   TEST COMPLETO: Flujo WirePOS + Factura + BD           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // ═══════════════════════════════════════════════════════════
    // PASO 1: Iniciar pago WirePOS
    // ═══════════════════════════════════════════════════════════
    console.log('📱 PASO 1: Iniciando pago WirePOS...');
    
    const addRequestResponse = await axios.post(
      `${API_URL}/api/wirepos/addrequest`,
      {
        params: 'V|DEV_TERM_001|10000|TEMP_TEST_001'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const { transactionId, idRequest } = addRequestResponse.data;
    console.log('✅ Pago iniciado:', {
      transactionId,
      idRequest
    });

    // ═══════════════════════════════════════════════════════════
    // PASO 2: Polling hasta que se apruebe
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔄 PASO 2: Esperando aprobación...');
    console.log('   (Aprobar en el simulador WirePOS)');
    
    let approved = false;
    let statusData = null;
    let attempts = 0;
    const maxAttempts = 60; // 3 minutos

    while (!approved && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar 3s

      try {
        const statusResponse = await axios.get(
          `${API_URL}/api/wirepos/status/${transactionId}`
        );

        if (statusResponse.status === 200) {
          statusData = statusResponse.data;
          console.log(`   Intento ${attempts}: Estado =`, statusData.status);

          if (statusData.status === 'DONE' && statusData.result?.approved) {
            approved = true;
            console.log('✅ Pago aprobado:', {
              responseCode: statusData.result.responseCode,
              authCode: statusData.result.authCode,
              cardLast4: statusData.result.cardLast4,
              wireposInvoice: statusData.result.wireposInvoice
            });
          }
        }
      } catch (err) {
        if (err.response?.status !== 204) {
          console.error('   Error en status:', err.message);
        }
      }
    }

    if (!approved) {
      console.error('❌ Timeout: Pago no fue aprobado');
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // PASO 3: Crear factura con transactionId
    // ═══════════════════════════════════════════════════════════
    console.log('\n💳 PASO 3: Creando factura con transactionId...');

    const mutation = `
      mutation CrearFactura($input: FacturaInputType!) {
        crearFactura(input: $input) {
          id
          consecutivo
          total
          transactionId
          invoiceWireposId
          fecha
          estado
        }
      }
    `;

    const variables = {
      input: {
        cajaId: 1,
        usuarioId: 1,
        formaPago: 'tarjeta',
        transactionId: transactionId,  // ⭐ Aquí se vincula
        idempotencyKey: `test-${Date.now()}`,
        productos: [
          {
            codigoBarras: '7501234567890',  // Reemplazar con código real
            cantidad: 2
          }
        ]
      }
    };

    const facturaResponse = await axios.post(
      GRAPHQL_URL,
      {
        query: mutation,
        variables: variables
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    if (facturaResponse.data.errors) {
      console.error('❌ Error creando factura:', facturaResponse.data.errors);
      return;
    }

    const factura = facturaResponse.data.data.crearFactura;
    console.log('✅ Factura creada:', {
      id: factura.id,
      consecutivo: factura.consecutivo,
      total: factura.total,
      transactionId: factura.transactionId,
      invoiceWireposId: factura.invoiceWireposId,  // ⭐ Debe tener valor
      fecha: factura.fecha,
      estado: factura.estado
    });

    // ═══════════════════════════════════════════════════════════
    // PASO 4: Verificar en BD
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔍 PASO 4: Verificando en base de datos...');
    console.log('\nEjecutar en MySQL:');
    console.log('```sql');
    console.log(`SELECT 
  f.id,
  f.consecutivo,
  f.total,
  f.transactionId,
  f.invoiceWireposId,
  w.wireposInvoice,
  w.responseCode,
  w.authCode,
  w.cardLast4
FROM Facturas f
LEFT JOIN WireposTransacciones w ON f.id = w.facturaId
WHERE f.id = ${factura.id};`);
    console.log('```\n');

    // ═══════════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════════
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TEST COMPLETADO                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📊 Resultados:');
    console.log('   • TransactionId:', transactionId);
    console.log('   • Factura ID:', factura.id);
    console.log('   • Consecutivo:', factura.consecutivo);
    console.log('   • InvoiceWireposId:', factura.invoiceWireposId || '❌ NULL');
    console.log('   • WirePOS Invoice:', statusData.result.wireposInvoice || '❌ NULL');
    console.log('\n');

    if (!factura.invoiceWireposId) {
      console.error('⚠️  PROBLEMA: invoiceWireposId es NULL');
      console.error('   Revisar logs del servidor para ver si linkFacturaToWirepos se ejecutó');
    }

  } catch (error) {
    console.error('\n❌ Error en test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// INSTRUCCIONES DE USO
// ═══════════════════════════════════════════════════════════
console.log(`
╔═══════════════════════════════════════════════════════════╗
║         INSTRUCCIONES PARA EJECUTAR EL TEST              ║
╚═══════════════════════════════════════════════════════════╝

1. Obtener token de autenticación:
   - Hacer login en la aplicación
   - Copiar el token del localStorage o de la respuesta
   - Pegar en la variable AUTH_TOKEN (línea 17)

2. Verificar que el servidor esté corriendo:
   npm run dev

3. Ejecutar el test:
   node test-wirepos-flow-complete.js

4. Cuando se indique, aprobar el pago en el simulador WirePOS

5. El script mostrará si el invoiceWireposId se guardó correctamente

═══════════════════════════════════════════════════════════
`);

// Descomentar para ejecutar
// testCompleteFlow();
