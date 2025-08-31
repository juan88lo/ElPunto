const request = require('supertest');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const jwt = require('jsonwebtoken');
const schema = require('../../src/graphql/schema');
const { sequelize } = require('../../src/models');

let server, app;
beforeAll(async () => {
  await sequelize.sync({ force: true });
  app = express();
  server = new ApolloServer({
    schema,
    // Provide a dummy authenticated user and allow all permissions
    context: () => ({ usuario: { id: 1 }, verificarPermiso: () => true })
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
});
afterAll(async () => {
  await sequelize.close();
  await server.stop();
});

describe('GraphQL Schema', () => {
  test('should return empty users list', async () => {
    const query = '{ usuarios { id nombre } }';
    const response = await request(app)
      .post('/graphql')
      .send({ query });
    expect(response.status).toBe(200);
    expect(response.body.data.usuarios).toEqual([]);
  });
});
