const request = require('supertest');
const express = require('express');
const { mockOrders, mockIds, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For Stripe webhook

// Mock order controller functions
const mockOrderController = {
  getUserOrders: jest.fn(),
  getSellerOrders: jest.fn(),
  placeOrderCOD: jest.fn(),
  updateOrderStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  placeOrderGuest: jest.fn(),
  placeOrderOnline: jest.fn(),
  stripeWebhook: jest.fn(),
  deleteOrder: jest.fn()
};

// Mock authentication middleware
const mockAuthUser = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized user access' });
  }
  req.userId = '507f1f77bcf86cd799439011';
  next();
});

const mockAuthSeller = jest.fn((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'invalid-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized seller access' });
  }
  req.sellerId = '507f1f77bcf86cd799439012';
  next();
});

// Setup routes for testing
app.get('/api/order/user', mockAuthUser, mockOrderController.getUserOrders);
app.get('/api/order/seller', mockAuthSeller, mockOrderController.getSellerOrders);
app.post('/api/order/cod', mockAuthUser, mockOrderController.placeOrderCOD);
app.put('/api/order/status', mockAuthSeller, mockOrderController.updateOrderStatus);
app.put('/api/order/payment', mockAuthSeller, mockOrderController.updatePaymentStatus);
app.post('/api/order/guest', mockOrderController.placeOrderGuest);
app.post('/api/order/online', mockAuthUser, mockOrderController.placeOrderOnline);
app.post('/api/order/webhook', mockOrderController.stripeWebhook);
app.delete('/api/order/delete', mockAuthSeller, mockOrderController.deleteOrder);

