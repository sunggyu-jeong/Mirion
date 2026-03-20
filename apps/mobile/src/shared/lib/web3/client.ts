import Config from 'react-native-config'
import type { Account, Chain, Hex, Transport, WalletClient } from 'viem'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { CHAIN } from '@shared/api/contracts'

const rpcUrl = Config.RPC_URL || undefined

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(rpcUrl),
})

export function createWalletClientFromKey(privateKey: Hex): WalletClient<Transport, Chain, Account> {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: CHAIN,
    transport: http(rpcUrl),
  })
}
