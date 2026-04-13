import type { WhaleTxDTO } from '../types.js';

const BASE = 'https://api.trongrid.io';
const SUN_PER_TRX = 1_000_000;

interface TronContract {
  type: string;
  parameter: { value: { owner_address: string; to_address: string; amount: number } };
}

interface TronTx {
  txID: string;
  raw_data: { contract: TronContract[]; timestamp: number };
  ret: [{ contractRet: string }];
}

interface TronListResponse {
  data: TronTx[];
}

export async function getTrxTransfers(
  address: string,
  minValueUsd: number,
  trxPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const apiKey = process.env['TRONGRID_API_KEY'];
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;

  const res = await fetch(`${BASE}/v1/accounts/${address}/transactions?limit=20&only_confirmed=true`, { headers });
  if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`);
  const json = (await res.json()) as TronListResponse;

  return json.data
    .filter((tx) => tx.raw_data.contract[0]?.type === 'TransferContract' && tx.ret[0]?.contractRet === 'SUCCESS')
    .map((tx): WhaleTxDTO | null => {
      const { owner_address, to_address, amount } = tx.raw_data.contract[0]!.parameter.value;
      const amountTrx = amount / SUN_PER_TRX;
      const amountUsd = amountTrx * trxPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const isOutgoing = owner_address.toLowerCase() === address.toLowerCase();
      return {
        txHash: tx.txID,
        type: isOutgoing ? 'send' : 'receive',
        amountNative: amountTrx,
        amountUsd,
        fromAddress: owner_address,
        toAddress: to_address,
        timestampMs: tx.raw_data.timestamp,
        blockNumber: '0',
        isLarge: true,
        asset: 'TRX',
        chain: 'TRX',
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
