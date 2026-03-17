require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const {
  sequelize,
  Usuario,
  TipoUsuario,
  Permiso,
  TipoUsuarioPermiso,
  Caja,
  Factura,
  Bitacora
} = require('./src/models');

const schema = require('./src/graphql/schema');
const verificarPermiso = require('./src/utils/permisos');
const createPromocionTriggers = require('./config/createPromocionTriggers');
const runAutoMigrations = require('./src/scripts/autoMigrations');

// Configuración CORS
const corsOptions = {
  origin: true, // Permite todos los orígenes
  optionsSuccessStatus: 200, // Para navegadores antiguos
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

// Inicializar Express
const app = express();

// Aplicar middleware CORS
app.use(cors(corsOptions));

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
      verificarPermiso: (permiso) => verificarPermiso(permiso, usuario?.id),
    };
  }
});

// Función principal de inicio
async function startServer() {
  try {
    // Ejecutar migraciones automáticas (idempotencyKey, etc.)
    await runAutoMigrations();
    
    // Sincronizar la base de datos (crea/actualiza tablas según modelos)
    console.log('🔄 Sincronizando modelos con base de datos...');
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados correctamente');
    
    // Crear triggers para promociones (no se pueden crear con Sequelize)
    await createPromocionTriggers();

    // Iniciar tareas programadas
    require('./src/tareas/scheduler')({ Caja, Factura, Bitacora });

    // Iniciar Apollo Server y montarlo en Express
    await server.start();
    server.applyMiddleware({ 
      app,
      cors: false // Desactivamos CORS de Apollo para usar el middleware de Express
    });

    // Crear y configurar servidor HTTP
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 4000;
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    // Iniciar servidor
    await new Promise(resolve => httpServer.listen({ port: PORT, host: HOST }, resolve));
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
