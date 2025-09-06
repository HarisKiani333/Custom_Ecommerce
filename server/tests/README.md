# API Test Suite Documentation

## Overview

This comprehensive test suite provides complete coverage for all API routes in the Husk Store backend application. The tests are designed to validate functionality, security, and edge cases across all endpoints.

## Test Structure

```
tests/
├── fixtures/
│   └── testData.js          # Mock data and test fixtures
├── helpers/
│   └── testHelpers.js       # Utility functions for testing
├── routes/
│   ├── address.test.js      # Address management tests
│   ├── cart.test.js         # Shopping cart tests
│   ├── contact.test.js      # Contact form tests
│   ├── order.test.js        # Order processing tests
│   ├── orderRating.test.js  # Order rating tests
│   ├── product.test.js      # Product CRUD tests
│   ├── rating.test.js       # Product rating tests
│   ├── seller.test.js       # Seller authentication tests
│   └── user.test.js         # User authentication tests
├── setup.js                 # Global test configuration
└── README.md               # This documentation
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests silently (minimal output)
npm run test:silent

# Run tests for CI/CD pipeline
npm run test:ci
```

### Route-Specific Tests

```bash
# Run all route tests
npm run test:routes

# Run specific route tests
npm run test:user
npm run test:product
npm run test:cart
npm run test:order
npm run test:address
npm run test:rating
npm run test:seller
npm run test:contact
npm run test:order-rating
```

## Test Coverage

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT token validation
- ✅ Protected route access
- ✅ Token refresh mechanisms
- ✅ Seller authentication
- ✅ Unauthorized access handling

### Product Management
- ✅ Product creation with file uploads
- ✅ Product listing with filters
- ✅ Product details retrieval
- ✅ Stock management
- ✅ Input validation
- ✅ Error handling

### Shopping Cart
- ✅ Cart item addition
- ✅ Cart item updates
- ✅ Cart item removal
- ✅ Cart retrieval
- ✅ Multiple item handling
- ✅ Quantity validation

### Order Processing
- ✅ Order creation (COD, Online, Guest)
- ✅ Order status updates
- ✅ Payment processing
- ✅ Stripe webhook handling
- ✅ Order retrieval (user/seller)
- ✅ Order deletion

### Address Management
- ✅ Address addition
- ✅ Address retrieval
- ✅ Input validation
- ✅ Authentication checks

### Rating System
- ✅ Product rating creation
- ✅ Rating updates and deletion
- ✅ Rating retrieval by product/user
- ✅ Order rating system
- ✅ Rating statistics
- ✅ Permission validation

### Contact & Communication
- ✅ Contact form submission
- ✅ Newsletter subscription
- ✅ Email validation
- ✅ Spam protection

## Test Features

### Security Testing
- **XSS Protection**: Tests for script injection attempts
- **SQL Injection**: Validation against malicious queries
- **Authentication Bypass**: Unauthorized access attempts
- **Input Validation**: Malformed data handling
- **Rate Limiting**: Excessive request protection

### Edge Cases
- **Malformed JSON**: Invalid request body handling
- **Missing Fields**: Required field validation
- **Invalid ObjectIds**: MongoDB ID validation
- **Concurrent Operations**: Race condition handling
- **Large Payloads**: Data size limit testing
- **Special Characters**: Unicode and symbol handling

### Error Scenarios
- **Database Errors**: Connection and query failures
- **External Service Failures**: Email, payment, file upload
- **Network Issues**: Timeout and connectivity problems
- **Resource Conflicts**: Duplicate entries and constraints
- **Server Errors**: Internal application failures

## Test Data Management

### Mock Data (`testData.js`)
- **Users**: Valid and invalid user profiles
- **Products**: Complete product information
- **Orders**: Various order states and types
- **Addresses**: Shipping and billing addresses
- **Ratings**: Product and order ratings
- **Tokens**: JWT and refresh tokens
- **Error Messages**: Standardized error responses

### Test Helpers (`testHelpers.js`)
- **Authentication**: Token generation and validation
- **Data Creation**: Automated test data setup
- **Response Validation**: Structure and content checks
- **Cleanup**: Test data removal
- **Mocking**: External service simulation
- **Utilities**: Common testing operations

## Configuration

### Jest Configuration
- **Environment**: Node.js test environment
- **Setup**: Automated test database setup
- **Coverage**: Comprehensive code coverage reporting
- **Timeout**: 30-second test timeout
- **Mocking**: External service mocks
- **Reporting**: HTML and LCOV coverage reports

### Environment Setup
- **In-Memory Database**: MongoDB Memory Server
- **Isolated Tests**: Independent test execution
- **Mock Services**: Stripe, Nodemailer, Cloudinary
- **Environment Variables**: Test-specific configuration

## Best Practices

### Test Organization
1. **Descriptive Names**: Clear test descriptions
2. **Logical Grouping**: Related tests in describe blocks
3. **Setup/Teardown**: Proper test isolation
4. **Mock Management**: Consistent mocking patterns
5. **Error Testing**: Comprehensive error scenarios

### Performance
1. **Parallel Execution**: Tests run concurrently
2. **Memory Management**: Efficient resource usage
3. **Fast Feedback**: Quick test execution
4. **Selective Running**: Target specific test suites

### Maintenance
1. **Regular Updates**: Keep tests current with code changes
2. **Coverage Monitoring**: Maintain high coverage levels
3. **Refactoring**: Improve test quality over time
4. **Documentation**: Keep this README updated

## Coverage Targets

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   ```bash
   # Ensure MongoDB Memory Server is properly installed
   npm install mongodb-memory-server --save-dev
   ```

2. **Test Timeouts**
   ```bash
   # Increase timeout in jest.config.js or individual tests
   jest.setTimeout(60000);
   ```

3. **Mock Issues**
   ```bash
   # Clear mocks between tests
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

4. **Port Conflicts**
   ```bash
   # Use different ports for test environment
   process.env.PORT = 0; // Random available port
   ```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file in debug mode
node --inspect-brk node_modules/.bin/jest tests/routes/user.test.js
```

## Contributing

When adding new routes or modifying existing ones:

1. **Update Tests**: Ensure corresponding tests are updated
2. **Add Coverage**: Test all new functionality
3. **Update Fixtures**: Add new mock data as needed
4. **Run Full Suite**: Verify all tests pass
5. **Check Coverage**: Maintain coverage targets

## Dependencies

### Testing Framework
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory database

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Babel**: JavaScript transpilation
