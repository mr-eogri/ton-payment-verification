/**
 * Validation utilities for payment verification
 */

export class Validators {
  /**
   * Validate TON address format
   */
  static isValidTonAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    
    // Remove spaces
    const cleanAddress = address.trim();
    
    // Check length (bounceable/non-bounceable)
    if (cleanAddress.length !== 48 && cleanAddress.length !== 66) {
      return false;
    }
    
    // Check if it's base64 or base64url
    const base64Regex = /^[A-Za-z0-9+/]+=*$|^[A-Za-z0-9_-]+=*$/;
    return base64Regex.test(cleanAddress);
  }

  /**
   * Validate transaction hash format
   */
  static isValidTransactionHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') return false;
    
    const cleanHash = hash.trim();
    
    // Hex format (64 characters)
    const hexRegex = /^[0-9a-fA-F]{64}$/;
    // Base64 format
    const base64Regex = /^[A-Za-z0-9+/]{43}=$/;
    
    return hexRegex.test(cleanHash) || base64Regex.test(cleanHash);
  }

  /**
   * Validate amount (in nanotons)
   */
  static isValidAmount(amount: string | number): boolean {
    if (amount === undefined || amount === null || amount === '') return false;
    
    const num = typeof amount === 'string' ? BigInt(amount) : BigInt(amount);
    return num > 0n;
  }

  /**
   * Validate timestamp
   */
  static isValidTimestamp(timestamp: number): boolean {
    if (typeof timestamp !== 'number') return false;
    // Check if timestamp is within reasonable range (between 2009 and year 2100)
    return timestamp > 1231006505 && timestamp < 4102444800;
  }

  /**
   * Validate memo/message
   */
  static isValidMemo(memo: string): boolean {
    if (!memo || typeof memo !== 'string') return true; // memo is optional
    return memo.length <= 1000; // reasonable limit
  }

  /**
   * Validate payload
   */
  static isValidPayload(payload: string): boolean {
    if (!payload || typeof payload !== 'string') return true; // payload is optional
    // Check if it's valid hex
    const hexRegex = /^[0-9a-fA-F]*$/;
    return hexRegex.test(payload) && payload.length % 2 === 0;
  }
}
