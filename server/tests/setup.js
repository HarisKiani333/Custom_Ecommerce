const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Global test setup and teardown
let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake_stripe_key_for_testing';
  process.env.EMAIL_SERVICE = 'test';
  
  // Suppress console logs during testing (optional)
  if (process.env.SUPPRESS_TEST_LOGS === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Clear any remaining timers
  jest.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  // Wait for a specified amount of time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random test data
  generateRandomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Generate random email
  generateRandomEmail: () => {
    const username = global.testUtils.generateRandomString(8);
    const domain = global.testUtils.generateRandomString(5);
    return `${username}@${domain}.com`;
  },
  
  // Generate random ObjectId
  generateRandomObjectId: () => {
    return new mongoose.Types.ObjectId().toString();
  },
  
  // Create test timeout wrapper
  withTimeout: (fn, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);
      
      Promise.resolve(fn())
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }
};

// Mock external services
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_payment_intent',
        client_secret: 'pi_test_client_secret',
        status: 'requires_payment_method'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_payment_intent',
        status: 'succeeded',
        amount: 2000
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_payment_intent',
        status: 'succeeded'
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_payment_intent',
            status: 'succeeded',
            metadata: {
              orderId: '507f1f77bcf86cd799439011'
            }
          }
        }
      })
    }
  }));
});

// Mock file upload middleware
jest.mock('multer', () => {
  const multer = {
    array: jest.fn(() => (req, res, next) => {
      req.files = [
        {
          fieldname: 'images',
          originalname: 'test-image.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake-image-data'),
          size: 1024,
          filename: 'test-image-123.jpg',
          path: '/uploads/test-image-123.jpg'
        }
      ];
      next();
    }),
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
        filename: 'test-image-123.jpg',
        path: '/uploads/test-image-123.jpg'
      };
      next();
    }),
    none: jest.fn(() => (req, res, next) => next())
  };
  
  return jest.fn(() => multer);
});

// Mock bcryptjs for password hashing
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn().mockImplementation((password, hash) => {
    // Simple mock comparison - in real tests you might want more sophisticated logic
    return Promise.resolve(password === 'correctpassword');
  }),
  genSalt: jest.fn().mockResolvedValue('$2b$10$salt')
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    return `mock.jwt.token.${payload.id || payload.userId || 'unknown'}`;
  }),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'invalid-token' || token === 'expired-token') {
      const error = new Error('Invalid token');
      error.name = token === 'expired-token' ? 'TokenExpiredError' : 'JsonWebTokenError';
      throw error;
    }
    
    // Extract ID from mock token
    const parts = token.split('.');
    const id = parts[parts.length - 1];
    
    return {
      id: id !== 'unknown' ? id : '507f1f77bcf86cd799439011',
      userId: id !== 'unknown' ? id : '507f1f77bcf86cd799439011',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
  }),
  decode: jest.fn().mockImplementation((token) => {
    const parts = token.split('.');
    const id = parts[parts.length - 1];
    return {
      id: id !== 'unknown' ? id : '507f1f77bcf86cd799439011',
      userId: id !== 'unknown' ? id : '507f1f77bcf86cd799439011'
    };
  })
}));

// Mock cloudinary for image uploads
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'test-image-id',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        resource_type: 'image'
      }),
      destroy: jest.fn().mockResolvedValue({
        result: 'ok'
      })
    }
  }
}));

// Set Jest timeout for all tests
jest.setTimeout(30000);

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export test configuration
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [__filename],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  verbose: true
};