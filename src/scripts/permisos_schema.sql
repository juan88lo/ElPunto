-- Primero, eliminamos los permisos existentes y sus relaciones para evitar duplicados
DELETE FROM TipoUsuarioPermisos;
DELETE FROM Permisos;

-- Reiniciamos el auto_increment de la tabla Permisos
ALTER TABLE Permisos AUTO_INCREMENT = 1;

-- Insertamos los permisos para cada pantalla
INSERT INTO Permisos (nombrePermiso, Pantalla) VALUES
-- Usuarios
('ver_usuario', 'Usuarios'),
('crear_usuario', 'Usuarios'),
('editar_usuario', 'Usuarios'),
('eliminar_usuario', 'Usuarios'),
('asignar_permiso', 'Usuarios'),

-- Roles
('ver_roles', 'Roles'),
('crear_rol', 'Roles'),
('editar_rol', 'Roles'),
('eliminar_rol', 'Roles'),
('asignar_permisos_rol', 'Roles'),

-- Permisos
('ver_permiso', 'Permisos'),
('crear_permiso', 'Permisos'),
('editar_permiso', 'Permisos'),
('eliminar_permiso', 'Permisos'),
('revocar_permiso', 'Permisos'),

-- Inventario
('ver_inventario', 'Inventario'),
('crear_inventario', 'Inventario'),
('editar_producto', 'Inventario'),
('eliminar_producto', 'Inventario'),
('actualizar_inventario', 'Inventario'),
('eliminar_inventario', 'Inventario'),
('ver_alertas_stock', 'Inventario'),
('act_existencias', 'Inventario'),
('cargar_inventario_masivo', 'Inventario'),

-- Categorias/Familias
('ver_categoria', 'Familias'),
('crear_categoria', 'Familias'),
('editar_categoria', 'Familias'),
('eliminar_categoria', 'Familias'),

-- Proveedores
('ver_proveedor', 'Proveedores'),
('crear_proveedor', 'Proveedores'),
('editar_proveedor', 'Proveedores'),
('eliminar_proveedor', 'Proveedores'),
('ver_pagoproveedores', 'Proveedores'),
('crear_pagoproveedor', 'Proveedores'),
('pagar_proveedor', 'Proveedores'),
('editar_pago_proveedor', 'Proveedores'),
('eliminar_pagoproveedor', 'Proveedores'),

-- Facturas y Notas de Crédito
('ver_facturas', 'Facturas'),
('crear_factura', 'Facturas'),
('anular_factura', 'Facturas'),
('ver_nota_credito', 'Facturas'),
('crear_nota_credito', 'Facturas'),
('anular_nota_credito', 'Facturas'),

-- Caja
('ver_cajas', 'Cajas'),
('abrir_caja', 'Cajas'),
('cerrar_caja', 'Cajas'),
('reabrir_caja', 'Cajas'),
('ver_movimientos_caja', 'Cajas'),

-- Empleados
('ver_empleados', 'Empleados'),
('crear_empleado', 'Empleados'),
('editar_empleado', 'Empleados'),
('eliminar_empleado', 'Empleados'),

-- Planilla
('ver_planillas', 'Planilla'),
('crear_planilla', 'Planilla'),
('editar_planilla', 'Planilla'),
('eliminar_planilla', 'Planilla'),
('pagar_planilla', 'Planilla'),

-- Vacaciones
('crear_vacacion_tomada', 'Vacaciones'),
('actualizar_vacacion_tomada', 'Vacaciones'),
('eliminar_vacacion_tomada', 'Vacaciones'),
('aprobar_vacacion_tomada', 'Vacaciones'),

-- Configuración
('ver_configuracion', 'Configuración'),
('crear_configuracion', 'Configuración'),
('editar_configuracion', 'Configuración'),
('eliminar_configuracion', 'Configuración');

-- Asignar todos los permisos al tipo de usuario administrador (ID = 1)
INSERT INTO TipoUsuarioPermisos (tipoUsuarioId, permisoId)
SELECT 1, id FROM Permisos;
