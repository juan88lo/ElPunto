const bcrypt = require('bcryptjs');

async function generarHash() {
  const passwordPlano = '12345';
  const hash = await bcrypt.hash(passwordPlano, 10);
  console.log('Hash generado:', hash);
}

generarHash();
