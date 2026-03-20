process.env.DATABASE_PATH = ':memory:'

import {
  insertInterestSnapshot,
  getInterestHistory,
  insertGasAdvance,
  getTotalGasAdvanced,
  getDb,
} from '@/lib/db'

describe('DB: interest_snapshots', () => {
  beforeEach(() => {
    getDb().exec('DELETE FROM interest_snapshots')
    getDb().exec('DELETE FROM gas_advances')
  })

  it('should insert and retrieve interest snapshots', () => {
    const address = '0xabc'
    insertInterestSnapshot(address, '1000000000000000', '5000000000000000', '2026-03-20')

    const rows = getInterestHistory(address)
    expect(rows).toHaveLength(1)
    expect(rows[0].address).toBe(address)
    expect(rows[0].daily_interest).toBe('1000000000000000')
    expect(rows[0].cumulative_interest).toBe('5000000000000000')
    expect(rows[0].date).toBe('2026-03-20')
  })

  it('should return empty array when no snapshots exist', () => {
    const rows = getInterestHistory('0xnonexistent')
    expect(rows).toHaveLength(0)
  })

  it('should return snapshots ordered by date desc', () => {
    insertInterestSnapshot('0xabc', '100', '100', '2026-03-18')
    insertInterestSnapshot('0xabc', '200', '300', '2026-03-20')
    insertInterestSnapshot('0xabc', '150', '450', '2026-03-19')

    const rows = getInterestHistory('0xabc')
    expect(rows[0].date).toBe('2026-03-20')
    expect(rows[1].date).toBe('2026-03-19')
    expect(rows[2].date).toBe('2026-03-18')
  })
})

describe('DB: gas_advances', () => {
  beforeEach(() => {
    getDb().exec('DELETE FROM gas_advances')
  })

  it('should insert gas advance record', () => {
    insertGasAdvance('0xabc', '0xtxhash', '21000000000000')
    const total = getTotalGasAdvanced('0xabc')
    expect(total).toBe('21000000000000')
  })

  it('should sum multiple gas advances', () => {
    insertGasAdvance('0xabc', '0xtx1', '10000000000000')
    insertGasAdvance('0xabc', '0xtx2', '11000000000000')
    const total = getTotalGasAdvanced('0xabc')
    expect(BigInt(total)).toBe(BigInt('21000000000000'))
  })

  it('should return zero for unknown address', () => {
    const total = getTotalGasAdvanced('0xunknown')
    expect(total).toBe('0')
  })
})
