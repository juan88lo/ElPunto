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

// Configuración CORS
app.use(cors({
  origin: ['https://elpuntoui-production.up.railway.app', 'http://localhost:3000'], // Agrega aquí todos los orígenes permitidos
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  cors: {
    origin: '*',
    methods: 'GET,POST',
  },
});

(async () => {
  try {
    // Sincronizar la base de datos
    await sequelize.sync({ alter: true });
    console.log(' Base de datos sincronizada');

    // Iniciar tareas programadas
    require('./tareas/scheduler')({ Caja, Factura, Bitacora });

    // Iniciar Apollo Server y montarlo en Express
    await server.start();
    server.applyMiddleware({ 
      app,
      cors: false // Desactivamos CORS de Apollo para usar el middleware de Express
    });

    // Crear servidor HTTP
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 4000;
    httpServer.listen({ port: PORT }, () => {
      console.log(` Servidor GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error(' Error al iniciar el servidor:', error);
  }
})();
