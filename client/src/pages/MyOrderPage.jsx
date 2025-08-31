import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import RatingModal from "../components/RatingModal";
import OrderRatingModal from "../components/OrderRatingModal";
import OrderRatingDisplay from "../components/OrderRatingDisplay";
import axios from "axios";



// Memoized Order Item Component to prevent unnecessary re-renders
const OrderItem = memo(({ 
  order, 
  currency, 
  userRatings, 
  orderRatings, 
  canRateProduct, 
  handleRateProduct, 
  handleOrderRateClick 
}) => {
  const [canRateOrderState, setCanRateOrderState] = useState(false);
  
  // Check if order can be rated (memoized)
  const checkCanRateOrder = useCallback(async () => {
    if ((order.status === "Delivered" || order.status === "Completed") && order.isPaid) {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/order-rating/can-rate/${order._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCanRateOrderState(data.success && data.canRate);
      } catch (error) {
        setCanRateOrderState(false);
      }
    }
  }, [order._id, order.status, order.isPaid]);
  
  useEffect(() => {
    checkCanRateOrder();
  }, [checkCanRateOrder]);
  
  return (
    <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <p className="text-sm text-gray-600">Order ID:</p>
          <p className="font-medium text-gray-800">{order._id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-sm font-medium text-green-600">{order.status}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <img
              className="w-16 h-16 object-cover rounded-md"
              src={item.product.image[0]}
              alt={item.product.name}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.product.name}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  {currency}{item.product.price} x {item.quantity}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  Size: {item.size}
                </p>
              </div>
            </div>
            
            {/* Product Rating Section */}
            <div className="flex flex-col items-end gap-2">
              {userRatings[item.product._id] ? (
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Your Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= userRatings[item.product._id].rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                canRateProduct(item.product._id) && 
                (order.status === "Delivered" || order.status === "Completed") && 
                order.isPaid && (
                  <button
                    type="button"
                    onClick={() => handleRateProduct(item.product, order._id)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Rate Product
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Delivery Address:</p>
            <p className="text-gray-800">
              {order.address.firstName} {order.address.lastName}<br />
              {order.address.street}, {order.address.city}<br />
              {order.address.state}, {order.address.zipcode}<br />
              {order.address.country}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">{currency}{order.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className={`font-medium ${
                order.isPaid ? "text-green-600" : "text-red-600"
              }`}>
                {order.paymentType} - {order.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-800">
                {new Date(order.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Order Rating Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Experience</h4>
          {orderRatings[order._id] ? (
            <OrderRatingDisplay rating={orderRatings[order._id]} />
          ) : (
            canRateOrderState && (
              <button
                type="button"
                onClick={() => handleOrderRateClick(order)}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Rate Order Experience
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
});

OrderItem.displayName = 'OrderItem';

const MyOrderPage = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, product: null, orderId: null });
  const [orderRatingModal, setOrderRatingModal] = useState({ isOpen: false, order: null });
  const [userRatings, setUserRatings] = useState({});
  const [orderRatings, setOrderRatings] = useState({});
  const { currency, axios: appAxios, user, loadingUser } = useAppContext();
  const pollingIntervalRef = useRef(null);
  const lastFetchTimeRef = useRef(0);

  const fetchMyOrders = useCallback(async (skipRatings = false) => {
    try {
      const now = Date.now();
      // Prevent rapid successive calls
      if (now - lastFetchTimeRef.current < 1000) return;
      lastFetchTimeRef.current = now;
      
      setLoading(true);
      const { data } = await appAxios.get("/api/order/user", {
        withCredentials: true,
      });

      if (data.success) {
        setMyOrders(prevOrders => {
          // Only update if orders actually changed
          const ordersChanged = JSON.stringify(prevOrders) !== JSON.stringify(data.orders);
          if (ordersChanged && !skipRatings) {
            // Fetch user ratings for all products in orders
            fetchUserRatings(data.orders);
          }
          return data.orders;
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view your orders");
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [appAxios]);

  const fetchUserRatings = useCallback(async (orders) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const productIds = new Set();
      orders.forEach(order => {
        order.items.forEach(item => {
          productIds.add(item.product._id);
        });
      });

      // Only fetch ratings for products we don't already have
      const newProductIds = Array.from(productIds).filter(id => !(id in userRatings));
      if (newProductIds.length === 0) return;

      const ratingsPromises = newProductIds.map(async (productId) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/rating/user/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { productId, rating: response.data.rating };
        } catch (error) {
          return { productId, rating: null };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const newRatingsMap = {};
      ratingsResults.forEach(({ productId, rating }) => {
        newRatingsMap[productId] = rating;
      });
      
      // Merge with existing ratings instead of replacing
      setUserRatings(prev => ({ ...prev, ...newRatingsMap }));
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  }, [userRatings]);

  const handleRateProduct = useCallback((product, orderId) => {
    setRatingModal({
      isOpen: true,
      product,
      orderId,
    });
  }, []);

  const handleRatingSubmitted = useCallback((newRating) => {
    // Update the userRatings state
    setUserRatings(prev => ({
      ...prev,
      [newRating.productId]: newRating
    }));
    toast.success("Thank you for your rating!");
  }, []);

  const handleOrderRateClick = useCallback((order) => {
    setOrderRatingModal({ isOpen: true, order });
  }, []);

  const handleOrderRatingSubmitted = useCallback((newOrderRating) => {
    // Update specific order rating instead of refetching all
    if (newOrderRating) {
      setOrderRatings(prev => ({
        ...prev,
        [newOrderRating.orderId]: newOrderRating
      }));
    }
    // Close the modal
    setOrderRatingModal({ isOpen: false, order: null });
    toast.success("Thank you for rating your order experience!");
  }, []);

  const fetchOrderRatings = useCallback(async () => {
    try {
      const { data } = await appAxios.get("/api/order-rating/user");
      if (data.success) {
        const ratingsMap = {};
        data.orderRatings.forEach(rating => {
          ratingsMap[rating.orderId] = rating;
        });
        setOrderRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching order ratings:", error);
    }
  }, [appAxios]);

  const canRateOrder = useCallback(async (orderId) => {
    try {
      const { data } = await appAxios.get(`/api/order-rating/can-rate/${orderId}`);
      return data.success && data.canRate;
    } catch (error) {
      return false;
    }
  }, [appAxios]);

  const canRateProduct = useCallback((productId) => {
    return !userRatings[productId];
  }, [userRatings]);

  // Memoize expensive computations
  const hasPendingPayments = useMemo(() => {
    return myOrders.some(order => 
      order.paymentType === "Online" && !order.isPaid
    );
  }, [myOrders]);

  // Optimized polling setup
  const setupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    if (hasPendingPayments && user) {
      pollingIntervalRef.current = setInterval(() => {
        fetchMyOrders(true); // Skip ratings refetch during polling
      }, 10000);
    }
  }, [hasPendingPayments, user, fetchMyOrders]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      if (user) {
        fetchMyOrders();
        fetchOrderRatings();
      } else {
        setLoading(false);
        toast.error("Please log in to view your orders");
      }
    }
  }, [user, loadingUser, fetchMyOrders, fetchOrderRatings]);

  // Setup optimized polling
  useEffect(() => {
    setupPolling();
  }, [setupPolling]);

  // Show loading while checking authentication
  if (loadingUser || loading) {
    return (
      <div className="mt-20 flex justify-center items-center min-h-[400px] animate-in fade-in-50 duration-500">
        <div className="text-center bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-20 animate-pulse"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">📦 Loading your orders...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="mt-20 flex justify-center items-center min-h-[400px] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <div className="text-center bg-gradient-to-br from-white to-gray-50 p-10 rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">You need to be logged in to view your orders and track your purchases.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3 rounded-full hover:from-green-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            🚀 Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-start w-max mb-8 ml-6">
        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">📦 My Orders List</p>
        <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full mt-2 animate-in slide-in-from-left duration-500 delay-300"></div>
      </div>

      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">📋 Orders List</h2>
        {myOrders.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto shadow-lg border border-gray-200">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">🛍️ No Orders Yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button 
                onClick={() => window.location.href = '/products'}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3 rounded-full hover:from-green-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                🛒 Start Shopping
              </button>
            </div>
          </div>
        ) : (
          myOrders.map((order, index) => (
            <OrderItem
              key={order._id || index}
              order={order}
              currency={currency}
              userRatings={userRatings}
              orderRatings={orderRatings}
              canRateProduct={canRateProduct}
              handleRateProduct={handleRateProduct}
              handleOrderRateClick={handleOrderRateClick}
            />
          ))
        )}
       </div>
       
       {/* Rating Modal */}
       <RatingModal
         isOpen={ratingModal.isOpen}
         onClose={() => setRatingModal({ isOpen: false, product: null, orderId: null })}
         productId={ratingModal.product?._id}
         orderId={ratingModal.orderId}
         productName={ratingModal.product?.name}
         productImage={ratingModal.product?.image?.[0]}
         onRatingSubmitted={handleRatingSubmitted}
       />
       
       {/* Order Rating Modal */}
       <OrderRatingModal
         isOpen={orderRatingModal.isOpen}
         onClose={() => setOrderRatingModal({ isOpen: false, order: null })}
         order={orderRatingModal.order}
         onRatingSubmitted={handleOrderRatingSubmitted}
       />
     </div>
   );
 };

export default MyOrderPage;
