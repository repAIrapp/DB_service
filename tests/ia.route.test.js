// tests/ia.route.test.js
const express = require('express');
const request = require('supertest');

// 👉 mock du middleware d’auth pour les routes protégées
jest.mock('../src/middleware/authMiddleware', () => (req, _res, next) => {
  // simule un user authentifié
  req.user = { id: req.headers['x-user-id'] || 'u1' };
  next();
});

// 👉 mock du service appelé par la route
jest.mock('../src/services/iarequestService', () => ({
  createIARequest: jest.fn(),
  getIARequestsByUser: jest.fn(),
  getIARequestById: jest.fn(),
  updateIAResult: jest.fn(),
}));

const svc = require('../src/services/iarequestService');
const iaRouter = require('../src/routes/iaRoute');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/ia', iaRouter);
  return app;
}

test('POST /ia (protégé) → 201 et appelle createIARequest', async () => {
  svc.createIARequest.mockResolvedValue({ _id: 'r1', userId: 'u1', input: 'img.jpg' });
  const app = makeApp();

  const res = await request(app)
    .post('/ia')
    .set('x-user-id', 'u1') // pour notre mock d’auth
    .send({ userId: 'u1', input: 'img.jpg' });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ _id: 'r1', userId: 'u1' });
  expect(svc.createIARequest).toHaveBeenCalledWith({ userId: 'u1', input: 'img.jpg' });
});

test('GET /ia/user/:userId (protégé) → 403 si user différent', async () => {
  const app = makeApp();

  const res = await request(app)
    .get('/ia/user/u-other')
    .set('x-user-id', 'u1');

  expect(res.status).toBe(403);
  expect(res.body).toEqual({ error: 'Accès non autorisé' });
});

test('GET /ia/user/:userId (protégé) → 200 + liste', async () => {
  svc.getIARequestsByUser.mockResolvedValue([{ _id: 'r1' }, { _id: 'r2' }]);
  const app = makeApp();

  const res = await request(app)
    .get('/ia/user/u1')
    .set('x-user-id', 'u1');

  expect(res.status).toBe(200);
  expect(svc.getIARequestsByUser).toHaveBeenCalledWith('u1');
  expect(res.body).toHaveLength(2);
});

test('GET /ia/:id (public) → 404 si non trouvé', async () => {
  svc.getIARequestById.mockResolvedValue(null);
  const app = makeApp();

  const res = await request(app).get('/ia/unknown');

  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: 'Requête IA non trouvée' });
});

test('GET /ia/:id (public) → 200 si trouvé', async () => {
  svc.getIARequestById.mockResolvedValue({ _id: 'r1', userId: 'u1' });
  const app = makeApp();

  const res = await request(app).get('/ia/r1');

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ _id: 'r1' });
});

test('PATCH /ia/:id/result (protégé) → 200 et appelle updateIAResult', async () => {
  svc.updateIAResult.mockResolvedValue({ _id: 'r1', resultIA: 'OK' });
  const app = makeApp();

  const res = await request(app)
    .patch('/ia/r1/result')
    .set('x-user-id', 'u1')
    .send({ resultIA: 'OK' });

  expect(res.status).toBe(200);
  expect(svc.updateIAResult).toHaveBeenCalledWith('r1', 'OK');
  expect(res.body).toMatchObject({ resultIA: 'OK' });
});
