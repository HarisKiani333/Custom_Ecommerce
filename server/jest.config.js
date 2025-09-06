export default {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout (30 seconds)
  testTimeout: 30000,
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Maximum worker processes
  maxWorkers: '50%',
  
  // Test results processor
  testResultsProcessor: undefined,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup files before framework
  setupFiles: [],
  
  // Test environment options
  testEnvironmentOptions: {},
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Custom resolver
  resolver: undefined,
  
  // Roots
  roots: ['<rootDir>'],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Bail configuration
  bail: 0,
  
  // Cache directory
  cacheDirectory: '/tmp/jest_cache',
  
  // Notify mode
  notify: false,
  
  // Notify mode configuration
  notifyMode: 'failure-change',
  
  // Preset
  preset: undefined,
  
  // Project configuration
  projects: undefined,
  
  // Runner
  runner: 'jest-runner',
  
  // Test name pattern
  testNamePattern: undefined,
  
  // Test regex
  testRegex: undefined,
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(supertest)/)',
  ],
  
  // Modules that should not be mocked
  // unmockedModulePathPatterns: [
  //   'node_modules/(?!(supertest|mongodb-memory-server))'
  // ],
  
  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'API Routes Test Report',
        logoImgPath: undefined,
        inlineSource: false
      }
    ]
  ]
}