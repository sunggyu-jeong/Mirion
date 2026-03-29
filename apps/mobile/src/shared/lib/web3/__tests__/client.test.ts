jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({ getBlockNumber: jest.fn() })),
  http: jest.fn(() => ({})),
}));

jest.mock('@shared/api/contracts', () => ({
  CHAIN: { id: 1 },
}));

import { createPublicClient } from 'viem';

import { publicClient } from '../client';

describe('publicClient', () => {
  it('정의된다', () => {
    expect(publicClient).toBeDefined();
  });

  it('createPublicClient로 생성된다', () => {
    expect(createPublicClient).toHaveBeenCalled();
  });
});

describe('publicClient (RPC_URL 없는 경우)', () => {
  it('RPC_URL이 없으면 undefined로 transport를 생성한다', () => {
    jest.resetModules();
    jest.mock('react-native-config', () => ({}));
    jest.mock('viem', () => ({
      createPublicClient: jest.fn(() => ({})),
      http: jest.fn(() => ({})),
    }));
    jest.mock('@shared/api/contracts', () => ({ CHAIN: { id: 1 } }));

    const { http } = require('viem');
    require('../client');
    expect(http).toHaveBeenCalledWith(undefined);
  });
});
