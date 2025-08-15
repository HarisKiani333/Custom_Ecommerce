import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assests";
import { toast } from "react-hot-toast";
const currency = import.meta.env.VITE_CURRENCY;

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
    setProducts(dummyProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => useContext(AppContext);