describe('Order Routes', () => {
  const userToken = generateTestToken('507f1f77bcf86cd799439011', 'user');
  const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/order/user', () => {
    it('should retrieve user orders successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Orders retrieved successfully',
        orders: [
          {
            _id: mockIds.validObjectId,
            ...mockOrders.validOrder,
            userId: '507f1f77bcf86cd799439011',
            status: 'pending',
            paymentStatus: 'paid'
          }
        ],
        total: 1
      };

      mockOrderController.getUserOrders.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/order/user')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.orders).toBeInstanceOf(Array);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].userId).toBe('507f1f77bcf86cd799439011');
      expect(mockOrderController.getUserOrders).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no orders', async () => {
      const mockResponse = {
        success: true,
        message: 'No orders found',
        orders: [],
        total: 0
      };

      mockOrderController.getUserOrders.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/order/user')
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.orders).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .get('/api/order/user');

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Orders retrieved successfully',
        orders: [mockOrders.validOrder],
        total: 10,
        page: 2,
        limit: 5
      };

      mockOrderController.getUserOrders.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/order/user')
        .query({ page: 2, limit: 5 })
        .set(createAuthHeaders(userToken));

      validateSuccessResponse(response, 200);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(5);
    });
  });

  describe('GET /api/order/seller', () => {
    it('should retrieve seller orders successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Seller orders retrieved successfully',
        orders: [
          {
            _id: mockIds.validObjectId,
            ...mockOrders.validOrder,
            sellerId: '507f1f77bcf86cd799439012'
          }
        ],
        total: 1
      };

      mockOrderController.getSellerOrders.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/order/seller')
        .set(createAuthHeaders(sellerToken));

      validateSuccessResponse(response, 200);
      expect(response.body.orders).toBeInstanceOf(Array);
      expect(response.body.orders[0].sellerId).toBe('507f1f77bcf86cd799439012');
      expect(mockOrderController.getSellerOrders).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .get('/api/order/seller');

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('POST /api/order/cod', () => {
    it('should place COD order successfully', async () => {
      const orderData = {
        items: [
          {
            productId: mockIds.validObjectId,
            quantity: 2,
            size: 'M',
            price: 99.99
          }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        totalAmount: 199.98
      };

      const mockResponse = {
        success: true,
        message: 'COD order placed successfully',
        order: {
          _id: mockIds.validObjectId,
          ...orderData,
          userId: '507f1f77bcf86cd799439011',
          paymentMethod: 'COD',
          status: 'pending',
          paymentStatus: 'pending'
        }
      };

      mockOrderController.placeOrderCOD.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/order/cod')
        .set(createAuthHeaders(userToken))
        .send(orderData);

      validateSuccessResponse(response, 201);
      expect(response.body.order.paymentMethod).toBe('COD');
      expect(response.body.order.status).toBe('pending');
      expect(mockOrderController.placeOrderCOD).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid order data', async () => {
      mockOrderController.placeOrderCOD.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid order data: items and shipping address are required'
        });
      });

      const response = await request(app)
        .post('/api/order/cod')
        .set(createAuthHeaders(userToken))
        .send({});

      validateErrorResponse(response, 400, 'Invalid order data');
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/order/cod')
        .send(mockOrders.validOrder);

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('POST /api/order/online', () => {
    it('should initiate online payment order successfully', async () => {
      const orderData = {
        items: [
          {
            productId: mockIds.validObjectId,
            quantity: 1,
            size: 'L',
            price: 149.99
          }
        ],
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Payment City',
          state: 'Payment State',
          zipCode: '67890',
          country: 'Payment Country'
        },
        totalAmount: 149.99
      };

      const mockResponse = {
        success: true,
        message: 'Payment session created successfully',
        sessionId: 'cs_test_123456789',
        order: {
          _id: mockIds.validObjectId,
          ...orderData,
          paymentMethod: 'online',
          status: 'pending',
          paymentStatus: 'pending'
        }
      };

      mockOrderController.placeOrderOnline.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/order/online')
        .set(createAuthHeaders(userToken))
        .send(orderData);

      validateSuccessResponse(response, 201);
      expect(response.body.sessionId).toBe('cs_test_123456');
      expect(response.body.order.paymentMethod).toBe('online');
      expect(mockOrderController.placeOrderOnline).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized user', async () => {
      const response = await request(app)
        .post('/api/order/online')
        .send(mockOrders.validOrder);

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('POST /api/order/guest', () => {
    it('should place guest order successfully', async () => {
      const guestOrderData = {
        items: [
          {
            productId: mockIds.validObjectId,
            quantity: 1,
            size: 'S',
            price: 79.99
          }
        ],
        guestInfo: {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '+1234567890'
        },
        shippingAddress: {
          street: '789 Pine St',
          city: 'Guest City',
          state: 'Guest State',
          zipCode: '54321',
          country: 'Guest Country'
        },
        totalAmount: 79.99
      };

      const mockResponse = {
        success: true,
        message: 'Guest order placed successfully',
        order: {
          _id: mockIds.validObjectId,
          ...guestOrderData,
          isGuest: true,
          status: 'pending',
          paymentStatus: 'pending'
        }
      };

      mockOrderController.placeOrderGuest.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/order/guest')
        .send(guestOrderData);

      validateSuccessResponse(response, 201);
      expect(response.body.order.isGuest).toBe(true);
      expect(response.body.order.guestInfo.email).toBe('guest@example.com');
      expect(mockOrderController.placeOrderGuest).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing guest information', async () => {
      mockOrderController.placeOrderGuest.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Guest information is required for guest orders'
        });
      });

      const response = await request(app)
        .post('/api/order/guest')
        .send({ items: [] });

      validateErrorResponse(response, 400, 'Guest information is required');
    });
  });

  describe('PUT /api/order/status', () => {
    it('should update order status successfully', async () => {
      const statusUpdateData = {
        orderId: mockIds.validObjectId,
        status: 'shipped'
      };

      const mockResponse = {
        success: true,
        message: 'Order status updated successfully',
        order: {
          _id: mockIds.validObjectId,
          status: 'shipped',
          updatedAt: new Date().toISOString()
        }
      };

      mockOrderController.updateOrderStatus.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/order/status')
        .set(createAuthHeaders(sellerToken))
        .send(statusUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.order.status).toBe('shipped');
      expect(mockOrderController.updateOrderStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .put('/api/order/status')
        .send({
          orderId: mockIds.validObjectId,
          status: 'shipped'
        });

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid status', async () => {
      mockOrderController.updateOrderStatus.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values: pending, confirmed, shipped, delivered, cancelled'
        });
      });

      const response = await request(app)
        .put('/api/order/status')
        .set(createAuthHeaders(sellerToken))
        .send({
          orderId: mockIds.validObjectId,
          status: 'invalid-status'
        });

      validateErrorResponse(response, 400, 'Invalid status');
    });
  });

  describe('PUT /api/order/payment', () => {
    it('should update payment status successfully', async () => {
      const paymentUpdateData = {
        orderId: mockIds.validObjectId,
        paymentStatus: 'paid'
      };

      const mockResponse = {
        success: true,
        message: 'Payment status updated successfully',
        order: {
          _id: mockIds.validObjectId,
          paymentStatus: 'paid',
          paidAt: new Date().toISOString()
        }
      };

      mockOrderController.updatePaymentStatus.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/order/payment')
        .set(createAuthHeaders(sellerToken))
        .send(paymentUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.order.paymentStatus).toBe('paid');
      expect(mockOrderController.updatePaymentStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .put('/api/order/payment')
        .send({
          orderId: mockIds.validObjectId,
          paymentStatus: 'paid'
        });

      validateErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('POST /api/order/webhook', () => {
    it('should handle Stripe webhook successfully', async () => {
      const webhookData = {
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123456789',
            payment_status: 'paid'
          }
        }
      };

      const mockResponse = {
        success: true,
        message: 'Webhook processed successfully'
      };

      mockOrderController.stripeWebhook.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/order/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookData);

      validateSuccessResponse(response, 200);
      expect(mockOrderController.stripeWebhook).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid webhook signature', async () => {
      mockOrderController.stripeWebhook.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      });

      const response = await request(app)
        .post('/api/order/webhook')
        .send({ type: 'test' });

      validateErrorResponse(response, 400, 'Invalid webhook signature');
    });
  });

  describe('DELETE /api/order/delete', () => {
    it('should delete order successfully', async () => {
      const deleteData = {
        orderId: mockIds.validObjectId
      };

      const mockResponse = {
        success: true,
        message: 'Order deleted successfully'
      };

      mockOrderController.deleteOrder.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/order/delete')
        .set(createAuthHeaders(sellerToken))
        .send(deleteData);

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Order deleted successfully');
      expect(mockOrderController.deleteOrder).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .delete('/api/order/delete')
        .send({ orderId: mockIds.validObjectId });

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 404 for non-existent order', async () => {
      mockOrderController.deleteOrder.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      });

      const response = await request(app)
        .delete('/api/order/delete')
        .set(createAuthHeaders(sellerToken))
        .send({ orderId: mockIds.nonExistentId });

      validateErrorResponse(response, 404, 'Order not found');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle insufficient stock during order placement', async () => {
      mockOrderController.placeOrderCOD.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock for one or more items'
        });
      });

      const response = await request(app)
        .post('/api/order/cod')
        .set(createAuthHeaders(userToken))
        .send(mockOrders.validOrder);

      validateErrorResponse(response, 400, 'Insufficient stock');
    });

    it('should handle payment processing errors', async () => {
      mockOrderController.placeOrderOnline.mockImplementation((req, res) => {
        res.status(402).json({
          success: false,
          message: 'Payment processing failed'
        });
      });

      const response = await request(app)
        .post('/api/order/online')
        .set(createAuthHeaders(userToken))
        .send(mockOrders.validOrder);

      validateErrorResponse(response, 402, 'Payment processing failed');
    });

    it('should handle order status transition validation', async () => {
      mockOrderController.updateOrderStatus.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot change status from delivered to pending'
        });
      });

      const response = await request(app)
        .put('/api/order/status')
        .set(createAuthHeaders(sellerToken))
        .send({
          orderId: mockIds.validObjectId,
          status: 'pending'
        });

      validateErrorResponse(response, 400, 'Cannot change status');
    });
  });
});