
const jwtLib = require('jsonwebtoken')

//  Mock total de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

// Important: charger le module après le mock
const { generateToken, verifyToken } = require('../src/utils/jwt')

describe('utils/jwt', () => {
  const SECRET = process.env.JWT_SECRET || 'supersecret'
  const user = {
    _id: 'u123',
    email: 'a@b.com',
    authType: 'local',
    role: 'user',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('generateToken : retourne le token et appelle jwt.sign avec le bon payload/options', () => {
    jwtLib.sign.mockReturnValue('fake.jwt.token')

    const token = generateToken(user)

    expect(token).toBe('fake.jwt.token')
    expect(jwtLib.sign).toHaveBeenCalledTimes(1)

    // Vérifie payload + secret + options
    const [payload, secret, options] = jwtLib.sign.mock.calls[0]
    expect(payload).toEqual({
      id: 'u123',
      email: 'a@b.com',
      authType: 'local',
      role: 'user',
    })
    expect(secret).toBe(SECRET)
    expect(options).toEqual({ expiresIn: '7d' })
  })

  test('generateToken : assigne "user" par défaut si role est absent', () => {
    jwtLib.sign.mockReturnValue('default.role.token')

    const userNoRole = {
      _id: 'u456',
      email: 'no@role.com',
      authType: 'local',
    }

    const token = generateToken(userNoRole)

    expect(token).toBe('default.role.token')
    expect(jwtLib.sign).toHaveBeenCalledTimes(1)

    const [payload] = jwtLib.sign.mock.calls[0]
    expect(payload.role).toBe('user') // branche couverte
  })

  test('verifyToken : retourne le payload décodé', () => {
    const decoded = { id: 'u123', email: 'a@b.com' }
    jwtLib.verify.mockReturnValue(decoded)

    const res = verifyToken('fake.jwt.token')

    expect(res).toEqual(decoded)
    expect(jwtLib.verify).toHaveBeenCalledWith('fake.jwt.token', SECRET)
  })

  test('verifyToken : propage l’erreur si jwt.verify lève', () => {
    const err = new Error('invalid token')
    jwtLib.verify.mockImplementation(() => { throw err })

    expect(() => verifyToken('bad.token')).toThrow('invalid token')
    expect(jwtLib.verify).toHaveBeenCalledWith('bad.token', SECRET)
  })
})
