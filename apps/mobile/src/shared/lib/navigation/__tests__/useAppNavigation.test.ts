jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

import { useNavigation } from '@react-navigation/native';
import { renderHook } from '@testing-library/react-native';

import { useAppNavigation } from '../useAppNavigation';

const mockReset = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNavigation).mockReturnValue({
    reset: mockReset,
    navigate: mockNavigate,
    goBack: mockGoBack,
  } as never);
});

describe('useAppNavigation', () => {
  describe('toOnboarding', () => {
    it('Onboarding으로 reset한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toOnboarding();
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Onboarding' }] });
    });
  });

  describe('toWalletConnect', () => {
    it('WalletConnect로 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toWalletConnect();
      expect(mockNavigate).toHaveBeenCalledWith('WalletConnect');
    });
  });

  describe('toWalletConnecting', () => {
    it('metamask walletType으로 WalletConnecting reset한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toWalletConnecting('metamask');
      expect(mockReset).toHaveBeenCalledWith({
        index: 1,
        routes: [
          { name: 'Onboarding' },
          { name: 'WalletConnecting', params: { walletType: 'metamask' } },
        ],
      });
    });

    it('coinbase walletType으로 WalletConnecting reset한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toWalletConnecting('coinbase');
      expect(mockReset).toHaveBeenCalledWith({
        index: 1,
        routes: [
          { name: 'Onboarding' },
          { name: 'WalletConnecting', params: { walletType: 'coinbase' } },
        ],
      });
    });
  });

  describe('toMain', () => {
    it('Main으로 reset한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toMain();
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Main' }] });
    });
  });

  describe('goBack', () => {
    it('navigation.goBack을 호출한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.goBack();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
