const sequelize = require('../src/models/baseModel').sequelize;

/**
 * Migración automática para crear/actualizar tablas de promociones y cupones de rifa
 * Se ejecuta automáticamente al iniciar el servidor
 */
async function migratePromociones() {
  try {
    console.log('🎁 Verificando tablas de promociones y cupones de rifa...');

    // Verificar si existe la tabla promociones_rifas
    const [tablaPromociones] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'promociones_rifas'
    `);

    if (tablaPromociones[0].count === 0) {
      console.log('📦 Creando tabla promociones_rifas...');
      
      await sequelize.query(`
        CREATE TABLE promociones_rifas (
          id INT PRIMARY KEY AUTO_INCREMENT,
          titulo VARCHAR(255) NOT NULL COMMENT 'Título de lo que se rifa',
          descripcion TEXT COMMENT 'Descripción adicional de la promoción',
          fechaInicio DATE NOT NULL COMMENT 'Fecha de inicio de la promoción',
          fechaSorteo DATE NOT NULL COMMENT 'Fecha del sorteo',
          montoMinimo DECIMAL(10,2) DEFAULT NULL COMMENT 'Monto mínimo de compra para participar',
          cantidadProductosMin INT DEFAULT NULL COMMENT 'Cantidad mínima de productos para participar',
          activo BOOLEAN DEFAULT FALSE COMMENT 'Indica si la promoción está activa',
          totalCupones INT DEFAULT 0 COMMENT 'Total de cupones generados',
          totalVentas DECIMAL(10,2) DEFAULT 0 COMMENT 'Total acumulado de ventas con cupón',
          cuponesReimpresos INT DEFAULT 0 COMMENT 'Total de cupones reimpresos',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('✅ Tabla promociones_rifas creada exitosamente');
    } else {
      console.log('✓ Tabla promociones_rifas ya existe');
    }

    // Verificar si existe la tabla cupones_rifa
    const [tablaCupones] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'cupones_rifa'
    `);

    if (tablaCupones[0].count === 0) {
      console.log('📦 Creando tabla cupones_rifa...');
      
      await sequelize.query(`
        CREATE TABLE cupones_rifa (
          id INT PRIMARY KEY AUTO_INCREMENT,
          promocionId INT NOT NULL COMMENT 'ID de la promoción asociada',
          facturaId INT NOT NULL COMMENT 'ID de la factura que generó el cupón',
          numeroCupon VARCHAR(50) UNIQUE NOT NULL COMMENT 'Número único del cupón',
          nombreCliente VARCHAR(255) COMMENT 'Nombre del cliente participante',
          telefono VARCHAR(20) COMMENT 'Teléfono del cliente',
          montoFactura DECIMAL(10,2) NOT NULL COMMENT 'Monto de la factura',
          fechaEmision TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de emisión',
          vecesImpreso INT DEFAULT 1 COMMENT 'Veces que se ha impreso',
          ultimaImpresion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Última impresión',
          impresoporUsuarioId INT COMMENT 'Usuario que imprimió por última vez',
          FOREIGN KEY (promocionId) REFERENCES promociones_rifas(id) ON DELETE CASCADE,
          FOREIGN KEY (facturaId) REFERENCES Facturas(id) ON DELETE CASCADE,
          FOREIGN KEY (impresoporUsuarioId) REFERENCES Usuarios(id) ON DELETE SET NULL,
          INDEX idx_promocion (promocionId),
          INDEX idx_factura (facturaId),
          INDEX idx_numero_cupon (numeroCupon)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('✅ Tabla cupones_rifa creada exitosamente');
    } else {
      console.log('✓ Tabla cupones_rifa ya existe');
    }

    // Verificar si existe la columna cuponRifaId en la tabla Facturas
    const [columnaCupon] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() 
      AND table_name = 'Facturas' 
      AND column_name = 'cuponRifaId'
    `);

    if (columnaCupon[0].count === 0) {
      console.log('📦 Agregando columna cuponRifaId a tabla Facturas...');
      
      await sequelize.query(`
        ALTER TABLE Facturas 
        ADD COLUMN cuponRifaId INT DEFAULT NULL COMMENT 'ID del cupón de rifa asociado',
        ADD FOREIGN KEY (cuponRifaId) REFERENCES cupones_rifa(id) ON DELETE SET NULL
      `);
      
      console.log('✅ Columna cuponRifaId agregada exitosamente');
    } else {
      console.log('✓ Columna cuponRifaId ya existe en Facturas');
    }

    // Crear trigger para actualizar estadísticas de promoción
    console.log('📦 Verificando triggers...');
    
    // Primero eliminar el trigger si existe
    await sequelize.query(`DROP TRIGGER IF EXISTS actualizar_stats_promocion`);
    
    // Crear el trigger
    await sequelize.query(`
      CREATE TRIGGER actualizar_stats_promocion
      AFTER INSERT ON cupones_rifa
      FOR EACH ROW
      BEGIN
        UPDATE promociones_rifas 
        SET totalCupones = totalCupones + 1,
            totalVentas = totalVentas + NEW.montoFactura
        WHERE id = NEW.promocionId;
      END
    `);
    
    console.log('✅ Trigger actualizar_stats_promocion creado/actualizado');

    // Crear trigger para actualizar contador de reimpresiones
    await sequelize.query(`DROP TRIGGER IF EXISTS actualizar_reimpresos`);
    
    await sequelize.query(`
      CREATE TRIGGER actualizar_reimpresos
      AFTER UPDATE ON cupones_rifa
      FOR EACH ROW
      BEGIN
        IF NEW.vecesImpreso > OLD.vecesImpreso THEN
          UPDATE promociones_rifas 
          SET cuponesReimpresos = cuponesReimpresos + 1
          WHERE id = NEW.promocionId;
        END IF;
      END
    `);
    
    console.log('✅ Trigger actualizar_reimpresos creado/actualizado');

    console.log('🎉 Migración de promociones completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración de promociones:', error.message);
    // No lanzamos el error para no detener el servidor
    // Solo registramos el problema
  }
}

module.exports = migratePromociones;
