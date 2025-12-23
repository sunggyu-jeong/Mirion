import { mockConnect, mockDisconnect } from "@/__tests__/setupWagmiMock";
import { useWalletAuth } from "@/src/features/wallet/model";
import { useAccount } from "@reown/appkit-react-native";
import { renderHook, act } from "@testing-library/react-native";

describe('지갑 연결 커스텀 훅 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: false,
      address: undefined,
    })
  })

  it('connect 함수 호출 시 특정 커넥터(BASE)로 연결을 시도해야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth())

    act(() => {
      result.current.connect('injected')
    })

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        connetor: expect.objectContaining({ id: 'injected'})
      })
    )
  })

  it('disconnect 함수 호출 시 지갑 연결이 해제되어야 한다.', () => {
    const { result } = renderHook(() => useWalletAuth())

    act(() => {
      result.current.disconnect()
    })
    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })

  it('지갑이 연결된 상태를 올바르게 반환해야 한다.', () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: true,
      address: '0x12356789101112abcdefghijklm'
    })
    
    const { result } = renderHook(() => useWalletAuth())

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe('0x12356789101112abcdefghijklm')
  })
})