export type RelayRequest = {
  userAddress: string
  fnName: string
  calldata: string
  signedHash: string
}

const ALLOWED_FN_NAMES = new Set(['deposit', 'withdraw', 'claimInterest', 'acceptDisclaimer'])

export function validateRelayRequest(req: RelayRequest): void {
  if (!req.userAddress) throw new Error('userAddress is required')
  if (!req.calldata) throw new Error('calldata is required')
  if (!req.signedHash) throw new Error('signedHash is required')
  if (!ALLOWED_FN_NAMES.has(req.fnName)) throw new Error('fnName not allowed')
}
