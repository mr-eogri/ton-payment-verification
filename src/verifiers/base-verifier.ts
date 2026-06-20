/**
 * Base verifier class with common verification logic
 */

import { PaymentDetails, VerificationOptions, VerificationResult } from '../types/index';
import { Validators } from '../utils/validators';
import { Logger } from '../utils/logger';

export abstract class BaseVerifier {
  protected logger: Logger;
  protected validators: typeof Validators = Validators;

  constructor(debug: boolean = false) {
    this.logger = new Logger(debug);
  }

  /**
   * Validate payment details structure
   */
  protected validatePaymentDetails(details: PaymentDetails): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate transaction hash
    if (!this.validators.isValidTransactionHash(details.transactionHash)) {
      errors.push('Invalid transaction hash format');
    }

    // Validate amount
    if (!this.validators.isValidAmount(details.amount)) {
      errors.push('Invalid amount (must be positive)');
    }

    // Validate sender
    if (!this.validators.isValidTonAddress(details.sender)) {
      errors.push('Invalid sender address format');
    }

    // Validate receiver
    if (!this.validators.isValidTonAddress(details.receiver)) {
      errors.push('Invalid receiver address format');
    }

    // Validate timestamp
    if (!this.validators.isValidTimestamp(details.timestamp)) {
      errors.push('Invalid timestamp');
    }

    // Validate optional fields
    if (details.memo && !this.validators.isValidMemo(details.memo)) {
      errors.push('Invalid memo');
    }

    if (details.payload && !this.validators.isValidPayload(details.payload)) {
      errors.push('Invalid payload');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create failed verification result
   */
  protected createFailedResult(transactionHash: string, error: string): VerificationResult {
    return {
      valid: false,
      verified: false,
      transactionHash,
      amount: '0',
      sender: '',
      receiver: '',
      timestamp: 0,
      status: 'failed',
      error,
      verificationTime: 0
    };
  }

  /**
   * Abstract verify method to be implemented by subclasses
   */
  abstract verify(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult>;
}
