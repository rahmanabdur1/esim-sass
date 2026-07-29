import {
  formatCurrency,
  formatDataGB,
  formatValidity,
  getDataPercentage,
  getPasswordStrength,
  truncateText,
  generateInitials,
  isValidEmail,
  sanitizeInput,
} from '@/utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(9.99, 'USD')).toBe('$9.99');
  });
  it('formats EUR correctly', () => {
    expect(formatCurrency(5.0, 'EUR')).toContain('5');
  });
});

describe('formatDataGB', () => {
  it('returns Unlimited for large values', () => {
    expect(formatDataGB(9999)).toBe('Unlimited');
  });
  it('returns GB string for normal values', () => {
    expect(formatDataGB(10)).toBe('10 GB');
  });
});

describe('formatValidity', () => {
  it('returns 1 Day for 1', () => expect(formatValidity(1)).toBe('1 Day'));
  it('returns 7 Days for 7', () => expect(formatValidity(7)).toBe('7 Days'));
  it('returns 1 Month for 30', () => expect(formatValidity(30)).toBe('1 Month'));
  it('returns 3 Months for 90', () => expect(formatValidity(90)).toBe('3 Months'));
});

describe('getDataPercentage', () => {
  it('returns 50 for half used', () => expect(getDataPercentage(5, 10)).toBe(50));
  it('returns 100 for fully used', () => expect(getDataPercentage(10, 10)).toBe(100));
  it('returns 0 for zero total', () => expect(getDataPercentage(0, 0)).toBe(0));
});

describe('getPasswordStrength', () => {
  it('returns Weak for short password', () => {
    expect(getPasswordStrength('abc').label).toBe('Weak');
  });
  it('returns Strong for complex password', () => {
    expect(getPasswordStrength('MyP@ssw0rd!2024').label).toBe('Strong');
  });
});

describe('truncateText', () => {
  it('truncates long text', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });
  it('returns original if short enough', () => {
    expect(truncateText('Hi', 10)).toBe('Hi');
  });
});

describe('generateInitials', () => {
  it('returns initials from full name', () => {
    expect(generateInitials('John Doe')).toBe('JD');
  });
  it('handles single name', () => {
    expect(generateInitials('Alice')).toBe('A');
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email', () => expect(isValidEmail('a@b.com')).toBe(true));
  it('returns false for invalid email', () => expect(isValidEmail('notanemail')).toBe(false));
});

describe('sanitizeInput', () => {
  it('strips script tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>hello')).toBe('hello');
  });
  it('leaves normal text alone', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});
