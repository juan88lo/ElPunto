require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// Inicializar Express
const app = express();

// Configuración CORS - Permite todos los orígenes en producción
const corsOptions = {
  origin: true, // Permite todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

// Aplicar middleware CORS antes de cualquier otra cosa
app.use(cors(corsOptions));

// Health check endpoint para Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Servir archivos estáticos
app.use('/archivos', express.static(path.join(__dirname, 'generated')));

// Configurar Apollo Server
const server = new ApolloServer({
  schema,
  cache: 'bounded',
  persistedQueries: false,
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
  }
});

(async () => {
  try {
    // Iniciar Apollo Server primero
    await server.start();
    server.applyMiddleware({ 
      app,
      cors: false // Desactivar CORS de Apollo porque ya está configurado en Express
    });

    // Crear servidor HTTP
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 4000;
    const HOST = '0.0.0.0';
    
    // Iniciar servidor PRIMERO - Railway necesita esto rápido
    await new Promise((resolve, reject) => {
      httpServer.listen({ port: PORT, host: HOST }, () => {
        console.log(`🚀 Servidor HTTP escuchando en ${HOST}:${PORT}`);
        console.log(`📡 GraphQL endpoint: http://${HOST}:${PORT}${server.graphqlPath}`);
        resolve();
      }).on('error', (err) => {
        console.error('❌ Error al iniciar servidor:', err);
        reject(err);
      });
    });

    // DESPUÉS sincronizar base de datos en background (no bloquear el inicio)
    console.log('🔄 Sincronizando modelos con base de datos...');
    sequelize.sync({ alter: false }).then(async () => {
      console.log('✅ Base de datos sincronizada');
      
      // Crear triggers para promociones
      const createPromocionTriggers = require('../config/createPromocionTriggers');
      await createPromocionTriggers();
      
      // Iniciar tareas programadas
      require('./tareas/scheduler')({ Caja, Factura, Bitacora });
      
      console.log('✅ Sistema completamente inicializado');
    }).catch(err => {
      console.error('⚠️ Error al sincronizar base de datos:', err);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
})();