import type { AlchemyJsonRpcResponse } from './types';

export interface AlchemyClientConfig {
  apiKey: string;
  network: string;
}

export interface AlchemyClient {
  request<T>(method: string, params: unknown[]): Promise<T>;
}

export class AlchemyHttpError extends Error {
  constructor(status: number) {
    super(`${status}`);
    this.name = 'AlchemyHttpError';
  }
}

export class AlchemyRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlchemyRequestError';
  }
}

export function createAlchemyClient(config: AlchemyClientConfig): AlchemyClient {
  const url = `https://${config.network}.g.alchemy.com/v2/${config.apiKey}`;

  return {
    async request<T>(method: string, params: unknown[]): Promise<T> {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
      });

      if (!response.ok) {
        throw new AlchemyHttpError(response.status);
      }

      const json = (await response.json()) as AlchemyJsonRpcResponse<T>;

      if (json.error) {
        throw new AlchemyRequestError(json.error.message);
      }

      return json.result as T;
    },
  };
}
