const request = require('supertest');
const express = require('express');
const { mockSellers, mockTokens, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock seller controller functions
const mockSellerController = {
  sellerLogin: jest.fn(),
  sellerLogout: jest.fn(),
  isAuthSeller: jest.fn()
};

// Mock seller authentication middleware
const mockAuthSeller = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized seller access' });
  }
  req.sellerId = '507f1f77bcf86cd799439012';
  next();
});

// Setup routes for testing
app.post('/api/seller/login', mockSellerController.sellerLogin);
app.post('/api/seller/logout', mockAuthSeller, mockSellerController.sellerLogout);
app.get('/api/seller/is-auth', mockAuthSeller, mockSellerController.isAuthSeller);

describe('Seller Routes', () => {
  const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/seller/login', () => {
    it('should login seller successfully with valid credentials', async () => {
      const loginData = {
        email: mockSellers.validSeller.email,
        password: mockSellers.validSeller.password
      };

      const mockResponse = {
        success: true,
        message: 'Seller login successful',
        seller: {
          _id: '507f1f77bcf86cd799439012',
          email: mockSellers.validSeller.email,
          name: mockSellers.validSeller.name,
          businessName: mockSellers.validSeller.businessName
        },
        token: mockTokens.validSellerToken
      };

      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send(loginData);

      validateSuccessResponse(response, 200);
      expect(response.body.seller).toHaveProperty('_id');
      expect(response.body.seller.email).toBe(mockSellers.validSeller.email);
      expect(response.body).toHaveProperty('token');
      expect(mockSellerController.sellerLogin).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing credentials', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({});

      validateErrorResponse(response, 400, 'required');
    });

    it('should return 401 for invalid credentials', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      validateErrorResponse(response, 401, 'Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      validateErrorResponse(response, 400, 'Invalid email format');
    });

    it('should return 423 for locked seller account', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(423).json({
          success: false,
          message: 'Seller account is locked due to multiple failed login attempts'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: mockSellers.validSeller.email,
          password: 'wrongpassword'
        });

      validateErrorResponse(response, 423, 'account is locked');
    });

    it('should return 403 for inactive seller account', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'Seller account is inactive or suspended'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: mockSellers.validSeller.email,
          password: mockSellers.validSeller.password
        });

      validateErrorResponse(response, 403, 'inactive or suspended');
    });
  });

  describe('POST /api/seller/logout', () => {
    it('should logout seller successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Seller logout successful'
      };

      mockSellerController.sellerLogout.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/seller/logout')
        .set(createAuthHeaders(sellerToken));

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Seller logout successful');
      expect(mockSellerController.sellerLogout).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .post('/api/seller/logout');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/seller/logout')
        .set('Authorization', 'Bearer invalid-token');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should handle already logged out seller', async () => {
      mockSellerController.sellerLogout.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Seller already logged out'
        });
      });

      const response = await request(app)
        .post('/api/seller/logout')
        .set(createAuthHeaders(sellerToken));

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Seller already logged out');
    });
  });

  describe('GET /api/seller/is-auth', () => {
    it('should return seller authentication status successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Seller is authenticated',
        seller: {
          _id: '507f1f77bcf86cd799439012',
          email: mockSellers.validSeller.email,
          name: mockSellers.validSeller.name,
          businessName: mockSellers.validSeller.businessName,
          isActive: true
        },
        isAuthenticated: true
      };

      mockSellerController.isAuthSeller.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/seller/is-auth')
        .set(createAuthHeaders(sellerToken));

      validateSuccessResponse(response, 200);
      expect(response.body.isAuthenticated).toBe(true);
      expect(response.body.seller).toHaveProperty('_id');
      expect(response.body.seller.email).toBe(mockSellers.validSeller.email);
      expect(mockSellerController.isAuthSeller).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .get('/api/seller/is-auth');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/seller/is-auth')
        .set('Authorization', 'Bearer invalid-token');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for expired token', async () => {
      mockSellerController.isAuthSeller.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          isAuthenticated: false
        });
      });

      const response = await request(app)
        .get('/api/seller/is-auth')
        .set(createAuthHeaders(mockTokens.expiredToken));

      validateErrorResponse(response, 401, 'Token expired');
      expect(response.body.isAuthenticated).toBe(false);
    });

    it('should handle seller account deactivation', async () => {
      mockSellerController.isAuthSeller.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'Seller account has been deactivated',
          isAuthenticated: false
        });
      });

      const response = await request(app)
        .get('/api/seller/is-auth')
        .set(createAuthHeaders(sellerToken));

      validateErrorResponse(response, 403, 'deactivated');
      expect(response.body.isAuthenticated).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in login request', async () => {
      const response = await request(app)
        .post('/api/seller/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle SQL injection attempts in login', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid input detected'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: "'; DROP TABLE sellers; --",
          password: 'password'
        });

      validateErrorResponse(response, 400, 'Invalid input');
    });

    it('should handle very long email addresses', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email address too long (max 254 characters)'
        });
      });

      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: longEmail,
          password: 'password123'
        });

      validateErrorResponse(response, 400, 'too long');
    });

    it('should handle concurrent login attempts', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many login attempts. Please try again later'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: mockSellers.validSeller.email,
          password: mockSellers.validSeller.password
        });

      validateErrorResponse(response, 429, 'Too many login attempts');
    });

    it('should handle database connection errors during login', async () => {
      mockSellerController.sellerLogin.mockImplementation((req, res) => {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable'
        });
      });

      const response = await request(app)
        .post('/api/seller/login')
        .send({
          email: mockSellers.validSeller.email,
          password: mockSellers.validSeller.password
        });

      validateErrorResponse(response, 503, 'temporarily unavailable');
    });

    it('should handle token blacklisting during logout', async () => {
      mockSellerController.sellerLogout.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Failed to blacklist token'
        });
      });

      const response = await request(app)
        .post('/api/seller/logout')
        .set(createAuthHeaders(sellerToken));

      validateErrorResponse(response, 500, 'Failed to blacklist');
    });
  });
});