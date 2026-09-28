import { normalizeEmail } from './email';

describe('normalizeEmail (plus-trick + gmail dots)', () => {
  it('collapses user+tag@gmail.com to user@gmail.com', () => {
    expect(normalizeEmail('user+test1@gmail.com').canonical).toBe('user@gmail.com');
    expect(normalizeEmail('user+test1@gmail.com').wasAliased).toBe(true);
  });

  it('removes dots for gmail only', () => {
    expect(normalizeEmail('u.s.e.r@gmail.com').canonical).toBe('user@gmail.com');
    expect(normalizeEmail('u.s.e.r@company.com').canonical).toBe('u.s.e.r@company.com');
  });

  it('lowercases and trims', () => {
    expect(normalizeEmail('  User@Gmail.COM ').canonical).toBe('user@gmail.com');
  });
});
