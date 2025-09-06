# Husk Store - Custom E-commerce Platform

A full-stack e-commerce application built with React.js frontend and Node.js/Express backend, featuring user authentication, product management, shopping cart, order processing, and payment integration.

## 🚀 Project Overview

Husk Store is a modern e-commerce platform that provides:
- User registration and authentication
- Product browsing and search functionality
- Shopping cart management
- Address management for delivery
- Order processing with payment integration (Stripe)
- Seller dashboard for product management
- Rating and review system
- Email notifications
- Responsive design for mobile and desktop

## 📁 Project Structure

```
Custom_Ecommerce/
├── client/                     # React.js Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── seller/         # Seller-specific components
│   │   │   └── *.jsx           # Various components
│   │   ├── pages/              # Page components
│   │   │   ├── seller/         # Seller dashboard pages
│   │   │   └── *.jsx           # Various pages
│   │   ├── context/            # React Context for state management
│   │   ├── assets/             # Images and static files
│   │   ├── lib/                # Utility libraries
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Node.js/Express Backend
│   ├── configs/                # Configuration files
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary setup
│   │   └── multer.js           # File upload configuration
│   ├── controllers/            # Route controllers
│   │   ├── userController.js   # User authentication
│   │   ├── productController.js # Product management
│   │   ├── orderController.js  # Order processing
│   │   ├── cartController.js   # Shopping cart
│   │   ├── addressController.js # Address management
│   │   ├── ratingController.js # Product ratings
│   │   ├── sellerController.js # Seller operations
│   │   └── contactController.js # Contact form
│   ├── middleware/             # Custom middleware
│   │   ├── authUser.js         # User authentication
│   │   └── authSeller.js       # Seller authentication
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js             # User model
│   │   ├── Product.js          # Product model
│   │   ├── Order.js            # Order model
│   │   ├── Address.js          # Address model
│   │   ├── Rating.js           # Rating model
│   │   └── OrderRating.js      # Order rating model
│   ├── routes/                 # API routes
│   │   ├── userRoute.js        # User routes
│   │   ├── productRoute.js     # Product routes
│   │   ├── orderRoute.js       # Order routes
│   │   ├── cartRoute.js        # Cart routes
│   │   ├── addressRoute.js     # Address routes
│   │   ├── ratingRoute.js      # Rating routes
│   │   ├── sellerRoute.js      # Seller routes
│   │   └── contactRoute.js     # Contact routes
│   ├── services/               # Business logic services
│   │   └── notificationService.js # Email notifications
│   ├── utils/                  # Utility functions
│   │   └── errorLogger.js      # Error logging
│   ├── server.js               # Express server entry point
│   └── package.json            # Backend dependencies
│
├── .gitignore                  # Git ignore rules
├── LICENSE                     # Project license
└── README.md                   # Project documentation
```

## 🛠️ Technology Stack

### Frontend
- **React.js 19.1.0** - UI library
- **Vite 7.1.2** - Build tool and dev server
- **React Router DOM 7.7.0** - Client-side routing
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Axios 1.11.0** - HTTP client
- **React Hot Toast 2.5.2** - Toast notifications
- **Lucide React 0.525.0** - Icon library
- **HeroUI React 2.8.1** - UI components
- **Mantine Hooks 8.1.3** - React hooks library

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.17.1** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **bcryptjs 3.0.2** - Password hashing
- **Stripe 18.4.0** - Payment processing
- **Cloudinary 2.7.0** - Image storage and management
- **Multer 2.0.2** - File upload handling
- **Nodemailer 7.0.6** - Email service
- **CORS 2.8.5** - Cross-origin resource sharing
- **Cookie Parser 1.4.7** - Cookie handling
- **dotenv 17.2.1** - Environment variables

## 📋 Prerequisites

Before running this project, make sure you have:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Cloudinary account** (for image storage)
- **Stripe account** (for payment processing)
- **Gmail account** (for email notifications)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Custom_Ecommerce
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `server` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/husk-store
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/husk-store

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5174
FRONTEND_URL=http://localhost:5174

# Admin Credentials
ADMIN_EMAIL=admin@huskstore.com
ADMIN_PASSWORD=your_admin_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### Frontend Environment Variables
Create a `.env` file in the `client` directory:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:4000

