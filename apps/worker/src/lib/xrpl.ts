import type { WhaleTxDTO, WhaleProfileDTO } from "../types";

const RPC = "https://xrplcluster.com";
const DROPS_PER_XRP = 1_000_000;
// XRP epoch starts 2000-01-01 00:00:00 UTC
const XRP_EPOCH_OFFSET = 946_684_800;

interface XRPLTx {
  hash: string;
  Account: string;
  Destination?: string;
  Amount?: string | { value: string };
  date?: number;
  TransactionType: string;
}

interface XRPLAccountTxEntry {
  tx: XRPLTx;
  meta: { TransactionResult: string; delivered_amount?: string | { value: string } };
}

interface XRPLAccountInfoResult {
  account_data: { Balance: string };
}

async function rpc<T>(method: string, params: object[]): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, params }),
  });
  if (!res.ok) throw new Error(`XRPL HTTP ${res.status}`);
  const json = (await res.json()) as { result: T & { status?: string; error?: string } };
  if (json.result.error) throw new Error(json.result.error);
  return json.result;
}

export async function getXrpProfile(
  address: string,
  xrpPriceUsd: number,
): Promise<WhaleProfileDTO> {
  const result = await rpc<XRPLAccountInfoResult>("account_info", [
    { account: address, ledger_index: "validated" },
  ]);
  const balanceXrp = Number(result.account_data.Balance) / DROPS_PER_XRP;
  return {
    nativeBalance: result.account_data.Balance,
    totalValueUsd: balanceXrp * xrpPriceUsd,
    tokens: [],
  };
}

export async function getXrpTransfers(
  address: string,
  minValueUsd: number,
  xrpPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const result = await rpc<{ transactions: XRPLAccountTxEntry[] }>("account_tx", [
    { account: address, limit: 20, ledger_index_min: -1, ledger_index_max: -1 },
  ]);

  return result.transactions
    .filter((entry) => {
      const { tx, meta } = entry;
      return (
        tx.TransactionType === "Payment" &&
        meta.TransactionResult === "tesSUCCESS" &&
        typeof tx.Amount === "string"
      );
    })
    .map((entry): WhaleTxDTO | null => {
      const { tx } = entry;
      const drops = typeof tx.Amount === "string" ? Number(tx.Amount) : 0;
      const amountXrp = drops / DROPS_PER_XRP;
      const amountUsd = amountXrp * xrpPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const timestampMs = tx.date ? (tx.date + XRP_EPOCH_OFFSET) * 1000 : Date.now();
      const isOutgoing = tx.Account.toLowerCase() === address.toLowerCase();

      return {
        txHash: tx.hash,
        type: isOutgoing ? "send" : "receive",
        amountNative: amountXrp,
        amountUsd,
        fromAddress: tx.Account,
        toAddress: tx.Destination ?? "",
        timestampMs,
        blockNumber: "0",
        isLarge: true,
        asset: "XRP",
        chain: "XRP",
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
