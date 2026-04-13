import type { WhaleTxDTO } from '../types.js';

const RPC = 'https://xrplcluster.com';
const DROPS_PER_XRP = 1_000_000;
const XRP_EPOCH_OFFSET = 946_684_800;

interface XRPLTx {
  hash: string;
  Account: string;
  Destination?: string;
  Amount?: string;
  date?: number;
  TransactionType: string;
}

interface XRPLEntry {
  tx: XRPLTx;
  meta: { TransactionResult: string };
}

interface XRPLRpcResponse<T> {
  result: T & { error?: string };
}

async function rpcCall<T>(method: string, params: object[]): Promise<T> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  });
  if (!res.ok) throw new Error(`XRPL HTTP ${res.status}`);
  const json = (await res.json()) as XRPLRpcResponse<T>;
  if (json.result.error) throw new Error(json.result.error);
  return json.result;
}

export async function getXrpTransfers(
  address: string,
  minValueUsd: number,
  xrpPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const result = await rpcCall<{ transactions: XRPLEntry[] }>('account_tx', [
    { account: address, limit: 20, ledger_index_min: -1, ledger_index_max: -1 },
  ]);

  return result.transactions
    .filter(
      ({ tx, meta }) =>
        tx.TransactionType === 'Payment' &&
        meta.TransactionResult === 'tesSUCCESS' &&
        typeof tx.Amount === 'string',
    )
    .map(({ tx }): WhaleTxDTO | null => {
      const amountXrp = Number(tx.Amount as string) / DROPS_PER_XRP;
      const amountUsd = amountXrp * xrpPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const isOutgoing = tx.Account.toLowerCase() === address.toLowerCase();
      return {
        txHash: tx.hash,
        type: isOutgoing ? 'send' : 'receive',
        amountNative: amountXrp,
        amountUsd,
        fromAddress: tx.Account,
        toAddress: tx.Destination ?? '',
        timestampMs: tx.date ? (tx.date + XRP_EPOCH_OFFSET) * 1000 : Date.now(),
        blockNumber: '0',
        isLarge: true,
        asset: 'XRP',
        chain: 'XRP',
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
