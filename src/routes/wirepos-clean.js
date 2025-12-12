/**
 * WirePOS Routes - Endpoints para frontend y .exe
 * 
 * Arquitectura simplificada:
 * Frontend → POST /addrequest → Guarda en transactionStore
 *         → Invoca wirepos:// (lanza .exe)
 * 
 * .exe → GET /CheckRequest/:id (cada 5s) → Lee transactionStore
 *     → Procesa tarjeta
 *     → POST /response → Actualiza transactionStore
 * 
 * Frontend → GET /status/:id (cada 5s) → Lee resultado
 */

const express = require('express');
const router = express.Router();
const wireposController = require('../controllers/wireposController');

console.log('[WireposRoutes] 🔧 Rutas WirePOS registradas en /api/wirepos');

/**
 * POST /addrequest - Frontend crea transacción
 * POST /AddRequest - Alias para compatibilidad
 */
router.post('/addrequest', wireposController.addRequest);
router.post('/AddRequest', wireposController.addRequest);

/**
 * GET /CheckRequest/:transactionId - El .exe consulta cada 5s
 */
router.get('/CheckRequest/:transactionId', wireposController.checkRequest);

/**
 * GET /status/:transactionId - Frontend consulta estado
 */
router.get('/status/:transactionId', wireposController.getStatus);

/**
 * POST /response - El .exe devuelve resultado
 */
router.post('/response', wireposController.receiveResponse);

/**
 * GET /health - Health check
 */
router.get('/health', wireposController.health);

module.exports = router;
