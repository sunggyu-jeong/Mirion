import { act, renderHook } from '@testing-library/react-native';
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi';

import { useWalletAuth } from '@/src/features/wallet/model';

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@walletconnect/react-native-compat', () => ({}));

jest.mock('@wagmi/connectors', () => ({
  walletConnect: jest.fn(() => ({ id: 'walletConnect' })),
  coinbaseWallet: jest.fn(() => ({ id: 'coinbaseWallet' })),
}));

jest.mock('wagmi/chains', () => ({
  mainnet: { id: 1 },
  sepolia: { id: 11155111 },
}));

jest.mock('wagmi', () => ({
  createConfig: jest.fn(() => ({})),
  createStorage: jest.fn(() => ({})),
  http: jest.fn(() => ({})),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
  useAccount: jest.fn(),
  useConnectors: jest.fn(),
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
}));

describe('지갑 연결 커스텀 훅 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useConnect as jest.Mock).mockReturnValue({ connect: mockConnect, isPending: false, error: null });
    (useDisconnect as jest.Mock).mockReturnValue({ disconnect: mockDisconnect });
    (useAccount as jest.Mock).mockReturnValue({ isConnected: false, address: undefined, chainId: undefined });
    (useConnectors as jest.Mock).mockReturnValue([{ id: 'injected', name: 'MetaMask' }]);
  });

  it('connect 함수 호출 시 특정 커넥터(injected)로 연결을 시도해야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth());

    act(() => {
      result.current.connect('injected');
    });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        connector: expect.objectContaining({ id: 'injected' }),
      }),
    );
  });

  it('disconnect 함수 호출 시 지갑 연결이 해제되어야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth());

    act(() => {
      result.current.disconnect();
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('지갑이 연결된 상태를 올바르게 반환해야 한다.', () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: true,
      address: '0x12356789101112abcdefghijklm',
      chainId: 8453,
    });

    const { result } = renderHook(() => useWalletAuth());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe('0x12356789101112abcdefghijklm');
  });

  it('connectorId 없이 connect 호출 시 첫 번째 커넥터를 사용해야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth());

    act(() => {
      result.current.connect();
    });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        connector: expect.objectContaining({ id: 'injected' }),
      }),
    );
  });

  it('존재하지 않는 connectorId 전달 시 connect를 호출하지 않아야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth());

    act(() => {
      result.current.connect('non-existent-connector');
    });

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('초기 상태에서 isPending은 false이어야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth());

    expect(result.current.isPending).toBe(false);
  });
});
