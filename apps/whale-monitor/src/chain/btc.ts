import type { WhaleTxDTO } from '../types.js';

const BASE = 'https://blockstream.info/api';
const SATS_PER_BTC = 100_000_000;

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

export async function getBtcTransfers(
  address: string,
  minValueUsd: number,
  btcPriceUsd: number,
): Promise<WhaleTxDTO[]> {
  const res = await fetch(`${BASE}/address/${address}/txs`);
  if (!res.ok) throw new Error(`Blockstream HTTP ${res.status}`);
  const txs = (await res.json()) as BlockstreamTx[];

  return txs
    .map((tx): WhaleTxDTO | null => {
      const fromAddress = tx.vin[0]?.prevout?.scriptpubkey_address ?? '';
      const isOutgoing = fromAddress === address;

      const valueSats = isOutgoing
        ? tx.vout.filter((v) => v.scriptpubkey_address !== address).reduce((s, v) => s + v.value, 0)
        : tx.vout.filter((v) => v.scriptpubkey_address === address).reduce((s, v) => s + v.value, 0);

      const amountBtc = valueSats / SATS_PER_BTC;
      const amountUsd = amountBtc * btcPriceUsd;
      if (amountUsd < minValueUsd) return null;

      const toAddress = isOutgoing
        ? (tx.vout.find((v) => v.scriptpubkey_address !== address)?.scriptpubkey_address ?? '')
        : address;

      return {
        txHash: tx.txid,
        type: isOutgoing ? 'send' : 'receive',
        amountNative: amountBtc,
        amountUsd,
        fromAddress,
        toAddress,
        timestampMs: tx.status.block_time ? tx.status.block_time * 1000 : Date.now(),
        blockNumber: '0',
        isLarge: true,
        asset: 'BTC',
        chain: 'BTC',
      };
    })
    .filter((t): t is WhaleTxDTO => t !== null);
}
