import { describe, it, expect } from 'vitest';

import { findDuplicatedOrBlockedEmailDomains } from './domain.js';

describe('findDuplicatedOrBlockedEmailDomains', () => {
  it('should return blocked domains and duplicated domains correctly', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([
      'gmail.com',
      'silverhand.io',
      'myeyesid.io',
      'yahoo.com',
      'outlook.com',
      'myeyesid.io',
    ]);
    expect(duplicatedDomains).toEqual(new Set(['myeyesid.io']));
    expect(forbiddenDomains).toEqual(new Set(['gmail.com', 'yahoo.com', 'outlook.com']));
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if all domains are valid', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([
      'silverhand.io',
      'myeyesid.io',
      'metalhand.io',
    ]);
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if input is undefined', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains();
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });

  it('should return empty `duplicatedDomains` and `forbiddenDomains` sets if input is empty array', () => {
    const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains([]);
    expect(duplicatedDomains).toEqual(new Set());
    expect(forbiddenDomains).toEqual(new Set());
  });
});
