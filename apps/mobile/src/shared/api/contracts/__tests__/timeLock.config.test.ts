jest.mock('react-native-config', () => ({
  CHAIN_ID: '84532',
  TIMELOCK_CONTRACT_ADDRESS: '0xDeadBeef00000000000000000000000000000001',
  RPC_URL: 'http://localhost:8545',
}));

import { CHAIN, TIMELOCK_ADDRESS, timeLockContract } from '../timeLock.config';

describe('timeLock.config', () => {
  describe('CHAIN', () => {
    it('CHAIN_ID 84532이면 baseSepolia 체인이다', () => {
      expect(CHAIN.id).toBe(84532);
    });

    it('CHAIN_ID 8453이면 base 체인이다', () => {
      jest.resetModules();
      jest.mock('react-native-config', () => ({
        CHAIN_ID: '8453',
        TIMELOCK_CONTRACT_ADDRESS: '0x0',
        RPC_URL: 'http://localhost:8545',
      }));
      const { CHAIN: baseChain } = require('../timeLock.config');
      expect(baseChain.id).toBe(8453);
    });
  });

  describe('TIMELOCK_ADDRESS', () => {
    it('Config.TIMELOCK_CONTRACT_ADDRESS 값을 사용한다', () => {
      expect(TIMELOCK_ADDRESS).toBe('0xDeadBeef00000000000000000000000000000001');
    });

    it('Config.TIMELOCK_CONTRACT_ADDRESS가 없으면 0x를 사용한다', () => {
      jest.resetModules();
      jest.mock('react-native-config', () => ({
        CHAIN_ID: '84532',
        TIMELOCK_CONTRACT_ADDRESS: undefined,
        RPC_URL: 'http://localhost:8545',
      }));
      const { TIMELOCK_ADDRESS: fallback } = require('../timeLock.config');
      expect(fallback).toBe('0x');
    });
  });

  describe('timeLockContract', () => {
    it('address 필드가 있다', () => {
      expect(timeLockContract).toHaveProperty('address');
    });

    it('abi 필드가 있다', () => {
      expect(timeLockContract).toHaveProperty('abi');
    });

    it('address가 TIMELOCK_ADDRESS와 일치한다', () => {
      expect(timeLockContract.address).toBe(TIMELOCK_ADDRESS);
    });
  });
});
