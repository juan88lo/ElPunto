const bcrypt = require('bcrypt');

async function generarHash() {
  const passwordPlano = 'admin123';
  const hash = await bcrypt.hash(passwordPlano, 10);
  console.log('Hash generado:', hash);
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare(passwordPlano, hash);
  console.log('¿El hash es válido?:', isValid);
  
  // También verificar el hash actual que no funciona
  const hashActual = '$2b$10$wIo6Zm3hTZCnOrVYX0BMp.U2dpgCDCyw0OGZ7O2AyeqBBydz7F93y';
  const isValidActual = await bcrypt.compare(passwordPlano, hashActual);
  console.log('¿El hash actual es válido?:', isValidActual);
}

generarHash();
