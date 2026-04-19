import Config from 'react-native-config';

const BASE_URL = Config.WORKER_URL ?? '';

let _devMock: Record<string, unknown> | null = null;
function getDevMock<T>(path: string): T | null {
  if (!__DEV__) {
    return null;
  }
  if (_devMock === null) {
    try {
      _devMock =
        (require('./mock-data.dev') as { DEV_MOCK: Record<string, unknown> }).DEV_MOCK ?? {};
    } catch {
      _devMock = {};
    }
  }
  const key = Object.keys(_devMock).find(k => path.startsWith(k));
  return key ? (_devMock[key] as T) : null;
}

export async function workerGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  try {
    const res = await fetch(url.toString());
    if ((res.status === 429 || !res.ok) && __DEV__) {
      const mock = getDevMock<T>(path);
      if (mock !== null) {
        return mock;
      }
    }
    if (!res.ok) {
      throw new Error(`Worker HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (__DEV__) {
      const mock = getDevMock<T>(path);
      if (mock !== null) {
        return mock;
      }
    }
    throw err;
  }
}
