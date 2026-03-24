jest.mock('../mmkv', () => ({
  storage: { getString: jest.fn(), set: jest.fn(), remove: jest.fn() },
}));

import { storage } from '../mmkv';
import { zustandStorage } from '../zustand-storage';

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('zustandStorage', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getItem', () => {
    it('키가 존재하면 문자열 값을 반환한다', () => {
      mockStorage.getString.mockReturnValue('stored-value');
      expect(zustandStorage.getItem('key')).toBe('stored-value');
      expect(mockStorage.getString).toHaveBeenCalledWith('key');
    });

    it('키가 존재하지 않으면 null을 반환한다', () => {
      mockStorage.getString.mockReturnValue(undefined);
      expect(zustandStorage.getItem('key')).toBeNull();
    });
  });

  describe('setItem', () => {
    it('storage.set에 위임한다', () => {
      zustandStorage.setItem('key', 'value');
      expect(mockStorage.set).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('removeItem', () => {
    it('storage.remove에 위임한다', () => {
      zustandStorage.removeItem('key');
      expect(mockStorage.remove).toHaveBeenCalledWith('key');
    });
  });
});
