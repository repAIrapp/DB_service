
const objectRouter = require('../src/routes/objectRoute')

// On **ne** teste pas verifyToken ici (testé ailleurs) : on appelle directement le handler final.
// On mocke les services utilisés par la route.
jest.mock('../src/services/objectService', () => ({
  createObject: jest.fn(),
  getObjectsByUser: jest.fn(),
  getObjectById: jest.fn(),
  updateObjectStatus: jest.fn(),
  deleteObject: jest.fn(),
}))

const {
  createObject,
  getObjectsByUser,
  getObjectById,
  updateObjectStatus,
  deleteObject,
} = require('../src/services/objectService')

// helpers
function getHandler(router, method, path) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()]
  )
  if (!layer) throw new Error(`Handler ${method} ${path} introuvable`)
  // Les routes protégées ont [verifyToken, handler] → on prend le dernier
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

describe('unit routes/objectRoute', () => {
  beforeEach(() => jest.clearAllMocks())

  test('POST / -> appelle createObject et 201', async () => {
    const handler = getHandler(objectRouter, 'post', '/')
    createObject.mockResolvedValue({ _id: 'o1', name: 'Phone' })

    const req = { body: { userId: 'u1', name: 'Phone' } }
    const res = mockRes()

    await handler(req, res)

    expect(createObject).toHaveBeenCalledWith({ userId: 'u1', name: 'Phone' })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ _id: 'o1', name: 'Phone' })
  })

  test('GET /user/:userId -> appelle getObjectsByUser et 200', async () => {
    const handler = getHandler(objectRouter, 'get', '/user/:userId')
    getObjectsByUser.mockResolvedValue([{ _id: 'o1' }])

    const req = { params: { userId: 'u1' }, user: { id: 'u1' } } // on simule verifyToken en mettant req.user
    const res = mockRes()

    // NB : la route fait un check req.user.id !== req.params.userId
    await handler(req, res)

    expect(getObjectsByUser).toHaveBeenCalledWith('u1')
    expect(res.json).toHaveBeenCalledWith([{ _id: 'o1' }])
  })

  test('GET /:id -> 200 si trouvé, 404 sinon', async () => {
    const handler = getHandler(objectRouter, 'get', '/:id')

    // trouvé
    getObjectById.mockResolvedValue({ _id: 'o1' })
    let req = { params: { id: 'o1' } }
    let res = mockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({ _id: 'o1' })

    // non trouvé
    getObjectById.mockResolvedValue(null)
    req = { params: { id: 'o404' } }
    res = mockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('PATCH /:id/status -> appelle updateObjectStatus', async () => {
    const handler = getHandler(objectRouter, 'patch', '/:id/status')
    updateObjectStatus.mockResolvedValue({ _id: 'o1', status: 'done' })

    const req = { params: { id: 'o1' }, body: { status: 'done' }, user: { id: 'u1' } }
    const res = mockRes()

    await handler(req, res)

    expect(updateObjectStatus).toHaveBeenCalledWith('o1', 'done')
    expect(res.json).toHaveBeenCalledWith({ _id: 'o1', status: 'done' })
  })

  test('DELETE /:id -> appelle deleteObject et renvoie message', async () => {
    const handler = getHandler(objectRouter, 'delete', '/:id')
    deleteObject.mockResolvedValue({})

    const req = { params: { id: 'o1' }, user: { id: 'u1' } }
    const res = mockRes()

    await handler(req, res)

    expect(deleteObject).toHaveBeenCalledWith('o1')
    expect(res.json).toHaveBeenCalledWith({ message: 'Objet supprimé' })
  })
})
