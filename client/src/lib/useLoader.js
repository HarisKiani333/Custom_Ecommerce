import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing loading states
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and controls
 */
export const useLoader = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState({
    type: 'navigation',
    message: '',
    delay: 1000,
    ...options
  });
  const navigate = useNavigate();

  const showLoader = useCallback((config = {}) => {
    setLoadingConfig(prev => ({ ...prev, ...config }));
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const navigateWithLoader = useCallback((path, config = {}) => {
    showLoader({ 
      type: 'navigation', 
      message: 'Loading page...', 
      ...config 
    });
    
    setTimeout(() => {
      navigate(path);
      hideLoader();
    }, config.delay || 800);
  }, [navigate, showLoader, hideLoader]);

  return {
    isLoading,
    loadingConfig,
    showLoader,
    hideLoader,
    navigateWithLoader
  };
};