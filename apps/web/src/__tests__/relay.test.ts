import { validateRelayRequest, type RelayRequest } from '@/lib/relay'

describe('relay: validateRelayRequest', () => {
  const validRequest: RelayRequest = {
    userAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    fnName: 'deposit',
    calldata: '0xabcdef',
    signedHash: '0x1234567890abcdef',
  }

  it('should pass validation for valid request', () => {
    expect(() => validateRelayRequest(validRequest)).not.toThrow()
  })

  it('should throw if userAddress is missing', () => {
    const req = { ...validRequest, userAddress: '' }
    expect(() => validateRelayRequest(req)).toThrow('userAddress is required')
  })

  it('should throw if fnName is not allowed', () => {
    const req = { ...validRequest, fnName: 'transferOwnership' }
    expect(() => validateRelayRequest(req)).toThrow('fnName not allowed')
  })

  it('should throw if calldata is missing', () => {
    const req = { ...validRequest, calldata: '' }
    expect(() => validateRelayRequest(req)).toThrow('calldata is required')
  })

  it('should throw if signedHash is missing', () => {
    const req = { ...validRequest, signedHash: '' }
    expect(() => validateRelayRequest(req)).toThrow('signedHash is required')
  })

  it('should allow only deposit, withdraw, claimInterest, acceptDisclaimer', () => {
    const allowed = ['deposit', 'withdraw', 'claimInterest', 'acceptDisclaimer']
    for (const fn of allowed) {
      expect(() => validateRelayRequest({ ...validRequest, fnName: fn })).not.toThrow()
    }
  })
})
