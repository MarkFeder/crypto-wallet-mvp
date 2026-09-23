const {
  generateMnemonic,
  deriveBitcoinAddress,
  deriveEthereumAddress,
  validateMnemonic,
  encryptMnemonic,
  decryptMnemonic,
} = require('../../src/server/utils/cryptoUtils');

describe('Crypto Utilities', () => {
  // Known test mnemonic for deterministic tests
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  describe('generateMnemonic', () => {
    it('should generate a valid 12-word mnemonic', () => {
      const mnemonic = generateMnemonic();
      const words = mnemonic.split(' ');

      expect(words).toHaveLength(12);
      expect(validateMnemonic(mnemonic)).toBe(true);
    });

    it('should generate unique mnemonics', () => {
      const mnemonic1 = generateMnemonic();
      const mnemonic2 = generateMnemonic();

      expect(mnemonic1).not.toBe(mnemonic2);
    });

    it('should only contain valid BIP39 words', () => {
      const mnemonic = generateMnemonic();
      const isValid = validateMnemonic(mnemonic);

      expect(isValid).toBe(true);
    });
  });

  describe('deriveBitcoinAddress', () => {
    it('should derive a valid Bitcoin address from mnemonic', () => {
      const result = deriveBitcoinAddress(testMnemonic);

      expect(result.address).toBeDefined();
      expect(result.privateKey).toBeDefined();
      // Bitcoin mainnet address should start with 1, 3, or bc1
      expect(result.address).toMatch(/^(1|3|bc1)/);
    });

    it('should derive deterministic addresses from the same mnemonic', () => {
      const result1 = deriveBitcoinAddress(testMnemonic, 0);
      const result2 = deriveBitcoinAddress(testMnemonic, 0);

      expect(result1.address).toBe(result2.address);
      expect(result1.privateKey).toBe(result2.privateKey);
    });

    it('should derive different addresses for different indices', () => {
      const result0 = deriveBitcoinAddress(testMnemonic, 0);
      const result1 = deriveBitcoinAddress(testMnemonic, 1);
      const result2 = deriveBitcoinAddress(testMnemonic, 2);

      expect(result0.address).not.toBe(result1.address);
      expect(result1.address).not.toBe(result2.address);
      expect(result0.address).not.toBe(result2.address);
    });

    it('should derive known address for test mnemonic', () => {
      // The "abandon" test mnemonic should produce a known address
      const result = deriveBitcoinAddress(testMnemonic, 0);

      // This is the expected address for the abandon mnemonic at index 0
      expect(result.address).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA');
    });

    it('should return WIF format private key', () => {
      const result = deriveBitcoinAddress(testMnemonic);

      // WIF private keys start with 5, K, or L for mainnet
      expect(result.privateKey).toMatch(/^[5KL]/);
    });
  });

  describe('deriveEthereumAddress', () => {
    it('should derive a valid Ethereum address from mnemonic', () => {
      const result = deriveEthereumAddress(testMnemonic);

      expect(result.address).toBeDefined();
      expect(result.privateKey).toBeDefined();
      // Ethereum address should be 42 characters starting with 0x
      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should derive deterministic addresses from the same mnemonic', () => {
      const result1 = deriveEthereumAddress(testMnemonic, 0);
      const result2 = deriveEthereumAddress(testMnemonic, 0);

      expect(result1.address).toBe(result2.address);
      expect(result1.privateKey).toBe(result2.privateKey);
    });

    it('should derive different addresses for different indices', () => {
      const result0 = deriveEthereumAddress(testMnemonic, 0);
      const result1 = deriveEthereumAddress(testMnemonic, 1);

      expect(result0.address).not.toBe(result1.address);
    });

    it('should derive known address for test mnemonic', () => {
      const result = deriveEthereumAddress(testMnemonic, 0);

      // Known address for abandon mnemonic at m/44'/60'/0'/0/0
      expect(result.address.toLowerCase()).toBe('0x9858effd232b4033e47d90003d41ec34ecaeda94');
    });

    it('should return hex format private key', () => {
      const result = deriveEthereumAddress(testMnemonic);

      // Private key should be 66 characters (0x + 64 hex chars)
      expect(result.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });

  describe('validateMnemonic', () => {
    it('should return true for valid mnemonic', () => {
      expect(validateMnemonic(testMnemonic)).toBe(true);
    });

    it('should return true for generated mnemonic', () => {
      const mnemonic = generateMnemonic();
      expect(validateMnemonic(mnemonic)).toBe(true);
    });

    it('should return false for invalid mnemonic', () => {
      expect(validateMnemonic('invalid mnemonic words')).toBe(false);
      expect(validateMnemonic('hello world')).toBe(false);
      expect(validateMnemonic('')).toBe(false);
    });

    it('should return false for wrong word count', () => {
      // Only 11 words
      const shortMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon';
      expect(validateMnemonic(shortMnemonic)).toBe(false);
    });

    it('should return false for mnemonic with invalid checksum', () => {
      // Valid words but invalid checksum
      const invalidChecksum = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon';
      expect(validateMnemonic(invalidChecksum)).toBe(false);
    });
  });

  describe('mnemonic encryption', () => {
    it('should round-trip a mnemonic through encrypt and decrypt', () => {
      const stored = encryptMnemonic(testMnemonic);

      expect(decryptMnemonic(stored)).toBe(testMnemonic);
    });

    it('should never contain the plaintext phrase in the stored value', () => {
      const stored = encryptMnemonic(testMnemonic);

      expect(stored).not.toContain(testMnemonic);
      expect(stored).not.toContain('abandon');
    });

    it('should produce a v1 iv:tag:ciphertext envelope', () => {
      const stored = encryptMnemonic(testMnemonic);
      const parts = stored.split(':');

      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('v1');
      expect(parts[1]).toMatch(/^[0-9a-f]{24}$/); // 12-byte IV
      expect(parts[2]).toMatch(/^[0-9a-f]{32}$/); // 16-byte GCM auth tag
      expect(parts[3]).toMatch(/^[0-9a-f]+$/);
    });

    it('should use a fresh IV so equal mnemonics encrypt differently', () => {
      const first = encryptMnemonic(testMnemonic);
      const second = encryptMnemonic(testMnemonic);

      expect(first).not.toBe(second);
      // Both still decrypt to the same plaintext.
      expect(decryptMnemonic(first)).toBe(testMnemonic);
      expect(decryptMnemonic(second)).toBe(testMnemonic);
    });

    it('should reject a tampered ciphertext', () => {
      const stored = encryptMnemonic(testMnemonic);
      const [version, iv, tag, ciphertext] = stored.split(':');

      // Flip the final hex digit of the ciphertext.
      const flipped = ciphertext.slice(0, -1) + (ciphertext.at(-1) === 'a' ? 'b' : 'a');
      const tampered = [version, iv, tag, flipped].join(':');

      expect(() => decryptMnemonic(tampered)).toThrow();
    });

    it('should reject a tampered auth tag', () => {
      const stored = encryptMnemonic(testMnemonic);
      const [version, iv, tag, ciphertext] = stored.split(':');

      const flippedTag = tag.slice(0, -1) + (tag.at(-1) === 'a' ? 'b' : 'a');
      const tampered = [version, iv, flippedTag, ciphertext].join(':');

      expect(() => decryptMnemonic(tampered)).toThrow();
    });

    it('should reject values that are not in the encrypted format', () => {
      // This is the shape of a row written before encryption was introduced.
      expect(() => decryptMnemonic(testMnemonic)).toThrow(/expected encrypted format/);
      expect(() => decryptMnemonic('')).toThrow(/expected encrypted format/);
      expect(() => decryptMnemonic('v2:aa:bb:cc')).toThrow(/expected encrypted format/);
    });

    it('should refuse to encrypt when the key is missing', () => {
      const original = process.env.MNEMONIC_ENCRYPTION_KEY;
      delete process.env.MNEMONIC_ENCRYPTION_KEY;

      try {
        expect(() => encryptMnemonic(testMnemonic)).toThrow(/MNEMONIC_ENCRYPTION_KEY is not set/);
      } finally {
        process.env.MNEMONIC_ENCRYPTION_KEY = original;
      }
    });

    it('should refuse a key that is not 32 bytes', () => {
      const original = process.env.MNEMONIC_ENCRYPTION_KEY;
      process.env.MNEMONIC_ENCRYPTION_KEY = 'tooshort';

      try {
        expect(() => encryptMnemonic(testMnemonic)).toThrow(/64 hex characters/);
      } finally {
        process.env.MNEMONIC_ENCRYPTION_KEY = original;
      }
    });

    it('should not decrypt with a different key', () => {
      const stored = encryptMnemonic(testMnemonic);
      const original = process.env.MNEMONIC_ENCRYPTION_KEY;
      process.env.MNEMONIC_ENCRYPTION_KEY = 'f'.repeat(64);

      try {
        expect(() => decryptMnemonic(stored)).toThrow();
      } finally {
        process.env.MNEMONIC_ENCRYPTION_KEY = original;
      }
    });
  });

  describe('Address derivation consistency', () => {
    it('should consistently derive addresses across multiple calls', () => {
      const mnemonic = generateMnemonic();
      const btcAddresses = [];
      const ethAddresses = [];

      // Derive addresses multiple times
      for (let i = 0; i < 5; i++) {
        btcAddresses.push(deriveBitcoinAddress(mnemonic, 0).address);
        ethAddresses.push(deriveEthereumAddress(mnemonic, 0).address);
      }

      // All addresses should be identical
      expect(new Set(btcAddresses).size).toBe(1);
      expect(new Set(ethAddresses).size).toBe(1);
    });

    it('should derive both BTC and ETH from same mnemonic', () => {
      const mnemonic = generateMnemonic();
      const btcResult = deriveBitcoinAddress(mnemonic);
      const ethResult = deriveEthereumAddress(mnemonic);

      expect(btcResult.address).toBeDefined();
      expect(ethResult.address).toBeDefined();
      expect(btcResult.address).not.toBe(ethResult.address);
    });
  });
});
