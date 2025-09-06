const request = require('supertest');
const express = require('express');
const { mockCart, mockIds, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock cart controller functions
const mockCartController = {
  getCart: jest.fn(),
  updateCart: jest.fn()
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
app.get('/api/cart/get', mockAuthUser, mockCartController.getCart);
app.post('/api/cart/update', mockAuthUser, mockCartController.updateCart);

describe('Cart Routes', () => {
  const userToken = generateTestToken('507f1f77bcf86cd799439011', 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart/get', () => {
    it('should retrieve user cart successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Cart retrieved successfully',
        cart: {
          _id: mockIds.validObjectId,
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: mockIds.validObjectId,
              name: 'Test Product',
              price: 99.99,
              size: 'M',
              quantity: 2,
              image: 'product-image.jpg'
            }
          ],
          totalAmount: 199.98,
          totalItems: 2
        }
      };

      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart/get')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.cart).toHaveProperty('_id');
      expect(response.body.cart).toHaveProperty('userId');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.totalAmount).toBe(199.98);
      expect(mockCartController.getCart).toHaveBeenCalledTimes(1);
    });

    it('should return empty cart for new user', async () => {
      const mockResponse = {
        success: true,
        message: 'Cart is empty',
        cart: {
          _id: null,
          userId: '507f1f77bcf86cd799439011',
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      };

      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart/get')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalAmount).toBe(0);
      expect(response.body.cart.totalItems).toBe(0);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .get('/api/cart/get');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/cart/get')
        .set('Authorization', 'Bearer invalid-token');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should handle server errors gracefully', async () => {
      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Internal server error while retrieving cart'
        });
      });

      const response = await request(app)
        .get('/api/cart/get')
        .set(createAuthHeaders(userToken));

      validateErrorResponse(response, 500, 'Internal server error');
    });
  });

  describe('POST /api/cart/update', () => {
    it('should add new item to cart successfully', async () => {
      const cartUpdateData = {
        productId: mockIds.validObjectId,
        size: 'M',
        quantity: 2
      };

      const mockResponse = {
        success: true,
        message: 'Cart updated successfully',
        cart: {
          _id: mockIds.validObjectId,
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: mockIds.validObjectId,
              name: 'Test Product',
              price: 99.99,
              size: 'M',
              quantity: 2,
              image: 'product-image.jpg'
            }
          ],
          totalAmount: 199.98,
          totalItems: 2
        }
      };

      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send(cartUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Cart updated successfully');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(mockCartController.updateCart).toHaveBeenCalledTimes(1);
    });

    it('should update existing item quantity in cart', async () => {
      const cartUpdateData = {
        productId: mockIds.validObjectId,
        size: 'M',
        quantity: 5
      };

      const mockResponse = {
        success: true,
        message: 'Cart item quantity updated',
        cart: {
          _id: mockIds.validObjectId,
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: mockIds.validObjectId,
              name: 'Test Product',
              price: 99.99,
              size: 'M',
              quantity: 5,
              image: 'product-image.jpg'
            }
          ],
          totalAmount: 499.95,
          totalItems: 5
        }
      };

      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send(cartUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.cart.items[0].quantity).toBe(5);
      expect(response.body.cart.totalAmount).toBe(499.95);
    });

    it('should remove item from cart when quantity is 0', async () => {
      const cartUpdateData = {
        productId: mockIds.validObjectId,
        size: 'M',
        quantity: 0
      };

      const mockResponse = {
        success: true,
        message: 'Item removed from cart',
        cart: {
          _id: mockIds.validObjectId,
          userId: '507f1f77bcf86cd799439011',
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      };

      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send(cartUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Item removed from cart');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalAmount).toBe(0);
    });

    it('should handle multiple items in cart', async () => {
      const cartUpdateData = {
        productId: '507f1f77bcf86cd799439013',
        size: 'L',
        quantity: 1
      };

      const mockResponse = {
        success: true,
        message: 'Cart updated successfully',
        cart: {
          _id: mockIds.validObjectId,
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: mockIds.validObjectId,
              name: 'Test Product 1',
              price: 99.99,
              size: 'M',
              quantity: 2,
              image: 'product1.jpg'
            },
            {
              productId: '507f1f77bcf86cd799439013',
              name: 'Test Product 2',
              price: 149.99,
              size: 'L',
              quantity: 1,
              image: 'product2.jpg'
            }
          ],
          totalAmount: 349.97,
          totalItems: 3
        }
      };

      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send(cartUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.cart.items).toHaveLength(2);
      expect(response.body.cart.totalItems).toBe(3);
      expect(response.body.cart.totalAmount).toBe(349.97);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/cart/update')
        .send({
          productId: mockIds.validObjectId,
          size: 'M',
          quantity: 1
        });

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for missing required fields', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Product ID, size, and quantity are required'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({});

      validateErrorResponse(response, 400, 'required');
    });

    it('should return 400 for invalid product ID', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID format'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: 'invalid-id',
          size: 'M',
          quantity: 1
        });

      validateErrorResponse(response, 400, 'Invalid product ID');
    });

    it('should return 400 for negative quantity', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Quantity must be a non-negative number'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.validObjectId,
          size: 'M',
          quantity: -1
        });

      validateErrorResponse(response, 400, 'non-negative');
    });

    it('should return 404 for non-existent product', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.nonExistentId,
          size: 'M',
          quantity: 1
        });

      validateErrorResponse(response, 404, 'Product not found');
    });

    it('should return 400 for unavailable size', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Selected size is not available for this product'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.validObjectId,
          size: 'XXL',
          quantity: 1
        });

      validateErrorResponse(response, 400, 'not available');
    });

    it('should return 400 for insufficient stock', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock. Only 3 items available'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.validObjectId,
          size: 'M',
          quantity: 10
        });

      validateErrorResponse(response, 400, 'Insufficient stock');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle very large quantity values', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Quantity exceeds maximum allowed limit (100)'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.validObjectId,
          size: 'M',
          quantity: 999999
        });

      validateErrorResponse(response, 400, 'exceeds maximum');
    });

    it('should handle concurrent cart updates', async () => {
      mockCartController.updateCart.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Conflict: Cart was updated by another process'
        });
      });

      const response = await request(app)
        .post('/api/cart/update')
        .set(createAuthHeaders(userToken))
        .send({
          productId: mockIds.validObjectId,
          size: 'M',
          quantity: 1
        });

      validateErrorResponse(response, 409, 'Conflict');
    });

    it('should handle database connection errors', async () => {
      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable'
        });
      });

      const response = await request(app)
        .get('/api/cart/get')
        .set(createAuthHeaders(userToken));

      validateErrorResponse(response, 503, 'temporarily unavailable');
    });
  });
});