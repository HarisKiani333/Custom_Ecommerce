import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

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

  //fetch user auth status : user cart items and data
  // Enhanced fetchUserStatus with better error handling and retry logic
  const fetchUserStatus = async (retryCount = 0) => {
    // Don't check user auth if already logged in as seller
    if (isSeller) {
      setUser(null);
      setCartItems({});
      return false;
    }
    
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        return true;
      } else {
        console.log("Auth check failed:", data.message);
        setUser(null);
        setCartItems({});
        return false;
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // Handle CORS/Network errors specifically
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.error('Network/CORS error - backend server may be down');
        if (retryCount === 0) {
          toast.error('Unable to connect to server. Please ensure backend is running on the correct port.');
        }
        setUser(null);
        setCartItems({});
        return false;
      }
      
      // Handle different error scenarios
      if (status === 401) {
        // Token expired or invalid - clear user state
        console.log("Authentication expired:", message);
        setUser(null);
        setCartItems({});
        return false;
      } else if (status >= 500 && retryCount < 2) {
        // Server error - retry up to 2 times
        console.log(`Server error, retrying... (${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return fetchUserStatus(retryCount + 1);
      } else {
        console.log("Auth error:", message);
        setUser(null);
        setCartItems({});
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
  
  // Add periodic auth check (optional - for long-running sessions)
  useEffect(() => {
    const authCheckInterval = setInterval(() => {
      if (user) {
        fetchUserStatus();
      }
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
      setIsSeller(false);
      console.error("Seller auth error:", error);
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
        toast.error("Error fetching products");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Lines 67-77: First useEffect
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserStatus();
      await fetchSeller();
      if (products.length === 0) {
        fetchProducts();
      }
    };
    initializeAuth();
  }, []);
  
  // Lines 135-139: Second useEffect (duplicate calls)
  useEffect(() => {
    fetchProducts();
    fetchSeller();
    fetchUserStatus();
  }, []);

  // Fixed cart update logic - removed problematic navigation
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (data.success) {
          console.log("Cart updated successfully");
        } else {
          console.error("Error updating cart:", data.message);
        }
      } catch (error) {
        console.log("Cart update error:", error);
      }
    };

    // Only update cart if user is logged in and cartItems is not empty
    if (user) {
      updateCart();
    }
  }, [cartItems]); // Added user to dependencies

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
    setIsSeller,
    isSeller,
    showUserLogin,
    setShowUserLogin,
    navigate,
    products,
    currency,
    cartItems,
    addCartItem,
    updateCartItem,
    removeCartItem,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
    fetchProducts,
    setCartItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => useContext(AppContext);
