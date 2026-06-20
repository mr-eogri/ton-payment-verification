/**
 * Main TON Payment Verifier class
 * Orchestrates verification across different methods
 */

import { PaymentDetails, VerificationOptions, VerificationResult } from './types/index';
import { FastVerifier } from './verifiers/fast-verifier';
import { FullVerifier } from './verifiers/full-verifier';
import { LightweightVerifier } from './verifiers/lightweight-verifier';
import { VerificationCache } from './utils/cache';
import { Logger } from './utils/logger';

export class TonPaymentVerifier {
  private fastVerifier: FastVerifier;
  private fullVerifier: FullVerifier;
  private lightweightVerifier: LightweightVerifier;
  private cache: VerificationCache;
  private logger: Logger;
  private cacheEnabled: boolean;
  private cacheDuration: number;

  constructor(options?: {
    rpcEndpoint?: string;
    debug?: boolean;
    cacheEnabled?: boolean;
    cacheDuration?: number;
    cacheSize?: number;
    timeout?: number;
  }) {
    const {
      rpcEndpoint,
      debug = false,
      cacheEnabled = true,
      cacheDuration = 3600,
      cacheSize = 1000,
      timeout = 30000
    } = options || {};

    this.fastVerifier = new FastVerifier(debug);
    this.fullVerifier = new FullVerifier(rpcEndpoint, debug, timeout);
    this.lightweightVerifier = new LightweightVerifier(debug);
    this.cache = new VerificationCache(cacheSize, cacheDuration);
    this.logger = new Logger(debug);
    this.cacheEnabled = cacheEnabled;
    this.cacheDuration = cacheDuration;
  }

  /**
   * Verify payment with automatic method selection
   */
  async verify(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    const method = options?.method || 'lightweight';
    
    // Check cache first
    const cacheKey = this.generateCacheKey(details);
    if (this.cacheEnabled && options?.useCache !== false) {
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        this.logger.info('Returning cached result', { hash: details.transactionHash });
        return cachedResult;
      }
    }

    let result: VerificationResult;

    switch (method) {
      case 'fast':
        result = await this.fastVerifier.verify(details, options);
        break;
      case 'full':
        result = await this.fullVerifier.verify(details, options);
        break;
      case 'lightweight':
      default:
        result = await this.lightweightVerifier.verify(details, options);
        break;
    }

    // Cache successful results
    if (this.cacheEnabled && result.valid) {
      this.cache.set(cacheKey, result, options?.cacheDuration || this.cacheDuration);
    }

    return result;
  }

  /**
   * Verify with fast method
   */
  async verifyFast(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    return this.verify(details, { ...options, method: 'fast' });
  }

  /**
   * Verify with full blockchain lookup
   */
  async verifyFull(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    return this.verify(details, { ...options, method: 'full' });
  }

  /**
   * Verify with lightweight method
   */
  async verifyLightweight(details: PaymentDetails, options?: VerificationOptions): Promise<VerificationResult> {
    return this.verify(details, { ...options, method: 'lightweight' });
  }

  /**
   * Batch verify multiple payments
   */
  async verifyBatch(details: PaymentDetails[], options?: VerificationOptions): Promise<VerificationResult[]> {
    this.logger.info('Starting batch verification', { count: details.length });
    
    const results = await Promise.all(
      details.map(detail => this.verify(detail, options))
    );

    this.logger.info('Batch verification completed', {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length
    });

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }

  /**
   * Enable or disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.logger.setEnabled(enabled);
  }

  /**
   * Generate cache key from payment details
   */
  private generateCacheKey(details: PaymentDetails): string {
    return `${details.transactionHash}:${details.sender}:${details.receiver}:${details.amount}`;
  }
}
