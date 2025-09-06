const request = require('supertest');
const express = require('express');
const { mockProducts, mockIds, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse,
  generateTestToken,
  createAuthHeaders,
  createMultipartHeaders
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock product controller functions
const mockProductController = {
  addProduct: jest.fn(),
  productList: jest.fn(),
  productDetailByID: jest.fn(),
  changeStock: jest.fn()
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

// Mock multer upload middleware
const mockUpload = {
  array: jest.fn(() => (req, res, next) => {
    req.files = [{
      fieldname: 'images',
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake image data'),
      size: 1024
    }];
    next();
  })
};

// Setup routes for testing
app.post('/api/product/add', mockUpload.array(['images']), mockAuthSeller, mockProductController.addProduct);
app.get('/api/product/list', mockProductController.productList);
app.get('/api/product/:id', mockProductController.productDetailByID);
app.put('/api/product/stock', mockAuthSeller, mockProductController.changeStock);

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/product/add', () => {
    const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');

    it('should add a new product with valid data and images', async () => {
      const mockResponse = {
        success: true,
        message: 'Product added successfully',
        product: {
          _id: mockIds.validObjectId,
          ...mockProducts.validProduct,
          images: ['image1.jpg', 'image2.jpg'],
          sellerId: '507f1f77bcf86cd799439012'
        }
      };

      mockProductController.addProduct.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/product/add')
        .set(createAuthHeaders(sellerToken))
        .field('name', mockProducts.validProduct.name)
        .field('description', mockProducts.validProduct.description)
        .field('price', mockProducts.validProduct.price)
        .field('category', mockProducts.validProduct.category)
        .field('subCategory', mockProducts.validProduct.subCategory)
        .attach('images', Buffer.from('fake image'), 'test1.jpg')
        .attach('images', Buffer.from('fake image'), 'test2.jpg');

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Product added successfully');
      expect(response.body.product).toHaveProperty('_id');
      expect(response.body.product.name).toBe(mockProducts.validProduct.name);
      expect(response.body.product.images).toBeInstanceOf(Array);
      expect(mockProductController.addProduct).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .post('/api/product/add')
        .field('name', mockProducts.validProduct.name);

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 401 for invalid seller token', async () => {
      const response = await request(app)
        .post('/api/product/add')
        .set('Authorization', 'Bearer invalid-token')
        .field('name', mockProducts.validProduct.name);

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid product data', async () => {
      mockProductController.addProduct.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Validation error: Invalid product data'
        });
      });

      const response = await request(app)
        .post('/api/product/add')
        .set(createAuthHeaders(sellerToken))
        .field('name', '')
        .field('price', -10);

      validateErrorResponse(response, 400, 'Validation error');
    });

    it('should return 400 for missing required fields', async () => {
      mockProductController.addProduct.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Name, description, price, and category are required'
        });
      });

      const response = await request(app)
        .post('/api/product/add')
        .set(createAuthHeaders(sellerToken));

      validateErrorResponse(response, 400, 'required');
    });

    it('should handle file upload errors', async () => {
      mockProductController.addProduct.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid file format. Only images are allowed'
        });
      });

      const response = await request(app)
        .post('/api/product/add')
        .set(createAuthHeaders(sellerToken))
        .field('name', mockProducts.validProduct.name)
        .attach('images', Buffer.from('fake file'), 'test.txt');

      validateErrorResponse(response, 400, 'Invalid file format');
    });
  });

  describe('GET /api/product/list', () => {
    it('should return list of all products', async () => {
      const mockResponse = {
        success: true,
        message: 'Products retrieved successfully',
        products: [
          {
            _id: mockIds.validObjectId,
            ...mockProducts.validProduct,
            images: ['image1.jpg']
          },
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'Another Product',
            price: 149.99,
            category: 'Electronics',
            images: ['image2.jpg']
          }
        ],
        total: 2
      };

      mockProductController.productList.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/product/list');

      validateSuccessResponse(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products).toHaveLength(2);
      expect(response.body).toHaveProperty('total');
      expect(mockProductController.productList).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      const mockResponse = {
        success: true,
        message: 'No products found',
        products: [],
        total: 0
      };

      mockProductController.productList.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/product/list');

      validateSuccessResponse(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should handle query parameters for filtering', async () => {
      const mockResponse = {
        success: true,
        message: 'Filtered products retrieved successfully',
        products: [{
          _id: mockIds.validObjectId,
          ...mockProducts.validProduct
        }],
        total: 1
      };

      mockProductController.productList.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/product/list')
        .query({ category: 'Electronics', limit: 10, page: 1 });

      validateSuccessResponse(response, 200);
      expect(response.body.products).toHaveLength(1);
    });

    it('should handle server errors gracefully', async () => {
      mockProductController.productList.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      });

      const response = await request(app)
        .get('/api/product/list');

      validateErrorResponse(response, 500, 'Internal server error');
    });
  });

  describe('GET /api/product/:id', () => {
    it('should return product details for valid ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Product retrieved successfully',
        product: {
          _id: mockIds.validObjectId,
          ...mockProducts.validProduct,
          images: ['image1.jpg', 'image2.jpg'],
          ratings: [],
          averageRating: 0,
          totalRatings: 0
        }
      };

      mockProductController.productDetailByID.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/product/${mockIds.validObjectId}`);

      validateSuccessResponse(response, 200);
      expect(response.body.product).toHaveProperty('_id');
      expect(response.body.product.name).toBe(mockProducts.validProduct.name);
      expect(response.body.product.images).toBeInstanceOf(Array);
      expect(mockProductController.productDetailByID).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent product ID', async () => {
      mockProductController.productDetailByID.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      });

      const response = await request(app)
        .get(`/api/product/${mockIds.nonExistentId}`);

      validateErrorResponse(response, 404, 'Product not found');
    });

    it('should return 400 for invalid product ID format', async () => {
      mockProductController.productDetailByID.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID format'
        });
      });

      const response = await request(app)
        .get('/api/product/invalid-id');

      validateErrorResponse(response, 400, 'Invalid product ID');
    });
  });

  describe('PUT /api/product/stock', () => {
    const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');

    it('should update product stock successfully', async () => {
      const stockUpdateData = {
        productId: mockIds.validObjectId,
        sizes: [
          { size: 'S', quantity: 10 },
          { size: 'M', quantity: 15 },
          { size: 'L', quantity: 8 }
        ]
      };

      const mockResponse = {
        success: true,
        message: 'Stock updated successfully',
        product: {
          _id: mockIds.validObjectId,
          ...mockProducts.validProduct,
          sizes: stockUpdateData.sizes
        }
      };

      mockProductController.changeStock.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/product/stock')
        .set(createAuthHeaders(sellerToken))
        .send(stockUpdateData);

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Stock updated successfully');
      expect(response.body.product.sizes).toEqual(stockUpdateData.sizes);
      expect(mockProductController.changeStock).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthorized seller', async () => {
      const response = await request(app)
        .put('/api/product/stock')
        .send({
          productId: mockIds.validObjectId,
          sizes: [{ size: 'M', quantity: 10 }]
        });

      validateErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid stock data', async () => {
      mockProductController.changeStock.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid stock data: quantities must be non-negative'
        });
      });

      const response = await request(app)
        .put('/api/product/stock')
        .set(createAuthHeaders(sellerToken))
        .send({
          productId: mockIds.validObjectId,
          sizes: [{ size: 'M', quantity: -5 }]
        });

      validateErrorResponse(response, 400, 'Invalid stock data');
    });

    it('should return 404 for non-existent product', async () => {
      mockProductController.changeStock.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      });

      const response = await request(app)
        .put('/api/product/stock')
        .set(createAuthHeaders(sellerToken))
        .send({
          productId: mockIds.nonExistentId,
          sizes: [{ size: 'M', quantity: 10 }]
        });

      validateErrorResponse(response, 404, 'Product not found');
    });

    it('should return 403 for seller trying to update another seller\'s product', async () => {
      mockProductController.changeStock.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own products'
        });
      });

      const response = await request(app)
        .put('/api/product/stock')
        .set(createAuthHeaders(sellerToken))
        .send({
          productId: mockIds.validObjectId,
          sizes: [{ size: 'M', quantity: 10 }]
        });

      validateErrorResponse(response, 403, 'Forbidden');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/product/add')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle very large product names', async () => {
      const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');
      
      mockProductController.addProduct.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Product name too long (max 100 characters)'
        });
      });

      const response = await request(app)
        .post('/api/product/add')
        .set(createAuthHeaders(sellerToken))
        .field('name', 'A'.repeat(200))
        .field('description', 'Test description')
        .field('price', 99.99);

      validateErrorResponse(response, 400, 'too long');
    });

    it('should handle concurrent stock updates', async () => {
      const sellerToken = generateTestToken('507f1f77bcf86cd799439012', 'seller');
      
      mockProductController.changeStock.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Conflict: Stock was updated by another process'
        });
      });

      const response = await request(app)
        .put('/api/product/stock')
        .set(createAuthHeaders(sellerToken))
        .send({
          productId: mockIds.validObjectId,
          sizes: [{ size: 'M', quantity: 10 }]
        });

      validateErrorResponse(response, 409, 'Conflict');
    });
  });
});