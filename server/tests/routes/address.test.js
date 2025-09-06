const request = require('supertest');
const express = require('express');
const { mockAddresses, mockIds, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock address controller functions
const mockAddressController = {
  addAddress: jest.fn(),
  getAddresses: jest.fn()
};

// Mock user authentication middleware
const mockAuthUser = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized user access' });
  }
  req.userId = '507f1f77bcf86cd799439011';
  next();
});

// Setup routes for testing
app.post('/api/address/add', mockAuthUser, mockAddressController.addAddress);
app.post('/api/address/get', mockAuthUser, mockAddressController.getAddresses);

describe('Address Routes', () => {
  const userToken = generateTestToken('507f1f77bcf86cd799439011', 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/address/add', () => {
    it('should add new address successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Address added successfully',
        address: {
          _id: mockIds.validObjectId,
          ...mockAddresses.validAddress,
          userId: '507f1f77bcf86cd799439011'
        }
      };

      mockAddressController.addAddress.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/address/add')
        .set(createAuthHeaders(userToken))
        .send(mockAddresses.validAddress);

      validateSuccessResponse(response, 201);
      expect(response.body.address).toHaveProperty('_id');
      expect(response.body.address.street).toBe(mockAddresses.validAddress.street);
      expect(mockAddressController.addAddress).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/address/add')
        .send(mockAddresses.validAddress);

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid address data', async () => {
      mockAddressController.addAddress.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'All address fields are required'
        });
      });

      const response = await request(app)
        .post('/api/address/add')
        .set(createAuthHeaders(userToken))
        .send(mockAddresses.invalidAddress);

      validateErrorResponse(response, 400, 'required');
    });
  });

  describe('POST /api/address/get', () => {
    it('should retrieve user addresses successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Addresses retrieved successfully',
        addresses: [
          {
            _id: mockIds.validObjectId,
            ...mockAddresses.validAddress,
            userId: '507f1f77bcf86cd799439011'
          }
        ]
      };

      mockAddressController.getAddresses.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/address/get')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.addresses).toBeInstanceOf(Array);
      expect(mockAddressController.getAddresses).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/address/get');

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });
});