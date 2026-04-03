import { useLidoStore } from '../model/lido.store';

describe('useLidoStore', () => {
  beforeEach(() => {
    useLidoStore.setState({ stakedBalance: 0n, estimatedApy: 0 });
  });

  it('초기 stakedBalance가 0n이다', () => {
    expect(useLidoStore.getState().stakedBalance).toBe(0n);
  });

  it('초기 estimatedApy가 0이다', () => {
    expect(useLidoStore.getState().estimatedApy).toBe(0);
  });

  it('setStakedBalance가 잔고를 업데이트한다', () => {
    useLidoStore.getState().setStakedBalance(1000000000000000000n);
    expect(useLidoStore.getState().stakedBalance).toBe(1000000000000000000n);
  });

  it('setEstimatedApy가 APY를 업데이트한다', () => {
    useLidoStore.getState().setEstimatedApy(3.8);
    expect(useLidoStore.getState().estimatedApy).toBe(3.8);
  });

  it('setStakeBaseline이 baseline을 업데이트한다', () => {
    useLidoStore.getState().setStakeBaseline(500000000000000000n);
    expect(useLidoStore.getState().stakeBaseline).toBe(500000000000000000n);
  });

  it('reset이 초기 상태로 돌아간다', () => {
    useLidoStore.setState({ stakedBalance: 5n, estimatedApy: 5.0 });
    useLidoStore.getState().reset();
    expect(useLidoStore.getState().stakedBalance).toBe(0n);
    expect(useLidoStore.getState().estimatedApy).toBe(0);
  });
});
