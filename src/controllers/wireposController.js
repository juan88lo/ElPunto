/**
 * WirePOS Controller - Lógica de negocio
 * 
 * Responsabilidad: 
 * 1. Recibir solicitudes del frontend
 * 2. Llamar wireposService.addRequest()
 * 3. Guardar en BD (tabla WireposTransacciones)
 * 4. Guardar estado en transactionStore (en memoria para polling)
 * 5. Retornar estado cuando frontend consulta
 * 6. Actualizar con respuesta del .exe
 */

const wireposService = require('../services/wireposService');
const { WireposTransaccion } = require('../models');

// 📦 Almacén de transacciones en memoria (para polling rápido)
// Formato: Map<transactionId, { id, status, result, createdAt, completedAt, ... }>
const transactionStore = new Map();

console.log('[WireposController] 🔧 Inicializado con transactionStore en memoria');

/**
 * POST /api/wirepos/addrequest
 * 
 * Recibe del frontend:
 * {
 *   id: "TXN_123456",
 *   command: "V",
 *   params: "V|TERM_001|10000|INV001",
 *   timestamp: 1234567890
 * }
 * 
 * Flujo:
 * 1. Parsea params (transactionType|deviceId|amount|invoice)
 * 2. Llama wireposService.addRequest()
 * 3. Guarda en transactionStore
 * 4. Retorna transactionId para polling
 */
