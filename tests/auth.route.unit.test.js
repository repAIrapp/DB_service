
// const authRouter = require('../src/routes/authRoute')

// // Mocks des dépendances
// jest.mock('../src/services/userService', () => ({
//   getUserByEmail: jest.fn(),
//   createUser: jest.fn(),
// }))
// jest.mock('../src/utils/jwt', () => ({
//   generateToken: jest.fn(),
// }))
// jest.mock('axios', () => ({ post: jest.fn() }))
// jest.mock('bcrypt', () => ({ compare: jest.fn() }))

// const { getUserByEmail, createUser } = require('../src/services/userService')
// const { generateToken } = require('../src/utils/jwt')
// const axios = require('axios')
// const bcrypt = require('bcrypt')

// // helpers pour extraire un handler et mocker req/res
// function getHandler(router, method, path) {
//   const layer = router.stack.find(
//     (l) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()]
//   )
//   if (!layer) throw new Error(`Handler ${method} ${path} introuvable`)
//   // Si plusieurs middlewares (ex: verifyToken, handler), on prend le dernier (= le vrai handler)
//   const stack = layer.route.stack
//   return stack[stack.length - 1].handle
// }

// function mockRes() {
//   const res = {}
//   res.status = jest.fn(() => res)
//   res.json = jest.fn(() => res)
//   res.send = jest.fn(() => res)
//   return res
// }

// describe('unit routes/authRoute', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   describe('POST /signup', () => {
//     test('local: crée user, envoie email, renvoie token', async () => {
//       const handler = getHandler(authRouter, 'post', '/signup')

//       getUserByEmail.mockResolvedValue(null)
//       createUser.mockResolvedValue({ _id: 'u1', email: 'a@b.com' })
//       axios.post.mockResolvedValue({ status: 200 })
//       generateToken.mockReturnValue('jwt.local.token')

//       const req = {
//         body: {
//           email: 'a@b.com',
//           password: 'secret',
//           first_name: 'Ann',
//           last_name: 'Bee',
//           authType: 'local',
//         },
//       }
//       const res = mockRes()

//       await handler(req, res)

//       expect(getUserByEmail).toHaveBeenCalledWith('a@b.com')
//       expect(createUser).toHaveBeenCalledWith(
//         expect.objectContaining({
//           email: 'a@b.com',
//           password: 'secret',
//           first_name: 'Ann',
//           last_name: 'Bee',
//           authType: 'local',
//           emailVerified: false,
//         })
//       )
//       expect(axios.post).toHaveBeenCalledTimes(1)
//       const [url, payload] = axios.post.mock.calls[0]
//       expect(url).toMatch(/\/api\/email\/confirmation$/)
//       expect(String(payload.confirmationLink)).toMatch(/\/verify\?userId=u1/)
//       expect(generateToken).toHaveBeenCalledWith({ _id: 'u1', email: 'a@b.com' })
//       expect(res.status).toHaveBeenCalledWith(201)
//       expect(res.json).toHaveBeenCalledWith({ token: 'jwt.local.token' })
//     })

//     test('oauth: crée user et renvoie token (pas d’email)', async () => {
//       const handler = getHandler(authRouter, 'post', '/signup')

//       getUserByEmail.mockResolvedValue(null)
//       createUser.mockResolvedValue({ _id: 'u2', email: 'o@o.com' })
//       generateToken.mockReturnValue('jwt.oauth.token')

//       const req = {
//         body: {
//           email: 'o@o.com',
//           first_name: 'O',
//           last_name: 'Auth',
//           authType: 'oauth',
//           oauthProvider: 'google',
//         },
//       }
//       const res = mockRes()

//       await handler(req, res)

//       expect(axios.post).not.toHaveBeenCalled()
//       expect(generateToken).toHaveBeenCalled()
//       expect(res.status).toHaveBeenCalledWith(201)
//       expect(res.json).toHaveBeenCalledWith({ token: 'jwt.oauth.token' })
//     })

//     test('400 si champs requis manquants', async () => {
//       const handler = getHandler(authRouter, 'post', '/signup')

//       const req = { body: { email: 'x@x.com' } }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(400)
//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
//     })

//     test('400 si email déjà utilisé', async () => {
//       const handler = getHandler(authRouter, 'post', '/signup')

//       getUserByEmail.mockResolvedValue({ _id: 'exists' })

//       const req = {
//         body: {
//           email: 'a@b.com',
//           password: 'secret',
//           first_name: 'Ann',
//           last_name: 'Bee',
//           authType: 'local',
//         },
//       }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(400)
//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
//     })

//     test('400 si local sans mot de passe', async () => {
//       const handler = getHandler(authRouter, 'post', '/signup')

