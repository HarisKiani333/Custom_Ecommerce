import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      const price = item.product.offerPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Helper function to get customer info from order
  const getCustomerInfo = (order) => {
    if (order.address) {
      // Logged-in user order
      return {
        name: `${order.address.firstName} ${order.address.lastName}`,
        location: `${order.address.city}, ${order.address.country}`,
      };
    } else if (order.guestInfo && order.guestAddress) {
      // Guest order
      return {
        name: order.guestInfo.name,
        location: `${order.guestAddress.city}, ${order.guestAddress.country}`,
      };
    }
    // Fallback for incomplete data
    return {
      name: "Unknown Customer",
      location: "Unknown Location",
    };
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
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        {/* Header with refresh + filter */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Customer Orders</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshOrders}
              disabled={isRefreshing}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <span>Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
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

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Products</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const customerInfo = getCustomerInfo(order);
                return (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">#{order._id}</td>

                    <td className="p-3">
                      <div>
                        <p className="font-medium">{customerInfo.name}</p>
                        <p className="text-xs text-gray-500">
                          {customerInfo.location}
                        </p>
                        {!order.userId && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Guest
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={item.product.image[0]}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 font-medium">
                      {currency} {calculateOrderTotal(order.items).toFixed(2)}
                    </td>

                    <td className="p-3 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Payment status toggle */}
                    <td className="p-3">
                      <button
                        onClick={() =>
                          updatePaymentStatus(order._id, !order.isPaid)
                        }
                        className={`px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                          order.isPaid
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </button>
                    </td>

                    {/* Order status */}
                    <td className="p-3">
                      <select
                        defaultValue={order.status || "New"}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          👁
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-800">
                          📄
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-6 text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
