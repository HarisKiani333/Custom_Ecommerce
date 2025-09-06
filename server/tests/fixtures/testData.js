// Test fixtures and mock data for API testing

// User test data
export const mockUsers = {
  validUser: {
    name: 'John Doe',
    email: 'john.doe@test.com',
    password: 'Password123!'
  },
  invalidUser: {
    name: '',
    email: 'invalid-email',
    password: '123'
  },
  existingUser: {
    name: 'Jane Smith',
    email: 'jane.smith@test.com',
    password: 'Password456!'
  }
};

// Product test data
export const mockProducts = {
  validProduct: {
    name: 'Test Product',
    description: 'A test product description',
    price: 99.99,
    category: 'Electronics',
    subCategory: 'Smartphones',
    sizes: ['S', 'M', 'L'],
    bestseller: false
  },
  invalidProduct: {
    name: '',
    description: '',
    price: -10,
    category: '',
    subCategory: ''
  },
  updateProduct: {
    name: 'Updated Test Product',
    description: 'Updated description',
    price: 149.99,
    category: 'Electronics',
    subCategory: 'Tablets'
  }
};

// Cart test data
export const mockCartItems = {
  validCartItem: {
    itemId: '507f1f77bcf86cd799439011',
    size: 'M',
    quantity: 2
  },
  invalidCartItem: {
    itemId: 'invalid-id',
    size: '',
    quantity: -1
  }
};

// Order test data
export const mockOrders = {
  validCODOrder: {
    address: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipcode: '12345',
      country: 'Test Country',
      phone: '+1234567890'
    },
    items: [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Product',
        price: 99.99,
        quantity: 2,
        size: 'M'
      }
    ],
    amount: 199.98
  },
  validOnlineOrder: {
    address: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@test.com',
      street: '456 Test Avenue',
      city: 'Test City',
      state: 'Test State',
      zipcode: '67890',
      country: 'Test Country',
      phone: '+0987654321'
    },
    items: [
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Another Test Product',
        price: 149.99,
        quantity: 1,
        size: 'L'
      }
    ],
    amount: 149.99
  },
  invalidOrder: {
    address: {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      phone: ''
    },
    items: [],
    amount: 0
  }
};

// Address test data
export const mockAddresses = {
  validAddress: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    country: 'USA',
    phone: '+1234567890'
  },
  invalidAddress: {
    firstName: '',
    lastName: '',
    email: 'invalid-email',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  }
};

// Rating test data
export const mockRatings = {
  validRating: {
    productId: '507f1f77bcf86cd799439011',
    rating: 5,
    comment: 'Excellent product!'
  },
  invalidRating: {
    productId: 'invalid-id',
    rating: 6, // Invalid rating (should be 1-5)
    comment: ''
  },
  updateRating: {
    rating: 4,
    comment: 'Good product, updated review'
  }
};

// Order Rating test data
export const mockOrderRatings = {
  validOrderRating: {
    orderId: '507f1f77bcf86cd799439013',
    rating: 5,
    comment: 'Great service!'
  },
  invalidOrderRating: {
    orderId: 'invalid-id',
    rating: 0, // Invalid rating
    comment: ''
  }
};

// Contact form test data
export const mockContactForms = {
  validContactForm: {
    name: 'John Doe',
    email: 'john.doe@test.com',
    subject: 'Test Subject',
    message: 'This is a test message'
  },
  invalidContactForm: {
    name: '',
    email: 'invalid-email',
    subject: '',
    message: ''
  }
};

// Newsletter subscription test data
export const mockNewsletterData = {
  validEmail: 'subscriber@test.com',
  invalidEmail: 'invalid-email'
};

// Seller test data
export const mockSellers = {
  validSeller: {
    email: 'seller@test.com',
    password: 'SellerPass123!'
  },
  invalidSeller: {
    email: 'invalid-email',
    password: '123'
  }
};

// JWT tokens for testing
export const mockTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MzQ1NjcwMDB9.test',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MzQ1NjcwMDAsImV4cCI6MTYzNDU2NzAwMX0.expired',
  invalidToken: 'invalid.token.here'
};

// Database IDs for testing
export const mockIds = {
  validObjectId: '507f1f77bcf86cd799439011',
  invalidObjectId: 'invalid-id',
  nonExistentId: '507f1f77bcf86cd799439999'
};

// HTTP status codes
export const statusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const errorMessages = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error'
};

// Default export for convenience
export default {
  mockUsers,
  mockProducts,
  mockCartItems,
  mockOrders,
  mockAddresses,
  mockRatings,
  mockOrderRatings,
  mockContactForms,
  mockNewsletterData,
  mockSellers,
  mockTokens,
  mockIds,
  statusCodes,
  errorMessages
};