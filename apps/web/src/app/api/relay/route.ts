import { type NextRequest, NextResponse } from 'next/server'
import { parseAbi, type Hex } from 'viem'

import { insertGasAdvance } from '@/lib/db'
import { publicClient, getRelayerWalletClient, TIMELOCK_ADDRESS } from '@/lib/chain'
import { validateRelayRequest, type RelayRequest } from '@/lib/relay'

const timeLockAbi = parseAbi([
  'function deposit(uint256 _unlockTime) payable',
  'function withdraw()',
  'function claimInterest()',
  'function acceptDisclaimer()',
  'function recordGasAdvance(address _user, uint256 _amount)',
])

export async function POST(req: NextRequest) {
  try {
    const body: RelayRequest = await req.json()
    validateRelayRequest(body)

    const walletClient = getRelayerWalletClient()

    const txHash = await walletClient.sendTransaction({
      to: TIMELOCK_ADDRESS,
      data: body.calldata as Hex,
    })

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      retryCount: 10,
      pollingInterval: 6_000,
    })

    const gasUsed = receipt.gasUsed
    const effectiveGasPrice = receipt.effectiveGasPrice ?? 0n
    const gasCost = gasUsed * effectiveGasPrice

    insertGasAdvance(body.userAddress, txHash, gasCost.toString())

    await walletClient.writeContract({
      address: TIMELOCK_ADDRESS,
      abi: timeLockAbi,
      functionName: 'recordGasAdvance',
      args: [body.userAddress as Hex, gasCost],
    })

    return NextResponse.json({ txHash, gasCost: gasCost.toString() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
