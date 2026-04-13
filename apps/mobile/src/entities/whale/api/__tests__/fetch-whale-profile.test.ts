jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';

import { fetchWhaleProfile } from '../fetch-whale-profile';

const ETH_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const ONE_ETH_HEX = '0xDE0B6B3A7640000';
const ZERO_HEX = '0x0';

const MOCK_DTO = {
  nativeBalance: ONE_ETH_HEX,
  totalValueUsd: 2450,
  tokens: [
    {
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      rawBalance: '0x2386F26FC10000',
    },
  ],
};

beforeEach(() => {
  (workerGet as jest.Mock).mockResolvedValue(MOCK_DTO);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchWhaleProfile', () => {
  it('calls the worker /api/whale-profile endpoint with the address', async () => {
    await fetchWhaleProfile(ETH_ADDRESS);

    expect(workerGet).toHaveBeenCalledWith('/api/whale-profile', {
      address: ETH_ADDRESS,
      chain: 'ETH',
    });
  });

  it('converts ethBalance from hex string to bigint', async () => {
    const profile = await fetchWhaleProfile(ETH_ADDRESS);

    expect(profile.nativeBalance).toBe(BigInt(ONE_ETH_HEX));
  });

  it('returns totalValueUsd from the worker response', async () => {
    const profile = await fetchWhaleProfile(ETH_ADDRESS);

    expect(profile.totalValueUsd).toBe(2450);
  });

  it('converts token rawBalance from hex string to bigint', async () => {
    const profile = await fetchWhaleProfile(ETH_ADDRESS);

    expect(profile.tokens[0].rawBalance).toBe(BigInt('0x2386F26FC10000'));
    expect(profile.tokens[0].contractAddress).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  });

  it('returns 0n ethBalance and empty tokens for a zero-balance address', async () => {
    (workerGet as jest.Mock).mockResolvedValueOnce({
      nativeBalance: ZERO_HEX,
      totalValueUsd: 0,
      tokens: [],
    });

    const profile = await fetchWhaleProfile(ETH_ADDRESS);

    expect(profile.nativeBalance).toBe(0n);
    expect(profile.totalValueUsd).toBe(0);
    expect(profile.tokens).toHaveLength(0);
  });

  it('propagates error when the worker request fails', async () => {
    (workerGet as jest.Mock).mockRejectedValueOnce(new Error('Worker HTTP 503'));

    await expect(fetchWhaleProfile(ETH_ADDRESS)).rejects.toThrow('Worker HTTP 503');
  });
});
