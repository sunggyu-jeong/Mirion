import { useLockStore } from '../model/lock.store'

describe('useLockStore', () => {
  beforeEach(() => {
    useLockStore.setState({
      balance: 0n,
      unlockTime: 0n,
      pendingReward: 0n,
    })
  })

  describe('초기 상태', () => {
    it('balance가 0n이다', () => {
      expect(useLockStore.getState().balance).toBe(0n)
    })

    it('unlockTime이 0n이다', () => {
      expect(useLockStore.getState().unlockTime).toBe(0n)
    })

    it('pendingReward가 0n이다', () => {
      expect(useLockStore.getState().pendingReward).toBe(0n)
    })
  })

  describe('setLockInfo', () => {
    it('balance와 unlockTime을 업데이트한다', () => {
      useLockStore.getState().setLockInfo(1000n, 9999999999n)
      const state = useLockStore.getState()
      expect(state.balance).toBe(1000n)
      expect(state.unlockTime).toBe(9999999999n)
    })

    it('pendingReward는 변경하지 않는다', () => {
      useLockStore.setState({ pendingReward: 500n })
      useLockStore.getState().setLockInfo(1000n, 9999999999n)
      expect(useLockStore.getState().pendingReward).toBe(500n)
    })
  })

  describe('setPendingReward', () => {
    it('pendingReward를 업데이트한다', () => {
      useLockStore.getState().setPendingReward(999n)
      expect(useLockStore.getState().pendingReward).toBe(999n)
    })

    it('balance는 변경하지 않는다', () => {
      useLockStore.setState({ balance: 1000n })
      useLockStore.getState().setPendingReward(999n)
      expect(useLockStore.getState().balance).toBe(1000n)
    })
  })

  describe('optimisticDeposit', () => {
    it('기존 balance에 amount를 더한다', () => {
      useLockStore.setState({ balance: 500n })
      useLockStore.getState().optimisticDeposit(300n, 9999999999n)
      expect(useLockStore.getState().balance).toBe(800n)
    })

    it('unlockTime을 업데이트한다', () => {
      useLockStore.getState().optimisticDeposit(300n, 9999999999n)
      expect(useLockStore.getState().unlockTime).toBe(9999999999n)
    })

    it('balance가 0n인 상태에서 amount를 그대로 설정한다', () => {
      useLockStore.getState().optimisticDeposit(1000n, 9999999999n)
      expect(useLockStore.getState().balance).toBe(1000n)
    })
  })

  describe('optimisticWithdraw', () => {
    it('balance를 0n으로 설정한다', () => {
      useLockStore.setState({ balance: 1000n })
      useLockStore.getState().optimisticWithdraw()
      expect(useLockStore.getState().balance).toBe(0n)
    })

    it('unlockTime을 0n으로 설정한다', () => {
      useLockStore.setState({ unlockTime: 9999999999n })
      useLockStore.getState().optimisticWithdraw()
      expect(useLockStore.getState().unlockTime).toBe(0n)
    })
  })

  describe('optimisticClaimInterest', () => {
    it('pendingReward를 0n으로 설정한다', () => {
      useLockStore.setState({ pendingReward: 500n })
      useLockStore.getState().optimisticClaimInterest()
      expect(useLockStore.getState().pendingReward).toBe(0n)
    })

    it('balance는 변경하지 않는다', () => {
      useLockStore.setState({ balance: 1000n, pendingReward: 500n })
      useLockStore.getState().optimisticClaimInterest()
      expect(useLockStore.getState().balance).toBe(1000n)
    })
  })

  describe('reset', () => {
    it('모든 상태를 초기값으로 되돌린다', () => {
      useLockStore.setState({ balance: 1000n, unlockTime: 9999999999n, pendingReward: 500n })
      useLockStore.getState().reset()
      const state = useLockStore.getState()
      expect(state.balance).toBe(0n)
      expect(state.unlockTime).toBe(0n)
      expect(state.pendingReward).toBe(0n)
    })
  })
})
