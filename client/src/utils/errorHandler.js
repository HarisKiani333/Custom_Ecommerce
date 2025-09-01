import { toast } from 'react-hot-toast';

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  EMAIL_CONFIG: 'EMAIL_CONFIG_ERROR',
  PERMISSION: 'PERMISSION_ERROR'
};

// Centralized error logging
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...(error.response && {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    })
  };

  // Console logging for development
  if (import.meta.env.DEV) {
    console.error('🔴 Frontend Error:', errorInfo);
  }

  // Store in localStorage for debugging (keep last 50 errors)
  try {
    const existingErrors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    existingErrors.push(errorInfo);
    
    // Keep only last 50 errors
    if (existingErrors.length > 50) {
      existingErrors.splice(0, existingErrors.length - 50);
    }
    
    localStorage.setItem('errorLogs', JSON.stringify(existingErrors));
  } catch (e) {
    console.warn('Failed to store error log:', e);
  }
};

// Determine error type based on error object
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  const errorCode = error.response.data?.error;

  if (status === 401 || status === 403) {
    return ERROR_TYPES.AUTH;
  }

  if (status === 400 && error.response.data?.constraintViolation) {
    return ERROR_TYPES.VALIDATION;
  }

  if (errorCode && errorCode.includes('EMAIL_')) {
    return ERROR_TYPES.EMAIL_CONFIG;
  }

  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }

  return ERROR_TYPES.SERVER;
};

// Get user-friendly error message
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const backendMessage = error.response?.data?.message;
  const errorCode = error.response?.data?.error;

  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return 'Unable to connect to server. Please check your internet connection and try again.';
    
    case ERROR_TYPES.AUTH:
      return backendMessage || 'Authentication failed. Please log in again.';
    
    case ERROR_TYPES.VALIDATION:
      return backendMessage || 'Please check your input and try again.';
    
    case ERROR_TYPES.EMAIL_CONFIG:
      if (errorCode === 'EMAIL_CONFIG_MISSING') {
        return 'Email service is currently unavailable. Please try again later.';
      }
      if (errorCode === 'EMAIL_CONFIG_INCOMPLETE') {
        return 'Email service is currently being configured. Please try again later.';
      }
      if (errorCode === 'EMAIL_AUTH_FAILED') {
        return 'Email service authentication failed. Please try again later.';
      }
      if (errorCode === 'EMAIL_CONNECTION_FAILED') {
        return 'Unable to connect to email service. Please try again later.';
      }
      return backendMessage || 'Email service error. Please try again later.';
    
    case ERROR_TYPES.SERVER:
      return backendMessage || 'Server error occurred. Please try again later.';
    
    default:
      return backendMessage || 'An unexpected error occurred. Please try again.';
  }
};

// Get appropriate toast icon based on error type
export const getErrorIcon = (errorType) => {
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return '🌐';
    case ERROR_TYPES.AUTH:
      return '🔐';
    case ERROR_TYPES.VALIDATION:
      return '⚠️';
    case ERROR_TYPES.EMAIL_CONFIG:
      return '📧';
    case ERROR_TYPES.SERVER:
      return '🔧';
    default:
      return '❌';
  }
};

// Main error handler function
export const handleError = (error, context = {}, customMessage = null) => {
  logError(error, context);
  
  const errorType = getErrorType(error);
  const message = customMessage || getErrorMessage(error);
  const icon = getErrorIcon(errorType);
  
  toast.error(`${icon} ${message}`, {
    duration: 5000,
    position: 'top-right'
  });
  
  return {
    type: errorType,
    message,
    originalError: error
  };
};

// Success handler
export const handleSuccess = (message, icon = '✅') => {
  toast.success(`${icon} ${message}`, {
    duration: 4000,
    position: 'top-right'
  });
};

// Warning handler
export const handleWarning = (message, icon = '⚠️') => {
  toast(`${icon} ${message}`, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: 'white'
    }
  });
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const errorType = getErrorType(error);
      
      // Don't retry auth errors or validation errors
      if (errorType === ERROR_TYPES.AUTH || errorType === ERROR_TYPES.VALIDATION) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      
      logError(new Error(`Request failed, retrying... (${attempt}/${maxRetries})`), {
        originalError: error.message,
        attempt
      });
    }
  }
};

// Clear error logs (for debugging)
export const clearErrorLogs = () => {
  localStorage.removeItem('errorLogs');
  console.log('Error logs cleared');
};

// Get error logs (for debugging)
export const getErrorLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('errorLogs') || '[]');
  } catch (e) {
    console.warn('Failed to retrieve error logs:', e);
    return [];
  }
};

// Export error logs as downloadable file (for debugging)
export const exportErrorLogs = () => {
  const logs = getErrorLogs();
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};