//       getUserByEmail.mockResolvedValue(null)
//       const req = {
//         body: {
//           email: 'a@b.com',
//           first_name: 'Ann',
//           last_name: 'Bee',
//           authType: 'local',
//         },
//       }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(400)
//     })
//   })

//   describe('POST /login', () => {
//     test('local OK si password correct', async () => {
//       const handler = getHandler(authRouter, 'post', '/login')

//       const user = { _id: 'u3', email: 'l@l.com', authType: 'local', password: 'hashed' }
//       getUserByEmail.mockResolvedValue(user)
//       bcrypt.compare.mockResolvedValue(true)
//       generateToken.mockReturnValue('jwt.login.local')

//       const req = { body: { email: 'l@l.com', password: 'secret', authType: 'local' } }
//       const res = mockRes()

//       await handler(req, res)

//       expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed')
//       expect(res.json).toHaveBeenCalledWith({ token: 'jwt.login.local' })
//     })

//     test('local 401 si mauvais password', async () => {
//       const handler = getHandler(authRouter, 'post', '/login')

//       getUserByEmail.mockResolvedValue({ _id: 'u', email: 'l@l.com', authType: 'local', password: 'h' })
//       bcrypt.compare.mockResolvedValue(false)

//       const req = { body: { email: 'l@l.com', password: 'nope', authType: 'local' } }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(401)
//     })

//     test('oauth: renvoie token', async () => {
//       const handler = getHandler(authRouter, 'post', '/login')

//       getUserByEmail.mockResolvedValue({ _id: 'u5', email: 'o@o.com', authType: 'oauth' })
//       generateToken.mockReturnValue('jwt.login.oauth')

//       const req = { body: { email: 'o@o.com', authType: 'oauth' } }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.json).toHaveBeenCalledWith({ token: 'jwt.login.oauth' })
//     })

//     test('400 si champs manquants', async () => {
//       const handler = getHandler(authRouter, 'post', '/login')
//       const req = { body: {} }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(400)
//     })

//     test('401 si user non trouvé / type incorrect', async () => {
//       const handler = getHandler(authRouter, 'post', '/login')
//       getUserByEmail.mockResolvedValue(null)

//       const req = { body: { email: 'x@x.com', authType: 'local', password: 's' } }
//       const res = mockRes()

//       await handler(req, res)

//       expect(res.status).toHaveBeenCalledWith(401)
//     })
//   })
// })






const request = require('supertest')
const express = require('express')
const authRouter = require('../src/routes/authRoute')

// Mocks des dépendances
jest.mock('../src/services/userService', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
}))
jest.mock('../src/utils/jwt', () => ({
  generateToken: jest.fn(),
}))
jest.mock('axios', () => ({ post: jest.fn() }))
jest.mock('bcrypt', () => ({ compare: jest.fn() }))

const { getUserByEmail, createUser } = require('../src/services/userService')
const { generateToken } = require('../src/utils/jwt')
const axios = require('axios')
const bcrypt = require('bcrypt')

// helpers pour extraire un handler et mocker req/res (utilisés pour /login uniquement)
function getHandler(router, method, path) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()]
  )
  if (!layer) throw new Error(`Handler ${method} ${path} introuvable`)
  const stack = layer.route.stack
  return stack[stack.length - 1].handle
}
function mockRes() {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  res.send = jest.fn(() => res)
  return res
}

// fabrique une app express réelle pour faire tourner les middlewares de validation
function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/', authRouter)
  return app
}

