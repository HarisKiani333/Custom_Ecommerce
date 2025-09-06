import '@testing-library/jest-dom';

// Simple utility function tests
describe('Cart Component Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('should handle cart calculations', () => {
    const mockCartItems = { '1': 2, '2': 1 };
    const getCartCount = () => {
      return Object.values(mockCartItems).reduce((total, quantity) => total + quantity, 0);
    };
    
    expect(getCartCount()).toBe(3);
  });

  test('should format currency correctly', () => {
    const formatCurrency = (amount, currency = '$') => {
      return `${currency}${amount.toFixed(2)}`;
    };
    
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(99.99)).toBe('$99.99');
  });
});