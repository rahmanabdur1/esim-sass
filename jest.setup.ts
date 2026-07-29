import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe accessibility assertions
expect.extend(toHaveNoViolations);

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter:        () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useSearchParams:  () => new URLSearchParams(),
  usePathname:      () => '/',
  useParams:        () => ({}),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    // eslint-disable-next-line @next/next/no-img-element
    Object.assign(document.createElement('img'), { src, alt, ...props }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn(), resolvedTheme: 'light' }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Framer Motion (avoid animation timing issues in tests)
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: new Proxy({}, {
    get: (_target, prop) => {
      const Component = ({ children, ...props }: Record<string, unknown>) => {
        const React = require('react');
        return React.createElement(String(prop), props, children);
      };
      Component.displayName = `motion.${String(prop)}`;
      return Component;
    },
  }),
}));

// Suppress specific console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = args[0];
    if (
      typeof msg === 'string' && (
        msg.includes('Warning: ReactDOM.render') ||
        msg.includes('act(...)') ||
        msg.includes('Not implemented: window.computedStyle')
      )
    ) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test cleanup
afterEach(() => {
  jest.clearAllTimers();
});
