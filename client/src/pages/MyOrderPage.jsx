import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import RatingModal from "../components/RatingModal";
import OrderRatingModal from "../components/OrderRatingModal";
import OrderRatingDisplay from "../components/OrderRatingDisplay";
import axios from "axios";

const OrderItem = memo(
  ({
    order,
    currency,
    userRatings,
    orderRatings,
    canRateProduct,
    handleRateProduct,
    handleOrderRateClick,
  }) => {
    const getStatusColor = (status) => {
      const statusColors = {
        "Order Placed": "text-blue-700 bg-blue-100",
        Processing: "text-yellow-700 bg-yellow-100",
        Shipped: "text-purple-700 bg-purple-100",
        Delivered: "text-green-700 bg-green-100",
        Cancelled: "text-red-700 bg-red-100",
        Completed: "text-green-700 bg-green-100",
      };
      return statusColors[status] || "text-gray-700 bg-gray-100";
    };

    const getPaymentStatusColor = (isPaid) => {
      return isPaid
        ? "text-green-700 bg-green-100"
        : "text-orange-700 bg-orange-100";
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              Order #{order._id.slice(-8).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right space-y-3">
            <p className="text-2xl font-bold text-gray-900">
              {currency}
              {order.amount}
            </p>
            <div className="flex flex-col gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                  order.isPaid
                )}`}
              >
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-6">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100"
            >
              {item.product ? (
                <>
                  <div className="flex-shrink-0">
                    <img
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      src={item.product.image?.[0] || "/placeholder-image.jpg"}
                      alt={item.product.name || "Product"}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                      {item.product.name || "Product Name Unavailable"}
                    </h4>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="font-medium text-gray-900">
                        {currency}
                        {item.product.offerPrice || 0}
                      </span>
                      <span className="text-gray-600">
                        Qty:{" "}
                        <span className="font-medium">{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        Total: {currency}
                        {(item.product.offerPrice || 0) * item.quantity}
                      </span>
                    </div>

                    {/* Product Rating */}
                    <div className="pt-2">
                      {item.product && userRatings[item.product._id] ? (
                        <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                          ★ Rated: {userRatings[item.product._id].rating}/5
                        </div>
                      ) : (
                        item.product &&
                        canRateProduct(item.product._id, order) && (
                          <button
                            onClick={() =>
                              handleRateProduct(item.product, order._id)
                            }
                            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            Rate Product
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full py-8 text-gray-500">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-gray-400 text-xl">?</span>
                    </div>
                    <p className="font-medium">
                      Product information unavailable
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Rating */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          {orderRatings[order._id] ? (
            <div className="bg-blue-50 rounded-lg p-4">
              <OrderRatingDisplay
                orderId={order._id}
                rating={orderRatings[order._id]}
                compact={true}
              />
            </div>
          ) : (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 font-medium">
                Rate your order experience
              </span>
              <button
                onClick={() => handleOrderRateClick(order)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Rate Order
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

OrderItem.displayName = "OrderItem";

const MyOrderPage = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    product: null,
    orderId: null,
  });
  const [orderRatingModal, setOrderRatingModal] = useState({
    isOpen: false,
    order: null,
  });
  const [userRatings, setUserRatings] = useState({});
  const [orderRatings, setOrderRatings] = useState({});
  const { currency, axios: appAxios, user, loadingUser } = useAppContext();
  const pollingIntervalRef = useRef(null);
  const lastFetchTimeRef = useRef(0);

  const fetchMyOrders = useCallback(
    async (skipRatings = false, showLoading = true) => {
      try {
        const now = Date.now();
        if (now - lastFetchTimeRef.current < 2000) return;
        lastFetchTimeRef.current = now;

        if (showLoading) setLoading(true);

        const { data } = await appAxios.get("/api/order/user", {
          withCredentials: true,
        });

        if (data.success) {
          setMyOrders((prevOrders) => {
            const prevIds = prevOrders
              .map((o) => o._id)
              .sort()
              .join(",");
            const newIds = data.orders
              .map((o) => o._id)
              .sort()
              .join(",");
            const changed =
              prevIds !== newIds || prevOrders.length !== data.orders.length;

            if (changed) {
              return data.orders;
            }
            return prevOrders;
          });

          if (!skipRatings) {
            await Promise.all([
              fetchUserRatings(data.orders),
              fetchOrderRatings(data.orders),
            ]);
          }
        } else {
          toast.error(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [appAxios]
  );

  const fetchUserRatings = useCallback(
    async (orders) => {
      try {
        const productIds = orders
          .flatMap((order) => order.items)
          .map((item) => item.product?._id)
          .filter(Boolean);

        if (productIds.length === 0) return;

        const { data } = await appAxios.get(
          `/api/rating/user-ratings?productIds=${productIds.join(",")}`,
          { withCredentials: true }
        );

        if (data.success) {
          const ratingsMap = {};
          data.ratings.forEach((rating) => {
            ratingsMap[rating.productId] = rating;
          });
          setUserRatings(ratingsMap);
        }
      } catch (error) {
        console.error("Error fetching user ratings:", error);
      }
    },
    [appAxios]
  );

  const fetchOrderRatings = useCallback(
    async (orders) => {
      try {
        const orderIds = orders.map((order) => order._id);
        if (orderIds.length === 0) return;

        const { data } = await appAxios.get(
          `/api/order-rating/user?orderIds=${orderIds.join(",")}`,
          { withCredentials: true }
        );

        if (data.success) {
          const ratingsMap = {};
          data.ratings.forEach((rating) => {
            ratingsMap[rating.orderId] = rating;
          });
          setOrderRatings(ratingsMap);
        }
      } catch (error) {
        console.error("Error fetching order ratings:", error);
      }
    },
    [appAxios]
  );

  const canRateProduct = useCallback(
    (productId, order) => {
      if (userRatings[productId]) return false;
      return order.status === "Delivered" || order.status === "Completed";
    },
    [userRatings]
  );

  const handleRateProduct = useCallback((product, orderId) => {
    setRatingModal({
      isOpen: true,
      product,
      orderId,
    });
  }, []);

  const handleOrderRateClick = useCallback((order) => {
    setOrderRatingModal({
      isOpen: true,
      order,
    });
  }, []);

  const handleRatingSubmitted = useCallback((rating) => {
    // The rating object contains productId and other rating data
    if (rating && rating.productId) {
      setUserRatings((prev) => ({
        ...prev,
        [rating.productId]: rating,
      }));
    }
    setRatingModal({ isOpen: false, product: null, orderId: null });
    toast.success("Thank you for your rating!");
  }, []);

  const handleOrderRatingSubmitted = useCallback((orderRating) => {
    // The orderRating object contains orderId and other rating data
    if (orderRating && orderRating.orderId) {
      setOrderRatings((prev) => ({
        ...prev,
        [orderRating.orderId]: orderRating,
      }));
    }
    setOrderRatingModal({ isOpen: false, order: null });
    toast.success("Thank you for rating your order experience!");
  }, []);

  const memoizedOrders = useMemo(() => myOrders, [myOrders]);

  useEffect(() => {
    if (!loadingUser && user) {
      fetchMyOrders();

      pollingIntervalRef.current = setInterval(() => {
        fetchMyOrders(true, false);
      }, 30000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [fetchMyOrders, user, loadingUser]);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your orders.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8">
        {" "}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-gray-600 text-lg">
              {memoizedOrders.length}{" "}
              {memoizedOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : memoizedOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-sm p-16 max-w-lg mx-auto border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                You haven't placed any orders yet. Start shopping to see your
                orders here.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            {memoizedOrders.map((order) => (
              <OrderItem
                key={order._id}
                order={order}
                currency={currency}
                userRatings={userRatings}
                orderRatings={orderRatings}
                canRateProduct={canRateProduct}
                handleRateProduct={handleRateProduct}
                handleOrderRateClick={handleOrderRateClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {ratingModal.isOpen && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          productId={ratingModal.product?._id}
          productName={ratingModal.product?.name}
          productImage={ratingModal.product?.image?.[0]}
          orderId={ratingModal.orderId}
          onClose={() =>
            setRatingModal({ isOpen: false, product: null, orderId: null })
          }
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {orderRatingModal.isOpen && (
        <OrderRatingModal
          isOpen={orderRatingModal.isOpen}
          order={orderRatingModal.order}
          onClose={() => setOrderRatingModal({ isOpen: false, order: null })}
          onRatingSubmitted={handleOrderRatingSubmitted}
        />
      )}
    </div>
  );
};

export default MyOrderPage;
