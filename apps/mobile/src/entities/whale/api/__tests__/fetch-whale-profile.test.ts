import type { AlchemyClient } from '@shared/api/alchemy';

import { fetchWhaleProfile } from '../fetch-whale-profile';

const ETH_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const ETH_PRICE_USD = 2450;
const ONE_ETH_HEX = '0xDE0B6B3A7640000';
const ZERO_HEX = '0x0';

function makeClient(mockRequest: jest.Mock = jest.fn()): AlchemyClient {
  return { request: mockRequest };
}

function setupMockRequests(
  request: jest.Mock,
  ethBalanceHex: string,
  tokenBalances: Array<{ contractAddress: string; tokenBalance: string }>,
): void {
  request
    .mockResolvedValueOnce(ethBalanceHex)
    .mockResolvedValueOnce({ address: ETH_ADDRESS, tokenBalances });
}

describe('fetchWhaleProfile', () => {
  it('calls eth_getBalance with the whale address at latest block', async () => {
    const request = jest.fn();
    setupMockRequests(request, ONE_ETH_HEX, []);

    await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(request).toHaveBeenCalledWith('eth_getBalance', [ETH_ADDRESS, 'latest']);
  });

  it('calls alchemy_getTokenBalances for ERC-20 tokens', async () => {
    const request = jest.fn();
    setupMockRequests(request, ONE_ETH_HEX, []);

    await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(request).toHaveBeenCalledWith('alchemy_getTokenBalances', [ETH_ADDRESS, 'erc20']);
  });

  it('returns ethBalance as bigint parsed from hex', async () => {
    const request = jest.fn();
    setupMockRequests(request, ONE_ETH_HEX, []);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.ethBalance).toBe(BigInt(ONE_ETH_HEX));
  });

  it('computes totalValueUsd as ethAmount times ethPriceUsd', async () => {
    const request = jest.fn();
    setupMockRequests(request, ONE_ETH_HEX, []);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.totalValueUsd).toBeCloseTo(ETH_PRICE_USD, 0);
  });

  it('returns ethBalance 0n and totalValueUsd 0 for a zero-balance address', async () => {
    const request = jest.fn();
    setupMockRequests(request, ZERO_HEX, []);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.ethBalance).toBe(0n);
    expect(profile.totalValueUsd).toBe(0);
  });

  it('returns all token balances from the alchemy response', async () => {
    const request = jest.fn();
    const tokenBalances = [
      {
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenBalance: '0x2386F26FC10000',
      },
      {
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenBalance: '0x3B9ACA00',
      },
    ];
    setupMockRequests(request, ONE_ETH_HEX, tokenBalances);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.tokens).toHaveLength(2);
    expect(profile.tokens[0].contractAddress).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    expect(profile.tokens[1].contractAddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  });

  it('excludes token entries with a zero raw balance', async () => {
    const request = jest.fn();
    const tokenBalances = [
      {
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenBalance: ZERO_HEX,
      },
      {
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenBalance: '0x3B9ACA00',
      },
    ];
    setupMockRequests(request, ONE_ETH_HEX, tokenBalances);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.tokens).toHaveLength(1);
    expect(profile.tokens[0].contractAddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  });

  it('stores rawBalance as bigint for each token', async () => {
    const request = jest.fn();
    const rawHex = '0x2386F26FC10000';
    setupMockRequests(request, ONE_ETH_HEX, [
      { contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', tokenBalance: rawHex },
    ]);

    const profile = await fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD);

    expect(profile.tokens[0].rawBalance).toBe(BigInt(rawHex));
  });

  it('throws when eth_getBalance request fails', async () => {
    const request = jest.fn().mockRejectedValueOnce(new Error('upstream error'));

    await expect(
      fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD),
    ).rejects.toThrow('upstream error');
  });

  it('throws when alchemy_getTokenBalances request fails', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(ONE_ETH_HEX)
      .mockRejectedValueOnce(new Error('token fetch failed'));

    await expect(
      fetchWhaleProfile(ETH_ADDRESS, makeClient(request), ETH_PRICE_USD),
    ).rejects.toThrow('token fetch failed');
  });
});
