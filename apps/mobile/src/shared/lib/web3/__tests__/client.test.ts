jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({ getBlockNumber: jest.fn() })),
  createWalletClient: jest.fn(() => ({ account: {}, writeContract: jest.fn() })),
  http: jest.fn(() => ({})),
}));

jest.mock('viem/accounts', () => ({
  privateKeyToAccount: jest.fn(() => ({ address: '0xabc' })),
}));

jest.mock('@shared/api/contracts', () => ({
  CHAIN: { id: 84532 },
}));

import { createPublicClient, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { createWalletClientFromKey, publicClient } from '../client';

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
    jest.mock('react-native-config', () => ({ CHAIN_ID: '84532' }));
    jest.mock('viem', () => ({
      createPublicClient: jest.fn(() => ({})),
      createWalletClient: jest.fn(() => ({})),
      http: jest.fn(() => ({})),
    }));
    jest.mock('viem/accounts', () => ({ privateKeyToAccount: jest.fn() }));
    jest.mock('@shared/api/contracts', () => ({ CHAIN: { id: 84532 } }));

    const { createPublicClient, http } = require('viem');
    require('../client');
    expect(http).toHaveBeenCalledWith(undefined);
    expect(createPublicClient).toHaveBeenCalled();
  });
});

describe('createWalletClientFromKey', () => {
  it('개인키로 지갑 클라이언트를 반환한다', () => {
    const result = createWalletClientFromKey('0xdeadbeef' as `0x${string}`);
    expect(result).toBeDefined();
  });

  it('privateKeyToAccount를 올바른 키로 호출한다', () => {
    createWalletClientFromKey('0xdeadbeef' as `0x${string}`);
    expect(privateKeyToAccount).toHaveBeenCalledWith('0xdeadbeef');
  });

  it('createWalletClient를 호출한다', () => {
    createWalletClientFromKey('0xdeadbeef' as `0x${string}`);
    expect(createWalletClient).toHaveBeenCalled();
  });
});
