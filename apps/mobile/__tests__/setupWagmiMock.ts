export const mockConnect = jest.fn();
export const mockDisconnect = jest.fn();
export const mockWriteContract = jest.fn();
export const mockUseConnectors = jest.fn();

jest.mock("wagmi", () => ({
  useConnect: () => ({
    mutate: mockConnect,
    isPending: false,
    error: null,
  }),
  useDisconnect: () => ({
    mutate: mockDisconnect
  }),
  useAccount: () => ({
    connectors: [{ id: 'injected', name: 'MetaMask' }]
  }),
  useWriteContract: () => ({
    writeContract: mockWriteContract,
    isPending: false,
    isSuccess: false,
    error: null,
    data: null,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false
  })
}))