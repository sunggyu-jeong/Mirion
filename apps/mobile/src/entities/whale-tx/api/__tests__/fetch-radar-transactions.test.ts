jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';
import { asMock } from '@test/mocks';

import { fetchRadarTransactions } from '../fetch-radar-transactions';

const MOCK_DTOS = [
  {
    txHash: '0xaaa',
    type: 'send' as const,
    amountNative: 1000,
    amountUsd: 2_450_000,
    fromAddress: '0xFrom',
    toAddress: '0xTo',
    timestampMs: 1_700_000_000_000,
    blockNumber: '20000000',
    isLarge: true,
    asset: 'ETH',
    chain: 'ETH',
  },
  {
    txHash: '0xbbb',
    type: 'receive' as const,
    amountNative: 50,
    amountUsd: 3_500_000,
    fromAddress: '0xA',
    toAddress: '0xB',
    timestampMs: 1_700_000_001_000,
    blockNumber: '19999999',
    isLarge: true,
    asset: 'BTC',
    chain: 'BTC',
  },
];

beforeEach(() => {
  asMock(workerGet).mockResolvedValue(MOCK_DTOS);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchRadarTransactions', () => {
  it('calls /api/radar without params when no chains given', async () => {
    await fetchRadarTransactions();

    expect(workerGet).toHaveBeenCalledWith('/api/radar', {});
  });

  it('passes chains as comma-joined string when provided', async () => {
    await fetchRadarTransactions(['ETH', 'BTC']);

    expect(workerGet).toHaveBeenCalledWith('/api/radar', { chains: 'ETH,BTC' });
  });

  it('passes single chain correctly', async () => {
    await fetchRadarTransactions(['SOL']);

    expect(workerGet).toHaveBeenCalledWith('/api/radar', { chains: 'SOL' });
  });

  it('converts blockNumber string to bigint', async () => {
    const txs = await fetchRadarTransactions();

    expect(txs[0].blockNumber).toBe(BigInt('20000000'));
    expect(txs[1].blockNumber).toBe(BigInt('19999999'));
  });

  it('preserves all other WhaleTx fields', async () => {
    const txs = await fetchRadarTransactions();
    const tx = txs[0];

    expect(tx.txHash).toBe('0xaaa');
    expect(tx.type).toBe('send');
    expect(tx.amountNative).toBe(1000);
    expect(tx.amountUsd).toBe(2_450_000);
    expect(tx.fromAddress).toBe('0xFrom');
    expect(tx.toAddress).toBe('0xTo');
    expect(tx.isLarge).toBe(true);
    expect(tx.asset).toBe('ETH');
    expect(tx.chain).toBe('ETH');
  });

  it('returns empty array when worker returns no data', async () => {
    asMock(workerGet).mockResolvedValueOnce([]);

    const txs = await fetchRadarTransactions();

    expect(txs).toHaveLength(0);
  });

  it('propagates error when worker request fails', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 503'));

    await expect(fetchRadarTransactions()).rejects.toThrow('Worker HTTP 503');
  });

  it('does not add chains param when empty array passed', async () => {
    await fetchRadarTransactions([]);

    expect(workerGet).toHaveBeenCalledWith('/api/radar', {});
  });
});
