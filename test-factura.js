// test-factura.js - Probar creación de facturas con decimales
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const schema = require('./src/graphql/schema');
const Context = require('./src/graphql/context');

async function testCrearFactura() {
    console.log('🧪 PRUEBA: Crear factura con cantidades decimales\n');
    
    const server = new ApolloServer({
        schema,
        context: () => new Context()
    });
    
    // Simular datos de factura
    const mutation = `
        mutation CrearFactura($input: FacturaInput!) {
            crearFactura(input: $input) {
                id
                consecutivo
                total
                formaPago
                estado
                fecha
            }
        }
    `;
    
    const variables = {
        input: {
            cajaId: 1,
            usuarioId: 1,
            formaPago: "mixto",
            productos: [
                {
                    codigoBarras: "123456789",
                    cantidad: 1.5  // ← Esta cantidad decimal causaba el error
                },
                {
                    codigoBarras: "987654321", 
                    cantidad: 2.25
                }
            ]
        }
    };
    
    try {
        console.log('📋 Datos de entrada:');
        console.log(JSON.stringify(variables, null, 2));
        console.log('\n🔄 Ejecutando mutación...');
        
        const result = await server.executeOperation({
            query: mutation,
            variables
        });
        
        if (result.errors) {
            console.log('\n❌ ERRORES:');
            result.errors.forEach(error => {
                console.log(`   - ${error.message}`);
            });
        } else {
            console.log('\n✅ FACTURA CREADA EXITOSAMENTE:');
            console.log(JSON.stringify(result.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ Error ejecutando prueba:', error.message);
    }
}

// Función alternativa para probar con enteros
async function testCrearFacturaEnteros() {
    console.log('\n🧪 PRUEBA ALTERNATIVA: Crear factura con cantidades enteras\n');
    
    const server = new ApolloServer({
        schema,
        context: () => new Context()
    });
    
    const mutation = `
        mutation CrearFactura($input: FacturaInput!) {
            crearFactura(input: $input) {
                id
                consecutivo
                total
                formaPago
                estado
            }
        }
    `;
    
    const variables = {
        input: {
            cajaId: 1,
            usuarioId: 1,
            formaPago: "efectivo",
            productos: [
                {
                    codigoBarras: "123456789",
                    cantidad: 2  // ← Cantidad entera
                }
            ]
        }
    };
    
    try {
        const result = await server.executeOperation({
            query: mutation,
            variables
        });
        
        if (result.errors) {
            console.log('\n❌ ERRORES CON ENTEROS:');
            result.errors.forEach(error => {
                console.log(`   - ${error.message}`);
            });
        } else {
            console.log('\n✅ FACTURA CON ENTEROS CREADA:');
            console.log(JSON.stringify(result.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

console.log('🚀 INICIANDO PRUEBAS DE FACTURACIÓN\n');

// Ejecutar ambas pruebas
testCrearFactura().then(() => {
    return testCrearFacturaEnteros();
}).then(() => {
    console.log('\n✅ Pruebas completadas');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error en pruebas:', error);
    process.exit(1);
});