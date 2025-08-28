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
} = require('./models');

const schema = require('./graphql/schema');
const verificarPermiso = require('./utils/permisos');

// Configuración CORS
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://elpuntoui-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Permitir solicitudes sin origin (como las herramientas de desarrollo)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
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
    // Sincronizar la base de datos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');

    // Iniciar tareas programadas
    require('./tareas/scheduler')({ Caja, Factura, Bitacora });

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
    console.log(`🚀 Servidor GraphQL listo en http://${HOST}:${PORT}${server.graphqlPath}`);
    console.log(`🌐 CORS habilitado para orígenes permitidos`);
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