# Currency Symbol
VITE_CURRENCY=$
```

### 5. Database Setup
- Install and start MongoDB locally, or set up MongoDB Atlas
- The application will automatically create the necessary collections

### 6. Cloudinary Setup
1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add these credentials to your backend `.env` file

### 7. Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the dashboard
3. Add the secret key to your backend `.env` file
4. Set up webhooks for order processing

### 8. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for the application
3. Add your Gmail address and app password to the backend `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd server
npm run server
```
The backend will run on `http://localhost:4000`

#### Start Frontend Development Server
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
cd client
npm run build
```

#### Start Backend in Production
```bash
cd server
npm start
```

## 🧪 Testing & Code Quality

### Available Scripts

#### Frontend Scripts
```bash
cd client

# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier

# Testing
npm test             # Run Jest tests
```

#### Backend Scripts
```bash
cd server

# Development
npm run server       # Start development server with nodemon
npm start           # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier

# Testing
npm test             # Run Jest tests

# Utilities
npm run setup-email  # Setup email configuration
npm run test-email   # Test email functionality
```

### Testing Setup

#### Backend Testing
- **Framework**: Jest with Supertest
- **Location**: `server/tests/`
- **Configuration**: `server/package.json` (Jest section)
- **Sample Tests**: API endpoint testing for products

#### Frontend Testing
- **Framework**: Jest with React Testing Library
- **Location**: `client/tests/`
- **Configuration**: `client/package.json` (Jest section)
- **Setup**: `client/tests/setupTests.js`
- **Sample Tests**: Component utility functions

#### Running Tests
```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

### Code Quality Tools

#### ESLint Configuration
- **Backend**: `.eslintrc.json` with Node.js rules
- **Frontend**: `eslint.config.js` with React rules
- **Rules**: Enforces consistent code style, catches common errors

#### Prettier Configuration
- **Config Files**: `.prettierrc` in both client and server
- **Settings**: 
  - Semicolons: true
  - Single quotes: true
  - Trailing commas: es5
  - Tab width: 2 spaces
  - Print width: 80 characters

#### Pre-commit Workflow
```bash
# Recommended workflow before committing
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm test             # Run tests
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `GET /api/user/is-auth` - Check authentication status
- `POST /api/user/refresh` - Refresh JWT token

### Product Endpoints
- `GET /api/product/list` - Get all products
- `GET /api/product/:id` - Get single product
- `POST /api/product/add` - Add new product (seller only)
- `PUT /api/product/:id` - Update product (seller only)
- `DELETE /api/product/:id` - Delete product (seller only)

### Cart Endpoints
- `GET /api/cart/get` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/update` - Update cart item quantity
- `POST /api/cart/remove` - Remove item from cart

### Order Endpoints
- `POST /api/order/cod` - Place cash on delivery order
- `POST /api/order/online` - Create online payment order
- `POST /api/order/guest` - Place guest order
- `GET /api/order/user` - Get user orders
- `POST /api/order/stripe-webhook` - Stripe webhook handler

### Address Endpoints
- `GET /api/address/get` - Get user addresses
- `POST /api/address/add` - Add new address
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address

### Rating Endpoints
- `GET /api/rating/product/:id` - Get product ratings
- `POST /api/rating/add` - Add product rating
- `GET /api/order-rating/user` - Get user order ratings
- `POST /api/order-rating/add` - Add order rating

### Seller Endpoints
- `POST /api/seller/login` - Seller login
- `GET /api/seller/orders` - Get seller orders
- `POST /api/seller/update-status` - Update order status

### Contact Endpoint
- `POST /api/contact/send` - Send contact form message

## 🚀 Deployment

### Backend Deployment (Node.js)
1. Choose a hosting platform (Heroku, Railway, DigitalOcean, etc.)
2. Set up environment variables on the platform
3. Deploy the `server` directory
4. Ensure MongoDB connection is configured for production
5. Set up Stripe webhooks with your production URL

### Frontend Deployment (Static Site)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update the `VITE_BACKEND_URL` to point to your production backend

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production database URLs
- Use production Stripe keys
- Configure CORS for your production domains
- Set secure cookie options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Code Style Guidelines
- Use ESLint configuration provided
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure responsive design for all UI components

### Testing
- Write unit tests for new features using Jest
- Backend: Use Jest + Supertest for API endpoint testing
- Frontend: Use Jest + React Testing Library for component testing
- Run `npm test` in respective directories to execute tests
- Ensure cross-browser compatibility
- Test responsive design on different devices

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🐛 Known Issues

- Email notifications require Gmail app passwords
- Stripe webhooks need to be configured for production
- Image uploads are limited by Cloudinary quotas

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce functionality
- Features: User auth, product management, cart, orders, payments, ratings