describe('unit routes/authRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /signup (avec supertest pour exécuter express-validator)', () => {
    test('local: crée user, envoie email, renvoie token', async () => {
      const app = buildApp()

      getUserByEmail.mockResolvedValue(null)
      createUser.mockResolvedValue({ _id: 'u1', email: 'a@b.com' })
      axios.post.mockResolvedValue({ status: 200 })
      generateToken.mockReturnValue('jwt.local.token')

      const body = {
        email: 'a@b.com',
        // Mot de passe conforme aux règles: >=12, min/maj/chiffre/spécial, sans prénom/nom/email
        password: 'S3cret!Passw0rd',
        confirmPassword: 'S3cret!Passw0rd',
        first_name: 'Ann',
        last_name: 'Bee',
        authType: 'local',
      }

      const res = await request(app).post('/signup').send(body)

      expect(getUserByEmail).toHaveBeenCalledWith('a@b.com')
      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          password: body.password,
          first_name: 'Ann',
          last_name: 'Bee',
          authType: 'local',
          emailVerified: false,
        })
      )
      expect(axios.post).toHaveBeenCalledTimes(1)
      const [url, payload] = axios.post.mock.calls[0]
      expect(url).toMatch(/\/api\/email\/confirmation$/)
      expect(String(payload.confirmationLink)).toMatch(/\/verify\?userId=u1/)
      expect(generateToken).toHaveBeenCalledWith({ _id: 'u1', email: 'a@b.com' })
      expect(res.status).toBe(201)
      expect(res.body).toEqual({ token: 'jwt.local.token' })
    })

    test("oauth: crée user et renvoie token (pas d'email de confirmation)", async () => {
      const app = buildApp()

      getUserByEmail.mockResolvedValue(null)
      createUser.mockResolvedValue({ _id: 'u2', email: 'o@o.com' })
      generateToken.mockReturnValue('jwt.oauth.token')

      const body = {
        email: 'o@o.com',
        first_name: 'O',
        last_name: 'Auth',
        authType: 'oauth',
        oauthProvider: 'google',
      }

      const res = await request(app).post('/signup').send(body)

      expect(axios.post).not.toHaveBeenCalled()
      expect(generateToken).toHaveBeenCalled()
      expect(res.status).toBe(201)
      expect(res.body).toEqual({ token: 'jwt.oauth.token' })
    })

    test('400 si champs requis manquants (validation)', async () => {
      const app = buildApp()

      const res = await request(app).post('/signup').send({ email: 'x@x.com' })

      expect(res.status).toBe(400)
      expect(Array.isArray(res.body.errors)).toBe(true)
      expect(res.body.errors.length).toBeGreaterThan(0)
    })

    test('400 si email déjà utilisé', async () => {
      const app = buildApp()

      getUserByEmail.mockResolvedValue({ _id: 'exists' })

      const body = {
        email: 'a@b.com',
        password: 'S3cret!Passw0rd',
        confirmPassword: 'S3cret!Passw0rd',
        first_name: 'Ann',
        last_name: 'Bee',
        authType: 'local',
      }

      const res = await request(app).post('/signup').send(body)

      expect(res.status).toBe(400)
      expect(res.body).toEqual(expect.objectContaining({ error: 'Email déjà utilisé' }))
    })

    test('400 si local sans mot de passe (validation)', async () => {
      const app = buildApp()

      getUserByEmail.mockResolvedValue(null)

      const body = {
        email: 'a@b.com',
        first_name: 'Ann',
        last_name: 'Bee',
        authType: 'local',
        // password manquant
      }

      const res = await request(app).post('/signup').send(body)

      expect(res.status).toBe(400)
      expect(Array.isArray(res.body.errors)).toBe(true)
      // on s’assure qu’une erreur liée au mot de passe est bien présente
      const msgs = res.body.errors.map(e => e.msg || '')
      expect(msgs.join(' ')).toMatch(/mot de passe requis/i)
    })
  })

  describe('POST /login (on garde le handler direct, pas besoin de validator)', () => {
    test('local OK si password correct', async () => {
      const handler = getHandler(authRouter, 'post', '/login')

      const user = { _id: 'u3', email: 'l@l.com', authType: 'local', password: 'hashed' }
      getUserByEmail.mockResolvedValue(user)
      bcrypt.compare.mockResolvedValue(true)
      generateToken.mockReturnValue('jwt.login.local')

      const req = { body: { email: 'l@l.com', password: 'secret', authType: 'local' } }
      const res = mockRes()

      await handler(req, res)

      expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed')
      expect(res.json).toHaveBeenCalledWith({ token: 'jwt.login.local' })
    })

    test('local 401 si mauvais password', async () => {
      const handler = getHandler(authRouter, 'post', '/login')

      getUserByEmail.mockResolvedValue({ _id: 'u', email: 'l@l.com', authType: 'local', password: 'h' })
      bcrypt.compare.mockResolvedValue(false)

      const req = { body: { email: 'l@l.com', password: 'nope', authType: 'local' } }
      const res = mockRes()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    test('oauth: renvoie token', async () => {
      const handler = getHandler(authRouter, 'post', '/login')

      getUserByEmail.mockResolvedValue({ _id: 'u5', email: 'o@o.com', authType: 'oauth' })
      generateToken.mockReturnValue('jwt.login.oauth')

      const req = { body: { email: 'o@o.com', authType: 'oauth' } }
      const res = mockRes()

      await handler(req, res)

      expect(res.json).toHaveBeenCalledWith({ token: 'jwt.login.oauth' })
    })

    test('400 si champs manquants', async () => {
      const handler = getHandler(authRouter, 'post', '/login')
      const req = { body: {} }
      const res = mockRes()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    test('401 si user non trouvé / type incorrect', async () => {
      const handler = getHandler(authRouter, 'post', '/login')
      getUserByEmail.mockResolvedValue(null)

      const req = { body: { email: 'x@x.com', authType: 'local', password: 's' } }
      const res = mockRes()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})
