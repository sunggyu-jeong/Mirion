jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@entities/lock', () => ({
  useLockStore: jest.fn(),
}));

jest.mock('@features/staking', () => ({
  useDeposit: jest.fn(),
  useWithdraw: jest.fn(),
  useClaimInterest: jest.fn(),
  useLockInfo: jest.fn(),
  usePendingTx: jest.fn(),
}));

jest.mock('viem', () => ({
  formatEther: jest.fn((val: bigint) => (Number(val) / 1e18).toString()),
  parseEther: jest.fn((val: string) => BigInt(Math.floor(Number(val) * 1e18))),
}));

import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import {
  useClaimInterest,
  useDeposit,
  useLockInfo,
  usePendingTx,
  useWithdraw,
} from '@features/staking';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import { StakingScreen } from '../StakingScreen';

const mockDeposit = jest.fn();
const mockWithdraw = jest.fn();
const mockClaimInterest = jest.fn();
const mockResetDeposit = jest.fn();
const mockResetWithdraw = jest.fn();
const mockResetClaim = jest.fn();

const defaultHooks = () => {
  jest.mocked(useWalletStore).mockReturnValue({ address: '0xUserAddress' } as never);
  jest.mocked(useLockStore).mockReturnValue({
    balance: 0n,
    unlockTime: 0n,
    pendingReward: 0n,
  } as never);
  jest.mocked(useDeposit).mockReturnValue({
    deposit: mockDeposit,
    txState: 'idle',
    errorMessage: null,
    reset: mockResetDeposit,
  } as never);
  jest.mocked(useWithdraw).mockReturnValue({
    withdraw: mockWithdraw,
    txState: 'idle',
    errorMessage: null,
    needsDisclaimer: false,
    reset: mockResetWithdraw,
  } as never);
  jest.mocked(useClaimInterest).mockReturnValue({
    claimInterest: mockClaimInterest,
    txState: 'idle',
    errorMessage: null,
    reset: mockResetClaim,
  } as never);
  jest.mocked(useLockInfo).mockReturnValue(undefined as never);
  jest.mocked(usePendingTx).mockReturnValue({
    pendingTx: null,
    isRecovering: false,
  } as never);
};

beforeEach(() => {
  jest.clearAllMocks();
  defaultHooks();
});

