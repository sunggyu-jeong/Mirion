export function asMock(fn: unknown): jest.Mock {
  return fn as jest.Mock;
}

export async function withSuppressedConsoleError<T>(callback: () => Promise<T>): Promise<T> {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  try {
    return await callback();
  } finally {
    spy.mockRestore();
  }
}
