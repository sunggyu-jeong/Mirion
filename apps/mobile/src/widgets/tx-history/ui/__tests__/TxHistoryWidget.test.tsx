import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/tx', () => ({
  useTxStore: jest.fn(),
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Linking = { openURL: jest.fn() };
  return rn;
});

import { useTxStore } from '@entities/tx';
import { fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { TxHistoryWidget } from '../TxHistoryWidget';

const baseStore = {
  txHash: null as string | null,
  status: 'pending',
  txType: 'stake',
  amountEth: '',
  errorMessage: '',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useTxStore).mockReturnValue({ ...baseStore } as never);
});

describe('TxHistoryWidget', () => {
  it('txHash 없으면 빈 상태 메시지를 렌더링한다', () => {
    render(<TxHistoryWidget />);
    expect(screen.getByText('아직 트랜잭션 내역이 없습니다')).toBeTruthy();
  });

  it('stake 타입 txHash가 있으면 "ETH 스테이킹" 텍스트를 렌더링한다', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xabc',
      status: 'success',
      amountEth: '1.5',
    } as never);
    render(<TxHistoryWidget />);
    expect(screen.getByText('ETH 스테이킹')).toBeTruthy();
  });

  it('unstake 타입이면 "stETH 언스테이킹" 텍스트를 렌더링한다', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xabc',
      txType: 'unstake',
      amountEth: '0.5',
    } as never);
    render(<TxHistoryWidget />);
    expect(screen.getByText('stETH 언스테이킹')).toBeTruthy();
  });

  it('success 상태일 때 "완료" 배지를 렌더링한다', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xdef',
      status: 'success',
      amountEth: '1.0',
    } as never);
    render(<TxHistoryWidget />);
    expect(screen.getByText('완료')).toBeTruthy();
  });

  it('error 상태일 때 "실패" 배지와 에러 메시지를 렌더링한다', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xghi',
      status: 'error',
      amountEth: '1.0',
      errorMessage: '잔액 부족',
    } as never);
    render(<TxHistoryWidget />);
    expect(screen.getByText('실패')).toBeTruthy();
    expect(screen.getByText('잔액 부족')).toBeTruthy();
  });

  it('pending 상태일 때 "진행 중" 배지를 렌더링한다', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xjkl',
      status: 'pending',
      amountEth: '2.0',
    } as never);
    render(<TxHistoryWidget />);
    expect(screen.getByText('진행 중')).toBeTruthy();
  });

  it('"이더스캔에서 보기" 버튼 클릭 시 Linking.openURL 호출', () => {
    jest.mocked(useTxStore).mockReturnValue({
      ...baseStore,
      txHash: '0xTxHash',
      status: 'success',
      amountEth: '1.0',
    } as never);
    render(<TxHistoryWidget />);
    fireEvent.press(screen.getByText('이더스캔에서 보기 →'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://etherscan.io/tx/0xTxHash');
  });
});
