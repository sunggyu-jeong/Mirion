import type { WhaleTrade } from '../types.js';

const WORKER_URL = process.env['WORKER_URL'] ?? '';
const CEX_INGEST_SECRET = process.env['CEX_INGEST_SECRET'] ?? '';

export async function notifyCloudflare(trade: WhaleTrade): Promise<void> {
  if (!WORKER_URL) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (CEX_INGEST_SECRET) {
    headers['Authorization'] = `Bearer ${CEX_INGEST_SECRET}`;
  }

  await fetch(`${WORKER_URL}/api/cex-trades`, {
    method: 'POST',
    headers,
    body: JSON.stringify(trade),
  });
}
