// tests/auth.middleware.test.js
const jwt = require('jsonwebtoken');
const verifyToken = require('../src/middleware/authMiddleware');

jest.mock('jsonwebtoken');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

test('401 quand Authorization manquant ou mal formé', () => {
  const req = { headers: {} };
  const res = makeRes();
  const next = jest.fn();

  verifyToken(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' });
  expect(next).not.toHaveBeenCalled();
});

test('403 quand le token est invalide', () => {
  const req = { headers: { authorization: 'Bearer BAD' } };
  const res = makeRes();
  const next = jest.fn();

  jwt.verify.mockImplementation(() => { throw new Error('invalid'); });

  verifyToken(req, res, next);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide' });
  expect(next).not.toHaveBeenCalled();
});

test('ok quand le token est valide → req.user rempli + next()', () => {
  const req = { headers: { authorization: 'Bearer GOOD' } };
  const res = makeRes();
  const next = jest.fn();

  jwt.verify.mockReturnValue({ id: 'u123', email: 'a@b.com' });

  verifyToken(req, res, next);

  expect(req.user).toEqual({ id: 'u123', email: 'a@b.com' });
  expect(next).toHaveBeenCalled();
});
