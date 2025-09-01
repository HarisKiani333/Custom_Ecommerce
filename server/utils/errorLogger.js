import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Error logging utility
export const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    context,
    ...(error.response && {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    })
  };

  // Console logging for development
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 Error:', {
      message: error.message,
      context,
      stack: error.stack
    });
  }

  // File logging for production
  const logEntry = `${timestamp} - ${JSON.stringify(errorInfo)}\n`;
  const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, logEntry);
};

// Success logging utility
export const logSuccess = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  const logInfo = {
    timestamp,
    message,
    context,
    type: 'SUCCESS'
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Success:', { message, context });
  }

  const logEntry = `${timestamp} - ${JSON.stringify(logInfo)}\n`;
  const logFile = path.join(logsDir, `success-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, logEntry);
};

// Warning logging utility
export const logWarning = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  const logInfo = {
    timestamp,
    message,
    context,
    type: 'WARNING'
  };

  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Warning:', { message, context });
  }

  const logEntry = `${timestamp} - ${JSON.stringify(logInfo)}\n`;
  const logFile = path.join(logsDir, `warning-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, logEntry);
};

// API request logging utility
export const logApiRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestInfo = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('📝 API Request:', requestInfo);
  }

  const logEntry = `${timestamp} - ${JSON.stringify(requestInfo)}\n`;
  const logFile = path.join(logsDir, `api-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, logEntry);
  next();
};

// Standardized error response utility
export const sendErrorResponse = (res, error, statusCode = 500, context = {}) => {
  logError(error, context);
  
  const errorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  };

  res.status(statusCode).json(errorResponse);
};

// Standardized success response utility
export const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  logSuccess(message, { data: typeof data === 'object' ? Object.keys(data) : data });
  
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};