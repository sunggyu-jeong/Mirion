import { getMagnitudeInfo } from '../magnitude';

describe('getMagnitudeInfo', () => {
  it('returns legendary for >= 50,000 ETH', () => {
    expect(getMagnitudeInfo(50_000).level).toBe('legendary');
    expect(getMagnitudeInfo(100_000).level).toBe('legendary');
  });

  it('returns massive for >= 10,000 ETH', () => {
    expect(getMagnitudeInfo(10_000).level).toBe('massive');
    expect(getMagnitudeInfo(49_999).level).toBe('massive');
  });

  it('returns large for >= 1,000 ETH', () => {
    expect(getMagnitudeInfo(1_000).level).toBe('large');
    expect(getMagnitudeInfo(9_999).level).toBe('large');
  });

  it('returns medium for >= 100 ETH', () => {
    expect(getMagnitudeInfo(100).level).toBe('medium');
    expect(getMagnitudeInfo(999).level).toBe('medium');
  });

  it('returns small for < 100 ETH', () => {
    expect(getMagnitudeInfo(0).level).toBe('small');
    expect(getMagnitudeInfo(99).level).toBe('small');
  });

  it('legendary label contains ⚡', () => {
    expect(getMagnitudeInfo(50_000).label).toContain('⚡');
  });

  it('massive label contains 🔴', () => {
    expect(getMagnitudeInfo(10_000).label).toContain('🔴');
  });

  it('returns correct color and bg per level', () => {
    const legendary = getMagnitudeInfo(50_000);
    expect(legendary.color).toBe('#7c3aed');
    expect(legendary.bg).toBe('#f5f3ff');
  });

  it('returns small (fallthrough) for negative value', () => {
    expect(getMagnitudeInfo(-1).level).toBe('small');
  });
});
