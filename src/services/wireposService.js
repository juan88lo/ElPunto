/**
 * WirePOS Service - Llama API REAL de WirePOS
 * 
 * Responsabilidad ÚNICA: Hacer HTTP calls a WirePOS Azure
 * No toca .exe, no maneja estado, solo axios requests
 * 
 * Endpoints reales (Site 2 - PROD):
 * https://larosolutions.net/CoolPoint/WCFRequest/MOBILE.COOLPOINT.REQUEST.CoolPointRequest.svc/json
 */

const axios = require('axios');

// ✨ Configuración de ambientes
const WIREPOS_URLS = {
  DEV: 'https://laro-solution-dev.azurewebsites.net/CoolPoint/WCFRequest/MOBILE.COOLPOINT.REQUEST.CoolPointRequest.svc/json',
  STAGING: 'https://laro-solution-staging.azurewebsites.net/CoolPoint/WCFRequest/MOBILE.COOLPOINT.REQUEST.CoolPointRequest.svc/json',
  PROD: 'https://larosolutions.net/CoolPoint/WCFRequest/MOBILE.COOLPOINT.REQUEST.CoolPointRequest.svc/json'
};

const AMBIENTE = process.env.WIREPOS_ENVIRONMENT || 'DEV';
const BASE_URL = WIREPOS_URLS[AMBIENTE];
const WIREPOS_DEVICE_ID = process.env.WIREPOS_DEVICE_ID || '2084';

console.log(`[WireposService] 🔧 Inicializado con AMBIENTE=${AMBIENTE}, URL=${BASE_URL}`);
console.log(`[WireposService] 🔧 DeviceID: ${WIREPOS_DEVICE_ID}`);

/**
 * Crea cliente axios con timeout y headers
 */
function createWireposClient() {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

/**
 * POST AddRequest - Inicia una transacción en WirePOS
 * 
 * @param {string} deviceId - ID del terminal (ej: "2084")
 * @param {number} amount - Monto (ej: 12.50)
 * @param {string} invoice - Número de factura (ej: "155055")
 * @param {string} idTransaction - ID único de transacción (ej: "1")
 * @param {string} command - Comando (default: "V" = Venta)
 * 
 * @returns {Promise<Object>} Respuesta de WirePOS con idRequest
 */
async function addRequest(deviceId, amount, invoice, idTransaction, command = 'V') {
  try {
    console.log('[WireposService] 📤 AddRequest:', {
      deviceId,
      amount,
      invoice,
      idTransaction,
      command
    });

    const client = createWireposClient();
    
    // Formato correcto según tu curl:
    // URL: /AddRequest/{deviceId}
    // Headers: Amount, Invoice, Command, IDTransaction
    // Body: deviceId (como string)
    
    const headers = {
      'Content-Type': 'application/json',
      'Amount': amount.toString(),
      'Invoice': invoice,
      'Command': command,
      'IDTransaction': idTransaction.toString()
    };

    console.log('[WireposService] 📮 Enviando a /AddRequest/' + deviceId);
    console.log('[WireposService] 📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('[WireposService] 📦 Body:', deviceId);

    // Llamar endpoint AddRequest con formato correcto
    const response = await client.post(`/AddRequest/${deviceId}`, deviceId, {
      headers
    });

    console.log('[WireposService] ✅ Respuesta AddRequest:', JSON.stringify(response.data, null, 2));

    // La respuesta contiene IDRequest
    return {
      success: true,
      idRequest: response.data.IDRequest || response.data.idRequest,
      status: 'PENDING',
      code: '00',
      message: 'Solicitud enviada a WirePOS',
      data: response.data
    };

  } catch (error) {
    console.error('[WireposService] ❌ Error en AddRequest:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });

    throw {
      success: false,
      code: 'WIREPOS_ADD_REQUEST_FAILED',
      message: error.response?.data?.message || error.message || 'Error en AddRequest',
      httpStatus: error.response?.status || 500,
      details: process.env.NODE_ENV === 'development' ? {
        errorMessage: error.message,
        wireposResponse: error.response?.data,
        requestUrl: error.config?.url,
        ambiente: AMBIENTE
      } : undefined
    };
  }
}

/**
 * POST CheckRequest - Consulta estado de una transacción
 * 
 * @param {string} deviceId - ID del terminal (ej: "2084")
 * @param {string} idRequest - ID retornado por AddRequest (ej: "C5F90E07E13B4C91BF4F18D6D2A3C646")
 * 
 * @returns {Promise<Object>} Estado de la transacción
 */
async function checkRequest(deviceId, idRequest) {
  try {
    console.log('[WireposService] 🔍 CheckRequest:', {
      deviceId,
      idRequest
    });

    const client = createWireposClient();
    
    // Formato correcto según tu curl:
    // URL: /CheckRequest/{deviceId}
    // Header: IDRequest
    // Body: { "IDRequest": "..." }
    
    const headers = {
      'Content-Type': 'application/json',
      'IDRequest': idRequest
    };

    const body = {
      IDRequest: idRequest
    };

    console.log('[WireposService] 📮 Enviando a /CheckRequest/' + deviceId);
    console.log('[WireposService] 📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('[WireposService] 📦 Body:', JSON.stringify(body, null, 2));

    // Llamar endpoint CheckRequest con formato correcto
    const response = await client.post(`/CheckRequest/${deviceId}`, body, {
      headers
    });

    console.log('[WireposService] ✅ Respuesta CheckRequest:', JSON.stringify(response.data, null, 2));

    // Parsear respuesta
    const responseString = response.data.ResponseString || response.data.responseString || '';
    const isPending = responseString === '' || responseString === '01';

    return {
      success: true,
      idRequest: idRequest,
      status: isPending ? 'PENDING' : 'DONE',
      responseString: responseString,
      approved: responseString.startsWith('00'),
      data: response.data
    };

  } catch (error) {
    console.error('[WireposService] ❌ Error en CheckRequest:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });

    throw {
      success: false,
      code: 'WIREPOS_CHECK_REQUEST_FAILED',
      message: error.response?.data?.message || error.message || 'Error en CheckRequest',
      httpStatus: error.response?.status || 500,
      details: process.env.NODE_ENV === 'development' ? {
        errorMessage: error.message,
        wireposResponse: error.response?.data,
        requestUrl: error.config?.url,
        ambiente: AMBIENTE
      } : undefined
    };
  }
}

module.exports = {
  addRequest,
  checkRequest,
  AMBIENTE,
  BASE_URL
};
