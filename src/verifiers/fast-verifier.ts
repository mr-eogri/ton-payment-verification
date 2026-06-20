/**
 * Fast verification method - quick local validation without blockchain queries
 */

import { BaseVerifier } from './base-verifier';
import { PaymentDetails, VerificationOptions, VerificationResult } from '../types/index';

export class FastVerifier extends BaseVerifier {
  /**
   * Fast verification - only validates structure and formats
   * No blockchain lookup
   */
  async verify(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    const startTime = Date.now();
    
    this.logger.info('Starting fast verification', { hash: details.transactionHash });

    // Validate payment details
    const validation = this.validatePaymentDetails(details);
    
    if (!validation.valid) {
      this.logger.warn('Validation failed', { errors: validation.errors });
      return {
        valid: false,
        verified: false,
        transactionHash: details.transactionHash,
        amount: details.amount,
        sender: details.sender,
        receiver: details.receiver,
        timestamp: details.timestamp,
        status: 'failed',
        error: validation.errors.join('; '),
        verificationTime: Date.now() - startTime
      };
    }

    // Additional checks
    const isValid = this.performBasicChecks(details);
    
    const result: VerificationResult = {
      valid: isValid,
      verified: false, // Not verified against blockchain
      transactionHash: details.transactionHash,
      amount: details.amount,
      sender: details.sender,
      receiver: details.receiver,
      timestamp: details.timestamp,
      status: isValid ? 'success' : 'failed',
      message: isValid ? 'Format validation passed (not verified against blockchain)' : 'Format validation failed',
      verificationTime: Date.now() - startTime
    };

    this.logger.info('Fast verification completed', { result });
    return result;
  }

  /**
   * Perform basic checks on payment details
   */
  private performBasicChecks(details: PaymentDetails): boolean {
    // Check if sender and receiver are different
    if (details.sender === details.receiver) {
      this.logger.warn('Sender and receiver are the same');
      return false;
    }

    // Check if amount is reasonable (not too large)
    try {
      const amount = BigInt(details.amount);
      // Maximum reasonable amount: 1 billion TON (1e18 nanotons)
      const maxAmount = BigInt('1000000000000000000');
      if (amount > maxAmount) {
        this.logger.warn('Amount exceeds reasonable limit');
        return false;
      }
    } catch (e) {
      this.logger.error('Error parsing amount', e);
      return false;
    }

    // Check if timestamp is not in the future
    const now = Math.floor(Date.now() / 1000);
    if (details.timestamp > now + 3600) { // Allow 1 hour future drift
      this.logger.warn('Timestamp is too far in the future');
      return false;
    }

    return true;
  }
}
