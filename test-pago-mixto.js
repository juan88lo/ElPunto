// test-pago-mixto.js
// Script para probar la funcionalidad de pago mixto

const { graphql, buildSchema } = require('graphql');

// Simulación de una consulta GraphQL para pago mixto
const testPagoMixto = `
mutation CrearFacturaPagoMixto($input: FacturaInput!) {
  crearFactura(input: $input) {
    id
    consecutivo
    fecha
    subtotal
    total
    formaPago
    montoEfectivo
    montoTarjeta
    lineas {
      id
      cantidad
      precio
      total
      producto {
        nombre
        codigoBarras
      }
    }
  }
}
`;

// Variables de ejemplo para pago mixto
const variablesPagoMixto = {
  input: {
    cajaId: "1",
    usuarioId: "1", 
    formaPago: "MIXTO",
    montoEfectivo: 5000.00,  // ₡5,000 en efectivo
    montoTarjeta: 3500.50,   // ₡3,500.50 con tarjeta  
    productos: [
      {
        codigoBarras: "123456789",
        cantidad: 1.5  // cantidad decimal
      },
      {
        codigoBarras: "987654321", 
        cantidad: 2.0
      }
    ]
  }
};

// Variables para pago solo efectivo (para comparar)
const variablesEfectivo = {
  input: {
    cajaId: "1",
    usuarioId: "1",
    formaPago: "EFECTIVO", 
    productos: [
      {
        codigoBarras: "123456789",
        cantidad: 0.75  // cantidad decimal
      }
    ]
  }
};

// Variables para pago solo tarjeta
const variablesTarjeta = {
  input: {
    cajaId: "1", 
    usuarioId: "1",
    formaPago: "TARJETA",
    productos: [
      {
        codigoBarras: "123456789",
        cantidad: 2.25  // cantidad decimal  
      }
    ]
  }
};

console.log('=== Test GraphQL Variables for Pago Mixto ===');
console.log('');
console.log('Query:');
console.log(testPagoMixto);
console.log('');
console.log('Variables for MIXTO payment:');
console.log(JSON.stringify(variablesPagoMixto, null, 2));
console.log('');
console.log('Variables for EFECTIVO payment:');
console.log(JSON.stringify(variablesEfectivo, null, 2));
console.log('');
console.log('Variables for TARJETA payment:');
console.log(JSON.stringify(variablesTarjeta, null, 2));
console.log('');
console.log('=== Validation Tests ===');

// Test de validación para pago mixto
function validatePagoMixto(input) {
  console.log(`\nTesting input:`, input);
  
  if (input.formaPago === 'MIXTO') {
    if (!input.montoEfectivo || !input.montoTarjeta) {
      console.log('❌ ERROR: Pago mixto requiere montoEfectivo y montoTarjeta');
      return false;
    }
    
    // Simular cálculo de total (esto se haría con productos reales)
    const totalSimulado = 8500.50; // Total simulado
    const sumaMontos = input.montoEfectivo + input.montoTarjeta;
    
    if (Math.abs(sumaMontos - totalSimulado) > 0.01) {
      console.log(`❌ ERROR: Suma de montos (${sumaMontos}) no coincide con total (${totalSimulado})`);
      return false;
    }
    
    console.log('✅ VALID: Pago mixto bien configurado');
    return true;
  } else {
    console.log('✅ VALID: Pago simple (no mixto)');
    return true;
  }
}

// Ejecutar tests
validatePagoMixto(variablesPagoMixto.input);
validatePagoMixto(variablesEfectivo.input); 
validatePagoMixto(variablesTarjeta.input);

// Test de cantidades decimales
console.log('\n=== Decimal Quantity Tests ===');
const cantidadesTest = [1, 1.5, 0.75, 2.25, 3.33];

cantidadesTest.forEach(cantidad => {
  console.log(`Cantidad: ${cantidad} → Type: ${typeof cantidad}, Valid: ${cantidad > 0}`);
});

console.log('\n=== Instructions ===');
console.log('1. Ejecutar migration-pago-mixto.sql en MySQL Workbench');
console.log('2. Reiniciar el servidor Node.js');
console.log('3. Usar las queries de arriba en GraphQL Playground');
console.log('4. Verificar que acepta cantidades decimales como 1.5, 2.25');
console.log('5. Verificar que pago mixto valida la suma correctamente');