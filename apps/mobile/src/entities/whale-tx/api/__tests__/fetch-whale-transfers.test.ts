jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';

import { fetchWhaleTransfers } from '../fetch-whale-transfers';

const WHALE = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

const MOCK_DTOS = [
  {
    txHash: '0xabc111',
    type: 'send' as const,
    amountEth: 1000,
    amountUsd: 0,
    fromAddress: WHALE,
    toAddress: OTHER,
    timestampMs: new Date('2024-06-01T10:00:00.000Z').getTime(),
    blockNumber: '0x1312D00',
    isLarge: true,
    asset: 'ETH',
  },
  {
    txHash: '0xabc222',
    type: 'receive' as const,
    amountEth: 500,
    amountUsd: 0,
    fromAddress: OTHER,
    toAddress: WHALE,
    timestampMs: new Date('2024-06-01T08:00:00.000Z').getTime(),
    blockNumber: '0x1312CFF',
    isLarge: true,
    asset: 'ETH',
  },
];

beforeEach(() => {
  (workerGet as jest.Mock).mockResolvedValue(MOCK_DTOS);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchWhaleTransfers', () => {
  it('calls the worker /api/whale-transfers endpoint', async () => {
    await fetchWhaleTransfers(WHALE, { minValueEth: 100 });

    expect(workerGet).toHaveBeenCalledWith(
      '/api/whale-transfers',
      expect.objectContaining({ address: WHALE }),
    );
  });

  it('passes minValueEth as a string query param', async () => {
    await fetchWhaleTransfers(WHALE, { minValueEth: 500 });

    expect(workerGet).toHaveBeenCalledWith(
      '/api/whale-transfers',
      expect.objectContaining({ minValueEth: '500' }),
    );
  });

  it('converts blockNumber from hex string to bigint', async () => {
    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 });

    expect(transfers[0].blockNumber).toBe(BigInt('0x1312D00'));
    expect(transfers[1].blockNumber).toBe(BigInt('0x1312CFF'));
  });

  it('preserves all other WhaleTx fields unchanged', async () => {
    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 });
    const tx = transfers[0];

    expect(tx.txHash).toBe('0xabc111');
    expect(tx.type).toBe('send');
    expect(tx.amountEth).toBe(1000);
    expect(tx.fromAddress).toBe(WHALE);
    expect(tx.toAddress).toBe(OTHER);
    expect(tx.isLarge).toBe(true);
    expect(tx.asset).toBe('ETH');
  });

  it('returns an empty array when the worker returns no transfers', async () => {
    (workerGet as jest.Mock).mockResolvedValueOnce([]);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 });

    expect(transfers).toHaveLength(0);
  });

  it('propagates error when the worker request fails', async () => {
    (workerGet as jest.Mock).mockRejectedValueOnce(new Error('Worker HTTP 500'));

    await expect(fetchWhaleTransfers(WHALE, { minValueEth: 100 })).rejects.toThrow(
      'Worker HTTP 500',
    );
  });
});
