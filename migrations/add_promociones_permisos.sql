-- Migración: Agregar permisos para módulo de Promociones y Rifas
-- Fecha: 2025-12-30
-- Descripción: Crear permisos para administrar promociones, cupones y estadísticas

-- Insertar permisos si no existen
INSERT INTO permisos (nombrePermiso, Pantalla)
SELECT 'ADMINISTRAR_PROMOCIONES', 'ADMINISTRACION'
WHERE NOT EXISTS (
    SELECT 1 FROM permisos 
    WHERE nombrePermiso = 'ADMINISTRAR_PROMOCIONES' 
    AND Pantalla = 'ADMINISTRACION'
);

INSERT INTO permisos (nombrePermiso, Pantalla)
SELECT 'VER_CUPONES', 'ADMINISTRACION'
WHERE NOT EXISTS (
    SELECT 1 FROM permisos 
    WHERE nombrePermiso = 'VER_CUPONES' 
    AND Pantalla = 'ADMINISTRACION'
);

INSERT INTO permisos (nombrePermiso, Pantalla)
SELECT 'REIMPRIMIR_CUPONES', 'VENTAS'
WHERE NOT EXISTS (
    SELECT 1 FROM permisos 
    WHERE nombrePermiso = 'REIMPRIMIR_CUPONES' 
    AND Pantalla = 'VENTAS'
);

-- Verificar permisos creados
SELECT 
    id,
    nombrePermiso,
    Pantalla
FROM permisos
WHERE nombrePermiso IN ('ADMINISTRAR_PROMOCIONES', 'VER_CUPONES', 'REIMPRIMIR_CUPONES')
ORDER BY id;

-- Asignar permisos al rol de ADMIN (id típicamente es 1)
-- Ajusta el tipoUsuarioId según tu configuración
INSERT INTO tiposusuariopermiso (tipoUsuarioId, permisoId)
SELECT 1, p.id
FROM permisos p
WHERE p.nombrePermiso IN ('ADMINISTRAR_PROMOCIONES', 'VER_CUPONES', 'REIMPRIMIR_CUPONES')
AND NOT EXISTS (
    SELECT 1 FROM tiposusuariopermiso tup
    WHERE tup.tipoUsuarioId = 1 AND tup.permisoId = p.id
);

-- Verificar asignación
SELECT 
    tu.nombre AS Rol,
    p.nombrePermiso AS Permiso,
    p.Pantalla
FROM tiposusuariopermiso tup
INNER JOIN TipoUsuarios tu ON tup.tipoUsuarioId = tu.id
INNER JOIN permisos p ON tup.permisoId = p.id
WHERE p.nombrePermiso IN ('ADMINISTRAR_PROMOCIONES', 'VER_CUPONES', 'REIMPRIMIR_CUPONES')
ORDER BY tu.nombre, p.nombrePermiso;
