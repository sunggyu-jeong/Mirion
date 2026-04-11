import type { WhaleTxDTO, WhaleProfileDTO } from "../types";

const BASE = "https://api.trongrid.io";
const SUN_PER_TRX = 1_000_000;

interface TronTxContract {
  type: string;
  parameter: {
    value: {
      owner_address: string;
      to_address: string;
      amount: number;
    };
  };
}

interface TronTx {
  txID: string;
  raw_data: {
    contract: TronTxContract[];
    timestamp: number;
  };
  ret: [{ contractRet: string }];
}

interface TronAccountResponse {
  data: [{ balance: number }];
}

interface TronTxListResponse {
  data: TronTx[];
  success: boolean;
}

function getHeaders(apiKey?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) h["TRON-PRO-API-KEY"] = apiKey;
  return h;
}

export async function getTrxProfile(
  address: string,
  trxPriceUsd: number,
  apiKey?: string,
): Promise<WhaleProfileDTO> {
  const res = await fetch(`${BASE}/v1/accounts/${address}`, { headers: getHeaders(apiKey) });
  if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`);
  const json = (await res.json()) as TronAccountResponse;
  const balanceSun = json.data[0]?.balance ?? 0;
  const balanceTrx = balanceSun / SUN_PER_TRX;
  return {
    nativeBalance: String(balanceSun),
    totalValueUsd: balanceTrx * trxPriceUsd,
    tokens: [],
  };
}

export async function getTrxTransfers(
  address: string,
  minValueUsd: number,
  trxPriceUsd: number,
  apiKey?: string,
): Promise<WhaleTxDTO[]> {
  const res = await fetch(
    `${BASE}/v1/accounts/${address}/transactions?limit=20&only_confirmed=true`,
    { headers: getHeaders(apiKey) },
  );
  if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`);
  const json = (await res.json()) as TronTxListResponse;

  return json.data
    .filter((tx) => {
      const contract = tx.raw_data.contract[0];
      return contract?.type === "TransferContract" && tx.ret[0]?.contractRet === "SUCCESS";
    })
    .map((tx): WhaleTxDTO | null => {
      const contract = tx.raw_data.contract[0]!;
      const { owner_address, to_address, amount } = contract.parameter.value;
      const amountTrx = amount / SUN_PER_TRX;
      const amountUsd = amountTrx * trxPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const isOutgoing = owner_address.toLowerCase() === address.toLowerCase();
      return {
        txHash: tx.txID,
        type: isOutgoing ? "send" : "receive",
        amountNative: amountTrx,
        amountUsd,
        fromAddress: owner_address,
        toAddress: to_address,
        timestampMs: tx.raw_data.timestamp,
        blockNumber: "0",
        isLarge: true,
        asset: "TRX",
        chain: "TRX",
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
