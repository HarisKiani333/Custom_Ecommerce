import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { handleError, handleSuccess, logError, retryRequest } from "../utils/errorHandler";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const currency = import.meta.env.VITE_CURRENCY;

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add loading state for initial user data fetching
  const [loadingUser, setLoadingUser] = useState(true);

  // Token refresh function
  const refreshToken = async () => {
    try {
      // Check if we have cookies before attempting refresh
      if (!document.cookie.includes('token=')) {
        console.log("No token found, skipping refresh");
        return false;
      }
      
      const { data } = await axios.post("/api/user/refresh");
      if (data.success) {
        console.log("Token refreshed successfully");
        return true;
      } else {
        console.log("Token refresh failed:", data.message);
        return false;
      }
    } catch (error) {
      logError(error, { context: 'token_refresh' });
      return false;
    }
  };

  // Setup axios interceptors for automatic token refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Don't retry refresh requests or logout requests to avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry && 
            !originalRequest.url?.includes('/refresh') && 
            !originalRequest.url?.includes('/logout')) {
          originalRequest._retry = true;
          
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            // Retry the original request
            return axios(originalRequest);
          } else {
            // Token refresh failed - clear user state and redirect to login
            setUser(null);
            setCartItems({});
            return Promise.reject(error);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  //fetch user auth status : user cart items and data
  // Enhanced fetchUserStatus with better error handling and retry logic
  const fetchUserStatus = async (retryCount = 0) => {
    if (retryCount >= 3) {
      console.log("Max retries reached for fetchUserStatus");
      setUser(null);
      setCartItems({});
      setLoadingUser(false);
      return false;
    }
    
    // Don't check user auth if already logged in as seller
    if (isSeller) {
      setUser(null);
      setCartItems({});
      setLoadingUser(false);
      return false;
    }
    
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        setLoadingUser(false);
        return true;
      } else {
        console.log("Auth check failed:", data.message);
        setUser(null);
        setCartItems({});
        setLoadingUser(false);
        return false;
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // Handle CORS/Network errors specifically
      if (error.code === 'ERR_NETWORK' || !error.response) {
        if (retryCount === 0) {
          handleError(error, { context: 'fetch_user_status', retryCount });
        }
        setUser(null);
        setCartItems({});
        setLoadingUser(false);
        return false;
      }
      
      // Handle different error scenarios
      if (status === 401) {
        // Try to refresh token before clearing user state
        console.log("Authentication expired, attempting token refresh:", message);
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry the original request after successful token refresh
          return fetchUserStatus(retryCount + 1);
        } else {
          // Token refresh failed - clear user state
          setUser(null);
          setCartItems({});
          setLoadingUser(false);
          return false;
        }
      } else if (status >= 500 && retryCount < 2) {
        // Server error - retry up to 2 times
        console.log(`Server error, retrying... (${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return fetchUserStatus(retryCount + 1);
      } else {
        logError(error, { context: 'fetch_user_status', status, message });
        setUser(null);
        setCartItems({});
        setLoadingUser(false);
        return false;
      }
    }
  };
  
  // Enhanced useEffect for initial authentication check
  useEffect(() => {
    const initializeAuth = async () => {
      // Always check authentication status on app load
      await fetchUserStatus();
      await fetchSeller();
      
      // Fetch products after auth check
      if (products.length === 0) {
        fetchProducts();
      }
    };
    
    initializeAuth();
  }, []); // Run only once on mount
  
  // Remove the duplicate useEffect that was causing issues
  // useEffect(() => {
  //   fetchProducts();
  //   fetchSeller();
  //   fetchUserStatus();
  // }, []);
  
  // Optimized periodic auth check
  useEffect(() => {
    if (!user) return;

    const authCheckInterval = setInterval(() => {
      fetchUserStatus();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(authCheckInterval);
  }, [user]);

  //seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      // Silently handle seller auth errors as they're expected for regular users
      setIsSeller(false);
      // Only log non-401 errors as 401 is expected for non-sellers
      if (error.response?.status !== 401) {
        logError(error, { context: 'fetch_seller' });
      }
    }
  };

  const addCartItem = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) cartData[itemId] += 1;
    else cartData[itemId] = 1;
    setCartItems(cartData);
    toast.success("Item Added in Cart!");
  };

  const updateCartItem = (itemId, qty) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = qty;
    setCartItems(cartData);
    toast.success("Cart Updated !");
  };

  const removeCartItem = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }
    toast("😭Item Removed From Cart!");
    setCartItems(cartData);
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        setProducts(data.products);
        console.log(data.products);
      } else {
        handleError(new Error('Failed to fetch products'), { context: 'fetch_products' });
      }
    } catch (error) {
      handleError(error, { context: 'fetch_products' });
    }
  };

  // Optimized cart update logic with debouncing
  useEffect(() => {
    if (!user || Object.keys(cartItems).length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (data.success) {
          console.log("Cart updated successfully");
        } else {
          logError(new Error(data.message), { context: 'update_cart' });
        }
      } catch (error) {
        logError(error, { context: 'update_cart' });
      }
    }, 500); // Debounce cart updates by 500ms

    return () => clearTimeout(timeoutId);
  }, [cartItems, user]);

  const getCartCount = () => {
    let totalCount = 0;
    for (let key in cartItems) {
      totalCount += cartItems[key];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (let key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (cartItems[key] > 0 && product) {
        totalAmount += product.offerPrice * cartItems[key];
      }
    }
    return totalAmount.toFixed(1);
  };

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    loadingUser, // Add loadingUser to context value
    navigate,
    currency,
    axios,
    addCartItem,
    updateCartItem,
    removeCartItem,
    getCartCount,
    getCartAmount,
    fetchUserStatus,
    fetchProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => useContext(AppContext);
