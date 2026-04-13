import type { WhaleTxDTO } from '../types.js';

const WORKER_URL = process.env['WORKER_URL'] ?? '';
const INGEST_SECRET = process.env['INGEST_SECRET'] ?? '';

export async function pushChainTxs(chain: string, txs: WhaleTxDTO[]): Promise<void> {
  if (!WORKER_URL || txs.length === 0) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (INGEST_SECRET) headers['Authorization'] = `Bearer ${INGEST_SECRET}`;

  const res = await fetch(`${WORKER_URL}/api/ingest/whale-tx`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ chain, txs }),
  });

  if (!res.ok) throw new Error(`Ingest HTTP ${res.status}`);
}
