import type { WhaleTxDTO, WhaleProfileDTO } from "../types";

const DEFAULT_RPC = "https://mainnet.helius-rpc.com";

function getRpc(apiKey?: string): string {
  return apiKey ? `${DEFAULT_RPC}/?api-key=${apiKey}` : DEFAULT_RPC;
}
const LAMPORTS_PER_SOL = 1_000_000_000;

async function rpc<T>(method: string, params: unknown[], apiKey?: string): Promise<T> {
  const res = await fetch(getRpc(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Solana RPC HTTP ${res.status}`);
  const json = (await res.json()) as { result: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

interface SolSignature {
  signature: string;
  blockTime: number | null;
}

interface SolTransaction {
  meta: {
    preBalances: number[];
    postBalances: number[];
    err: unknown;
  } | null;
  transaction: {
    message: {
      accountKeys: string[];
    };
  };
}

export async function getSolProfile(
  address: string,
  solPriceUsd: number,
  apiKey?: string,
): Promise<WhaleProfileDTO> {
  const result = await rpc<{ value: number }>("getBalance", [address], apiKey);
  const balanceSol = result.value / LAMPORTS_PER_SOL;

  return {
    nativeBalance: result.value.toString(),
    totalValueUsd: balanceSol * solPriceUsd,
    tokens: [],
  };
}

export async function getSolTransfers(
  address: string,
  minValueUsd: number,
  solPriceUsd: number,
  apiKey?: string,
): Promise<WhaleTxDTO[]> {
  const sigs = await rpc<SolSignature[]>("getSignaturesForAddress", [
    address,
    { limit: 20 },
  ], apiKey);

  const txResults = await Promise.allSettled(
    sigs.map((s) =>
      rpc<SolTransaction>("getTransaction", [
        s.signature,
        { encoding: "json", maxSupportedTransactionVersion: 0 },
      ], apiKey),
    ),
  );

  const transfers: WhaleTxDTO[] = [];

  for (let i = 0; i < sigs.length; i++) {
    const result = txResults[i];
    if (result.status !== "fulfilled" || !result.value?.meta) continue;

    const tx = result.value;
    const accounts = tx.transaction.message.accountKeys;
    const idx = accounts.indexOf(address);
    if (idx === -1) continue;

    const pre = tx.meta.preBalances[idx] ?? 0;
    const post = tx.meta.postBalances[idx] ?? 0;
    const diffLamports = post - pre;
    const amountSol = Math.abs(diffLamports) / LAMPORTS_PER_SOL;
    const amountUsd = amountSol * solPriceUsd;

    if (amountUsd < minValueUsd) continue;

    const isOutgoing = diffLamports < 0;
    const counterIdx = isOutgoing
      ? accounts.findIndex((_, j) => j !== idx && (tx.meta!.postBalances[j] ?? 0) > (tx.meta!.preBalances[j] ?? 0))
      : accounts.findIndex((_, j) => j !== idx && (tx.meta!.postBalances[j] ?? 0) < (tx.meta!.preBalances[j] ?? 0));
    const counterAddress = accounts[counterIdx] ?? "";

    transfers.push({
      txHash: sigs[i].signature,
      type: isOutgoing ? "send" : "receive",
      amountNative: amountSol,
      amountUsd,
      fromAddress: isOutgoing ? address : counterAddress,
      toAddress: isOutgoing ? counterAddress : address,
      timestampMs: (sigs[i].blockTime ?? 0) * 1000,
      blockNumber: "0",
      isLarge: true,
      asset: "SOL",
    });
  }

  return transfers;
}
