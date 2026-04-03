import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React, { createRef } from 'react';
import { Text } from 'react-native';

import { BottomSheet } from '../BottomSheet';

describe('BottomSheet', () => {
  it('초기 상태에서 null을 반환한다 (mounted=false)', () => {
    const ref = createRef<any>();
    const { toJSON } = render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    expect(toJSON()).toBeNull();
  });

  it('open() 호출 시 children을 렌더링한다', () => {
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>시트 내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    expect(screen.getByText('시트 내용')).toBeTruthy();
  });

  it('close()를 오류 없이 호출할 수 있다', () => {
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    expect(() => {
      act(() => {
        ref.current?.close();
      });
    }).not.toThrow();
  });

  it('콜백과 함께 close()를 호출할 수 있다', () => {
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    expect(() => {
      act(() => {
        ref.current?.close(jest.fn());
      });
    }).not.toThrow();
  });

  it('open() 후 다시 open() 해도 오류가 발생하지 않는다', () => {
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    expect(() => {
      act(() => {
        ref.current?.open();
        ref.current?.open();
      });
    }).not.toThrow();
    expect(screen.getByText('내용')).toBeTruthy();
  });

  it('열린 상태에서 렌더링된 컴포넌트가 존재한다', () => {
    const ref = createRef<any>();
    const { toJSON } = render(
      <BottomSheet
        height={300}
        ref={ref}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    expect(toJSON()).not.toBeNull();
  });

  it('bottomInset과 horizontalInset prop을 받는다', () => {
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
        bottomInset={20}
        horizontalInset={16}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    expect(screen.getByText('내용')).toBeTruthy();
  });

  it('onDismiss prop이 close 시 호출된다', () => {
    const ref = createRef<any>();
    const onDismiss = jest.fn();
    render(
      <BottomSheet
        height={300}
        ref={ref}
        onDismiss={onDismiss}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    act(() => {
      ref.current?.close();
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('백드롭 onPress가 dismiss를 호출한다', () => {
    const onDismiss = jest.fn();
    const ref = createRef<any>();
    render(
      <BottomSheet
        height={300}
        ref={ref}
        onDismiss={onDismiss}
      >
        <Text>내용</Text>
      </BottomSheet>,
    );
    act(() => {
      ref.current?.open();
    });
    fireEvent.press(screen.getByTestId('bottom-sheet-backdrop'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
