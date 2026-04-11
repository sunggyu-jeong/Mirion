import type { WhaleTxDTO } from "../types";

const BASE = "https://api.bscscan.com/api";

interface BscTx {
  hash: string;
  from: string;
  to: string;
  value: string; // in wei
  timeStamp: string;
  blockNumber: string;
  txreceipt_status: string;
  isError: string;
}

interface BscResponse {
  status: string;
  result: BscTx[] | string;
}

const WEI_PER_BNB = 1_000_000_000_000_000_000n;

async function fetchBscTxList(address: string, apiKey?: string): Promise<BscTx[]> {
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    page: "1",
    offset: "25",
    sort: "desc",
    ...(apiKey ? { apikey: apiKey } : {}),
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`BSCScan HTTP ${res.status}`);
  const json = (await res.json()) as BscResponse;
  if (json.status !== "1" || !Array.isArray(json.result)) return [];
  return json.result;
}

export async function getBnbTransfers(
  address: string,
  minValueUsd: number,
  bnbPriceUsd: number,
  apiKey?: string,
): Promise<WhaleTxDTO[]> {
  const txs = await fetchBscTxList(address, apiKey);

  return txs
    .filter((tx) => tx.isError === "0" && tx.txreceipt_status === "1")
    .map((tx): WhaleTxDTO | null => {
      const valueWei = BigInt(tx.value);
      const amountBnb = Number(valueWei) / Number(WEI_PER_BNB);
      const amountUsd = amountBnb * bnbPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const isOutgoing = tx.from.toLowerCase() === address.toLowerCase();
      return {
        txHash: tx.hash,
        type: isOutgoing ? "send" : "receive",
        amountNative: amountBnb,
        amountUsd,
        fromAddress: tx.from,
        toAddress: tx.to,
        timestampMs: Number(tx.timeStamp) * 1000,
        blockNumber: tx.blockNumber,
        isLarge: true,
        asset: "BNB",
        chain: "BNB",
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
