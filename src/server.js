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
const app = express();

// Middleware de CORS más específico
app.use(cors({
  origin: ['http://localhost:5173', 'https://elpuntoui-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: true
}));

app.use('/archivos', express.static(path.join(__dirname, 'generated')));

// Middleware para manejar preflight OPTIONS
app.options('*', cors());

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
        console.error('Error de token:', err.message);
      }
    }

    return {
      usuario,
      verificarPermiso: (permiso) => verificarPermiso(permiso, usuario?.id),
    };
  },
  cors: false,
  persistedQueries: false,
  cache: 'bounded',
  playground: true, // Habilita el playground en producción
  introspection: true // Permite introspection en producción
});

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');

    await server.start();
    
    server.applyMiddleware({ 
      app,
      path: '/graphql',
      cors: false
    });

    const httpServer = createServer(app);
    const PORT = process.env.PORT || 3000;
    
    httpServer.listen({ 
      port: PORT,
      host: '0.0.0.0'
    }, () => {
      console.log(`Servidor GraphQL listo en http://0.0.0.0:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})();
