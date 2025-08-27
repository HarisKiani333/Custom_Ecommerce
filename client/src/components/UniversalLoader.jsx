import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

/**
 * Universal Loader Component
 * 
 * Displays a full-screen loading overlay during:
 * - Initial user state fetch (loadingUser from AppContext)
 * - Route changes (location changes)
 * - Maintains visibility until operations complete
 * - Prevents UI jitter with full viewport coverage
 */
const UniversalLoader = ({ children }) => {
  const location = useLocation();
  const { loadingUser } = useAppContext();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Track location changes for navigation loading
  useEffect(() => {
    setIsNavigating(true);
    
    // Short delay to show loading state during route transitions
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300); // Adjust delay as needed
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Show loader during navigation or initial user loading
  const isLoading = isNavigating || loadingUser;
  
  // Get loading message based on current state
  const getLoadingMessage = () => {
    if (loadingUser) {
      return 'Initializing application...';
    }
    
    if (isNavigating) {
      return 'Loading page...';
    }
    
    return 'Loading...';
  };
  
  // Render spinner component
  const renderSpinner = () => {
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
    );
  };
  
  return (
    <>
      {/* Full-screen loader overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            {/* Main Spinner */}
            <div className="mb-6">
              {renderSpinner()}
            </div>
            
            {/* Loading Message */}
            <p className="text-gray-600 text-base font-medium">
              {getLoadingMessage()}
            </p>
          </div>
        </div>
      )}
      
      {/* App content - always rendered but covered by loader when needed */}
      {children}
    </>
  );
};

export default UniversalLoader;