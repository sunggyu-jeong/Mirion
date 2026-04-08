jest.mock('@shared/lib/storage', () => ({
  storage: { getString: jest.fn(), set: jest.fn() },
}));
jest.mock('@shared/lib/toast', () => ({
  toast: { info: jest.fn(), success: jest.fn(), error: jest.fn() },
}));

import { storage } from '@shared/lib/storage';
import { toast } from '@shared/lib/toast';
import { renderHook } from '@testing-library/react-native';

import { useDailyBriefing } from '../use-daily-briefing';

const mockGetString = storage.getString as jest.Mock;
const mockSet = storage.set as jest.Mock;
const mockToastInfo = toast.info as jest.Mock;

const TODAY = new Date().toISOString().split('T')[0];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useDailyBriefing', () => {
  it('does nothing when movements is undefined', () => {
    renderHook(() => useDailyBriefing(undefined));
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('does nothing before 9am', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    mockGetString.mockReturnValue(undefined);
    renderHook(() => useDailyBriefing([]));
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('does nothing if briefing already shown today', () => {
    mockGetString.mockReturnValue(TODAY);
    renderHook(() => useDailyBriefing([]));
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('shows briefing and saves date when not shown yet', () => {
    mockGetString.mockReturnValue(undefined);
    renderHook(() => useDailyBriefing([]));
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith('daily-briefing-date', TODAY);
  });

  it('includes movement count in message when there are movements', () => {
    mockGetString.mockReturnValue(undefined);
    const movements = [
      {
        txHash: '0x1',
        type: 'send' as const,
        amountEth: 500,
        amountUsd: 1_000_000,
        fromAddress: '0xFrom',
        toAddress: '0xTo',
        timestampMs: Date.now(),
        blockNumber: 1n,
        isLarge: true,
        asset: 'ETH',
      },
    ];
    renderHook(() => useDailyBriefing(movements));
    expect(mockToastInfo).toHaveBeenCalledWith(expect.stringContaining('1건'));
  });

  it('shows no-activity message when no movements today', () => {
    mockGetString.mockReturnValue(undefined);
    renderHook(() => useDailyBriefing([]));
    expect(mockToastInfo).toHaveBeenCalledWith(expect.stringContaining('없음'));
  });
});
