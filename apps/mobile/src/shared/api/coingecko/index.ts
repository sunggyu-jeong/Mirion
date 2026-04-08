interface CoinGeckoPriceResponse {
  ethereum: { usd: number };
}

export async function fetchEthPriceUsd(): Promise<number> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  );

  if (!response.ok) {
    throw new Error(`CoinGecko HTTP ${response.status}`);
  }

  const json = (await response.json()) as CoinGeckoPriceResponse;
  return json.ethereum.usd;
}
