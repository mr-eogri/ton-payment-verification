/**
 * Payment verification types and interfaces
 */

export interface PaymentDetails {
  transactionHash: string;
  amount: string;
  sender: string;
  receiver: string;
  timestamp: number;
  memo?: string;
  payload?: string;
  seqno?: number;
  lt?: number;
}

export interface VerificationOptions {
  // Verification method: 'fast', 'full', 'lightweight'
  method?: 'fast' | 'full' | 'lightweight';
  // Cache verification results
  useCache?: boolean;
  cacheDuration?: number; // in seconds
  // RPC endpoint
  rpcEndpoint?: string;
  // Verification timeout
  timeout?: number; // in milliseconds
  // Enable debug logging
  debug?: boolean;
}

export interface VerificationResult {
  valid: boolean;
  verified: boolean;
  transactionHash: string;
  amount: string;
  sender: string;
  receiver: string;
  timestamp: number;
  blockSeqno?: number;
  blockLt?: number;
  status: 'success' | 'pending' | 'failed' | 'not_found';
  message?: string;
  error?: string;
  verificationTime: number; // in milliseconds
}

export interface CacheEntry {
  result: VerificationResult;
  timestamp: number;
  expiresAt: number;
}

export interface BlockchainTransaction {
  hash: string;
  amount: string;
  source: string;
  destination: string;
  now: number;
  body?: string;
  message?: string;
  data?: any;
}

export interface NetworkConfig {
  name: 'testnet' | 'mainnet';
  rpcUrl: string;
  timeout: number;
}
