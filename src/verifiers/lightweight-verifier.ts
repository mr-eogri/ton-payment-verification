/**
 * Lightweight verification method - balance between fast and full
 */

import { BaseVerifier } from './base-verifier';
import { PaymentDetails, VerificationOptions, VerificationResult } from '../types/index';
import { FastVerifier } from './fast-verifier';

export class LightweightVerifier extends BaseVerifier {
  private fastVerifier: FastVerifier;

  constructor(debug: boolean = false) {
    super(debug);
    this.fastVerifier = new FastVerifier(debug);
  }

  /**
   * Lightweight verification - fast validation with some additional checks
   */
  async verify(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    const startTime = Date.now();
    
    this.logger.info('Starting lightweight verification', { hash: details.transactionHash });

    // Use fast verification as base
    const fastResult = await this.fastVerifier.verify(details, options);
    
    if (!fastResult.valid) {
      return fastResult;
    }

    // Add additional lightweight checks
    const additionalChecks = this.performAdditionalChecks(details);
    
    const result: VerificationResult = {
      ...fastResult,
      valid: additionalChecks,
      status: additionalChecks ? 'success' : 'pending',
      message: additionalChecks 
        ? 'Lightweight verification passed' 
        : 'Additional checks failed',
      verificationTime: Date.now() - startTime
    };

    this.logger.info('Lightweight verification completed', { result });
    return result;
  }

  /**
   * Perform additional lightweight checks
   */
  private performAdditionalChecks(details: PaymentDetails): boolean {
    try {
      // Check memo length
      if (details.memo && details.memo.length > 500) {
        this.logger.warn('Memo too long');
        return false;
      }

      // Verify amount is not zero
      const amount = BigInt(details.amount);
      if (amount === 0n) {
        this.logger.warn('Amount cannot be zero');
        return false;
      }

      // Check for suspicious patterns
      if (this.detectSuspiciousPatterns(details)) {
        this.logger.warn('Suspicious patterns detected');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error in additional checks', error);
      return false;
    }
  }

  /**
   * Detect suspicious patterns
   */
  private detectSuspiciousPatterns(details: PaymentDetails): boolean {
    // Check for repeated characters in addresses
    const senderRepeats = this.countConsecutiveChars(details.sender);
    const receiverRepeats = this.countConsecutiveChars(details.receiver);
    
    if (senderRepeats > 10 || receiverRepeats > 10) {
      return true;
    }

    // Check if memo looks like gibberish
    if (details.memo && !this.isValidText(details.memo)) {
      return true;
    }

    return false;
  }

  /**
   * Count maximum consecutive same characters
   */
  private countConsecutiveChars(str: string): number {
    let maxCount = 0;
    let currentCount = 1;
    
    for (let i = 1; i < str.length; i++) {
      if (str[i] === str[i - 1]) {
        currentCount++;
      } else {
        maxCount = Math.max(maxCount, currentCount);
        currentCount = 1;
      }
    }
    
    return Math.max(maxCount, currentCount);
  }

  /**
   * Check if text looks valid
   */
  private isValidText(text: string): boolean {
    // At least 50% should be alphanumeric or common symbols
    const validChars = text.match(/[a-zA-Z0-9\s.,-_]/g) || [];
    return validChars.length / text.length >= 0.5;
  }
}
