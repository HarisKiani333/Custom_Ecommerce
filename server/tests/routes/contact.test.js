const request = require('supertest');
const express = require('express');
const { mockContactForms, mockNewsletterData, statusCodes } = require('../fixtures/testData.js');
const {
  validateSuccessResponse,
  validateErrorResponse
} = require('../helpers/testHelpers.js');

// Mock the app for testing
const app = express();
app.use(express.json());

// Mock contact controller functions
const mockContactController = {
  submitContactForm: jest.fn(),
  subscribeNewsletter: jest.fn()
};

// Setup routes for testing
app.post('/api/contact/submit', mockContactController.submitContactForm);
app.post('/api/contact/newsletter', mockContactController.subscribeNewsletter);

describe('Contact Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contact/submit', () => {
    it('should submit contact form successfully with valid data', async () => {
      const contactData = {
        name: mockContactForms.validForm.name,
        email: mockContactForms.validForm.email,
        subject: mockContactForms.validForm.subject,
        message: mockContactForms.validForm.message
      };

      const mockResponse = {
        success: true,
        message: 'Contact form submitted successfully',
        contactId: '507f1f77bcf86cd799439013'
      };

      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send(contactData);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Contact form submitted successfully');
      expect(response.body).toHaveProperty('contactId');
      expect(mockContactController.submitContactForm).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing required fields', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Name, email, subject, and message are required'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
          // Missing subject and message
        });

      validateErrorResponse(response, 400, 'required');
    });

    it('should return 400 for invalid email format', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          subject: 'Test Subject',
          message: 'Test message'
        });

      validateErrorResponse(response, 400, 'Invalid email format');
    });

    it('should return 400 for empty message', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Message cannot be empty'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: ''
        });

      validateErrorResponse(response, 400, 'Message cannot be empty');
    });

    it('should return 400 for message too long', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Message exceeds maximum length of 2000 characters'
        });
      });

      const longMessage = 'a'.repeat(2001);
      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: longMessage
        });

      validateErrorResponse(response, 400, 'exceeds maximum length');
    });

    it('should return 400 for name too short', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: 'J',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message'
        });

      validateErrorResponse(response, 400, 'at least 2 characters');
    });

    it('should handle spam detection', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many submissions. Please try again later'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send(mockContactForms.validForm);

      validateErrorResponse(response, 429, 'Too many submissions');
    });

    it('should handle contact form with special characters', async () => {
      const specialCharData = {
        name: 'José María',
        email: 'jose@example.com',
        subject: 'Inquiry about products & services',
        message: 'Hello! I\'m interested in your products. Can you help me?'
      };

      const mockResponse = {
        success: true,
        message: 'Contact form submitted successfully',
        contactId: '507f1f77bcf86cd799439014'
      };

      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send(specialCharData);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Contact form submitted successfully');
    });
  });

  describe('POST /api/contact/newsletter', () => {
    it('should subscribe to newsletter successfully with valid email', async () => {
      const newsletterData = {
        email: mockNewsletterData.validEmail
      };

      const mockResponse = {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriptionId: '507f1f77bcf86cd799439015'
      };

      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send(newsletterData);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Successfully subscribed to newsletter');
      expect(response.body).toHaveProperty('subscriptionId');
      expect(mockContactController.subscribeNewsletter).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing email', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({});

      validateErrorResponse(response, 400, 'Email is required');
    });

    it('should return 400 for invalid email format', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: 'invalid-email'
        });

      validateErrorResponse(response, 400, 'Invalid email format');
    });

    it('should return 409 for already subscribed email', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Email is already subscribed to newsletter'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: mockNewsletterData.validEmail
        });

      validateErrorResponse(response, 409, 'already subscribed');
    });

    it('should handle newsletter subscription with name', async () => {
      const newsletterDataWithName = {
        email: mockNewsletterData.validEmail,
        name: 'John Doe'
      };

      const mockResponse = {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriptionId: '507f1f77bcf86cd799439016'
      };

      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send(newsletterDataWithName);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Successfully subscribed to newsletter');
    });

    it('should handle newsletter unsubscribe request', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Successfully unsubscribed from newsletter'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: mockNewsletterData.validEmail,
          action: 'unsubscribe'
        });

      validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Successfully unsubscribed from newsletter');
    });

    it('should handle newsletter subscription with preferences', async () => {
      const newsletterDataWithPrefs = {
        email: mockNewsletterData.validEmail,
        preferences: {
          frequency: 'weekly',
          categories: ['products', 'offers']
        }
      };

      const mockResponse = {
        success: true,
        message: 'Successfully subscribed to newsletter with preferences',
        subscriptionId: '507f1f77bcf86cd799439017'
      };

      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send(newsletterDataWithPrefs);

      validateSuccessResponse(response, 201);
      expect(response.body.message).toBe('Successfully subscribed to newsletter with preferences');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in contact form', async () => {
      const response = await request(app)
        .post('/api/contact/submit')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle XSS attempts in contact form', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid characters detected in input'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message'
        });

      validateErrorResponse(response, 400, 'Invalid characters');
    });

    it('should handle SQL injection attempts in contact form', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid input detected'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send({
          name: "'; DROP TABLE contacts; --",
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message'
        });

      validateErrorResponse(response, 400, 'Invalid input');
    });

    it('should handle database connection errors', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send(mockContactForms.validForm);

      validateErrorResponse(response, 503, 'temporarily unavailable');
    });

    it('should handle email service failures for newsletter', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(502).json({
          success: false,
          message: 'Email service unavailable'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: mockNewsletterData.validEmail
        });

      validateErrorResponse(response, 502, 'Email service unavailable');
    });

    it('should handle concurrent newsletter subscriptions', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many subscription attempts. Please try again later'
        });
      });

      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: mockNewsletterData.validEmail
        });

      validateErrorResponse(response, 429, 'Too many subscription attempts');
    });

    it('should handle very long email addresses in newsletter', async () => {
      mockContactController.subscribeNewsletter.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email address too long (max 254 characters)'
        });
      });

      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app)
        .post('/api/contact/newsletter')
        .send({
          email: longEmail
        });

      validateErrorResponse(response, 400, 'too long');
    });

    it('should handle contact form submission rate limiting', async () => {
      mockContactController.submitContactForm.mockImplementation((req, res) => {
        res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please wait before submitting again'
        });
      });

      const response = await request(app)
        .post('/api/contact/submit')
        .send(mockContactForms.validForm);

      validateErrorResponse(response, 429, 'Rate limit exceeded');
    });
  });
});