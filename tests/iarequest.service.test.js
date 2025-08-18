// tests/iarequest.service.test.js

// --- Mock du modèle mongoose : une fonction jest.fn() + méthodes statiques
jest.mock('../src/models/IArequest', () => {
  const mockFn = jest.fn();          // <-- IARequest devient une fonction mockée
  mockFn.find = jest.fn();           // méthodes "statiques"
  mockFn.findById = jest.fn();
  mockFn.findByIdAndUpdate = jest.fn();
  return mockFn;
});

const IARequest = require('../src/models/IArequest');
const service = require('../src/services/iarequestService');

describe('iarequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createIARequest appelle save() sur le modèle', async () => {
    const saveMock = jest.fn().mockResolvedValue({ _id: 'id1', foo: 'bar' });
    IARequest.mockImplementation(() => ({ save: saveMock })); // <-- fonctionne maintenant

    const data = { foo: 'bar' };
    const res = await service.createIARequest(data);

    expect(res).toEqual({ _id: 'id1', foo: 'bar' });
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(IARequest).toHaveBeenCalledWith(data);
  });

  test('getIARequestsByUser appelle find().populate()', async () => {
    const populateMock = jest.fn().mockResolvedValue([{ _id: 'r1' }]);
    IARequest.find.mockReturnValue({ populate: populateMock });

    const res = await service.getIARequestsByUser('u123');

    expect(IARequest.find).toHaveBeenCalledWith({ userId: 'u123' });
    expect(populateMock).toHaveBeenCalledWith('objectrepairedId');
    expect(res).toEqual([{ _id: 'r1' }]);
  });

  test('getIARequestById appelle findById().populate()', async () => {
    const populateMock = jest.fn().mockResolvedValue({ _id: 'r2' });
    IARequest.findById.mockReturnValue({ populate: populateMock });

    const res = await service.getIARequestById('r2');

    expect(IARequest.findById).toHaveBeenCalledWith('r2');
    expect(populateMock).toHaveBeenCalledWith('objectrepairedId');
    expect(res).toEqual({ _id: 'r2' });
  });

  test('updateIAResult appelle findByIdAndUpdate avec bon payload', async () => {
    IARequest.findByIdAndUpdate.mockResolvedValue({ _id: 'r3', resultIA: 'done' });

    const res = await service.updateIAResult('r3', 'done');

    expect(IARequest.findByIdAndUpdate).toHaveBeenCalledWith(
      'r3',
      { resultIA: 'done' },
      { new: true }
    );
    expect(res).toEqual({ _id: 'r3', resultIA: 'done' });
  });
});
