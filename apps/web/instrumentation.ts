export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron')
    const { publicClient, TIMELOCK_ADDRESS } = await import('@/lib/chain')
    const { insertInterestSnapshot, getLatestCumulativeInterest } = await import('@/lib/db')
    const { runDailySnapshot } = await import('@/scheduler/interest-snapshot')

    const TRACKED_ADDRESSES = (process.env.TRACKED_ADDRESSES ?? '').split(',').filter(Boolean)

    const timeLockAbi = [
      {
        name: 'pendingReward',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const

    cron.schedule('0 0 * * *', async () => {
      await runDailySnapshot(
        TRACKED_ADDRESSES,
        async (address) => {
          return publicClient.readContract({
            address: TIMELOCK_ADDRESS,
            abi: timeLockAbi,
            functionName: 'pendingReward',
            args: [address as `0x${string}`],
          })
        },
        (address) => getLatestCumulativeInterest(address),
        (payload) =>
          insertInterestSnapshot(
            payload.address,
            payload.dailyInterest,
            payload.cumulativeInterest,
            payload.date,
          ),
      )
    })
  }
}
