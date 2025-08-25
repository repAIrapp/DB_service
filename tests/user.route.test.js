const request = require('supertest');
const { connectTestDB, clearDB, closeTestDB } = require('./setup-db');
const {app} = require('../app');

// ---- Mock axios pour ne PAS faire d’appel réseau lors de l’envoi de l’email
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
}));

// ---- Mock du middleware d’auth: on met req.user.id depuis l’en-tête x-user-id (ou 'aaa' par défaut)
jest.mock('../src/middleware/authMiddleware', () => (req, _res, next) => {
  const hdr = req.headers['x-user-id'];
  req.user = { id: hdr || 'aaa' };
  next();
});

const axios = require('axios');

beforeAll(connectTestDB);
afterEach(async () => {
  jest.clearAllMocks();
  await clearDB();
});
afterAll(closeTestDB);

const base = '/api/users';

test('POST /api/users crée un user local et envoie un email de confirmation', async () => {
  const res = await request(app)
    .post(base)
    .send({
      first_name: 'Ann',
      last_name: 'Bee',
      email: 'a@b.com',
      password: 'secret',
    });
console.log(" RES BODY:", res.body);  

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('_id');
  expect(res.body.email).toBe('a@b.com');
  expect(res.body.authType).toBe('local');
  expect(res.body.emailVerified).toBe(false);

  // email de confirmation appelé
  expect(axios.post).toHaveBeenCalledTimes(1);
  const [url, payload] = axios.post.mock.calls[0];
  expect(url).toMatch(/\/api\/email\/confirmation$/);
  expect(payload.email).toBe('a@b.com');
  expect(String(payload.confirmationLink)).toMatch(/\/verify\?userId=/);
});

test('POST /api/users/oauth crée un user OAuth si inconnu', async () => {
  const res = await request(app)
    .post(`${base}/oauth`)
    .send({
      email: 'o@o.com',
      first_name: 'O',
      last_name: 'Auth',
      oauthProvider: 'google',
    });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('_id');
  expect(res.body.authType).toBe('oauth');
  expect(res.body.oauthProvider).toBe('google');
  expect(res.body.emailVerified).toBe(true);
});

test('POST /api/users/oauth renvoie 200 si déjà existant', async () => {
  // 1ère fois -> crée
  await request(app)
    .post(`${base}/oauth`)
    .send({
      email: 'o2@o.com',
      first_name: 'O',
      last_name: 'Auth',
      oauthProvider: 'google',
    });

  // 2ème fois -> existant
  const res = await request(app)
    .post(`${base}/oauth`)
    .send({
      email: 'o2@o.com',
      first_name: 'O',
      last_name: 'Auth',
      oauthProvider: 'google',
    });

  expect(res.status).toBe(200);
  expect(res.body.email).toBe('o2@o.com');
});

test('GET /api/users/by-email trouve l’utilisateur', async () => {
  await request(app).post(base).send({
    first_name: 'Ann',
    last_name: 'Bee',
    email: 'find@me.com',
    password: 'supersecret',
  });

  const ok = await request(app).get(`${base}/by-email`).query({ email: 'find@me.com' });
  expect(ok.status).toBe(200);
  expect(ok.body.email).toBe('find@me.com');

  const not = await request(app).get(`${base}/by-email`).query({ email: 'none@x.com' });
  expect(not.status).toBe(404);
});

test('GET /api/users/:id -> 403 si x-user-id ≠ id', async () => {
  const created = await request(app).post(base).send({
    first_name: 'Ann',
    last_name: 'Bee',
    email: 'f@f.com',
    password: 'strongpass',
  });
  const id = created.body._id;

  const res = await request(app).get(`${base}/${id}`).set('x-user-id', 'different');
  expect(res.status).toBe(403);
});

test('GET /api/users/:id -> 200 si x-user-id = id', async () => {
  const created = await request(app).post(base).send({
    first_name: 'Ann',
    last_name: 'Bee',
    email: 'g@g.com',
    password: 'strongpass',
  });
  const id = created.body._id;

  const res = await request(app).get(`${base}/${id}`).set('x-user-id', id);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(id);
});

test('PATCH /api/users/:id/preferences met à jour (protégé)', async () => {
  const created = await request(app).post(base).send({
    first_name: 'Pref',
    last_name: 'User',
    email: 'p@p.com',
    password: 'strongpass',
  });
  const id = created.body._id;

  const res = await request(app)
    .patch(`${base}/${id}/preferences`)
    .set('x-user-id', id)
    .send({ notificationsActivated: false });

  expect(res.status).toBe(200);
  expect(res.body.preferences.notificationsActivated).toBe(false);
});

test('PATCH /api/users/subscription/:userId met à jour abonnement', async () => {
  const created = await request(app).post(base).send({
    first_name: 'Sub',
    last_name: 'User',
    email: 'sub@u.com',
    password: 'strongpass',
  });
  const id = created.body._id;

  const res = await request(app)
    .patch(`${base}/subscription/${id}`)
    .send({
      type: 'premium',
      status: 'active',
      date_start: '2025-01-01',
      date_end: '2026-01-01',
    });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'Abonnement mis à jour');
  expect(res.body.subscription.type).toBe('premium');
  expect(res.body.subscription.status).toBe('active');
});

test('PATCH /api/users/:id/verify-email bascule emailVerified=true', async () => {
  const created = await request(app).post(base).send({
    first_name: 'Verify',
    last_name: 'Me',
    email: 'ver@me.com',
    password: 'strongpass',
  });
  const id = created.body._id;

  const res = await request(app).patch(`${base}/${id}/verify-email`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message');

  // relecture
  const get = await request(app).get(`${base}/${id}`).set('x-user-id', id);
  expect(get.status).toBe(200);
  expect(get.body.emailVerified).toBe(true);
});
