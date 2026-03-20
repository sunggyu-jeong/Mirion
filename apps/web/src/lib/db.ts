import { DatabaseSync } from 'node:sqlite'
import path from 'path'

let _db: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (!_db) {
    const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'lockfi.db')
    _db = new DatabaseSync(dbPath)
    _db.exec(`
      CREATE TABLE IF NOT EXISTS interest_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        date TEXT NOT NULL,
        daily_interest TEXT NOT NULL,
        cumulative_interest TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(address, date)
      );

      CREATE TABLE IF NOT EXISTS gas_advances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        tx_hash TEXT NOT NULL UNIQUE,
        gas_amount TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `)
  }
  return _db
}

export function insertInterestSnapshot(
  address: string,
  dailyInterest: string,
  cumulativeInterest: string,
  date: string,
): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO interest_snapshots (address, date, daily_interest, cumulative_interest, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(address, date, dailyInterest, cumulativeInterest, Date.now())
}

export type InterestSnapshot = {
  address: string
  date: string
  daily_interest: string
  cumulative_interest: string
  created_at: number
}

export function getInterestHistory(address: string): InterestSnapshot[] {
  return getDb()
    .prepare(
      `SELECT address, date, daily_interest, cumulative_interest, created_at
       FROM interest_snapshots
       WHERE address = ?
       ORDER BY date DESC`,
    )
    .all(address) as InterestSnapshot[]
}

export function getLatestCumulativeInterest(address: string): string {
  const row = getDb()
    .prepare(
      `SELECT cumulative_interest FROM interest_snapshots
       WHERE address = ? ORDER BY date DESC LIMIT 1`,
    )
    .get(address) as { cumulative_interest: string } | undefined
  return row?.cumulative_interest ?? '0'
}

export function insertGasAdvance(address: string, txHash: string, gasAmount: string): void {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO gas_advances (address, tx_hash, gas_amount, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(address, txHash, gasAmount, Date.now())
}

export function getTotalGasAdvanced(address: string): string {
  const rows = getDb()
    .prepare(`SELECT gas_amount FROM gas_advances WHERE address = ?`)
    .all(address) as { gas_amount: string }[]

  if (rows.length === 0) return '0'
  const total = rows.reduce((acc, row) => acc + BigInt(row.gas_amount), 0n)
  return total.toString()
}