describe('StakingScreen', () => {
  describe('기본 렌더링', () => {
    it('LockFi 제목을 렌더링한다', () => {
      render(<StakingScreen />);
      expect(screen.getByText('LockFi')).toBeTruthy();
    });

    it('지갑 주소를 표시한다', () => {
      render(<StakingScreen />);
      expect(screen.getByText('0xUserAddress')).toBeTruthy();
    });

    it('지갑 미연결 시 "지갑 미연결" 텍스트를 표시한다', () => {
      jest.mocked(useWalletStore).mockReturnValue({ address: null } as never);
      render(<StakingScreen />);
      expect(screen.getByText('지갑 미연결')).toBeTruthy();
    });

    it('예치하기 버튼을 렌더링한다', () => {
      render(<StakingScreen />);
      expect(screen.getByText('예치하기')).toBeTruthy();
    });

    it('출금하기 버튼을 렌더링한다', () => {
      render(<StakingScreen />);
      expect(screen.getByText('출금하기')).toBeTruthy();
    });

    it('이자 수령 버튼을 렌더링한다', () => {
      render(<StakingScreen />);
      expect(screen.getByText('이자 수령')).toBeTruthy();
    });
  });

  describe('잔액 표시', () => {
    it('balance와 pendingReward를 formatEther로 표시한다', () => {
      jest.mocked(useLockStore).mockReturnValue({
        balance: BigInt('1000000000000000000'),
        unlockTime: 0n,
        pendingReward: BigInt('500000000000000000'),
      } as never);
      render(<StakingScreen />);
      expect(screen.getAllByText(/ETH/).length).toBeGreaterThan(0);
    });

    it('unlockTime이 0이면 "-"를 표시한다', () => {
      jest.mocked(useLockStore).mockReturnValue({
        balance: 0n,
        unlockTime: 0n,
        pendingReward: 0n,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('-')).toBeTruthy();
    });

    it('unlockTime이 있으면 날짜 형식으로 표시한다', () => {
      const futureTimestamp = BigInt(Math.floor(Date.now() / 1000) + 86400);
      jest.mocked(useLockStore).mockReturnValue({
        balance: 0n,
        unlockTime: futureTimestamp,
        pendingReward: 0n,
      } as never);
      render(<StakingScreen />);
      // 날짜가 "-"가 아닌 다른 텍스트로 표시됨
      expect(screen.queryByText('-')).toBeNull();
    });
  });

  describe('예치 상태', () => {
    it('depositState가 biometric이면 ActivityIndicator를 표시한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'biometric',
        errorMessage: null,
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('생체 인증 중...')).toBeTruthy();
    });

    it('depositState가 success이면 예치 완료 메시지를 표시한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'success',
        errorMessage: null,
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('예치 완료!')).toBeTruthy();
    });

    it('depositError가 있으면 오류 메시지를 표시한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'error',
        errorMessage: '잔액 부족',
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('잔액 부족')).toBeTruthy();
    });
  });

  describe('출금 상태', () => {
    it('withdrawState가 biometric이면 활성 상태 레이블이 표시된다', () => {
      jest.mocked(useWithdraw).mockReturnValue({
        withdraw: mockWithdraw,
        txState: 'biometric',
        errorMessage: null,
        needsDisclaimer: false,
        reset: mockResetWithdraw,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('생체 인증 중...')).toBeTruthy();
    });

    it('withdrawError가 있으면 오류 메시지를 표시한다', () => {
      jest.mocked(useWithdraw).mockReturnValue({
        withdraw: mockWithdraw,
        txState: 'error',
        errorMessage: '출금 실패',
        needsDisclaimer: false,
        reset: mockResetWithdraw,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('출금 실패')).toBeTruthy();
    });

    it('잔액이 있고 잠금 해제되면 출금 가능 상태가 된다', () => {
      const now = Math.floor(Date.now() / 1000);
      jest.mocked(useLockStore).mockReturnValue({
        balance: BigInt('1000000000000000000'),
        unlockTime: BigInt(now - 100),
        pendingReward: 0n,
      } as never);
      render(<StakingScreen />);
      expect(screen.queryByText('잠금 중')).toBeNull();
    });

    it('잔액이 있고 아직 잠금 중이면 "잠금 중" 텍스트를 표시한다', () => {
      const future = BigInt(Math.floor(Date.now() / 1000) + 86400);
      jest.mocked(useLockStore).mockReturnValue({
        balance: BigInt('1000000000000000000'),
        unlockTime: future,
        pendingReward: 0n,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('잠금 중')).toBeTruthy();
    });
  });

  describe('이자 수령 상태', () => {
    it('claimState가 broadcasting이면 활성 상태 레이블이 표시된다', () => {
      jest.mocked(useClaimInterest).mockReturnValue({
        claimInterest: mockClaimInterest,
        txState: 'broadcasting',
        errorMessage: null,
        reset: mockResetClaim,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('트랜잭션 전송 중...')).toBeTruthy();
    });

    it('claimError가 있으면 오류 메시지를 표시한다', () => {
      jest.mocked(useClaimInterest).mockReturnValue({
        claimInterest: mockClaimInterest,
        txState: 'error',
        errorMessage: '이자 수령 실패',
        reset: mockResetClaim,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('이자 수령 실패')).toBeTruthy();
    });
  });

  describe('activeTxLabel', () => {
    it('pending 상태에서 ActivityIndicator와 레이블을 표시한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'pending',
        errorMessage: null,
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('블록체인 처리 중...')).toBeTruthy();
    });

    it('claimState가 pending이면 이자 레이블을 표시한다', () => {
      jest.mocked(useClaimInterest).mockReturnValue({
        claimInterest: mockClaimInterest,
        txState: 'pending',
        errorMessage: null,
        reset: mockResetClaim,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('블록체인 처리 중...')).toBeTruthy();
    });
  });

  describe('에러 닫기 버튼', () => {
    it('error 상태에서 닫기 버튼을 표시한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'error',
        errorMessage: '오류',
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('닫기')).toBeTruthy();
    });

    it('닫기 버튼 클릭 시 모든 reset을 호출한다', () => {
      jest.mocked(useDeposit).mockReturnValue({
        deposit: mockDeposit,
        txState: 'error',
        errorMessage: '오류',
        reset: mockResetDeposit,
      } as never);
      render(<StakingScreen />);
      fireEvent.press(screen.getByText('닫기'));
      expect(mockResetDeposit).toHaveBeenCalled();
      expect(mockResetWithdraw).toHaveBeenCalled();
      expect(mockResetClaim).toHaveBeenCalled();
    });

    it('withdrawState error에서도 닫기 버튼이 표시된다', () => {
      jest.mocked(useWithdraw).mockReturnValue({
        withdraw: mockWithdraw,
        txState: 'error',
        errorMessage: '오류',
        needsDisclaimer: false,
        reset: mockResetWithdraw,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('닫기')).toBeTruthy();
    });
  });

  describe('트랜잭션 복구', () => {
    it('복구 중일 때 복구 상태를 표시한다', () => {
      jest.mocked(usePendingTx).mockReturnValue({
        pendingTx: { txHash: '0xdeadbeef', type: 'deposit', timestamp: 0, status: 'pending' },
        isRecovering: true,
      } as never);
      render(<StakingScreen />);
      expect(screen.getByText('트랜잭션 복구 중')).toBeTruthy();
    });

    it('복구 중이지만 pendingTx가 없으면 복구 UI를 표시하지 않는다', () => {
      jest.mocked(usePendingTx).mockReturnValue({
        pendingTx: null,
        isRecovering: true,
      } as never);
      render(<StakingScreen />);
      expect(screen.queryByText('트랜잭션 복구 중')).toBeNull();
    });
  });

  describe('출금 버튼', () => {
    it('잔액 있고 잠금 해제 시 출금 버튼 클릭이 withdraw를 호출한다', () => {
      const now = Math.floor(Date.now() / 1000);
      jest.mocked(useLockStore).mockReturnValue({
        balance: BigInt('1000000000000000000'),
        unlockTime: BigInt(now - 100),
        pendingReward: 0n,
      } as never);
      render(<StakingScreen />);
      fireEvent.press(screen.getByText('출금하기'));
      expect(mockWithdraw).toHaveBeenCalled();
    });
  });

  describe('이자 수령 버튼', () => {
    it('pendingReward 있을 때 이자 수령 버튼 클릭이 claimInterest를 호출한다', () => {
      jest.mocked(useLockStore).mockReturnValue({
        balance: 0n,
        unlockTime: 0n,
        pendingReward: BigInt('100000000000000000'),
      } as never);
      render(<StakingScreen />);
      fireEvent.press(screen.getByText('이자 수령'));
      expect(mockClaimInterest).toHaveBeenCalled();
    });
  });

  describe('예치 입력 유효성 검사', () => {
    it('금액 미입력 시 Alert를 표시한다', () => {
      jest.spyOn(Alert, 'alert');
      render(<StakingScreen />);
      fireEvent.press(screen.getByText('예치하기'));
      expect(Alert.alert).toHaveBeenCalledWith(
        '입력 오류',
        '올바른 금액과 잠금 기간을 입력하세요.',
      );
    });

    it('올바른 입력값으로 deposit을 호출한다', () => {
      render(<StakingScreen />);
      fireEvent.changeText(screen.getByPlaceholderText('예치할 ETH 금액'), '1.0');
      fireEvent.changeText(screen.getByPlaceholderText('잠금 기간 (일)'), '30');
      fireEvent.press(screen.getByText('예치하기'));
      expect(mockDeposit).toHaveBeenCalled();
    });
  });
});
