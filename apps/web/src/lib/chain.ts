import { createPublicClient, createWalletClient, http, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base, baseSepolia } from 'viem/chains'

const chain = process.env.CHAIN_ID === '8453' ? base : baseSepolia
const rpcUrl = process.env.RPC_URL ?? undefined

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
})

export function getRelayerWalletClient() {
  const privateKey = process.env.RELAYER_PRIVATE_KEY
  if (!privateKey) throw new Error('RELAYER_PRIVATE_KEY is not set')
  return createWalletClient({
    account: privateKeyToAccount(privateKey as Hex),
    chain,
    transport: http(rpcUrl),
  })
}

export const TIMELOCK_ADDRESS = (process.env.TIMELOCK_CONTRACT_ADDRESS ?? '0x') as Address
