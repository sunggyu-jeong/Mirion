import { buildInterestSnapshotPayload } from '@/scheduler/interest-snapshot'

describe('interest-snapshot: buildInterestSnapshotPayload', () => {
  it('should build correct date string for today', () => {
    const date = new Date('2026-03-20T00:00:00.000Z')
    const payload = buildInterestSnapshotPayload('0xabc', '5000000000000000', date)

    expect(payload.address).toBe('0xabc')
    expect(payload.date).toBe('2026-03-20')
    expect(payload.dailyInterest).toBe('5000000000000000')
  })

  it('should compute cumulative interest correctly', () => {
    const payload = buildInterestSnapshotPayload(
      '0xabc',
      '1000000000000000',
      new Date('2026-03-20T00:00:00.000Z'),
      '4000000000000000',
    )

    expect(payload.cumulativeInterest).toBe('5000000000000000')
  })

  it('should default cumulative to dailyInterest when no previous cumulative', () => {
    const payload = buildInterestSnapshotPayload('0xabc', '1000', new Date())
    expect(payload.cumulativeInterest).toBe('1000')
  })
})
