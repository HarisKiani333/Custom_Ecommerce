// Test helper utilities for API testing
import jwt from 'jsonwebtoken';
import { mockUsers, mockSellers } from '../fixtures/testData.js';

// Generate JWT token for testing
export const generateTestToken = (userId, type = 'user') => {
  const secret = type === 'seller' ? process.env.JWT_SELLER_SECRET : process.env.JWT_SECRET;
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Generate expired JWT token for testing
export const generateExpiredToken = (userId, type = 'user') => {
  const secret = type === 'seller' ? process.env.JWT_SELLER_SECRET : process.env.JWT_SECRET;
  return jwt.sign({ userId }, secret, { expiresIn: '-1h' });
};

// Create authenticated request headers
export const createAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Create multipart form headers for file uploads
export const createMultipartHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  };
};

// Mock user registration helper
export const registerTestUser = async (request, userData = mockUsers.validUser) => {
  const response = await request
    .post('/api/user/register')
    .send(userData);
  return response;
};

// Mock user login helper
export const loginTestUser = async (request, userData = mockUsers.validUser) => {
  const response = await request
    .post('/api/user/login')
    .send({
      email: userData.email,
      password: userData.password
    });
  return response;
};

// Mock seller login helper
export const loginTestSeller = async (request, sellerData = mockSellers.validSeller) => {
  const response = await request
    .post('/api/seller/login')
    .send(sellerData);
  return response;
};

// Create test product helper
export const createTestProduct = async (request, token, productData) => {
  const response = await request
    .post('/api/product/add')
    .set(createAuthHeaders(token))
    .send(productData);
  return response;
};

// Add item to cart helper
export const addToCartHelper = async (request, token, cartItem) => {
  const response = await request
    .post('/api/cart/update')
    .set(createAuthHeaders(token))
    .send(cartItem);
  return response;
};

// Create test order helper
export const createTestOrder = async (request, token, orderData) => {
  const response = await request
    .post('/api/order/cod')
    .set(createAuthHeaders(token))
    .send(orderData);
  return response;
};

// Add test address helper
export const addTestAddress = async (request, token, addressData) => {
  const response = await request
    .post('/api/address/add')
    .set(createAuthHeaders(token))
    .send(addressData);
  return response;
};

// Create test rating helper
export const createTestRating = async (request, token, ratingData) => {
  const response = await request
    .post('/api/rating/create')
    .set(createAuthHeaders(token))
    .send(ratingData);
  return response;
};

// Validation helper functions
export const validateResponseStructure = (response, expectedFields) => {
  expectedFields.forEach(field => {
    expect(response.body).toHaveProperty(field);
  });
};

export const validateErrorResponse = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', false);
  if (expectedMessage) {
    expect(response.body.message).toContain(expectedMessage);
  }
};

export const validateSuccessResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', true);
};

// Database cleanup helpers
export const cleanupTestData = async () => {
  // This would typically clean up test data from database
  // Implementation depends on your database setup
  console.log('Cleaning up test data...');
};

// Mock file upload helper
export const createMockFile = (filename = 'test.jpg', mimetype = 'image/jpeg') => {
  return {
    fieldname: 'images',
    originalname: filename,
    encoding: '7bit',
    mimetype: mimetype,
    buffer: Buffer.from('fake image data'),
    size: 1024
  };
};

// Wait helper for async operations
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random test data
export const generateRandomEmail = () => {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
};

export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_SELLER_SECRET = 'test-seller-jwt-secret';
};

// Common test patterns
export const testUnauthorizedAccess = (request, method, endpoint) => {
  return request[method](endpoint)
    .expect(401)
    .then(response => {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
};

export const testInvalidObjectId = (request, method, endpoint, token) => {
  const headers = token ? createAuthHeaders(token) : {};
  return request[method](endpoint.replace(':id', 'invalid-id'))
    .set(headers)
    .expect(400)
    .then(response => {
      expect(response.body.success).toBe(false);
    });
};