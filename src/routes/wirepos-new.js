/**
 * WirePOS Routes - Endpoints para frontend
 * 
 * Arquitectura:
 * Frontend → POST /addrequest → wireposController.addRequest()
 *         → wireposService.addRequest() → WirePOS API Azure
 *         → GET /status/:id → Polling cada 5s
 * 
 * Endpoints:
 * POST /addrequest    - Crear transacción
 * GET /status/:id     - Consultar estado
 * POST /response      - Recibir respuesta del .exe (opcional)
 * GET /health         - Health check
 */

const express = require('express');
const router = express.Router();
const wireposController = require('../controllers/wireposController');

console.log('[WireposRoutes] 🔧 Rutas WirePOS registradas en /api/wirepos');

/**
 * POST /addrequest
 * Alias de /AddRequest para compatibilidad
 */
router.post('/addrequest', wireposController.addRequest);
router.post('/AddRequest', wireposController.addRequest);

/**
 * GET /status/:transactionId
 * Alias de /status/ para polling
 */
router.get('/status/:transactionId', wireposController.getStatus);

/**
 * POST /response
 * Recibir respuesta del .exe (opcional)
 */
router.post('/response', wireposController.receiveResponse);

/**
 * GET /health
 * Health check
 */
router.get('/health', wireposController.health);

module.exports = router;
