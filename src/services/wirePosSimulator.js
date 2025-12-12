/**
 * WirePOS Simulator Server
 * 
 * Propósito: Simular respuestas del terminal WirePOS localmente
 * para que el .exe de WirePOS pueda consultar en http://localhost:8765/wirepos/pending
 * 
 * En producción (Railway), se desactiva este simulador porque:
 * - El .exe no está disponible en servidor Linux
 * - Se comunica directamente con Azure WirePOS API
 */

const express = require('express');
const router = express.Router();

// Almacén de transacciones en memoria (en DEV)
const transactionStore = new Map();

console.log('[WirePOS Simulator] Initialized');

/**
 * GET /wirepos/pending
 * Simula endpoint del terminal para obtener transacciones pendientes
 */
router.get('/pending', (req, res) => {
  console.log('[WirePOS] 📥 GET /wirepos/pending - El .exe está consultando');
  
  const pending = Array.from(transactionStore.values())
    .filter(t => t.status === 'PENDING')
    .map(t => ({
      ID: t.ID,
      Amount: t.Amount,
      Invoice: t.Invoice,
      Command: t.Command
    }));

  console.log(`[WirePOS] 📤 Retornando ${pending.length} transacciones pendientes`);
  res.json(pending);
});

/**
 * POST /wirepos/process
 * Simula procesamiento de una transacción
 * Body: { ID, Status, AuthCode, CardLast4, Response }
 */
router.post('/process', (req, res) => {
  const { ID, Status, AuthCode, CardLast4, Response } = req.body;
  
  console.log(`[WirePOS] 🔄 POST /wirepos/process - Procesando ${ID}`);
  
  if (!ID) {
    return res.status(400).json({ error: 'ID requerido' });
  }

  // Actualizar transacción en store
  if (transactionStore.has(ID)) {
    const transaction = transactionStore.get(ID);
    transaction.status = Status || 'DONE';
    transaction.authCode = AuthCode || '';
    transaction.cardLast4 = CardLast4 || '****';
    transaction.response = Response || '';
    
    console.log(`[WirePOS] ✅ Transacción ${ID} actualizada: ${transaction.status}`);
  }

  res.json({ success: true, ID });
});

/**
 * POST /wirepos/add
 * Agrega una nueva transacción para que el .exe la procese
 */
router.post('/add', (req, res) => {
  const { ID, Amount, Invoice, Command } = req.body;
  
  console.log(`[WirePOS] ➕ POST /wirepos/add - Nueva transacción ${ID}`);
  
  if (!ID || !Amount || !Invoice) {
    return res.status(400).json({ error: 'ID, Amount, Invoice requeridos' });
  }

  transactionStore.set(ID, {
    ID,
    Amount,
    Invoice,
    Command: Command || 'Sale',
    status: 'PENDING',
    timestamp: new Date().toISOString()
  });

  console.log(`[WirePOS] ✅ Transacción ${ID} agregada al simulador`);
  res.json({ success: true, ID });
});

/**
 * GET /wirepos/status/:ID
 * Obtiene estado de una transacción
 */
router.get('/status/:ID', (req, res) => {
  const { ID } = req.params;
  
  if (transactionStore.has(ID)) {
    const transaction = transactionStore.get(ID);
    return res.json({
      ID,
      status: transaction.status,
      authCode: transaction.authCode,
      cardLast4: transaction.cardLast4,
      response: transaction.response
    });
  }

  res.status(404).json({ error: 'Transacción no encontrada' });
});

/**
 * DELETE /wirepos/clear
 * Limpia todas las transacciones (para testing)
 */
router.delete('/clear', (req, res) => {
  transactionStore.clear();
  console.log('[WirePOS] 🗑️ Todas las transacciones fueron limpiadas');
  res.json({ success: true, message: 'Transacciones limpiadas' });
});

module.exports = router;
