import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

export const calculateOrderAmount = (items) => {
  return items.reduce((total, item) => {
    const price = item.product.offerPrice || item.product.price || 0;
    return total + price * item.quantity;
  }, 0);
};

const MyOrderPage = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, axios, user, loadingUser } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user", {
        withCredentials: true,
      });

      if (data.success) {
        setMyOrders(data.orders);
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
  };

  useEffect(() => {
    if (!loadingUser) {
      if (user) {
        fetchMyOrders();
      } else {
        setLoading(false);
        toast.error("Please log in to view your orders");
      }
    }
  }, [user, loadingUser]);

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
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-6 max-w-4xl rounded-xl border border-gray-200 text-gray-700 bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-4"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <div className="flex gap-5">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={item.product.image[0]}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover transition-transform duration-300 group-hover:scale-110 shadow-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                      {item.product.name}
                    </p>
                    <span
                      className={`text-emerald-600 font-medium text-sm ${
                        item.quantity < 2 ? "hidden" : ""
                      }`}
                    >
                      ✕ {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold mb-2 text-gray-800 flex items-center">
                📍 {order.address.firstName} {order.address.lastName}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {order.address.street}, {order.address.city},{" "}
                {order.address.state}, {order.address.zipcode},{" "}
                {order.address.country}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">💰 Total Amount</p>
              <p className="font-bold text-lg text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                {currency}
                {calculateOrderAmount(order.items).toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">💳</span>
                <span className="font-medium">{order.paymentType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <span className="font-medium">{order.orderDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.isPaid 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.isPaid ? "✅ Paid" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrderPage;
