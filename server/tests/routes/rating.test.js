const request = require('supertest');
const express = require('express');
const { mockRatings, mockIds, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock rating controller functions
const mockRatingController = {
  createRating: jest.fn(),
  getRatings: jest.fn(),
  updateRating: jest.fn(),
  deleteRating: jest.fn(),
  getProductRatings: jest.fn(),
  getUserRatings: jest.fn()
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
app.post('/api/rating/create', mockAuthUser, mockRatingController.createRating);
app.get('/api/rating/get', mockRatingController.getRatings);
app.put('/api/rating/update', mockAuthUser, mockRatingController.updateRating);
app.delete('/api/rating/delete', mockAuthUser, mockRatingController.deleteRating);
app.get('/api/rating/product/:productId', mockRatingController.getProductRatings);
app.get('/api/rating/user', mockAuthUser, mockRatingController.getUserRatings);

describe('Rating Routes', () => {
  const userToken = generateTestToken('507f1f77bcf86cd799439011', 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/rating/create', () => {
    it('should create rating successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Rating created successfully',
        rating: {
          _id: mockIds.validObjectId,
          ...mockRatings.validRating,
          userId: '507f1f77bcf86cd799439011'
        }
      };

      mockRatingController.createRating.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/rating/create')
        .set(createAuthHeaders(userToken))
        .send(mockRatings.validRating);

      validateSuccessResponse(response, 201);
      expect(response.body.rating).toHaveProperty('_id');
      expect(response.body.rating.rating).toBe(mockRatings.validRating.rating);
      expect(mockRatingController.createRating).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/rating/create')
        .send(mockRatings.validRating);

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid rating data', async () => {
      mockRatingController.createRating.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      });

      const response = await request(app)
        .post('/api/rating/create')
        .set(createAuthHeaders(userToken))
        .send(mockRatings.invalidRating);

      validateErrorResponse(response, 400, 'Rating must be between');
    });

    it('should return 409 for duplicate rating', async () => {
      mockRatingController.createRating.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'You have already rated this product'
        });
      });

      const response = await request(app)
        .post('/api/rating/create')
        .set(createAuthHeaders(userToken))
        .send(mockRatings.validRating);

      validateErrorResponse(response, 409, 'already rated');
    });
  });

  describe('GET /api/rating/get', () => {
    it('should retrieve all ratings successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Ratings retrieved successfully',
        ratings: [
          {
            _id: mockIds.validObjectId,
            ...mockRatings.validRating,
            userId: '507f1f77bcf86cd799439011'
          }
        ],
        total: 1
      };

      mockRatingController.getRatings.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/rating/get');

      validateSuccessResponse(response, 200);
      expect(response.body.ratings).toBeInstanceOf(Array);
      expect(mockRatingController.getRatings).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/rating/update', () => {
    it('should update rating successfully', async () => {
      const updateData = {
        ratingId: mockIds.validObjectId,
        rating: 4,
        comment: 'Updated comment'
      };

      const mockResponse = {
        success: true,
        message: 'Rating updated successfully',
        rating: {
          _id: mockIds.validObjectId,
          ...updateData,
          userId: '507f1f77bcf86cd799439011'
        }
      };

      mockRatingController.updateRating.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/rating/update')
        .set(createAuthHeaders(userToken))
        .send(updateData);

      validateSuccessResponse(response, 200);
      expect(response.body.rating.rating).toBe(4);
      expect(mockRatingController.updateRating).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .put('/api/rating/update')
        .send({ ratingId: mockIds.validObjectId, rating: 4 });

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 403 for updating another user\'s rating', async () => {
      mockRatingController.updateRating.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'You can only update your own ratings'
        });
      });

      const response = await request(app)
        .put('/api/rating/update')
        .set(createAuthHeaders(userToken))
        .send({ ratingId: mockIds.validObjectId, rating: 4 });

      validateErrorResponse(response, 403, 'only update your own');
    });
  });

  describe('DELETE /api/rating/delete', () => {
    it('should delete rating successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Rating deleted successfully'
      };

      mockRatingController.deleteRating.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/rating/delete')
        .set(createAuthHeaders(userToken))
        .send({ ratingId: mockIds.validObjectId });

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Rating deleted successfully');
      expect(mockRatingController.deleteRating).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .delete('/api/rating/delete')
        .send({ ratingId: mockIds.validObjectId });

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('GET /api/rating/product/:productId', () => {
    it('should retrieve product ratings successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Product ratings retrieved successfully',
        ratings: [
          {
            _id: mockIds.validObjectId,
            ...mockRatings.validRating,
            productId: mockIds.validObjectId
          }
        ],
        averageRating: 4.5,
        totalRatings: 1
      };

      mockRatingController.getProductRatings.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/rating/product/${mockIds.validObjectId}`);

      validateSuccessResponse(response, 200);
      expect(response.body.ratings).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('averageRating');
      expect(mockRatingController.getProductRatings).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent product', async () => {
      mockRatingController.getProductRatings.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      });

      const response = await request(app)
        .get(`/api/rating/product/${mockIds.nonExistentId}`);

      validateErrorResponse(response, 404, 'Product not found');
    });
  });

  describe('GET /api/rating/user', () => {
    it('should retrieve user ratings successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User ratings retrieved successfully',
        ratings: [
          {
            _id: mockIds.validObjectId,
            ...mockRatings.validRating,
            userId: '507f1f77bcf86cd799439011'
          }
        ]
      };

      mockRatingController.getUserRatings.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/rating/user')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.ratings).toBeInstanceOf(Array);
      expect(mockRatingController.getUserRatings).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .get('/api/rating/user');

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });
});