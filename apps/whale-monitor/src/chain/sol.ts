import type { WhaleTxDTO } from '../types.js';

const HELIUS_RPC = 'https://mainnet.helius-rpc.com';
const FALLBACK_RPC = 'https://api.mainnet-beta.solana.com';
const LAMPORTS_PER_SOL = 1_000_000_000;
const RECENCY_SEC = 30 * 24 * 60 * 60;

function getRpc(): string {
  const apiKey = process.env['HELIUS_API_KEY'];
  return apiKey ? `${HELIUS_RPC}/?api-key=${apiKey}` : FALLBACK_RPC;
}

interface SolRpcResponse<T> {
  result: T;
  error?: { message: string };
}

interface SolSignature {
  signature: string;
  blockTime: number | null;
}

interface SolTransaction {
  meta: { preBalances: number[]; postBalances: number[]; err: unknown } | null;
  transaction: { message: { accountKeys: string[] } };
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(getRpc(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Solana RPC HTTP ${res.status}`);
  const json = (await res.json()) as SolRpcResponse<T>;
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function getSolTransfers(
  address: string,
  minValueUsd: number,
  solPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const minBlockTime = Math.floor(Date.now() / 1000) - RECENCY_SEC;
  const sigs = await rpcCall<SolSignature[]>('getSignaturesForAddress', [address, { limit: 5 }]);
  const recentSigs = sigs.filter((s) => (s.blockTime ?? 0) >= minBlockTime);
  if (recentSigs.length === 0) return [];

  const txResults = await Promise.allSettled(
    recentSigs.map((s) =>
      rpcCall<SolTransaction>('getTransaction', [
        s.signature,
        { encoding: 'json', maxSupportedTransactionVersion: 0 },
      ]),
    ),
  );

  const transfers: WhaleTxDTO[] = [];

  for (let i = 0; i < recentSigs.length; i++) {
    const result = txResults[i];
    if (result.status !== 'fulfilled' || !result.value?.meta) continue;

    const tx = result.value;
    const accounts = tx.transaction.message.accountKeys;
    const idx = accounts.indexOf(address);
    if (idx === -1) continue;

    const pre = tx.meta!.preBalances[idx] ?? 0;
    const post = tx.meta!.postBalances[idx] ?? 0;
    const diffLamports = post - pre;
    const amountSol = Math.abs(diffLamports) / LAMPORTS_PER_SOL;
    const amountUsd = amountSol * solPriceUsd;
    if (amountUsd < minValueUsd) continue;

    const isOutgoing = diffLamports < 0;
    const counterIdx = isOutgoing
      ? accounts.findIndex((_, j) => j !== idx && (tx.meta!.postBalances[j] ?? 0) > (tx.meta!.preBalances[j] ?? 0))
      : accounts.findIndex((_, j) => j !== idx && (tx.meta!.postBalances[j] ?? 0) < (tx.meta!.preBalances[j] ?? 0));

    transfers.push({
      txHash: recentSigs[i].signature,
      type: isOutgoing ? 'send' : 'receive',
      amountNative: amountSol,
      amountUsd,
      fromAddress: isOutgoing ? address : (accounts[counterIdx] ?? ''),
      toAddress: isOutgoing ? (accounts[counterIdx] ?? '') : address,
      timestampMs: recentSigs[i].blockTime ? recentSigs[i].blockTime! * 1000 : Date.now(),
      blockNumber: '0',
      isLarge: true,
      asset: 'SOL',
      chain: 'SOL',
    });
  }

  return transfers;
}
