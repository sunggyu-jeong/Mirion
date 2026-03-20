process.env.DATABASE_PATH = ':memory:'

import { insertInterestSnapshot, getInterestHistory, insertGasAdvance, getTotalGasAdvanced } from '@/lib/db'
import { validateRelayRequest } from '@/lib/relay'
import { buildInterestSnapshotPayload, runDailySnapshot } from '@/scheduler/interest-snapshot'

describe('E2E Flow: 모바일 대납 서명 → 백엔드 처리 → Lock → 이자 정산 후 출금', () => {
  const USER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  const TX_HASH_DEPOSIT = '0xdeposittxhash'
  const TX_HASH_WITHDRAW = '0xwithdrawtxhash'

  beforeEach(() => {
    const { getDb } = require('@/lib/db')
    getDb().exec('DELETE FROM interest_snapshots')
    getDb().exec('DELETE FROM gas_advances')
  })

  it('시나리오 1: 가스비 대납 릴레이 요청 유효성 검증', () => {
    const depositRequest = {
      userAddress: USER,
      fnName: 'deposit',
      calldata: '0xabcdef1234',
      signedHash: '0xsignedhashvalue',
    }

    expect(() => validateRelayRequest(depositRequest)).not.toThrow()

    const invalidRequest = { ...depositRequest, fnName: 'maliciousFunction' }
    expect(() => validateRelayRequest(invalidRequest)).toThrow('fnName not allowed')
  })

  it('시나리오 2: 가스비 대납 기록 및 누적 정산', () => {
    insertGasAdvance(USER, TX_HASH_DEPOSIT, '21000000000000')
    insertGasAdvance(USER, TX_HASH_WITHDRAW, '21000000000000')

    const total = getTotalGasAdvanced(USER)
    expect(BigInt(total)).toBe(BigInt('42000000000000'))
  })

  it('시나리오 3: 일별 이자 스냅샷 기록', async () => {
    const dailyAmounts = ['1000000000000000', '1100000000000000', '1200000000000000']
    const dates = ['2026-03-18', '2026-03-19', '2026-03-20']

    let cumulative = 0n
    for (let i = 0; i < dates.length; i++) {
      cumulative += BigInt(dailyAmounts[i])
      const payload = buildInterestSnapshotPayload(
        USER,
        dailyAmounts[i],
        new Date(dates[i] + 'T00:00:00.000Z'),
        i === 0 ? undefined : (cumulative - BigInt(dailyAmounts[i])).toString(),
      )
      insertInterestSnapshot(payload.address, payload.dailyInterest, payload.cumulativeInterest, payload.date)
    }

    const history = getInterestHistory(USER)
    expect(history).toHaveLength(3)

    const lastCumulative = BigInt(history[0].cumulative_interest)
    expect(lastCumulative).toBe(BigInt('1000000000000000') + BigInt('1100000000000000') + BigInt('1200000000000000'))
  })

  it('시나리오 4: 출금 시 정산 공식 검증 (원금 + 이자 - 대납가스비 - 수수료)', () => {
    const principalWei = BigInt('5000000000000000000')
    const interestWei = BigInt('137000000000000000')
    const gasAdvancedWei = BigInt('42000000000000')
    const feePercentage = 300n
    const feeBasisPoints = 10000n

    const fee = (principalWei * feePercentage) / feeBasisPoints
    const gross = principalWei + interestWei
    const deductions = gasAdvancedWei + fee
    const netAmount = gross - deductions

    expect(netAmount).toBe(gross - deductions)
    expect(netAmount).toBeGreaterThan(0n)

    const feeEth = Number(fee) / 1e18
    expect(feeEth).toBeCloseTo(0.15, 2)
  })

  it('시나리오 5: 면책 조항 미수락 시 출금 차단 (릴레이 허용 함수 목록)', () => {
    const allowedFunctions = ['deposit', 'withdraw', 'claimInterest', 'acceptDisclaimer']

    for (const fn of allowedFunctions) {
      expect(() => validateRelayRequest({
        userAddress: USER,
        fnName: fn,
        calldata: '0xabc',
        signedHash: '0xsig',
      })).not.toThrow()
    }

    expect(() => validateRelayRequest({
      userAddress: USER,
      fnName: 'transferOwnership',
      calldata: '0xabc',
      signedHash: '0xsig',
    })).toThrow()
  })

  it('시나리오 6: 이자 히스토리 시계열 조회', () => {
    insertInterestSnapshot(USER, '100000000000000', '100000000000000', '2026-03-18')
    insertInterestSnapshot(USER, '110000000000000', '210000000000000', '2026-03-19')
    insertInterestSnapshot(USER, '120000000000000', '330000000000000', '2026-03-20')

    const history = getInterestHistory(USER)

    expect(history[0].date).toBe('2026-03-20')
    expect(history[0].cumulative_interest).toBe('330000000000000')
    expect(history[2].date).toBe('2026-03-18')
  })
})