async function addRequest(req, res) {
  try {
    const { id, command, params, timestamp } = req.body;

    console.log('[WireposController] 📥 POST /addrequest');
    console.log('[WireposController] Body:', { id, command, params, timestamp });

    // Validar params
    if (!params) {
      console.error('[WireposController] ❌ Validación fallida - Falta params');
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMS',
        message: 'Falta campo params con formato: transactionType|deviceId|amount|invoice'
      });
    }

    // Parsear params: "V|TERM_001|10000|INV001"
    const partsArray = params.split('|');
    console.log('[WireposController] 🔍 Params divididos:', partsArray);

    if (partsArray.length < 4) {
      console.error('[WireposController] ❌ Validación fallida - Formato params inválido');
      return res.status(400).json({
        success: false,
        code: 'INVALID_PARAMS_FORMAT',
        message: 'Formato params inválido. Esperado: transactionType|deviceId|amount|invoice',
        received: params
      });
    }

    const transactionType = partsArray[0];  // "V"
    const deviceId = partsArray[1];         // "DEV_TERM_001" (del frontend)
    const amount = parseFloat(partsArray[2]); // 10000
    const invoice = partsArray[3];          // "INV001"

    // ✅ Usar deviceId real de LARO (2084) en lugar del que envía el frontend
    const realDeviceId = process.env.WIREPOS_DEVICE_ID || '2084';

    console.log('[WireposController] ✅ Parámetros extraídos:', {
      transactionType,
      deviceId: `${deviceId} (frontend) → ${realDeviceId} (LARO)`,
      amount,
      invoice
    });

    // Validar datos
    if (!transactionType || isNaN(amount) || !invoice) {
      console.error('[WireposController] ❌ Validación fallida - Valores inválidos');
      return res.status(400).json({
        success: false,
        code: 'INVALID_VALUES',
        message: 'Valores inválidos en params',
        received: { transactionType, amount, invoice }
      });
    }

    // Generar transactionId si no viene
    const transactionId = id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[WireposController] 🚀 Llamando wireposService.addRequest() a API externa');

    // ✨ PASO 1: Llamar API externa de LARO WirePOS con deviceId real (2084)
    let wireposResponse;
    try {
      wireposResponse = await wireposService.addRequest(
        realDeviceId,  // ✅ Usar 2084 en lugar del deviceId del frontend
        amount,
        invoice,
        transactionId,
        transactionType  // ✅ Usar "V" (transactionType), no "AddRequest" (command)
      );
      console.log('[WireposController] ✅ wireposService.addRequest() exitoso');
      console.log('[WireposController] 📋 IDRequest recibido:', wireposResponse.idRequest);
    } catch (serviceError) {
      console.error('[WireposController] ❌ wireposService.addRequest() falló:', serviceError);
      
      return res.status(serviceError.httpStatus || 500).json({
        success: false,
        code: serviceError.code,
        message: serviceError.message,
        details: serviceError.details
      });
    }

    // ✅ Validar que se recibió IDRequest
    if (!wireposResponse.idRequest) {
      console.error('[WireposController] ❌ LARO no retornó IDRequest válido');
      console.error('[WireposController] 📋 Respuesta completa:', wireposResponse);
      
      return res.status(500).json({
        success: false,
        code: 'MISSING_ID_REQUEST',
        message: `LARO no retornó IDRequest válido. ResponseCode: ${wireposResponse.data?.ResponseCode || 'N/A'}`,
        details: wireposResponse.data
      });
    }

    // ✨ PASO 2: Guardar transacción SOLO en memoria (NO en BD aún)
    // La BD se actualiza cuando el usuario confirme la factura
    const transaction = {
      id: transactionId,
      transactionType,
      deviceId: realDeviceId,
      frontendDeviceId: deviceId,
      amount,
      invoice,
      command,
      status: 'PENDING',
      result: null,
      wireposIdRequest: wireposResponse.idRequest,
      addRequestResponse: wireposResponse.data || wireposResponse,
      environment: process.env.WIREPOS_ENVIRONMENT || 'DEV',
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    transactionStore.set(transactionId, transaction);

    console.log('[WireposController] 💾 Transacción guardada en transactionStore');
    console.log('[WireposController] 📍 transactionStore.size:', transactionStore.size);

    // ✨ PASO 4: Guardar en archivo para el .exe (opcional)
    try {
      const fs = require('fs');
      const path = require('path');
      const requestFilePath = path.join('C:\\AuthorPos', 'request.json');
      
      const dir = path.dirname(requestFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(requestFilePath, JSON.stringify({
        id: transactionId,
        transactionType,
        deviceId: realDeviceId,  // ✅ Usar deviceId real
        frontendDeviceId: deviceId,
        amount,
        invoice,
        wireposIdRequest: wireposResponse.idRequest,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log('[WireposController] 📝 Solicitud guardada en:', requestFilePath);
    } catch (err) {
      console.warn('[WireposController] ⚠️  No se pudo guardar archivo:', err.message);
    }

    // ✨ PASO 4: Responder al frontend
    const responseData = {
      success: true,
      transactionId: transactionId,
      wireposIdRequest: wireposResponse.idRequest,
      status: 'PENDING',
      message: 'Transacción enviada a LARO WirePOS. Comienza polling...',
      pollUrl: `http://localhost:4000/api/wirepos/status/${transactionId}`
    };

    console.log('[WireposController] 📤 Respuesta al frontend:', responseData);
    res.json(responseData);

    // ✨ PASO 6: Iniciar polling en background para consultar CheckRequest
    startPollingCheckRequest(transactionId, realDeviceId, wireposResponse.idRequest);

  } catch (error) {
    console.error('[WireposController] ❌ Error inesperado:', error.message);
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/wirepos/status/:transactionId
 * 
 * Frontend consulta cada 5 segundos para saber si hay resultado
 * 
 * Respuesta:
 * - Si status === PENDING && result === null: HTTP 204 No Content
 * - Si status === DONE && result !== null: HTTP 200 + result
 */
async function getStatus(req, res) {
  try {
    const { transactionId } = req.params;

    console.log('[WireposController] 🔍 GET /status/:transactionId', transactionId);

    // Buscar en transactionStore
    if (!transactionStore.has(transactionId)) {
      console.log('[WireposController] ❌ Transacción no encontrada');
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Transacción no existe',
        transactionId
      });
    }

    const transaction = transactionStore.get(transactionId);

    // Si aún no hay resultado
    if (!transaction.result || transaction.status === 'PENDING') {
      console.log('[WireposController] ⏳ Status: PENDING - Sin resultado aún');
      
      // Retornar HTTP 204 No Content (frontend sabe que debe reintentar)
      return res.status(204).send();
    }

    // Si hay resultado
    console.log('[WireposController] ✅ Status: DONE - Resultado disponible');
    return res.json({
      success: true,
      transactionId: transactionId,
      status: transaction.status,
      result: transaction.result,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt
    });

  } catch (error) {
    console.error('[WireposController] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * POST /api/wirepos/response
 * 
 * El .exe llamará aquí con la respuesta
 * (O alternativamente, backend hace polling a CheckRequest)
 * 
 * Recibe:
 * {
 *   transactionId: "TXN_123456",
 *   status: "APPROVED",
 *   authCode: "AUTH123",
 *   cardLast4: "1234",
 *   responseCode: "00",
 *   message: "Aprobado"
 * }
 */
async function receiveResponse(req, res) {
  try {
    const { transactionId, status, authCode, cardLast4, responseCode, message } = req.body;

    console.log('[WireposController] 📥 POST /response (.exe respondiendo)');
    console.log('[WireposController] Body:', { transactionId, status, authCode, cardLast4 });

    // Validar que existe la transacción
    if (!transactionId || !transactionStore.has(transactionId)) {
      console.error('[WireposController] ❌ Transacción no encontrada');
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Transacción no existe'
      });
    }

    const transaction = transactionStore.get(transactionId);

    // Actualizar con resultado del .exe
    transaction.status = 'DONE';
    transaction.result = {
      status: status || 'APPROVED',
      authCode: authCode || '',
      cardLast4: cardLast4 || '****',
      responseCode: responseCode || '00',
      message: message || 'Transacción completada'
    };
    transaction.completedAt = new Date().toISOString();

    console.log('[WireposController] ✅ Transacción actualizada con resultado del .exe');
    console.log('[WireposController] 📊 Resultado:', transaction.result);

    res.json({
      success: true,
      message: 'Resultado guardado',
      transactionId
    });

  } catch (error) {
    console.error('[WireposController] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/wirepos/pending
 * 
 * El .exe SIMULADOR consulta este endpoint cada 500ms
 * Retorna array de transacciones PENDING para procesar
 * 
 * Respuesta:
 * {
 *   success: true,
 *   pending: [
 *     {
 *       id: "TXN_123",
 *       transactionId: "TXN_123",
 *       invoiceNumber: "INV001",
 *       amount: 10000,
 *       deviceId: "TERM_001",
 *       transactionType: "V"
 *     }
 *   ]
 * }
 */
function getPending(req, res) {
  try {
    console.log('[WireposController] 🔍 GET /pending (.exe consultando)');
    
    const pending = Array.from(transactionStore.values())
      .filter(t => t.status === 'PENDING')
      .map(t => ({
        id: t.id,
        transactionId: t.id,
        invoiceNumber: t.invoice,
        amount: t.amount,
        deviceId: t.deviceId,
        transactionType: t.transactionType
      }));
    
    console.log('[WireposController] 📊 Total en store:', transactionStore.size);
    console.log('[WireposController] 📋 Transacciones PENDING:', pending.length);
    
    if (pending.length > 0) {
      console.log('[WireposController] ✅ Enviando:', JSON.stringify(pending, null, 2));
    }
    
    res.json({
      success: true,
      pending
    });
  } catch (error) {
    console.error('[WireposController] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      pending: [],
      error: error.message
    });
  }
}

/**
 * GET /api/wirepos/health
 * Health check
 */
function health(req, res) {
  res.json({
    status: 'OK',
    transactionsInMemory: transactionStore.size,
    timestamp: new Date().toISOString()
  });
}

/**
 * GET /api/wirepos/CheckRequest/:transactionId
 * 
 * El .exe consulta este endpoint cada 5 segundos
 * Retorna ResponseString según LARO WirePOS spec:
 * - ResponseString: "" (vacío) = transacción pendiente
 * - ResponseString: "datos" = transacción lista para procesar
 * 
 * Este es el endpoint que el .exe REAL consulta en loop
 */
async function checkRequest(req, res) {
  try {
    const { transactionId } = req.params;

    console.log('[WireposController] 🔍 GET /CheckRequest/:transactionId', transactionId);

    // Buscar en transactionStore
    if (!transactionStore.has(transactionId)) {
      console.log('[WireposController] ❌ Transacción no encontrada');
      return res.status(404).json({
        ResponseString: ''
      });
    }

    const transaction = transactionStore.get(transactionId);

    // Si aún no hay resultado del .exe
    if (!transaction.result || transaction.status === 'PENDING') {
      console.log('[WireposController] ⏳ CheckRequest: Sin resultado aún');
      
      // Retornar datos para que el .exe procese
      // Formato: deviceId|amount|invoice|command
      const responseString = `${transaction.deviceId}|${transaction.amount}|${transaction.invoice}|${transaction.command || 'V'}`;
      
      return res.json({
        ResponseString: responseString,
        status: 'PENDING'
      });
    }

    // Si ya hay resultado (ya procesado)
    console.log('[WireposController] ✅ CheckRequest: Ya procesado');
    
    return res.json({
      ResponseString: '',
      status: 'DONE',
      result: transaction.result
    });

  } catch (error) {
    console.error('[WireposController] ❌ Error:', error.message);
    res.status(500).json({
      ResponseString: '',
      error: error.message
    });
  }
}

/**
 * Polling en background para consultar CheckRequest cada 3 segundos
 * Actualiza SOLO transactionStore (memoria). La BD se actualiza al confirmar factura.
 */
function startPollingCheckRequest(transactionId, deviceId, wireposIdRequest) {
  console.log('[WireposController] ⏰ Iniciando polling para transactionId:', transactionId);
  
  let attempts = 0;
  const maxAttempts = 40; // 40 intentos × 3s = 2 minutos máximo
  
  const intervalId = setInterval(async () => {
    attempts++;
    
    try {
      console.log(`[WireposController] 🔄 Polling CheckRequest (intento ${attempts}/${maxAttempts})`);
      
      const checkResponse = await wireposService.checkRequest(deviceId, wireposIdRequest);
      
      console.log('[WireposController] 📊 CheckRequest response:', checkResponse);
      
      // Si ya tiene resultado (responseString no vacío)
      if (checkResponse.status === 'DONE') {
        console.log('[WireposController] ✅ Transacción completada en LARO');
        
        // Parsear ResponseString para extraer datos
        const responseData = checkResponse.data || {};
        const responseString = checkResponse.responseString || '';
        
        // Parsear responseString: viene con separador ¶ según formato LARO WirePOS
        // Formato: responseCode¶authCode¶cardLast4¶referencia¶cardType¶mensaje¶fecha¶hora¶comercio¶terminal¶invoice¶batchData¶monto¶emvData¶lote...
        const parts = responseString.split('¶');
        const parsedData = {
          responseCode: parts[0] || null,           // Subcampo 0: Código respuesta (00=Aprobado)
          authCode: parts[1] || null,               // Subcampo 1: Código de autorización
          cardLast4: parts[2] || null,              // Subcampo 2: Últimos 4 dígitos tarjeta
          referencia: parts[3] || null,             // Subcampo 3: Número de referencia
          cardType: parts[4] || null,               // Subcampo 4: Nombre de tarjeta (VISA, MASTERCARD)
          mensaje: parts[5] || null,                // Subcampo 5: Mensaje (APROBADA, RECHAZADA)
          fecha: parts[6] || null,                  // Subcampo 6: Fecha (DDMM)
          hora: parts[7] || null,                   // Subcampo 7: Hora (HHMMSS)
          comercio: parts[8] || null,               // Subcampo 8: Número de comercio
          terminal: parts[9] || null,               // Subcampo 9: Número de terminal
          wireposInvoice: parts[10] || null,        // ⭐ Subcampo 10: Invoice generado por WirePOS
          batchData: parts[11] || null,             // Subcampo 11: Datos del lote
          monto: parts[12] || null,                 // Subcampo 12: Monto de la transacción
          emvData: parts[13] || null,               // Subcampo 13: Datos EMV (chip)
          lote: parts[14] || null                   // Subcampo 14: Número de lote
        };
        
        // ✨ Actualizar SOLO transactionStore (memoria)
        const transaction = transactionStore.get(transactionId);
        if (transaction) {
          transaction.status = 'DONE';
          transaction.pollingAttempts = attempts;
          transaction.checkRequestResponse = responseData;
          transaction.result = {
            responseString: checkResponse.responseString,
            approved: checkResponse.approved,
            data: checkResponse.data,
            // Datos parseados del responseString
            responseCode: parsedData.responseCode,
            authCode: parsedData.authCode,
            cardLast4: parsedData.cardLast4,
            referencia: parsedData.referencia,
            cardType: parsedData.cardType,
            mensaje: parsedData.mensaje,
            fecha: parsedData.fecha,
            hora: parsedData.hora,
            comercio: parsedData.comercio,
            terminal: parsedData.terminal,
            wireposInvoice: parsedData.wireposInvoice,  // ⭐ Invoice generado por WirePOS
            batchData: parsedData.batchData,
            monto: parsedData.monto,
            emvData: parsedData.emvData,
            lote: parsedData.lote
          };
          transaction.completedAt = new Date().toISOString();
          
          console.log('[WireposController] 💾 TransactionStore actualizado con resultado');
          console.log('[WireposController] 📝 BD se actualizará cuando se confirme la factura');
        }
        
        // Detener polling
        clearInterval(intervalId);
        return;
      }
      
      // Si llegamos al máximo de intentos
      if (attempts >= maxAttempts) {
        console.log('[WireposController] ⏱️ Timeout: Máximo de intentos alcanzado');
        
        const transaction = transactionStore.get(transactionId);
        if (transaction) {
          transaction.status = 'TIMEOUT';
          transaction.pollingAttempts = attempts;
          transaction.result = {
            error: 'Timeout consultando LARO WirePOS',
            attempts: attempts
          };
          transaction.completedAt = new Date().toISOString();
        }
        
        clearInterval(intervalId);
      }
      
    } catch (error) {
      console.error('[WireposController] ❌ Error en polling CheckRequest:', error.message);
      
      if (attempts >= maxAttempts) {
        const transaction = transactionStore.get(transactionId);
        if (transaction) {
          transaction.status = 'ERROR';
          transaction.result = {
            error: error.message,
            attempts: attempts
          };
          transaction.completedAt = new Date().toISOString();
        }
        
        clearInterval(intervalId);
      }
    }
  }, 3000); // Consultar cada 3 segundos
}

/**
 * Helper para crear registro en BD y asociar factura con transacción WirePOS
 * ⚠️ IMPORTANTE: Llama esta función SOLO cuando la factura se confirme y guarde en BD
 * 
 * Flujo:
 * 1. Usuario hace pago WirePOS → Guarda en memoria
 * 2. Pago aprobado → Frontend muestra confirmación
 * 3. Usuario confirma factura → Se guarda factura en BD
 * 4. Llamas esta función → Se crea registro WireposTransaccion en BD
 * 
 * @param {number} facturaId - ID de la factura creada
 * @param {string} transactionId - ID de la transacción WirePOS
 * @returns {Promise<boolean>}
 */
async function linkFacturaToWirepos(facturaId, transactionId) {
  console.log('[WireposController] 🔗 INICIANDO linkFacturaToWirepos:', { facturaId, transactionId });
  console.log('[WireposController] 📦 TransactionStore tiene', transactionStore.size, 'transacciones en memoria');
  
  try {
    const { Factura } = require('../models');
    
    // 1. Obtener transacción de memoria
    const txInMemory = transactionStore.get(transactionId);
    console.log('[WireposController] 🔍 Transacción en memoria:', txInMemory ? 'ENCONTRADA ✅' : 'NO ENCONTRADA ❌');
    
    if (!txInMemory) {
      console.error('[WireposController] ❌ Transacción no encontrada en memoria:', transactionId);
      console.error('[WireposController] 📋 IDs disponibles en memoria:', Array.from(transactionStore.keys()));
      return false;
    }

    const invoiceWireposId = txInMemory.wireposIdRequest;

    console.log('[WireposController] 📝 Datos de transacción en memoria:', {
      wireposIdRequest: invoiceWireposId,
      status: txInMemory.status,
      deviceId: txInMemory.deviceId,
      amount: txInMemory.amount,
      invoice: txInMemory.invoice,
      wireposInvoice: txInMemory.result?.wireposInvoice,
      responseCode: txInMemory.result?.responseCode,
      authCode: txInMemory.result?.authCode
    });
    
    console.log('[WireposController] 📝 Guardando transacción WirePOS en BD...');

    // 2. Crear registro en WireposTransacciones (¡AHORA SÍ!)
    const dbTransaction = await WireposTransaccion.create({
      transactionId: transactionId,
      invoiceWireposId: invoiceWireposId,
      facturaId: facturaId,
      deviceId: txInMemory.deviceId,
      frontendDeviceId: txInMemory.frontendDeviceId,
      transactionType: txInMemory.transactionType,
      amount: txInMemory.amount,
      invoice: txInMemory.invoice,
      wireposInvoice: txInMemory.result?.wireposInvoice,  // ⭐ Invoice generado por WirePOS (subcampo 10)
      status: txInMemory.status,
      addRequestResponse: txInMemory.addRequestResponse,
      checkRequestResponse: txInMemory.checkRequestResponse,
      responseCode: txInMemory.result?.responseCode,
      responseMessage: txInMemory.result?.mensaje || (txInMemory.result?.approved ? 'Aprobado' : 'Rechazado'),
      authCode: txInMemory.result?.authCode,
      cardLast4: txInMemory.result?.cardLast4,
      cardType: txInMemory.result?.cardType,
      createdAt: new Date(txInMemory.createdAt),
      completedAt: txInMemory.completedAt ? new Date(txInMemory.completedAt) : null,
      pollingAttempts: txInMemory.pollingAttempts || 0,
      errorMessage: txInMemory.result?.error || null,
      environment: txInMemory.environment
    });

    console.log('[WireposController] ✅ Transacción guardada en BD con ID:', dbTransaction.id);
    
    // 3. Actualizar factura con invoiceWireposId
    await Factura.update(
      { 
        invoiceWireposId: invoiceWireposId,
        transactionId: transactionId
      },
      { where: { id: facturaId } }
    );
    
    console.log('[WireposController] ✅ Factura actualizada con invoiceWireposId');
    console.log('[WireposController] 🔗 Vinculación completa:', {
      facturaId,
      transactionId,
      invoiceWireposId,
      dbTransactionId: dbTransaction.id
    });
    
    return true;
  } catch (error) {
    console.error('[WireposController] ❌ Error vinculando factura:', error.message);
    console.error('[WireposController] Stack:', error.stack);
    return false;
  }
}

module.exports = {
  addRequest,
  getStatus,
  getPending,
  checkRequest,
  receiveResponse,
  health,
  linkFacturaToWirepos,  // ✨ Exportar helper
  transactionStore  // Exportar para testing/debugging
};
