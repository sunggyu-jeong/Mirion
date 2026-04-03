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

  describe('toLegal', () => {
    it('Legal으로 reset한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toLegal();
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Legal' }] });
    });
  });

  describe('toDepositSetup', () => {
    it('DepositSetup으로 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toDepositSetup();
      expect(mockNavigate).toHaveBeenCalledWith('DepositSetup');
    });
  });

  describe('toDepositConfirm', () => {
    it('DepositConfirm으로 params와 함께 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toDepositConfirm({ amountEth: '1.5', unlockDate: '2026-01-01' });
      expect(mockNavigate).toHaveBeenCalledWith('DepositConfirm', {
        amountEth: '1.5',
        unlockDate: '2026-01-01',
      });
    });
  });

  describe('toTransactionProgress', () => {
    it('TransactionProgress로 params와 함께 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toTransactionProgress({
        amountEth: '1.5',
        unlockTimestamp: '0',
        unlockDateLabel: '2년 후',
      });
      expect(mockNavigate).toHaveBeenCalledWith('TransactionProgress', {
        amountEth: '1.5',
        unlockTimestamp: '0',
        unlockDateLabel: '2년 후',
      });
    });
  });

  describe('toDepositSuccess', () => {
    it('DepositSuccess로 params와 함께 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toDepositSuccess({ unlockDateLabel: '2028-01-01' });
      expect(mockNavigate).toHaveBeenCalledWith('DepositSuccess', {
        unlockDateLabel: '2028-01-01',
      });
    });
  });

  describe('toError', () => {
    it('Error로 params와 함께 navigate한다', () => {
      const { result } = renderHook(() => useAppNavigation());
      result.current.toError({ errorType: 'balance' });
      expect(mockNavigate).toHaveBeenCalledWith('Error', { errorType: 'balance' });
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
