import { renderHook, act } from '@testing-library/react-native'
import { useDisclaimerGuard } from '../model/use-disclaimer-guard'

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xUserAddress' }),
  ),
  secureKey: {
    retrieve: jest.fn().mockResolvedValue('abcdef1234567890'),
  },
}))

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({ available: true }),
    simplePrompt: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    waitForTransactionReceipt: jest.fn().mockResolvedValue({ status: 'success' }),
  },
  createWalletClientFromKey: jest.fn().mockReturnValue({
    writeContract: jest.fn().mockResolvedValue('0xmocktxhash'),
  }),
}))

jest.mock('@shared/api/contracts', () => ({
  timeLockContract: { address: '0xContract', abi: [] },
}))

jest.mock('@shared/lib/storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  },
}))

describe('useDisclaimerGuard', () => {
  it('should return isAccepted false when not previously accepted', () => {
    const { result } = renderHook(() => useDisclaimerGuard('0xUserAddress'))
    expect(result.current.isAccepted).toBe(false)
  })

  it('should return isAccepted true when MMKV has accepted flag', () => {
    const { storage } = jest.requireMock('@shared/lib/storage')
    storage.getString.mockReturnValueOnce('true')

    const { result } = renderHook(() => useDisclaimerGuard('0xUserAddress'))
    expect(result.current.isAccepted).toBe(true)
  })

  it('should call contract acceptDisclaimer and persist to MMKV on accept()', async () => {
    const { storage } = jest.requireMock('@shared/lib/storage')
    const { result } = renderHook(() => useDisclaimerGuard('0xUserAddress'))

    await act(async () => {
      await result.current.accept('key-id')
    })

    expect(storage.set).toHaveBeenCalledWith(
      'disclaimer_accepted_0xUserAddress',
      'true',
    )
    expect(result.current.isAccepted).toBe(true)
  })
})
