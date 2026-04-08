import type { AlchemyClient } from '@shared/api/alchemy';

import { fetchWhaleTransfers } from '../fetch-whale-transfers';

const WHALE = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const THIRD = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8';

function makeClient(mockRequest: jest.Mock = jest.fn()): AlchemyClient {
  return { request: mockRequest };
}

const OUTGOING_RESPONSE = {
  transfers: [
    {
      hash: '0xabc111',
      from: WHALE,
      to: OTHER,
      value: 1000,
      asset: 'ETH',
      category: 'external',
      blockNum: '0x1312D00',
      metadata: { blockTimestamp: '2024-06-01T10:00:00.000Z' },
    },
    {
      hash: '0xabc333',
      from: WHALE,
      to: OTHER,
      value: 50,
      asset: 'ETH',
      category: 'external',
      blockNum: '0x1312CFE',
      metadata: { blockTimestamp: '2024-06-01T06:00:00.000Z' },
    },
  ],
};

const INCOMING_RESPONSE = {
  transfers: [
    {
      hash: '0xabc222',
      from: THIRD,
      to: WHALE,
      value: 500,
      asset: 'ETH',
      category: 'external',
      blockNum: '0x1312CFF',
      metadata: { blockTimestamp: '2024-06-01T08:00:00.000Z' },
    },
  ],
};

const EMPTY_RESPONSE = { transfers: [] };

describe('fetchWhaleTransfers', () => {
  it('calls alchemy_getAssetTransfers with fromAddress set to the whale address', async () => {
    const request = jest.fn().mockResolvedValue(EMPTY_RESPONSE);

    await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    expect(request).toHaveBeenCalledWith(
      'alchemy_getAssetTransfers',
      expect.arrayContaining([expect.objectContaining({ fromAddress: WHALE })]),
    );
  });

  it('calls alchemy_getAssetTransfers with toAddress set to the whale address', async () => {
    const request = jest.fn().mockResolvedValue(EMPTY_RESPONSE);

    await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    expect(request).toHaveBeenCalledWith(
      'alchemy_getAssetTransfers',
      expect.arrayContaining([expect.objectContaining({ toAddress: WHALE })]),
    );
  });

  it('includes external, internal, and erc20 transfer categories', async () => {
    const request = jest.fn().mockResolvedValue(EMPTY_RESPONSE);

    await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    const [, params] = (request as jest.Mock).mock.calls[0] as [string, [Record<string, unknown>]];
    expect(params[0].category).toEqual(expect.arrayContaining(['external', 'internal', 'erc20']));
  });

  it('excludes transfers whose value is below minValueEth threshold', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(INCOMING_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    expect(transfers).toHaveLength(2);
    transfers.forEach(tx => expect(tx.amountEth).toBeGreaterThanOrEqual(100));
  });

  it('classifies transfer as "send" when fromAddress matches the whale address', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(EMPTY_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));
    const tx = transfers.find(t => t.txHash === '0xabc111');

    expect(tx?.type).toBe('send');
  });

  it('classifies transfer as "receive" when toAddress matches the whale address', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(EMPTY_RESPONSE)
      .mockResolvedValueOnce(INCOMING_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));
    const tx = transfers.find(t => t.txHash === '0xabc222');

    expect(tx?.type).toBe('receive');
  });

  it('returns amountEth as a number', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(INCOMING_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    transfers.forEach(tx => expect(typeof tx.amountEth).toBe('number'));
  });

  it('returns timestampMs as epoch milliseconds', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(EMPTY_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));
    const tx = transfers.find(t => t.txHash === '0xabc111');

    expect(tx?.timestampMs).toBe(new Date('2024-06-01T10:00:00.000Z').getTime());
  });

  it('returns blockNumber as bigint parsed from hex blockNum', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(EMPTY_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));
    const tx = transfers.find(t => t.txHash === '0xabc111');

    expect(tx?.blockNumber).toBe(BigInt('0x1312D00'));
  });

  it('marks all returned transfers as isLarge', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(INCOMING_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    transfers.forEach(tx => expect(tx.isLarge).toBe(true));
  });

  it('returns an empty array when the response contains no transfers', async () => {
    const request = jest.fn().mockResolvedValue(EMPTY_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    expect(transfers).toHaveLength(0);
  });

  it('deduplicates transfers that appear in both outgoing and incoming responses', async () => {
    const duplicateTransfer = OUTGOING_RESPONSE.transfers[0];
    const request = jest
      .fn()
      .mockResolvedValueOnce({ transfers: [duplicateTransfer] })
      .mockResolvedValueOnce({ transfers: [duplicateTransfer] });

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));

    expect(transfers).toHaveLength(1);
  });

  it('encodes pageSize as a hex maxCount string', async () => {
    const request = jest.fn().mockResolvedValue(EMPTY_RESPONSE);

    await fetchWhaleTransfers(WHALE, { minValueEth: 100, pageSize: 10 }, makeClient(request));

    const [, params] = (request as jest.Mock).mock.calls[0] as [string, [Record<string, unknown>]];
    expect(params[0].maxCount).toBe('0xa');
  });

  it('preserves the asset field from the raw transfer', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce(OUTGOING_RESPONSE)
      .mockResolvedValueOnce(EMPTY_RESPONSE);

    const transfers = await fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request));
    const tx = transfers.find(t => t.txHash === '0xabc111');

    expect(tx?.asset).toBe('ETH');
  });

  it('throws when the Alchemy client request rejects', async () => {
    const request = jest.fn().mockRejectedValue(new Error('rate limited'));

    await expect(
      fetchWhaleTransfers(WHALE, { minValueEth: 100 }, makeClient(request)),
    ).rejects.toThrow('rate limited');
  });
});
