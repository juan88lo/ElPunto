const bcrypt = require('bcrypt');

// Hash que necesitas verificar
const hashAVerificar = '$2b$10$WIDMxYpwnF627oNShlbv0eIuRiYNQSTSF2ANOUGlE77SgLrB2X5J2';

console.log('🔍 VERIFICADOR DE CONTRASEÑA BCRYPT');
console.log('Hash a verificar:', hashAVerificar);
console.log('');

// Contraseñas comunes para probar
const contraseñas = [
    'admin',
    'admin123',
    'password',
    'password123',
    '123456',
    'root',
    'elpunto',
    'ElPunto',
    'elpunto123',
    'ElPunto123',
    'administrador',
    'sistema',
    'usuario',
    'test',
    'demo'
];

async function verificarContraseñas() {
    console.log('🔄 Probando contraseñas comunes...\n');
    
    for (const password of contraseñas) {
        try {
            const esCorrecta = await bcrypt.compare(password, hashAVerificar);
            
            if (esCorrecta) {
                console.log(`✅ ¡ENCONTRADA! La contraseña es: "${password}"`);
                console.log(`🎯 Hash verificado exitosamente\n`);
                
                // Generar nuevo hash para admin123 si es necesario
                const nuevoHash = await bcrypt.hash('admin123', 10);
                console.log('🔧 Nuevo hash para "admin123":');
                console.log(nuevoHash);
                
                return password;
            } else {
                console.log(`❌ "${password}" - No coincide`);
            }
        } catch (error) {
            console.log(`⚠️  Error con "${password}":`, error.message);
        }
    }
    
    console.log('\n❌ No se encontró entre las contraseñas comunes');
    console.log('\n💡 Sugerencias:');
    console.log('   - La contraseña puede ser más compleja');
    console.log('   - Puede incluir números o símbolos especiales');
    console.log('   - Revisar documentación del sistema original');
}

verificarContraseñas();
