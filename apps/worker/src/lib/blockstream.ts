import type { WhaleTxDTO, WhaleProfileDTO } from "../types";

const BASE = "https://blockstream.info/api";
const SATS_PER_BTC = 100_000_000;

interface BlockstreamAddress {
  chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
}

interface BlockstreamVin {
  prevout: { scriptpubkey_address?: string; value: number } | null;
}

interface BlockstreamVout {
  scriptpubkey_address?: string;
  value: number;
}

interface BlockstreamTx {
  txid: string;
  vin: BlockstreamVin[];
  vout: BlockstreamVout[];
  status: { block_time?: number };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Blockstream HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getBtcProfile(
  address: string,
  btcPriceUsd: number,
): Promise<WhaleProfileDTO> {
  const data = await get<BlockstreamAddress>(`/address/${address}`);
  const balanceSats =
    data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
  const balanceBtc = balanceSats / SATS_PER_BTC;

  return {
    nativeBalance: balanceSats.toString(),
    totalValueUsd: balanceBtc * btcPriceUsd,
    tokens: [],
  };
}

export async function getBtcTransfers(
  address: string,
  minValueUsd: number,
  btcPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const txs = await get<BlockstreamTx[]>(`/address/${address}/txs`);

  return txs
    .map((tx): WhaleTxDTO | null => {
      const fromAddress =
        tx.vin[0]?.prevout?.scriptpubkey_address ?? "";
      const isOutgoing = fromAddress === address;

      const valueSats = isOutgoing
        ? tx.vout
            .filter((v) => v.scriptpubkey_address !== address)
            .reduce((s, v) => s + v.value, 0)
        : tx.vout
            .filter((v) => v.scriptpubkey_address === address)
            .reduce((s, v) => s + v.value, 0);

      const amountBtc = valueSats / SATS_PER_BTC;
      const amountUsd = amountBtc * btcPriceUsd;

      if (amountUsd < minValueUsd) return null;

      const toAddress = isOutgoing
        ? (tx.vout.find((v) => v.scriptpubkey_address !== address)
            ?.scriptpubkey_address ?? "")
        : address;

      return {
        txHash: tx.txid,
        type: isOutgoing ? "send" : "receive",
        amountNative: amountBtc,
        amountUsd,
        fromAddress,
        toAddress,
        timestampMs: (tx.status.block_time ?? 0) * 1000,
        blockNumber: "0",
        isLarge: true,
        asset: "BTC",
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
