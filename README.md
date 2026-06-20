# TON Payment Verification

🔐 A comprehensive NPM library for verifying TON blockchain payments with multiple validation options, full speed optimization, and support for both server and client-side operations.

## Features

✅ **Multiple Verification Methods**
- **Fast**: Quick local validation without blockchain queries (⚡ < 10ms)
- **Lightweight**: Balance between speed and security with additional checks (⚡ < 50ms)
- **Full**: Complete blockchain verification with transaction lookup (🔍 < 30s)

✅ **Comprehensive Validation**
- Transaction hash validation
- Address format verification
- Amount validation
- Timestamp verification
- Memo and payload validation
- Suspicious pattern detection

✅ **Performance Optimization**
- Built-in caching system for verification results
- Configurable cache duration and size
- Support for batch verification
- Minimal memory footprint

✅ **Universal Compatibility**
- Works in Node.js (server-side)
- Works in browsers (client-side)
- TypeScript support with full type definitions
- ES6+ module support

✅ **Easy Integration**
- Simple and intuitive API
- Detailed error messages
- Optional debug logging
- Zero dependencies for core functionality

## Installation

```bash
npm install ton-payment-verification
```

## Quick Start

```typescript
import { TonPaymentVerifier } from 'ton-payment-verification';

// Initialize verifier
const verifier = new TonPaymentVerifier({
  debug: true,
  cacheEnabled: true,
  timeout: 30000
});

// Define payment details
const paymentDetails = {
  transactionHash: 'your_transaction_hash',
  amount: '1000000000', // in nanotons (1 TON)
  sender: 'EQC_sender_address',
  receiver: 'EQC_receiver_address',
  timestamp: Math.floor(Date.now() / 1000),
  memo: 'Payment for order #123',
  payload: 'optional_hex_payload'
};

// Verify payment
const result = await verifier.verify(paymentDetails, {
  method: 'lightweight' // 'fast', 'lightweight', or 'full'
});

if (result.valid) {
  console.log('✅ Payment verified successfully!');
  console.log('Amount:', result.amount);
  console.log('Status:', result.status);
} else {
  console.log('❌ Payment verification failed');
  console.log('Error:', result.error);
}
```

## Usage Examples

### 1. Fast Verification (Local Validation Only)

```typescript
const result = await verifier.verifyFast(paymentDetails);
// Fastest but only validates format and structure
// Response time: < 10ms
```

### 2. Lightweight Verification (Recommended)

```typescript
const result = await verifier.verifyLightweight(paymentDetails, {
  useCache: true,
  cacheDuration: 3600 // 1 hour
});
// Balanced performance with additional security checks
// Response time: < 50ms
```

### 3. Full Blockchain Verification

```typescript
const result = await verifier.verifyFull(paymentDetails, {
  rpcEndpoint: 'https://toncenter.com/api/v2',
  timeout: 30000
});
// Complete verification against blockchain
// Response time: up to 30 seconds
```

### 4. Batch Verification

```typescript
const payments = [
  { transactionHash: 'hash1', ... },
  { transactionHash: 'hash2', ... },
  { transactionHash: 'hash3', ... }
];

const results = await verifier.verifyBatch(payments, {
  method: 'lightweight'
});

results.forEach((result, index) => {
  console.log(`Payment ${index + 1}:`, result.status);
});
```

## API Reference

### TonPaymentVerifier

#### Constructor Options

```typescript
interface VerifierOptions {
  rpcEndpoint?: string;        // TON RPC endpoint URL
  debug?: boolean;              // Enable debug logging
  cacheEnabled?: boolean;       // Enable result caching
  cacheDuration?: number;       // Cache duration in seconds (default: 3600)
  cacheSize?: number;          // Maximum cache entries (default: 1000)
  timeout?: number;            // Request timeout in milliseconds (default: 30000)
}
```

#### Methods

##### `verify(details, options?): Promise<VerificationResult>`

Verify a payment with optional configuration.

```typescript
const result = await verifier.verify(paymentDetails, {
  method: 'lightweight',
  useCache: true,
  timeout: 30000
});
```

##### `verifyFast(details, options?): Promise<VerificationResult>`

Quick local validation without blockchain queries.

```typescript
const result = await verifier.verifyFast(paymentDetails);
```

##### `verifyLightweight(details, options?): Promise<VerificationResult>`

Balanced verification with additional security checks.

```typescript
const result = await verifier.verifyLightweight(paymentDetails);
```

##### `verifyFull(details, options?): Promise<VerificationResult>`

Complete blockchain verification.

