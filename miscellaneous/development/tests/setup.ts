// Jest setup file for global test configuration
import mockFs from 'mock-fs';

// Global test setup
beforeEach(() => {
  // Clear any existing mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore file system after each test
  mockFs.restore();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
