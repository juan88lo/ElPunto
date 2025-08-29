require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Add this import

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
const app = express();

// Configure CORS for Express
app.use(cors({
  origin: true, // Allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight']
}));

app.use('/archivos', express.static(path.join(__dirname, 'generated')));

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
  cors: false, // Disable Apollo CORS since we're using Express CORS
  persistedQueries: false, // Prevent DoS vulnerability
  cache: 'bounded' // Use bounded cache
});

(async () => {
  try {
    // Sincronizar la base de datos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');

    // Iniciar tareas programadas
    require('./tareas/scheduler')({ Caja, Factura, Bitacora });

    // Iniciar Apollo Server y montarlo en Express
    await server.start();
    server.applyMiddleware({ 
      app,
      path: '/graphql',
      cors: false // Disable CORS here as well
    });

    // Crear servidor HTTP
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 3000;
    
    // Listen on all network interfaces
    httpServer.listen({ 
      port: PORT,
      host: '0.0.0.0'
    }, () => {
      console.log(`Servidor GraphQL listo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})();
