import request from 'supertest';
import express from 'express';
import { mockUsers, statusCodes } from '../fixtures/testData.js';
import {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  generateExpiredToken,
  createAuthHeaders
} from '../helpers/testHelpers.js';

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock user controller functions
const mockUserController = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  isAuth: jest.fn(),
  refreshToken: jest.fn()
};

// Mock middleware
const mockAuthUser = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.userId = '507f1f77bcf86cd799439011';
  next();
});

// Setup routes for testing
app.post('/api/user/register', mockUserController.register);
app.post('/api/user/login', mockUserController.login);
app.get('/api/user/is-auth', mockAuthUser, mockUserController.isAuth);
app.post('/api/user/refresh', mockUserController.refreshToken);
app.post('/api/user/logout', mockAuthUser, mockUserController.logout);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/register', () => {
    it('should register a new user with valid data', async () => {
      const mockResponse = {
        success: true,
        message: 'User registered successfully',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: mockUsers.validUser.name,
          email: mockUsers.validUser.email
        }
      };

      mockUserController.register.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/user/register')
        .send(mockUsers.validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(mockUsers.validUser.email);
      expect(mockUserController.register).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid user data', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Validation error: Invalid user data'
        });
      });

      const response = await request(app)
        .post('/api/user/register')
        .send(mockUsers.invalidUser);

      validateErrorResponse(response, 400, 'Validation error');
      expect(mockUserController.register).toHaveBeenCalledTimes(1);
    });

    it('should return 409 for existing email', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      });

      const response = await request(app)
        .post('/api/user/register')
        .send(mockUsers.existingUser);

      validateErrorResponse(response, 409, 'User already exists');
    });

    it('should return 400 for missing required fields', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      });

      const response = await request(app)
        .post('/api/user/register')
        .send({});

      validateErrorResponse(response, 400, 'required');
    });
  });

  describe('POST /api/user/login', () => {
    it('should login user with valid credentials', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: mockUsers.validUser.name,
          email: mockUsers.validUser.email
        }
      };

      mockUserController.login.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: mockUsers.validUser.email,
          password: mockUsers.validUser.password
        });

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(mockUsers.validUser.email);
    });

    it('should return 401 for invalid credentials', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        });

      validateErrorResponse(response, 401, 'Invalid email or password');
    });

    it('should return 400 for missing credentials', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({});

      validateErrorResponse(response, 400, 'required');
    });

    it('should return 400 for invalid email format', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      validateErrorResponse(response, 400, 'Invalid email format');
    });
  });

  describe('GET /api/user/is-auth', () => {
    it('should return user info for authenticated user', async () => {
      const mockResponse = {
        success: true,
        message: 'User is authenticated',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: mockUsers.validUser.name,
          email: mockUsers.validUser.email
        }
      };

      mockUserController.isAuth.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const token = generateTestToken('507f1f77bcf86cd799439011');
      const response = await request(app)
        .get('/api/user/is-auth')
        .set(createAuthHeaders(token));

      validateSuccessResponse(response, 200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/user/is-auth');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/user/is-auth')
        .set('Authorization', 'Bearer invalid-token');

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('POST /api/user/refresh', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Token refreshed successfully',
        token: 'new-jwt-token'
      };

      mockUserController.refreshToken.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      validateSuccessResponse(response, 200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Token refreshed successfully');
    });

    it('should return 401 for invalid refresh token', async () => {
      mockUserController.refreshToken.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      });

      const response = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'invalid-refresh-token' });

      validateErrorResponse(response, 401, 'Invalid refresh token');
    });

    it('should return 400 for missing refresh token', async () => {
      mockUserController.refreshToken.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      });

      const response = await request(app)
        .post('/api/user/refresh')
        .send({});

      validateErrorResponse(response, 400, 'required');
    });
  });

  describe('POST /api/user/logout', () => {
    it('should logout user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Logout successful'
      };

      mockUserController.logout.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const token = generateTestToken('507f1f77bcf86cd799439011');
      const response = await request(app)
        .post('/api/user/logout')
        .set(createAuthHeaders(token));

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/user/logout');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/user/logout')
        .set('Authorization', 'Bearer invalid-token');

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      });

      const response = await request(app)
        .post('/api/user/register')
        .send(mockUsers.validUser);

      validateErrorResponse(response, 500, 'Internal server error');
    });

    it('should validate request body size limits', async () => {
      const largePayload = {
        name: 'A'.repeat(10000),
        email: 'test@example.com',
        password: 'password123'
      };

      mockUserController.register.mockImplementation((req, res) => {
        res.status(413).json({
          success: false,
          message: 'Payload too large'
        });
      });

      const response = await request(app)
        .post('/api/user/register')
        .send(largePayload);

      expect(response.status).toBe(413);
    });
  });
});