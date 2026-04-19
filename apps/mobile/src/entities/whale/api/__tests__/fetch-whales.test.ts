jest.mock('@shared/api/worker', () => ({
  workerGet: jest.fn(),
}));

import { workerGet } from '@shared/api/worker';
import { asMock } from '@test/mocks';

import { fetchWhales } from '../fetch-whales';

const MOCK_DTOS = [
  {
    id: 'vitalik',
    name: 'Vitalik Buterin',
    address: '0xd8dA',
    tag: 'ETH 창시자',
    chain: 'ETH' as const,
    isLocked: false,
  },
  {
    id: 'whale2',
    name: 'Unknown Whale',
    address: '0xabc1',
    tag: '익명',
    chain: 'BTC' as const,
    isLocked: true,
  },
];

beforeEach(() => {
  asMock(workerGet).mockResolvedValue(MOCK_DTOS);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchWhales', () => {
  it('calls /api/whales endpoint', async () => {
    await fetchWhales();
    expect(workerGet).toHaveBeenCalledWith('/api/whales');
  });

  it('returns whales from the worker', async () => {
    const whales = await fetchWhales();
    expect(whales).toHaveLength(2);
    expect(whales[0].id).toBe('vitalik');
    expect(whales[1].isLocked).toBe(true);
  });

  it('returns empty array when worker returns none', async () => {
    asMock(workerGet).mockResolvedValueOnce([]);
    const whales = await fetchWhales();
    expect(whales).toHaveLength(0);
  });

  it('propagates worker errors', async () => {
    asMock(workerGet).mockRejectedValueOnce(new Error('Worker HTTP 500'));
    await expect(fetchWhales()).rejects.toThrow('Worker HTTP 500');
  });
});
