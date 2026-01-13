const {
  generateMnemonic,
  deriveBitcoinAddress,
  deriveEthereumAddress,
  validateMnemonic,
} = require('../../src/server/utils/crypto-utils');

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
