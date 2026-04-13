import type { WhaleTxDTO } from '../types.js';

const BASE = 'https://deep-index.moralis.io/api/v2.2';
const WEI_PER_BNB = 1_000_000_000_000_000_000n;

interface MoralisTx {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  receipt_status: string;
}

interface MoralisResponse {
  result: MoralisTx[];
}

export async function getBnbTransfers(
  address: string,
  minValueUsd: number,
  bnbPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const apiKey = process.env['MORALIS_API_KEY'];
  if (!apiKey) return [];

  const res = await fetch(`${BASE}/${address}?chain=bsc&limit=50&order=DESC`, {
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Moralis HTTP ${res.status}`);

  const json = (await res.json()) as MoralisResponse;
  if (!Array.isArray(json.result)) return [];

  return json.result
    .filter((tx) => tx.receipt_status === '1')
    .map((tx): WhaleTxDTO | null => {
      const amountBnb = Number(BigInt(tx.value)) / Number(WEI_PER_BNB);
      const amountUsd = amountBnb * bnbPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const isOutgoing = tx.from_address.toLowerCase() === address.toLowerCase();
      return {
        txHash: tx.hash,
        type: isOutgoing ? 'send' : 'receive',
        amountNative: amountBnb,
        amountUsd,
        fromAddress: tx.from_address,
        toAddress: tx.to_address ?? '',
        timestampMs: tx.block_timestamp ? new Date(tx.block_timestamp).getTime() : Date.now(),
        blockNumber: tx.block_number,
        isLarge: true,
        asset: 'BNB',
        chain: 'BNB',
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
