require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const {
  sequelize,
  Usuario,
  TipoUsuario,
  Permiso,
  TipoUsuarioPermiso,
  Caja,
  Factura,
  Bitacora
} = require('./models');

const schema = require('./graphql/schema');
const verificarPermiso = require('../src/utils/permisos');
const path = require('path');
const cors = require('cors');
const app = express();

// ✨ Middleware para parsear JSON y CORS (IMPORTANTE para WirePOS)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/archivos', express.static(path.join(__dirname, 'generated')));

// ✨ Importar rutas adicionales para WirePOS
const wirePosRoutes = require('./routes/wirepos');

// ✨ Transaction store compartido (exportado para GraphQL)
let wirePosTransactionStore = new Map();

// ✨ Funciones de utilidad para acceder al store desde GraphQL
function getWirePosTransaction(requestId) {
  return wirePosTransactionStore.get(requestId);
}

function addWirePosTransaction(requestId, transaction) {
  wirePosTransactionStore.set(requestId, transaction);
  return transaction;
}

function updateWirePosTransaction(requestId, updates) {
  const transaction = wirePosTransactionStore.get(requestId);
  if (!transaction) return null;
  Object.assign(transaction, updates);
  wirePosTransactionStore.set(requestId, transaction);
  return transaction;
}

function getPendingWirePosTransactions() {
  return Array.from(wirePosTransactionStore.values())
    .filter(t => t.status === 'PENDING');
}

// Exportar funciones para uso en GraphQL
module.exports.getWirePosTransaction = getWirePosTransaction;
module.exports.addWirePosTransaction = addWirePosTransaction;
module.exports.updateWirePosTransaction = updateWirePosTransaction;
module.exports.getPendingWirePosTransactions = getPendingWirePosTransactions;

