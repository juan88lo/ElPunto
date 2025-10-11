// verificar-productos.js - Ver qué productos existen en la BD
require('dotenv').config();
const { Inventario } = require('./src/models');

async function verificarProductos() {
    console.log('🔍 VERIFICANDO PRODUCTOS EN BASE DE DATOS\n');
    
    try {
        const productos = await Inventario.findAll({
            limit: 10,
            attributes: ['id', 'nombre', 'codigoBarras', 'precioFinalVenta', 'cantidadExistencias']
        });
        
        if (productos.length === 0) {
            console.log('❌ No hay productos en la base de datos');
            console.log('💡 Necesitas insertar productos primero');
            return;
        }
        
        console.log(`✅ Encontrados ${productos.length} productos:\n`);
        
        productos.forEach(p => {
            console.log(`📦 ${p.nombre}`);
            console.log(`   Código: ${p.codigoBarras}`);
            console.log(`   Precio: ₡${p.precioFinalVenta}`);
            console.log(`   Stock: ${p.cantidadExistencias}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarProductos();