
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `bitacoras` WRITE;
/*!40000 ALTER TABLE `bitacoras` DISABLE KEYS */;
/*!40000 ALTER TABLE `bitacoras` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `cajas` WRITE;
/*!40000 ALTER TABLE `cajas` DISABLE KEYS */;
INSERT INTO `cajas` (`id`, `usuarioId`, `usuarioAperturaId`, `usuarioCierreId`, `fechaApertura`, `fechaCierre`, `montoInicial`, `montoSistema`, `montoReal`, `totalVentas`, `estado`, `motivoReapertura`, `fechaReapertura`, `numeroDia`) VALUES (1,1,1,NULL,'2025-08-28 01:36:45',NULL,0.00,0.00,NULL,NULL,'abierta',NULL,NULL,1);
/*!40000 ALTER TABLE `cajas` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `configuraciones` WRITE;
/*!40000 ALTER TABLE `configuraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `consecutivofactura` WRITE;
/*!40000 ALTER TABLE `consecutivofactura` DISABLE KEYS */;
/*!40000 ALTER TABLE `consecutivofactura` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `detallefacturas` WRITE;
/*!40000 ALTER TABLE `detallefacturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `detallefacturas` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `detallenotascredito` WRITE;
/*!40000 ALTER TABLE `detallenotascredito` DISABLE KEYS */;
/*!40000 ALTER TABLE `detallenotascredito` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `familias` WRITE;
/*!40000 ALTER TABLE `familias` DISABLE KEYS */;
/*!40000 ALTER TABLE `familias` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `inventarios` WRITE;
/*!40000 ALTER TABLE `inventarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventarios` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `notascredito` WRITE;
/*!40000 ALTER TABLE `notascredito` DISABLE KEYS */;
/*!40000 ALTER TABLE `notascredito` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `pagosproveedores` WRITE;
/*!40000 ALTER TABLE `pagosproveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagosproveedores` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` (`id`, `nombrePermiso`, `Pantalla`) VALUES (1,'TEST','Test');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `planillas` WRITE;
/*!40000 ALTER TABLE `planillas` DISABLE KEYS */;
/*!40000 ALTER TABLE `planillas` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `tipousuariopermisos` WRITE;
/*!40000 ALTER TABLE `tipousuariopermisos` DISABLE KEYS */;
INSERT INTO `tipousuariopermisos` (`tipoUsuarioId`, `permisoId`) VALUES (1,1);
/*!40000 ALTER TABLE `tipousuariopermisos` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `tipousuarios` WRITE;
/*!40000 ALTER TABLE `tipousuarios` DISABLE KEYS */;
INSERT INTO `tipousuarios` (`id`, `nombre`, `descripcion`) VALUES (1,'User',NULL);
INSERT INTO `tipousuarios` (`id`, `nombre`, `descripcion`) VALUES (2,'Administrador','Tiene acceso completo al sistema');
INSERT INTO `tipousuarios` (`id`, `nombre`, `descripcion`) VALUES (3,'Cajero','Puede realizar ventas y consultar inventario');
INSERT INTO `tipousuarios` (`id`, `nombre`, `descripcion`) VALUES (4,'Supervisor','Puede ver reportes y supervisar acciones del cajero');
/*!40000 ALTER TABLE `tipousuarios` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `password`, `tipoUsuarioId`, `empleadoId`, `estado`) VALUES (1,'u1','admin@example.com','$2b$10$wIo6Zm3hTZCnOrVYX0BMp.U2dpgCDCyw0OGZ7O2AyeqBBydz7F93y',1,NULL,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `vacacionestomadas` WRITE;
/*!40000 ALTER TABLE `vacacionestomadas` DISABLE KEYS */;
/*!40000 ALTER TABLE `vacacionestomadas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

