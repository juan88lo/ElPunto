
DELETE FROM TipoUsuarioPermisos;
DELETE FROM Permisos;

-- Reiniciamos el auto_increment de la tabla Permisos
ALTER TABLE Permisos AUTO_INCREMENT = 1;

-- Insertamos los permisos para cada pantalla
INSERT INTO Permisos (nombrePermiso, Pantalla) VALUES
-- Usuarios y Roles
('ver_usuario', 'Usuarios'),
('crear_usuario', 'Usuarios'),
('editar_usuario', 'Usuarios'),
('eliminar_usuario', 'Usuarios'),
('asignar_permiso', 'Usuarios'),
('ver_roles', 'Roles'),
('crear_rol', 'Roles'),
('editar_rol', 'Roles'),
('eliminar_rol', 'Roles'),
('asignar_permisos_rol', 'Roles'),
('ver_permiso', 'Permisos'),
('crear_permiso', 'Permisos'),
('editar_permiso', 'Permisos'),
('eliminar_permiso', 'Permisos'),
('revocar_permiso', 'Permisos'),
('asignar_permisos_rol', 'Permisos'),

-- Inventario
('ver_inventario', 'Inventario'),
('crear_producto', 'Inventario'),
('editar_producto', 'Inventario'),
('eliminar_producto', 'Inventario'),
('ver_alertas_stock', 'Inventario'),
('crear_inventario', 'Inventario'),
('actualizar_inventario', 'Inventario'),
('cargar_inventario_masivo', 'Inventario'),
('act_existencias', 'Inventario'),
('eliminar_inventario', 'Inventario'),
('cargar_csv_inventario', 'Inventario'),
('exportar_pdf_inventario', 'Inventario'),
('carga_masiva', 'Inventario'),
('exportar_inventario', 'Inventario'),

-- Familias
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

-- Facturas y Ventas
('ver_facturas', 'Facturas'),
('crear_factura', 'Facturas'),
('anular_factura', 'Facturas'),
('ver_nota_credito', 'Facturas'),
('crear_nota_credito', 'Facturas'),
('anular_nota_credito', 'Facturas'),
('ver_ventas', 'Ventas'),
('gestionar_ventas', 'Ventas'),

-- Caja
('ver_cajas', 'Cajas'),
('abrir_caja', 'Cajas'),
('cerrar_caja', 'Cajas'),
('reabrir_caja', 'Cajas'),
('ver_movimientos_caja', 'Cajas'),
('ver_cajas_admin', 'Cajas'),

-- Empleados y Planilla
('ver_empleados', 'Empleados'),
('crear_empleado', 'Empleados'),
('editar_empleado', 'Empleados'),
('eliminar_empleado', 'Empleados'),
('ver_planillas', 'Empleados'),
('crear_planilla', 'Empleados'),
('editar_planilla', 'Empleados'),
('eliminar_planilla', 'Empleados'),
('pagar_planilla', 'Empleados'),
('ver_vacaciones', 'Empleados'),
('crear_vacacion_tomada', 'Empleados'),
('actualizar_vacacion_tomada', 'Empleados'),
('eliminar_vacacion_tomada', 'Empleados'),
('ver_Planillas', 'Planilla'),
('gestionar_planillas', 'Planilla'),

-- Configuración y Administración
('ver_configuracion', 'Configuración'),
('crear_configuracion', 'Configuración'),
('editar_configuracion', 'Configuración'),
('eliminar_configuracion', 'Configuración'),
('ver_admin', 'Administracion'),
('gestionar_sistema', 'Administracion'),

-- Dashboard
('ver_dashboard', 'Dashboard'),
('ver_metricas_ventas', 'Dashboard'),
('ver_metricas_inventario', 'Dashboard'),
('ver_metricas_financieras', 'Dashboard'),

-- Sistema
('gestionar_sesiones', 'Sistema'),
('ver_sesiones_activas', 'Sistema'),
('crear_backup', 'Sistema'),
('restaurar_backup', 'Sistema'),

-- Reportes
('ver_reporte_ventas', 'Reportes'),
('ver_reporte_inventario', 'Reportes'),
('ver_reporte_empleados', 'Reportes'),
('ver_reporte_financiero', 'Reportes'),
('exportar_reportes', 'Reportes'),
('ver_reporte_caja', 'Reportes'),
('ver_reporte_proveedores', 'Reportes'),

-- Pagos
('ver_pagos', 'Pagos'),
('gestionar_pagos', 'Pagos');

-- Asignar todos los permisos al tipo de usuario administrador (ID = 1)
INSERT INTO TipoUsuarioPermisos (tipoUsuarioId, permisoId)
SELECT 1, id FROM Permisos;

 