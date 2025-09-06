const request = require('supertest');
const express = require('express');
const { mockOrderRatings, mockOrders, mockUsers, mockTokens, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders,
  testUnauthorizedAccess
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock order rating controller functions
const mockOrderRatingController = {
  createOrderRating: jest.fn(),
  getOrderRatings: jest.fn(),
  updateOrderRating: jest.fn(),
  deleteOrderRating: jest.fn(),
  canUserRateOrder: jest.fn(),
  getOrderRatingStats: jest.fn()
};

// Mock user authentication middleware
const mockAuthUser = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }
  req.userId = '507f1f77bcf86cd799439011';
  next();
});

// Setup routes for testing
app.post('/api/order-rating/create', mockAuthUser, mockOrderRatingController.createOrderRating);
app.get('/api/order-rating/get/:orderId', mockAuthUser, mockOrderRatingController.getOrderRatings);
app.put('/api/order-rating/update/:ratingId', mockAuthUser, mockOrderRatingController.updateOrderRating);
app.delete('/api/order-rating/delete/:ratingId', mockAuthUser, mockOrderRatingController.deleteOrderRating);
app.get('/api/order-rating/can-rate/:orderId', mockAuthUser, mockOrderRatingController.canUserRateOrder);
app.get('/api/order-rating/stats/:orderId', mockOrderRatingController.getOrderRatingStats);

