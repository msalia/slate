import { describe, expect, it } from 'vitest';

import { generatePublishToken } from '@/lib/token';

describe('generatePublishToken', () => {
  it('generates a 5-character token by default', () => {
    const token = generatePublishToken();
    expect(token).toHaveLength(5);
  });

  it('generates a token with custom length', () => {
    const token = generatePublishToken(8);
    expect(token).toHaveLength(8);
  });

  it('only contains lowercase letters and numbers', () => {
    const token = generatePublishToken();
    expect(token).toMatch(/^[a-z0-9]+$/);
  });

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generatePublishToken()));
    expect(tokens.size).toBeGreaterThan(90);
  });
});
