import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment:        'jest-environment-jsdom',
  setupFilesAfterEnv:     ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  testPathPattern:         ['<rootDir>/src/tests/unit/**/*.test.{ts,tsx}', '<rootDir>/src/tests/integration/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**',
    '!src/__mocks__/**',
    '!src/tests/**',
    '!src/app/api/**',
    '!src/lib/mock/**',
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      functions:  70,
      branches:   65,
      lines:      70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout:        10000,
  clearMocks:         true,
  restoreMocks:       true,
};

export default createJestConfig(config);
