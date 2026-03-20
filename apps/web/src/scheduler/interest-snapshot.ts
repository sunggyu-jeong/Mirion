export type SnapshotPayload = {
  address: string
  date: string
  dailyInterest: string
  cumulativeInterest: string
}

export function buildInterestSnapshotPayload(
  address: string,
  dailyInterest: string,
  date: Date,
  previousCumulative?: string,
): SnapshotPayload {
  const dateStr = date.toISOString().split('T')[0]
  const cumulative = previousCumulative
    ? (BigInt(previousCumulative) + BigInt(dailyInterest)).toString()
    : dailyInterest

  return {
    address,
    date: dateStr,
    dailyInterest,
    cumulativeInterest: cumulative,
  }
}

export async function runDailySnapshot(
  addresses: string[],
  fetchPendingReward: (address: string) => Promise<bigint>,
  getLatestCumulative: (address: string) => string,
  saveSnapshot: (payload: SnapshotPayload) => void,
): Promise<void> {
  const today = new Date()

  for (const address of addresses) {
    try {
      const pendingReward = await fetchPendingReward(address)
      const previousCumulative = getLatestCumulative(address)
      const payload = buildInterestSnapshotPayload(
        address,
        pendingReward.toString(),
        today,
        previousCumulative === '0' ? undefined : previousCumulative,
      )
      saveSnapshot(payload)
    } catch {
    }
  }
}
