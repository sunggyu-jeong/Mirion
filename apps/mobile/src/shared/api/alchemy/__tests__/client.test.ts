import { createAlchemyClient } from '../client';

const API_KEY = 'test-api-key-abc';
const NETWORK = 'eth-mainnet';

describe('createAlchemyClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts to the correct Alchemy endpoint URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, jsonrpc: '2.0', result: '0x0' }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });
    await client.request('eth_getBalance', ['0xabc', 'latest']);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://${NETWORK}.g.alchemy.com/v2/${API_KEY}`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends a well-formed JSON-RPC 2.0 body', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, jsonrpc: '2.0', result: '0x0' }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });
    await client.request('eth_getBalance', ['0xabc', 'latest']);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);

    expect(body).toEqual({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: ['0xabc', 'latest'],
    });
  });

  it('sets Content-Type header to application/json', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, jsonrpc: '2.0', result: '0x0' }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });
    await client.request('eth_getBalance', ['0xabc', 'latest']);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('returns the result field from a successful JSON-RPC response', async () => {
    const expected = '0xDE0B6B3A7640000';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, jsonrpc: '2.0', result: expected }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });
    const result = await client.request<string>('eth_getBalance', ['0xabc', 'latest']);

    expect(result).toBe(expected);
  });

  it('throws AlchemyRequestError when the response contains a JSON-RPC error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32000, message: 'invalid api-key' },
      }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });

    await expect(client.request('eth_getBalance', ['0xabc', 'latest'])).rejects.toThrow(
      'invalid api-key',
    );
  });

  it('throws AlchemyHttpError with the status code when HTTP response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });

    await expect(client.request('eth_getBalance', ['0xabc', 'latest'])).rejects.toThrow('429');
  });

  it('propagates network-level errors directly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });

    await expect(client.request('eth_getBalance', ['0xabc', 'latest'])).rejects.toThrow(
      'Network request failed',
    );
  });

  it('forwards arbitrary method names and param arrays unchanged', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, jsonrpc: '2.0', result: { tokenBalances: [] } }),
    });

    const client = createAlchemyClient({ apiKey: API_KEY, network: NETWORK });
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    await client.request('alchemy_getTokenBalances', [address, 'erc20']);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.method).toBe('alchemy_getTokenBalances');
    expect(body.params).toEqual([address, 'erc20']);
  });
});
