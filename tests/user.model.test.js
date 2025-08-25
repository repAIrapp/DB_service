const { connectTestDB, clearDB, closeTestDB } = require('./setup-db');
const User = require('../src/models/User'); 
const bcrypt = require('bcrypt');

beforeAll(connectTestDB);
afterEach(clearDB);
afterAll(closeTestDB);

test('hash le mot de passe avant save', async () => {
  const u = await User.create({
    first_name: 'Ann',
    last_name: 'Bee',
    email: 'a@b.com',
    password: 'plain',
  });

  expect(u.password).toBeDefined();
  expect(u.password).not.toBe('plain');
  const ok = await bcrypt.compare('plain', u.password);
  expect(ok).toBe(true);
});
