import Config from 'react-native-config';

const BASE_URL = Config.WORKER_URL ?? '';

export async function workerGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Worker HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
