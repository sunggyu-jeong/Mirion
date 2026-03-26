import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { StepIndicator } from '../StepIndicator';

const STEPS = [
  { label: '트랜잭션 승인', subtitle: '지갑에서 트랜잭션을 승인해주세요' },
  { label: '예치 진행 중', subtitle: '블록체인에 기록 중입니다' },
  { label: '확인 대기', subtitle: '트랜잭션이 확인되고 있습니다' },
];

describe('StepIndicator', () => {
  it('모든 단계 라벨을 렌더링한다', () => {
    render(
      <StepIndicator
        steps={STEPS}
        activeStep={0}
      />,
    );
    expect(screen.getByText('트랜잭션 승인')).toBeTruthy();
    expect(screen.getByText('예치 진행 중')).toBeTruthy();
    expect(screen.getByText('확인 대기')).toBeTruthy();
  });

  it('활성 단계의 subtitle을 표시한다', () => {
    render(
      <StepIndicator
        steps={STEPS}
        activeStep={0}
      />,
    );
    expect(screen.getByText('지갑에서 트랜잭션을 승인해주세요')).toBeTruthy();
  });

  it('비활성 단계는 subtitle을 표시하지 않는다', () => {
    render(
      <StepIndicator
        steps={STEPS}
        activeStep={0}
      />,
    );
    expect(screen.queryByText('블록체인에 기록 중입니다')).toBeNull();
    expect(screen.queryByText('트랜잭션이 확인되고 있습니다')).toBeNull();
  });

  it('step 2가 활성일 때 해당 subtitle을 표시한다', () => {
    render(
      <StepIndicator
        steps={STEPS}
        activeStep={1}
      />,
    );
    expect(screen.getByText('블록체인에 기록 중입니다')).toBeTruthy();
    expect(screen.queryByText('지갑에서 트랜잭션을 승인해주세요')).toBeNull();
  });

  it('단계 번호 배지를 렌더링한다', () => {
    render(
      <StepIndicator
        steps={STEPS}
        activeStep={0}
      />,
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
