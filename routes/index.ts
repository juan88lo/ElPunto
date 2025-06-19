import express from 'express';
 
const router = express.Router();

// Usar las rutas de autenticación
// router.use('/auth', authRoutes);

// Ruta por defecto
router.get('/', (req, res) => {
  res.json({ mensaje: 'API de Tienda funcionando' });
});

export default router;  // Usamos export default en lugar de module.exports