// ✨ Iniciar WirePOS Intermediario en puerto 8765
const initWirePosServer = () => {
  try {
    const express2 = require('express');
    const wirePosApp = express2();
    const WIREPOS_PORT = 8765;

    wirePosApp.use(express2.json());
    wirePosApp.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    // Usar el store compartido en lugar de uno local
    const transactionStore = wirePosTransactionStore;

    // GET / - Health check raíz (para verificar que está activo)
    wirePosApp.get('/', (req, res) => {
      res.json({ 
        status: 'OK',
        service: 'WirePOS Intermediario',
        port: WIREPOS_PORT,
        transactionsInMemory: transactionStore.size
      });
    });

    // GET /wirepos/pending
    wirePosApp.get('/wirepos/pending', (req, res) => {
      console.log('\n[8765] 🔍 GET /wirepos/pending (.exe consultando)');
      
      const pending = Array.from(transactionStore.values())
        .filter(t => t.status === 'PENDING')
        .map(t => ({
          id: t.id,                          // El simulador usa este campo
          transactionId: t.id,               // Compatibilidad con código viejo
          invoiceNumber: t.invoiceNumber,
          amount: t.amount,
          deviceId: t.deviceId,
          transactionType: t.transactionType
        }));
      
      console.log('[8765] Total en almacén:', transactionStore.size);
      console.log('[8765] Transacciones PENDING:', pending.length);
      if (pending.length > 0) {
        console.log('[8765] ✅ Enviando:', JSON.stringify(pending, null, 2));
      }
      
      res.json({ success: true, pending });
    });

    // POST /wirepos/request
    // Formato del frontend: { id, command, params, timestamp, callbackUrl }
    // params = "V|DEV_TERM_001|200|TEMP_1764554408166_tyzw2wi9zk"
    wirePosApp.post('/wirepos/request', (req, res) => {
      console.log('\n[8765] 📥 POST /wirepos/request');
      console.log('[8765] Headers:', req.headers);
      console.log('[8765] Body completo:', req.body);
      console.log('[8765] Body (JSON):', JSON.stringify(req.body, null, 2));

      const { id, command, params, timestamp, callbackUrl } = req.body;
      
      // Validar que llegue params
      if (!params) {
        console.log('[8765] ❌ VALIDACIÓN FALLIDA - Falta campo params');
        return res.status(400).json({ 
          success: false, 
          error: 'Falta campo params'
        });
      }

      // Parsear params: "V|DEV_TERM_001|200|TEMP_1764554408166_tyzw2wi9zk"
      const partsArray = params.split('|');
      console.log('[8765] 🔍 Params divididos por |:', partsArray);

      if (partsArray.length < 4) {
        console.log('[8765] ❌ VALIDACIÓN FALLIDA - Formato params inválido');
        return res.status(400).json({ 
          success: false, 
          error: 'Formato params inválido. Esperado: transactionType|deviceId|amount|invoiceNumber',
          received: params
        });
      }

      const transactionType = partsArray[0];  // "V"
      const deviceId = partsArray[1];         // "DEV_TERM_001"
      const amount = parseFloat(partsArray[2]); // "200"
      const invoiceNumber = partsArray[3];    // "TEMP_1764554408166_tyzw2wi9zk"

      console.log('[8765] ✅ Parámetros extraídos:');
      console.log('[8765]   - transactionType:', transactionType);
      console.log('[8765]   - deviceId:', deviceId);
      console.log('[8765]   - amount:', amount);
      console.log('[8765]   - invoiceNumber:', invoiceNumber);

      if (!transactionType || !deviceId || isNaN(amount) || !invoiceNumber) {
        console.log('[8765] ❌ VALIDACIÓN FALLIDA - Valores inválidos');
        return res.status(400).json({ 
          success: false, 
          error: 'Valores inválidos en params',
          received: { transactionType, deviceId, amount, invoiceNumber }
        });
      }

      const transactionId = id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('[8765] ✅ Creando transacción:', transactionId);

      transactionStore.set(transactionId, {
        id: transactionId,
        transactionType,
        invoiceNumber,
        amount: amount,
        deviceId: deviceId,
        command,
        callbackUrl,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        result: null
      });

      console.log('[8765] ✅ Transacción almacenada:', transactionStore.get(transactionId));
      
      // 📝 Guardar solicitud en archivo para que .exe la lea
      // El .exe puede consultar C:\AuthorPos\request.json periódicamente
      try {
        const fs = require('fs');
        const path = require('path');
        const requestFilePath = path.join('C:\\AuthorPos', 'request.json');
        fs.writeFileSync(requestFilePath, JSON.stringify({
          id: transactionId,
          transactionType,
          deviceId,
          amount,
          invoiceNumber,
          timestamp: new Date().toISOString()
        }, null, 2));
        console.log('[8765] 💾 Solicitud guardada en:', requestFilePath);
      } catch (err) {
        console.warn('[8765] ⚠️  No se pudo guardar archivo de solicitud:', err.message);
      }
      
      // 📝 RESPONDER AL FRONTEND con el transactionId
      // El frontend debe ahora hacer polling a /wirepos/status/:id hasta que result !== null
      const response = {
        success: true,
        transactionId: transactionId,
        status: 'PENDING',
        message: 'Transacción creada. El .exe consultará cada 1-2 segundos. Espera resultado...',
        pollUrl: `http://localhost:8765/wirepos/status/${transactionId}`
      };
      
      console.log('[8765] 📤 Respuesta al frontend:', response);
      res.json(response);
    });

    // POST /wirepos/response
    wirePosApp.post('/wirepos/response', (req, res) => {
      console.log('\n[8765] 📤 POST /wirepos/response (.exe respondiendo)');
      console.log('[8765] Body:', JSON.stringify(req.body, null, 2));

      const { transactionId, status, authCode, cardLast4, responseCode, message } = req.body;

      if (!transactionId || !transactionStore.has(transactionId)) {
        console.log('[8765] ❌ Transacción no encontrada:', transactionId);
        return res.status(404).json({ success: false, error: 'Transacción no encontrada' });
      }

      const transaction = transactionStore.get(transactionId);
      transaction.status = 'DONE';
      transaction.result = { status, authCode, cardLast4, responseCode, message };
      transaction.completedAt = new Date().toISOString();

      console.log('[8765] ✅ Resultado guardado:', { status, authCode, cardLast4 });

      res.json({ success: true, message: 'Resultado guardado' });
    });

    // GET /wirepos/status/:id
    wirePosApp.get('/wirepos/status/:id', (req, res) => {
      const { id } = req.params;
      console.log('\n[8765] 🔍 GET /wirepos/status/:id', id);

      if (!transactionStore.has(id)) {
        console.log('[8765] ❌ No encontrada');
        return res.status(404).json({ 
          success: false, 
          error: 'Transacción no existe',
          transactionId: id
        });
      }

      const transaction = transactionStore.get(id);
      
      // Si aún no hay resultado, devolver PENDING
      if (transaction.status === 'PENDING' || !transaction.result) {
        console.log('[8765] ⏳ Status: PENDING - Esperando respuesta del .exe');
        return res.json({
          success: true,
          transactionId: id,
          invoiceNumber: transaction.invoiceNumber,
          amount: transaction.amount,
          status: 'PENDING',
          result: null,
          message: 'Transacción pendiente. El .exe aún está procesándola. Reintenta en 1-2 segundos.',
          createdAt: transaction.createdAt
        });
      }

      // Si hay resultado, devolver DONE
      console.log('[8765] ✅ Status: DONE - Resultado disponible');
      res.json({
        success: true,
        transactionId: id,
        invoiceNumber: transaction.invoiceNumber,
        amount: transaction.amount,
        status: 'DONE',
        result: transaction.result,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt
      });
    });

    // GET /wirepos/simulate-exe/:id
    // SOLO PARA TESTING: Simula que el .exe completó la transacción
    // El .exe real leería C:\AuthorPos\request.json, procesaría, y llamaría a /wirepos/response
    wirePosApp.get('/wirepos/simulate-exe/:id', (req, res) => {
      const { id } = req.params;
      console.log('\n[8765] 🎭 GET /wirepos/simulate-exe/:id (SIMULACIÓN) ', id);

      if (!transactionStore.has(id)) {
        console.log('[8765] ❌ Transacción no encontrada');
        return res.status(404).json({ success: false, error: 'Transacción no existe' });
      }

      const transaction = transactionStore.get(id);
      
      // Simular procesamiento
      setTimeout(() => {
        const authCode = 'AUTH' + Math.floor(Math.random() * 9000 + 1000);
        
        console.log('[8765] 🎭 [SIMULACIÓN] Completando transacción con:', authCode);
        
        transaction.status = 'DONE';
        transaction.result = {
          status: 'APPROVED',
          authCode: authCode,
          cardLast4: '1234',
          responseCode: '00',
          message: 'Transacción aprobada (SIMULADA)'
        };
        transaction.completedAt = new Date().toISOString();
      }, 2000); // Simular 2 segundos de procesamiento

      res.json({ 
        success: true, 
        message: 'Simulación iniciada - espera 2 segundos',
        transactionId: id
      });
    });

    // GET /wirepos/health
    wirePosApp.get('/wirepos/health', (req, res) => {
      res.json({ status: 'OK', port: WIREPOS_PORT, transactionsInMemory: transactionStore.size });
    });

    wirePosApp.listen(WIREPOS_PORT, () => {
      console.log(`\n✅ WirePOS Intermediario activo en http://localhost:${WIREPOS_PORT}\n`);
    });
  } catch (error) {
    console.error('Error iniciando WirePOS:', error.message);
  }
};

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let usuario = null;

    if (token) {
      try {
        usuario = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        // token inválido
      }
    }

    return {
      usuario,
      verificarPermiso: (permiso) =>
        verificarPermiso(permiso, usuario?.id),
    };
  },
  cors: {
    origin: '*',
    methods: 'GET,POST',
  },
});

(async () => {
  try {
    // ✨ Iniciar WirePOS Intermediario en puerto 8765
    initWirePosServer();

    // Sincronizar la base de datos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');

    // Iniciar tareas programadas
    require('./tareas/scheduler')({ Caja, Factura, Bitacora });

    // Iniciar Apollo Server y montarlo en Express
    await server.start();
    server.applyMiddleware({ app });

    // ✨ Registrar rutas REST para WirePOS
    app.use('/api/wirepos', wirePosRoutes);

    // Crear servidor HTTP
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 4000;
    httpServer.listen({ port: PORT }, () => {
      console.log(`Servidor GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})();