const pathService = '../src/services/objectService';

// IMPORTANT: use literal here because jest.mock is hoisted
jest.mock('../src/models/Objectrepaired', () => jest.fn());

const ObjectRepaired = require('../src/models/Objectrepaired');
const service = require(pathService);

beforeEach(() => {
  jest.clearAllMocks();

  // Attach static methods to the mocked constructor
  ObjectRepaired.find = jest.fn();
  ObjectRepaired.findById = jest.fn();
  ObjectRepaired.findByIdAndUpdate = jest.fn();
  ObjectRepaired.findByIdAndDelete = jest.fn();
});

describe('objectService (unit)', () => {
  test('createObject: calls constructor with data and .save()', async () => {
    const data = { userId: 'u1', objectname: 'Phone', status: 'in_progress' };
    const saved = { _id: 'o1', ...data };

    const saveMock = jest.fn().mockResolvedValue(saved);
    ObjectRepaired.mockImplementation(() => ({ save: saveMock }));

    const res = await service.createObject(data);

    expect(ObjectRepaired).toHaveBeenCalledWith(data);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res).toEqual(saved);
  });

  test('getObjectsByUser: uses find({ userId })', async () => {
    const userId = 'u42';
    const list = [{ _id: 'o1' }, { _id: 'o2' }];
    ObjectRepaired.find.mockResolvedValue(list);

    const res = await service.getObjectsByUser(userId);

    expect(ObjectRepaired.find).toHaveBeenCalledWith({ userId });
    expect(res).toBe(list);
  });

  test('getObjectById: uses findById(id)', async () => {
    const doc = { _id: 'o77' };
    ObjectRepaired.findById.mockResolvedValue(doc);

    const res = await service.getObjectById('o77');

    expect(ObjectRepaired.findById).toHaveBeenCalledWith('o77');
    expect(res).toBe(doc);
  });

  test('updateObjectStatus: sets status + modificationDate, returns updated', async () => {
    const updated = { _id: 'o5', status: 'done', modificationDate: new Date() };
    ObjectRepaired.findByIdAndUpdate.mockResolvedValue(updated);

    const res = await service.updateObjectStatus('o5', 'done');

    expect(ObjectRepaired.findByIdAndUpdate).toHaveBeenCalledWith(
      'o5',
      { status: 'done', modificationDate: expect.any(Date) },
      { new: true }
    );
    expect(res).toBe(updated);
  });

  test('deleteObject: uses findByIdAndDelete(id)', async () => {
    const removed = { acknowledged: true };
    ObjectRepaired.findByIdAndDelete.mockResolvedValue(removed);

    const res = await service.deleteObject('o9');

    expect(ObjectRepaired.findByIdAndDelete).toHaveBeenCalledWith('o9');
    expect(res).toBe(removed);
  });
});
