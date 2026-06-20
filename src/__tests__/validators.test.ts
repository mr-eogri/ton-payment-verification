/**
 * Tests for validators
 */

import { Validators } from '../utils/validators';

describe('Validators', () => {
  describe('isValidTonAddress', () => {
    it('should validate correct TON addresses', () => {
      const validAddresses = [
        'EQC_sender_address_1234567890123456789012345',
        'UQC_sender_address_1234567890123456789012345'
      ];
      validAddresses.forEach(addr => {
        expect(Validators.isValidTonAddress(addr)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      expect(Validators.isValidTonAddress('')).toBe(false);
      expect(Validators.isValidTonAddress('invalid')).toBe(false);
      expect(Validators.isValidTonAddress('123')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive amounts', () => {
      expect(Validators.isValidAmount('1000000000')).toBe(true);
      expect(Validators.isValidAmount('1')).toBe(true);
      expect(Validators.isValidAmount(1000)).toBe(true);
    });

    it('should reject zero and negative amounts', () => {
      expect(Validators.isValidAmount('0')).toBe(false);
      expect(Validators.isValidAmount('-1')).toBe(false);
      expect(Validators.isValidAmount('')).toBe(false);
    });
  });

  describe('isValidTimestamp', () => {
    it('should validate reasonable timestamps', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(Validators.isValidTimestamp(now)).toBe(true);
      expect(Validators.isValidTimestamp(now - 86400)).toBe(true); // 1 day ago
    });

    it('should reject invalid timestamps', () => {
      expect(Validators.isValidTimestamp(100)).toBe(false);
      expect(Validators.isValidTimestamp(5000000000)).toBe(false);
    });
  });
});
