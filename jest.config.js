// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    
    // Setup environment variables for tests
    setupFiles: ['<rootDir>/__tests__/setup-env.js'],
    
    // Generate coverage reports
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/__tests__/**/*',
      '!src/scripts/**/*'
    ],
    
    // Configure timeouts for slower tests
    testTimeout: 30000,
    
    // Configure test result reporters
    reporters: ['default'],
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Verbose output to see detailed test results
    verbose: true
  };