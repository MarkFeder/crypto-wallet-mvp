const {
  safeParseFloat,
  calculateAssetValue,
  calculateSwapWithFee,
  hasSufficientBalance,
  toFixedSafe,
} = require('../../src/server/utils/calculations');

describe('Calculation Utilities', () => {
  describe('safeParseFloat', () => {
    it('should parse valid number strings', () => {
      expect(safeParseFloat('123.45')).toBe(123.45);
      expect(safeParseFloat('0.001')).toBe(0.001);
      expect(safeParseFloat('1000')).toBe(1000);
    });

    it('should return the number when given a number', () => {
      expect(safeParseFloat(123.45)).toBe(123.45);
      expect(safeParseFloat(0)).toBe(0);
    });

    it('should return fallback for invalid strings', () => {
      expect(safeParseFloat('invalid')).toBe(0);
      expect(safeParseFloat('invalid', 100)).toBe(100);
      expect(safeParseFloat('')).toBe(0);
    });

    it('should return fallback for NaN', () => {
      expect(safeParseFloat(NaN)).toBe(0);
      expect(safeParseFloat(NaN, 50)).toBe(50);
    });

    it('should handle negative numbers', () => {
      expect(safeParseFloat('-123.45')).toBe(-123.45);
      expect(safeParseFloat(-50)).toBe(-50);
    });
  });

  describe('calculateAssetValue', () => {
    it('should calculate asset value correctly', () => {
      expect(calculateAssetValue('10', '100')).toBe(1000);
      expect(calculateAssetValue(5, 200)).toBe(1000);
      expect(calculateAssetValue('0.5', '50000')).toBe(25000);
    });

    it('should return 0 when balance is 0', () => {
      expect(calculateAssetValue('0', '100')).toBe(0);
      expect(calculateAssetValue(0, 50000)).toBe(0);
    });

    it('should return 0 when price is 0', () => {
      expect(calculateAssetValue('10', '0')).toBe(0);
      expect(calculateAssetValue(10, 0)).toBe(0);
    });

    it('should handle very small numbers', () => {
      const result = calculateAssetValue('0.00000001', '50000');
      expect(result).toBeCloseTo(0.0005, 10);
    });
  });

  describe('calculateSwapWithFee', () => {
    it('should calculate swap with fee correctly', () => {
      const result = calculateSwapWithFee(1, 50000, 2000, 0.005);

      // 1 BTC at $50000 = $50000
      // Fee at 0.5% = $250
      // Remaining = $49750
      // ETH amount = $49750 / $2000 = 24.875 ETH
      expect(result.toAmount).toBeCloseTo(24.875, 2);
      expect(result.feeUSD).toBeCloseTo(250, 2);
    });

    it('should handle zero amount', () => {
      const result = calculateSwapWithFee(0, 50000, 2000, 0.005);
      expect(result.toAmount).toBe(0);
      expect(result.feeUSD).toBe(0);
    });

    it('should handle string input', () => {
      const result = calculateSwapWithFee('1', 50000, 2000, 0.005);
      expect(result.toAmount).toBeCloseTo(24.875, 2);
    });

    it('should calculate with different fee percentages', () => {
      const result1 = calculateSwapWithFee(1, 1000, 1000, 0.01); // 1%
      const result2 = calculateSwapWithFee(1, 1000, 1000, 0.001); // 0.1%

      expect(result1.toAmount).toBeCloseTo(0.99, 2);
      expect(result2.toAmount).toBeCloseTo(0.999, 3);
    });
  });

  describe('toFixedSafe', () => {
    it('should format numbers with specified decimals', () => {
      expect(toFixedSafe(123.456789, 2)).toBe('123.46');
      expect(toFixedSafe(123.456789, 4)).toBe('123.4568');
      expect(toFixedSafe(100, 2)).toBe('100.00');
    });

    it('should use default 8 decimals', () => {
      expect(toFixedSafe(1.123456789)).toBe('1.12345679');
    });

    it('should return "0" for NaN', () => {
      expect(toFixedSafe(NaN)).toBe('0');
      expect(toFixedSafe(NaN, 2)).toBe('0');
    });
  });

  describe('hasSufficientBalance', () => {
    it('should return true when balance is sufficient', () => {
      expect(hasSufficientBalance('10', '5')).toBe(true);
      expect(hasSufficientBalance(100, 50)).toBe(true);
      expect(hasSufficientBalance('10', '5', '1')).toBe(true);
    });

    it('should return false when balance is insufficient', () => {
      expect(hasSufficientBalance('5', '10')).toBe(false);
      expect(hasSufficientBalance(50, 100)).toBe(false);
      expect(hasSufficientBalance('10', '5', '6')).toBe(false);
    });

    it('should return true when balance equals amount', () => {
      expect(hasSufficientBalance('10', '10')).toBe(true);
    });

    it('should include fee in calculation', () => {
      expect(hasSufficientBalance('10', '9', '1')).toBe(true);
      expect(hasSufficientBalance('10', '9', '2')).toBe(false);
    });

    it('should handle string inputs', () => {
      expect(hasSufficientBalance('100.50', '50.25', '10.00')).toBe(true);
    });
  });
});
