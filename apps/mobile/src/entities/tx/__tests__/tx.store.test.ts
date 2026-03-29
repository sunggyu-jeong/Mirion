import { useTxStore } from '../model/tx.store';

describe('useTxStore', () => {
  beforeEach(() => {
    useTxStore.getState().reset();
  });

  it('초기 status가 idle이다', () => {
    expect(useTxStore.getState().status).toBe('idle');
  });

  it('setPending이 txHash와 status를 설정한다', () => {
    useTxStore.getState().setPending('0xabc', 'stake');
    const state = useTxStore.getState();
    expect(state.txHash).toBe('0xabc');
    expect(state.status).toBe('pending');
    expect(state.txType).toBe('stake');
  });

  it('setSuccess가 status를 success로 변경한다', () => {
    useTxStore.getState().setPending('0xabc', 'stake');
    useTxStore.getState().setSuccess();
    expect(useTxStore.getState().status).toBe('success');
  });

  it('setError가 status와 errorMessage를 설정한다', () => {
    useTxStore.getState().setError('트랜잭션 실패');
    const state = useTxStore.getState();
    expect(state.status).toBe('error');
    expect(state.errorMessage).toBe('트랜잭션 실패');
  });

  it('reset이 초기 상태로 돌아간다', () => {
    useTxStore.getState().setPending('0xabc', 'unstake');
    useTxStore.getState().reset();
    const state = useTxStore.getState();
    expect(state.txHash).toBeNull();
    expect(state.status).toBe('idle');
  });
});
