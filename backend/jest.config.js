module.exports = {
  displayName: 'Template Backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/database/migrations/**',
    '!src/database/seeds/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/database/(.*)$': '<rootDir>/src/database/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  // Transform configuration
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  // Test environment setup
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
};

