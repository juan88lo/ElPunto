const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

// Eliminar todos los archivos dentro de dist
fs.readdir(distPath, (err, files) => {
  if (err) {
    console.log('Error leyendo la carpeta dist', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(distPath, file);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log('Error eliminando el archivo:', filePath);
      } else {
        console.log(`Archivo eliminado: ${filePath}`);
      }
    });
  });
});
