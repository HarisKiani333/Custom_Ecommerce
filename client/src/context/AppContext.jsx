import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assests";
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


  const fetchUserStatus = async ()=>{
    try {
      const {data} = await axios.get("/api/user/is-auth");
      if(data.success){
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
      else{
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.log(error);
    }

  }



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
        const {data} = await axios.get("/api/product/list");
       
       if(data.success){
        setProducts(data.products);
        console.log(data.products);
       }
       else
       {
        toast.error("Error fetching products");
       }

    } catch (error) {
      console.log(error);
      toast.error(error.message);

    } 

  };

  useEffect(() => {
    fetchProducts();
    fetchSeller();
    fetchUserStatus();
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
    axios,
    fetchProducts
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => useContext(AppContext);
