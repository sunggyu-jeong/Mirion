import { LEGAL_ACCEPTED_KEY } from '../keys';

describe('storage keys', () => {
  it('LEGAL_ACCEPTED_KEY 값이 "legal-accepted"이다', () => {
    expect(LEGAL_ACCEPTED_KEY).toBe('legal-accepted');
  });
});
