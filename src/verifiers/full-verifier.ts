/**
 * Full verification method - queries blockchain to verify transactions
 */

import { BaseVerifier } from './base-verifier';
import { PaymentDetails, VerificationOptions, VerificationResult, BlockchainTransaction } from '../types/index';

export class FullVerifier extends BaseVerifier {
  private rpcEndpoint: string;
  private timeout: number;

  constructor(rpcEndpoint?: string, debug: boolean = false, timeout: number = 30000) {
    super(debug);
    this.rpcEndpoint = rpcEndpoint || 'https://toncenter.com/api/v2';
    this.timeout = timeout;
  }

  /**
   * Full verification - validates and queries blockchain
   */
  async verify(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    const startTime = Date.now();
    
    this.logger.info('Starting full verification', { hash: details.transactionHash });

    // Validate payment details first
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

    try {
      // Query blockchain for transaction
      const txData = await this.getTransactionData(details.transactionHash, options);
      
      if (!txData) {
        return {
          valid: false,
          verified: false,
          transactionHash: details.transactionHash,
          amount: details.amount,
          sender: details.sender,
          receiver: details.receiver,
          timestamp: details.timestamp,
          status: 'not_found',
          error: 'Transaction not found on blockchain',
          verificationTime: Date.now() - startTime
        };
      }

      // Verify transaction details match
      const matches = this.verifyTransactionDetails(details, txData);
      
      const result: VerificationResult = {
        valid: matches,
        verified: true,
        transactionHash: details.transactionHash,
        amount: details.amount,
        sender: details.sender,
        receiver: details.receiver,
        timestamp: details.timestamp,
        blockSeqno: txData.blockSeqno,
        blockLt: txData.blockLt,
        status: matches ? 'success' : 'failed',
        message: matches ? 'Transaction verified on blockchain' : 'Transaction details do not match',
        verificationTime: Date.now() - startTime
      };

      this.logger.info('Full verification completed', { result });
      return result;
    } catch (error: any) {
      this.logger.error('Full verification error', error);
      return {
        valid: false,
        verified: false,
        transactionHash: details.transactionHash,
        amount: details.amount,
        sender: details.sender,
        receiver: details.receiver,
        timestamp: details.timestamp,
        status: 'failed',
        error: `Verification error: ${error.message}`,
        verificationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get transaction data from blockchain
   */
  private async getTransactionData(hash: string, options?: VerificationOptions): Promise<any> {
    // This is a placeholder - actual implementation would query the blockchain
    // Using TON's RPC or TonCenter API
    
    this.logger.debug('Querying blockchain for transaction', { hash });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.rpcEndpoint}/getTransactionByHash?hash=${hash}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        this.logger.warn('Blockchain query failed', { status: response.status });
        return null;
      }
      
      const data = await response.json();
      return data?.result || null;
    } catch (error) {
      this.logger.error('Error querying blockchain', error);
      throw error;
    }
  }

  /**
   * Verify transaction details match
   */
  private verifyTransactionDetails(details: PaymentDetails, txData: any): boolean {
    try {
      // Compare amounts
      if (txData.amount !== details.amount) {
        this.logger.warn('Amount mismatch', { expected: details.amount, actual: txData.amount });
        return false;
      }

      // Compare sender
      if (txData.source !== details.sender) {
        this.logger.warn('Sender mismatch', { expected: details.sender, actual: txData.source });
        return false;
      }

      // Compare receiver
      if (txData.destination !== details.receiver) {
        this.logger.warn('Receiver mismatch', { expected: details.receiver, actual: txData.destination });
        return false;
      }

      // Compare timestamp (allow some drift)
      const timeDiff = Math.abs(txData.now - details.timestamp);
      if (timeDiff > 60) { // 60 seconds tolerance
        this.logger.warn('Timestamp mismatch', { expected: details.timestamp, actual: txData.now });
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error verifying transaction details', error);
      return false;
    }
  }
}
