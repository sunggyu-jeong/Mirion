export const mockConnect = jest.fn();
export const mockDisconnect = jest.fn();
export const mockWriteContract = jest.fn();
export const mockUseConnectors = jest.fn();

jest.mock('@walletconnect/react-native-compat', () => ({}));

jest.mock('@wagmi/connectors', () => ({
  walletConnect: jest.fn(() => ({ id: 'walletConnect', name: 'WalletConnect' })),
  coinbaseWallet: jest.fn(() => ({ id: 'coinbaseWallet', name: 'Coinbase Wallet' })),
  injected: jest.fn(() => ({ id: 'injected', name: 'Injected' })),
}));

jest.mock('wagmi', () => ({
  createConfig: jest.fn(() => ({})),
  createStorage: jest.fn(() => ({})),
  http: jest.fn(() => ({})),
  useConnect: jest.fn().mockReturnValue({
    mutate: mockConnect,
    isPending: false,
    error: null,
  }),
  useDisconnect: jest.fn().mockReturnValue({
    mutate: mockDisconnect,
  }),
  useAccount: jest.fn().mockReturnValue({
    isConnected: false,
    address: undefined,
    chainId: undefined,
  }),
  useConnectors: jest.fn().mockReturnValue([{ id: 'injected', name: 'MetaMask' }]),
  useWriteContract: jest.fn().mockReturnValue({
    writeContract: mockWriteContract,
    isPending: false,
    isSuccess: false,
    error: null,
    data: null,
  }),
  useWaitForTransactionReceipt: jest.fn().mockReturnValue({
    isLoading: false,
    isSuccess: false,
  }),
}));

jest.mock('wagmi/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' },
  sepolia: { id: 11155111, name: 'Sepolia' },
  base: { id: 8453, name: 'Base' },
}));
