const User = require('../src/models/User');
const {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPreferences
} = require('../src/services/userService');

// On mock toutes les méthodes statiques de Mongoose utilisées
jest.mock('../src/models/User');

describe('userService (unit)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('crée un user si email pas encore utilisé', async () => {
      User.findOne.mockResolvedValue(null); // aucun user existant
      const fakeSave = jest.fn().mockResolvedValue({ _id: '123', email: 'a@b.com' });
      User.mockImplementation(() => ({ save: fakeSave }));

      const user = await createUser({ email: 'a@b.com' });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(fakeSave).toHaveBeenCalled();
      expect(user).toEqual({ _id: '123', email: 'a@b.com' });
    });

    it('rejette si email déjà utilisé', async () => {
      User.findOne.mockResolvedValue({ _id: '999', email: 'a@b.com' });

      await expect(createUser({ email: 'a@b.com' }))
        .rejects
        .toThrow('Email déjà utilisé');
    });
  });

  describe('getUserByEmail', () => {
    it('retourne un user trouvé par email', async () => {
      User.findOne.mockResolvedValue({ _id: '123', email: 'test@test.com' });

      const user = await getUserByEmail('test@test.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(user.email).toBe('test@test.com');
    });
  });

  describe('getUserById', () => {
    it('retourne un user trouvé par ID', async () => {
      User.findById.mockResolvedValue({ _id: 'abc', email: 'id@test.com' });

      const user = await getUserById('abc');

      expect(User.findById).toHaveBeenCalledWith('abc');
      expect(user._id).toBe('abc');
    });
  });

  describe('updateUserPreferences', () => {
    it('met à jour les préférences', async () => {
      const updated = { _id: 'abc', preferences: { notificationsActivated: false } };
      User.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await updateUserPreferences('abc', { notificationsActivated: false });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { preferences: { notificationsActivated: false } },
        { new: true }
      );
      expect(result.preferences.notificationsActivated).toBe(false);
    });
  });
});
