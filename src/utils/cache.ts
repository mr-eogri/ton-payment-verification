/**
 * In-memory cache for verification results
 */

import { VerificationResult, CacheEntry } from '../types/index';

export class VerificationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private defaultDuration: number; // in seconds

  constructor(maxSize: number = 1000, defaultDuration: number = 3600) {
    this.maxSize = maxSize;
    this.defaultDuration = defaultDuration;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get cached result
   */
  get(key: string): VerificationResult | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  /**
   * Set cached result
   */
  set(key: string, result: VerificationResult, duration?: number): void {
    // Limit cache size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const now = Date.now();
    const expiresAt = now + (duration || this.defaultDuration) * 1000;
    
    this.cache.set(key, {
      result,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
