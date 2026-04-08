import { CURATED_WHALES } from '../curated-whales';
import type { Chain } from '../whale.types';
import { CHAIN_CONFIG } from '../whale.types';

describe('CURATED_WHALES', () => {
  it('should have 9 whale profiles', () => {
    expect(CURATED_WHALES).toHaveLength(9);
  });

  it('each whale should have a valid chain', () => {
    const validChains = Object.keys(CHAIN_CONFIG) as Chain[];
    CURATED_WHALES.forEach(whale => {
      expect(validChains).toContain(whale.chain);
    });
  });

  it('should include whales for each supported chain', () => {
    const chains = CURATED_WHALES.map(w => w.chain);
    expect(chains).toContain('ETH');
    expect(chains).toContain('BTC');
    expect(chains).toContain('SOL');
    expect(chains).toContain('BNB');
  });

  it('free whales (isLocked=false) should be 3', () => {
    const free = CURATED_WHALES.filter(w => !w.isLocked);
    expect(free).toHaveLength(3);
  });

  it('locked whales (isLocked=true) should be 6', () => {
    const locked = CURATED_WHALES.filter(w => w.isLocked);
    expect(locked).toHaveLength(6);
  });

  it('each whale should have a unique id', () => {
    const ids = CURATED_WHALES.map(w => w.id);
    expect(new Set(ids).size).toBe(CURATED_WHALES.length);
  });
});

describe('CHAIN_CONFIG', () => {
  it('should have config for all chains', () => {
    expect(CHAIN_CONFIG.ETH).toBeDefined();
    expect(CHAIN_CONFIG.BTC).toBeDefined();
    expect(CHAIN_CONFIG.SOL).toBeDefined();
    expect(CHAIN_CONFIG.BNB).toBeDefined();
  });

  it('each chain config should have label and color', () => {
    Object.values(CHAIN_CONFIG).forEach(config => {
      expect(config.label).toBeTruthy();
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