```typescript
const result = await verifier.verifyFull(paymentDetails);
```

##### `verifyBatch(details[], options?): Promise<VerificationResult[]>`

Verify multiple payments efficiently.

```typescript
const results = await verifier.verifyBatch(paymentList);
```

##### `clearCache(): void`

Clear all cached verification results.

```typescript
verifier.clearCache();
```

##### `getCacheStats(): { size: number }`

Get cache statistics.

```typescript
const stats = verifier.getCacheStats();
console.log(`Cache size: ${stats.size} entries`);
```

##### `setDebug(enabled: boolean): void`

Enable or disable debug logging.

```typescript
verifier.setDebug(true);
```

## Type Definitions

### PaymentDetails

```typescript
interface PaymentDetails {
  transactionHash: string;  // Transaction hash (hex or base64)
  amount: string;           // Amount in nanotons
  sender: string;           // Sender's TON address
  receiver: string;         // Receiver's TON address
  timestamp: number;        // Unix timestamp
  memo?: string;            // Optional payment memo
  payload?: string;         // Optional hex payload
  seqno?: number;          // Optional sequence number
  lt?: number;             // Optional logical time
}
```

### VerificationOptions

```typescript
interface VerificationOptions {
  method?: 'fast' | 'full' | 'lightweight';
  useCache?: boolean;
  cacheDuration?: number;  // in seconds
  rpcEndpoint?: string;
  timeout?: number;        // in milliseconds
  debug?: boolean;
}
```

### VerificationResult

```typescript
interface VerificationResult {
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
  verificationTime: number;  // in milliseconds
}
```

## Verification Methods Comparison

| Feature | Fast | Lightweight | Full |
|---------|------|-------------|------|
| Format Validation | ✅ | ✅ | ✅ |
| Structure Validation | ✅ | ✅ | ✅ |
| Suspicious Pattern Detection | ❌ | ✅ | ✅ |
| Blockchain Verification | ❌ | ❌ | ✅ |
| Response Time | < 10ms | < 50ms | < 30s |
| Cache Support | ✅ | ✅ | ✅ |
| Server-Side | ✅ | ✅ | ✅ |
| Client-Side | ✅ | ✅ | ✅ |

## Error Handling

```typescript
try {
  const result = await verifier.verify(paymentDetails);
  
  if (!result.valid) {
    console.error('Verification failed:', result.error);
    // Handle specific error
    switch (result.status) {
      case 'not_found':
        console.log('Transaction not found on blockchain');
        break;
      case 'failed':
        console.log('Verification checks failed');
        break;
      case 'pending':
        console.log('Transaction is pending');
        break;
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Advanced Usage

### Custom RPC Endpoint

```typescript
const verifier = new TonPaymentVerifier({
  rpcEndpoint: 'https://your-custom-ton-rpc.com/api/v2',
  timeout: 45000 // Longer timeout for slower endpoints
});
```

### Disable Caching

```typescript
const result = await verifier.verify(paymentDetails, {
  useCache: false
});
```

### Custom Cache Duration

```typescript
const result = await verifier.verify(paymentDetails, {
  cacheDuration: 7200 // 2 hours
});
```

### Debug Mode

```typescript
const verifier = new TonPaymentVerifier({ debug: true });
// Or enable later:
verifier.setDebug(true);

// Will output detailed logs:
// [INFO] Starting lightweight verification
// [DEBUG] Querying blockchain for transaction
// [INFO] Verification completed
```

## Performance Tips

1. **Use Lightweight Verification** for most use cases
   - Balances speed and security
   - Includes pattern detection

2. **Enable Caching** for repeated verifications
   - Default 1 hour cache duration
   - Configurable size and duration

3. **Use Batch Verification** for multiple payments
   - More efficient than individual verification
   - Parallel processing

4. **Adjust Timeout** based on your needs
   - Server: 30-60 seconds
   - Client: 10-30 seconds

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Node.js Support

- Node.js >= 16.0.0
- CommonJS and ES6 modules

## License

MIT © 2026 mr-eogri

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions:
- GitHub Issues: https://github.com/mr-eogri/ton-payment-verification/issues
- Documentation: https://github.com/mr-eogri/ton-payment-verification

## Roadmap

- [ ] Support for additional blockchain networks
- [ ] WebSocket support for real-time verification
- [ ] Advanced analytics and monitoring
- [ ] Multi-signature transaction verification
- [ ] Integration with TON wallet providers
- [ ] CLI tool for manual verification

---

**Made with ❤️ by mr-eogri**