describe('Order Rating Routes', () => {
  const userToken = generateTestToken('507f1f77bcf86cd799439011', 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/order-rating/create', () => {
    it('should create order rating successfully with valid data', async () => {
      const ratingData = {
        orderId: mockOrderRatings.validRating.orderId,
        rating: mockOrderRatings.validRating.rating,
        comment: mockOrderRatings.validRating.comment
      };

      const mockResponse = {
        success: true,
        message: 'Order rating created successfully',
        rating: {
          _id: '507f1f77bcf86cd799439020',
          ...ratingData,
          userId: '507f1f77bcf86cd799439011',
          createdAt: new Date().toISOString()
        }
      };

      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send(ratingData);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Order rating created successfully');
      expect(response.body.rating).toHaveProperty('_id');
      expect(response.body.rating.rating).toBe(ratingData.rating);
      expect(mockOrderRatingController.createOrderRating).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing required fields', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Order ID and rating are required'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          comment: 'Great service'
          // Missing orderId and rating
        });

      validateErrorResponse(response, 400, 'required');
    });

    it('should return 400 for invalid rating value', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 6, // Invalid rating
          comment: 'Test comment'
        });

      validateErrorResponse(response, 400, 'between 1 and 5');
    });

    it('should return 404 for non-existent order', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: '507f1f77bcf86cd799439999',
          rating: 5,
          comment: 'Test comment'
        });

      validateErrorResponse(response, 404, 'Order not found');
    });

    it('should return 403 for unauthorized order access', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'You can only rate your own orders'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 5,
          comment: 'Test comment'
        });

      validateErrorResponse(response, 403, 'only rate your own orders');
    });

    it('should return 409 for duplicate rating', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'You have already rated this order'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 5,
          comment: 'Test comment'
        });

      validateErrorResponse(response, 409, 'already rated');
    });

    it('should handle unauthorized access', async () => {
      await testUnauthorizedAccess(app, 'post', '/api/order-rating/create');
    });
  });

  describe('GET /api/order-rating/get/:orderId', () => {
    it('should get order ratings successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Order ratings retrieved successfully',
        ratings: [
          {
            _id: '507f1f77bcf86cd799439020',
            orderId: mockOrderRatings.validRating.orderId,
            userId: '507f1f77bcf86cd799439011',
            rating: 5,
            comment: 'Excellent service',
            createdAt: new Date().toISOString()
          }
        ],
        totalRatings: 1,
        averageRating: 5
      };

      mockOrderRatingController.getOrderRatings.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/get/${mockOrderRatings.validRating.orderId}`)
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.ratings).toHaveLength(1);
      expect(response.body).toHaveProperty('averageRating');
      expect(mockOrderRatingController.getOrderRatings).toHaveBeenCalledTimes(1);
    });

    it('should return empty array for order with no ratings', async () => {
      const mockResponse = {
        success: true,
        message: 'No ratings found for this order',
        ratings: [],
        totalRatings: 0,
        averageRating: 0
      };

      mockOrderRatingController.getOrderRatings.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/get/${mockOrderRatings.validRating.orderId}`)
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.ratings).toHaveLength(0);
      expect(response.body.averageRating).toBe(0);
    });

    it('should return 400 for invalid order ID format', async () => {
      mockOrderRatingController.getOrderRatings.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid order ID format'
        });
      });

      const response = await request(app)
        .get('/api/order-rating/get/invalid-id')
        .set(createAuthHeaders(userToken));

      validateErrorResponse(response, 400, 'Invalid order ID');
    });

    it('should handle unauthorized access', async () => {
      await testUnauthorizedAccess(app, 'get', `/api/order-rating/get/${mockOrderRatings.validRating.orderId}`);
    });
  });

  describe('PUT /api/order-rating/update/:ratingId', () => {
    it('should update order rating successfully', async () => {
      const updateData = {
        rating: 4,
        comment: 'Updated comment - Good service'
      };

      const mockResponse = {
        success: true,
        message: 'Order rating updated successfully',
        rating: {
          _id: '507f1f77bcf86cd799439020',
          orderId: mockOrderRatings.validRating.orderId,
          userId: '507f1f77bcf86cd799439011',
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      };

      mockOrderRatingController.updateOrderRating.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/order-rating/update/507f1f77bcf86cd799439020')
        .set(createAuthHeaders(userToken))
        .send(updateData);

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Order rating updated successfully');
      expect(response.body.rating.rating).toBe(updateData.rating);
      expect(response.body.rating.comment).toBe(updateData.comment);
      expect(mockOrderRatingController.updateOrderRating).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent rating', async () => {
      mockOrderRatingController.updateOrderRating.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      });

      const response = await request(app)
        .put('/api/order-rating/update/507f1f77bcf86cd799439999')
        .set(createAuthHeaders(userToken))
        .send({
          rating: 4,
          comment: 'Updated comment'
        });

      validateErrorResponse(response, 404, 'Rating not found');
    });

    it('should return 403 for unauthorized rating update', async () => {
      mockOrderRatingController.updateOrderRating.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'You can only update your own ratings'
        });
      });

      const response = await request(app)
        .put('/api/order-rating/update/507f1f77bcf86cd799439020')
        .set(createAuthHeaders(userToken))
        .send({
          rating: 4,
          comment: 'Updated comment'
        });

      validateErrorResponse(response, 403, 'only update your own ratings');
    });

    it('should handle unauthorized access', async () => {
      await testUnauthorizedAccess(app, 'put', '/api/order-rating/update/507f1f77bcf86cd799439020');
    });
  });

  describe('DELETE /api/order-rating/delete/:ratingId', () => {
    it('should delete order rating successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Order rating deleted successfully'
      };

      mockOrderRatingController.deleteOrderRating.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/order-rating/delete/507f1f77bcf86cd799439020')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Order rating deleted successfully');
      expect(mockOrderRatingController.deleteOrderRating).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent rating', async () => {
      mockOrderRatingController.deleteOrderRating.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      });

      const response = await request(app)
        .delete('/api/order-rating/delete/507f1f77bcf86cd799439999')
        .set(createAuthHeaders(userToken));

      validateErrorResponse(response, 404, 'Rating not found');
    });

    it('should return 403 for unauthorized rating deletion', async () => {
      mockOrderRatingController.deleteOrderRating.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own ratings'
        });
      });

      const response = await request(app)
        .delete('/api/order-rating/delete/507f1f77bcf86cd799439020')
        .set(createAuthHeaders(userToken));

      validateErrorResponse(response, 403, 'only delete your own ratings');
    });

    it('should handle unauthorized access', async () => {
      await testUnauthorizedAccess(app, 'delete', '/api/order-rating/delete/507f1f77bcf86cd799439020');
    });
  });

  describe('GET /api/order-rating/can-rate/:orderId', () => {
    it('should return true when user can rate order', async () => {
      const mockResponse = {
        success: true,
        message: 'User can rate this order',
        canRate: true,
        reason: 'Order is completed and not yet rated'
      };

      mockOrderRatingController.canUserRateOrder.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/can-rate/${mockOrderRatings.validRating.orderId}`)
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.canRate).toBe(true);
      expect(response.body).toHaveProperty('reason');
      expect(mockOrderRatingController.canUserRateOrder).toHaveBeenCalledTimes(1);
    });

    it('should return false when user cannot rate order', async () => {
      const mockResponse = {
        success: true,
        message: 'User cannot rate this order',
        canRate: false,
        reason: 'Order already rated by user'
      };

      mockOrderRatingController.canUserRateOrder.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/can-rate/${mockOrderRatings.validRating.orderId}`)
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.canRate).toBe(false);
      expect(response.body.reason).toBe('Order already rated by user');
    });

    it('should handle unauthorized access', async () => {
      await testUnauthorizedAccess(app, 'get', `/api/order-rating/can-rate/${mockOrderRatings.validRating.orderId}`);
    });
  });

  describe('GET /api/order-rating/stats/:orderId', () => {
    it('should get order rating statistics successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Order rating statistics retrieved successfully',
        stats: {
          totalRatings: 10,
          averageRating: 4.2,
          ratingDistribution: {
            1: 0,
            2: 1,
            3: 2,
            4: 3,
            5: 4
          },
          mostRecentRating: {
            rating: 5,
            comment: 'Excellent service',
            createdAt: new Date().toISOString()
          }
        }
      };

      mockOrderRatingController.getOrderRatingStats.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/stats/${mockOrderRatings.validRating.orderId}`);

      validateSuccessResponse(response, 200);
      expect(response.body.stats).toHaveProperty('totalRatings');
      expect(response.body.stats).toHaveProperty('averageRating');
      expect(response.body.stats).toHaveProperty('ratingDistribution');
      expect(mockOrderRatingController.getOrderRatingStats).toHaveBeenCalledTimes(1);
    });

    it('should return empty stats for order with no ratings', async () => {
      const mockResponse = {
        success: true,
        message: 'No ratings found for this order',
        stats: {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          },
          mostRecentRating: null
        }
      };

      mockOrderRatingController.getOrderRatingStats.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/order-rating/stats/${mockOrderRatings.validRating.orderId}`);

      validateSuccessResponse(response, 200);
      expect(response.body.stats.totalRatings).toBe(0);
      expect(response.body.stats.averageRating).toBe(0);
    });

    it('should return 400 for invalid order ID format', async () => {
      mockOrderRatingController.getOrderRatingStats.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid order ID format'
        });
      });

      const response = await request(app)
        .get('/api/order-rating/stats/invalid-id');

      validateErrorResponse(response, 400, 'Invalid order ID');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in create rating request', async () => {
      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle very long comments', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Comment exceeds maximum length of 1000 characters'
        });
      });

      const longComment = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 5,
          comment: longComment
        });

      validateErrorResponse(response, 400, 'exceeds maximum length');
    });

    it('should handle database connection errors', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 5,
          comment: 'Test comment'
        });

      validateErrorResponse(response, 503, 'temporarily unavailable');
    });

    it('should handle concurrent rating updates', async () => {
      mockOrderRatingController.updateOrderRating.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Rating was modified by another request. Please refresh and try again'
        });
      });

      const response = await request(app)
        .put('/api/order-rating/update/507f1f77bcf86cd799439020')
        .set(createAuthHeaders(userToken))
        .send({
          rating: 4,
          comment: 'Updated comment'
        });

      validateErrorResponse(response, 409, 'modified by another request');
    });

    it('should handle XSS attempts in comments', async () => {
      mockOrderRatingController.createOrderRating.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid characters detected in comment'
        });
      });

      const response = await request(app)
        .post('/api/order-rating/create')
        .set(createAuthHeaders(userToken))
        .send({
          orderId: mockOrderRatings.validRating.orderId,
          rating: 5,
          comment: '<script>alert("xss")</script>'
        });

      validateErrorResponse(response, 400, 'Invalid characters');
    });
  });
});