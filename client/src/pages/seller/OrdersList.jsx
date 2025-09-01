import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { currency, axios } = useAppContext();

  const orderStatuses = [
    "New",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Completed",
  ];

  // Calculate total amount for an order
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      if (!item.product) return total;
      const price = item.product.offerPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Helper function to get customer info from order
  const getCustomerInfo = (order) => {
    if (order?.address) {
      // Logged-in user order
      const firstName = order.address.firstName || '';
      const lastName = order.address.lastName || '';
      const city = order.address.city || 'Unknown City';
      const country = order.address.country || 'Unknown Country';
      
      return {
        name: `${firstName} ${lastName}`.trim() || "Unknown Customer",
        location: `${city}, ${country}`,
      };
    } else if (order?.guestInfo && order?.guestAddress) {
      // Guest order
      const guestName = order.guestInfo.name || 'Unknown Guest';
      const city = order.guestAddress.city || 'Unknown City';
      const country = order.guestAddress.country || 'Unknown Country';
      
      return {
        name: guestName,
        location: `${city}, ${country}`,
      };
    }
    // Fallback for incomplete data
    return {
      name: "Unknown Customer",
      location: "Unknown Location",
    };
  };

  // Delete order function
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    );
    
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      const { data } = await axios.delete(`/api/order/delete/${orderId}`);

      if (data.success) {
        toast.success("Order deleted successfully!");
        // Remove the deleted order from the state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refreshOrders = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put("/api/order/update-status", {
        orderId,
        status: newStatus,
      });

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated successfully");
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const updatePaymentStatus = async (orderId, isPaid) => {
    try {
      const { data } = await axios.put("/api/order/update-payment", {
        orderId,
        isPaid,
      });

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, isPaid } : order
          )
        );
        toast.success("Payment status updated successfully");
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update payment status");
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 animate-in fade-in-50 duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
            📦 Order Management
          </h1>
          <p className="text-gray-600">Track and manage customer orders efficiently</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-gray-600">Total Orders: </span>
              <span className="font-bold text-blue-600">{orders.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-gray-600">Filtered: </span>
              <span className="font-bold text-blue-600">{filteredOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-in slide-in-from-top-4 duration-500 delay-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🛒</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>
                <p className="text-gray-600 text-sm">Manage order status and payments</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={refreshOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-lg">{isRefreshing ? '🔄' : '🔄'}</span>
                {isRefreshing ? "Refreshing..." : "Refresh Orders"}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium flex items-center gap-1">
                  <span className="text-lg">🔍</span>
                  Filter:
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="all">All Orders</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-200">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Orders Overview
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">🆔</span>
                      Order ID
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">👤</span>
                      Customer
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">🛍️</span>
                      Products
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">💰</span>
                      Amount
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">📅</span>
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">💳</span>
                      Payment
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">📊</span>
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">⚡</span>
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center animate-in fade-in-50 duration-500">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Found</h3>
                        <p className="text-gray-500">
                          {filterStatus === 'all' ? 'No orders have been placed yet' : `No orders with status "${filterStatus}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const customerInfo = getCustomerInfo(order);
                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-blue-50 transition-all duration-300 animate-in slide-in-from-left-4 duration-500"
                        style={{ animationDelay: `${100 + index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-mono text-sm font-medium text-gray-800">
                              #{order._id.slice(-8)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {customerInfo.name ? customerInfo.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{customerInfo.name || 'Unknown Customer'}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span>📍</span>
                                {customerInfo.location || 'Unknown Location'}
                              </p>
                              {!order.userId && (
                                <span className="inline-flex items-center mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                                  <span className="mr-1">👤</span>
                                  Guest
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {order.items.slice(0, 3).map((item, idx) => {
                              if (!item.product) {
                                return (
                                  <div key={idx} className="relative group">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-red-200 bg-red-50 flex items-center justify-center">
                                      <span className="text-red-500 text-xs">❌</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} className="relative group">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                                    <img
                                      src={item.product.image?.[0] || '/placeholder-image.jpg'}
                                      alt={item.product.name || 'Product'}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  {item.quantity > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                                      {item.quantity}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {order.items.length > 3 && (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">
                              {currency} {calculateOrderTotal(order.items).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : "N/A"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ""}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              updatePaymentStatus(order._id, !order.isPaid)
                            }
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 ${
                              order.isPaid
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            }`}
                          >
                            <span className="text-sm">
                              {order.isPaid ? '✅' : '⏳'}
                            </span>
                            {order.isPaid ? "Paid" : "Pending"}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <select
                            defaultValue={order.status || "New"}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-300 transform hover:scale-110">
                              <span className="text-lg">👁️</span>
                            </button>
                            <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-300 transform hover:scale-110">
                              <span className="text-lg">📄</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={deleteLoading}
                              className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                                deleteLoading 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                              }`}
                              title={deleteLoading ? "Deleting..." : "Delete Order"}
                            >
                              <span className="text-lg">{deleteLoading ? '⏳' : '🗑️'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
