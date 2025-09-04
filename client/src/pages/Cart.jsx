import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import CartItem from "../components/CartItem";
import AddressSelector from "../components/AddressSelector";

const Cart = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [guestAddress, setGuestAddress] = useState(
    JSON.parse(localStorage.getItem("guestAddress")) || {}
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const {
    getCartCount,
    getCartAmount,
    navigate,
    products,
    currency,
    cartItems,
    removeCartItem,
    updateCartItem,
    axios,
    user,
    setCartItems,
  } = useAppContext();

  const cartArray = useMemo(
    () =>
      Object.keys(cartItems)
        .map((itemId) => {
          const product = products.find((p) => p._id === itemId);
          return product ? { ...product, quantity: cartItems[itemId] } : null;
        })
        .filter(Boolean),
    [cartItems, products]
  );

  // Handle address selection
  const handleAddressSelect = useCallback((addr) => {
    setSelectedAddress(addr);
  }, []);

  // Fetch user addresses
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.post("/api/address/get");
      if (data.success) {
        setAddresses(data.address || []);
        // Auto-select first address if none selected
        if (!selectedAddress && data.address?.length > 0) {
          setSelectedAddress(data.address[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  }, [user, axios, selectedAddress]);

  // Handle address added callback
  const handleAddressAdded = useCallback(() => {
    fetchAddresses(); // Refresh addresses after adding new one
  }, [fetchAddresses]);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const placeOrder = useCallback(async () => {
    setIsPlacingOrder(true);
    try {
      if (!cartArray.length) {
        setIsPlacingOrder(false);
        return toast.error("Cart is empty");
      }

      let payload = {
        items: cartArray.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      if (user) {
        if (!selectedAddress?._id) {
          setIsPlacingOrder(false);
          return toast.error("Please select or add an address");
        }
        payload.userId = user._id;
        payload.address = selectedAddress._id;
      } else {
        if (!guestAddress) {
          setIsPlacingOrder(false);
          return toast.error("Please add shipping details");
        }
        payload.address = {
          street: guestAddress.address,
          city: guestAddress.city,
          state: guestAddress.state,
          zip: guestAddress.zip,
          country: guestAddress.country,
        };
        payload.guestInfo = {
          name: guestAddress.fullName,
          email: guestAddress.email,
          phone: guestAddress.phone,
        };
      }

      if (paymentMethod === "cod") {
        const { data } = await axios.post(
          user ? "/api/order/cod" : "/api/order/guest",
          payload
        );
        if (data.success) {
          toast.success(data.message || "Order placed successfully");
          setCartItems({});
          if (!user) localStorage.removeItem("guestAddress");
          navigate(user ? "/my-orders" : "/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/online", payload);
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.message || "Failed to initiate payment");
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [
    cartArray,
    user,
    selectedAddress,
    guestAddress,
    paymentMethod,
    axios,
    setCartItems,
    navigate,
  ]);

  useEffect(() => {
    if (products.length > 0 && cartItems) getCartAmount();
  }, [products, cartItems]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return (
    <>
      {products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-20 px-6 md:px-25 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <div className="flex-1 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                🛒 Shopping Cart
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-16 h-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full animate-in slide-in-from-left duration-500 delay-300"></div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {getCartCount()} Items
                </span>
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                Review and manage your selected items
              </p>
            </div>

            <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-600 text-base font-semibold pb-4 border-b-2 border-gray-200 mb-4">
              <p className="text-left flex items-center gap-2">
                📦 Product Details
              </p>
              <p className="text-center flex items-center justify-center gap-2">
                💰 Subtotal
              </p>
              <p className="text-center flex items-center justify-center gap-2">
                ⚡ Action
              </p>
            </div>

            {cartArray.map((product, index) => (
              <CartItem key={product._id} product={product} index={index} />
            ))}

            <button
              onClick={() => navigate("/products")}
              className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:underline transition"
            >
              Continue Shopping
            </button>
          </div>

          <div className="max-w-[360px] w-full bg-gradient-to-br from-white to-gray-50 p-8 max-md:mt-16 border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {" "}
                Order Summary
              </h2>
            </div>
            <hr className="border-gray-300 my-5" />

            {/* Address Display Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  📍 Delivery Address
                </h3>
                {user && addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded-md transition-colors duration-200"
                  >
                    Change
                  </button>
                )}
              </div>
              
              {user ? (
                selectedAddress ? (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedAddress.firstName} {selectedAddress.lastName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedAddress.street}, {selectedAddress.city}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedAddress.state} {selectedAddress.zip}, {selectedAddress.country}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📞 {selectedAddress.phone}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-600 mb-3">No address selected</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add Shipping Address
                    </button>
                  </div>
                )
              ) : (
                guestAddress && Object.keys(guestAddress).length > 0 ? (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-900">
                      {guestAddress.fullName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {guestAddress.address}, {guestAddress.city}
                    </div>
                    <div className="text-sm text-gray-600">
                      {guestAddress.state} {guestAddress.zip}, {guestAddress.country}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📞 {guestAddress.phone}
                    </div>
                  </div>
                ) : (
                  <AddressSelector
                    selectedAddress={selectedAddress}
                    addresses={addresses}
                    guestAddress={guestAddress}
                    onAddressSelect={handleAddressSelect}
                    onAddressAdded={handleAddressAdded}
                  />
                )
              )}
            </div>

            {/* Address Selection Modal */}
            {showAddressModal && user && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Select Delivery Address
                      </h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <AddressSelector
                      selectedAddress={selectedAddress}
                      addresses={addresses}
                      guestAddress={guestAddress}
                      onAddressSelect={(addr) => {
                        handleAddressSelect(addr);
                        setShowAddressModal(false);
                      }}
                      onAddressAdded={handleAddressAdded}
                      isModal={true}
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-gray-300 mt-5" />

            {cartArray.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    💰 Price
                  </span>
                  <span className="font-bold text-lg text-gray-800">
                    {currency}
                    {getCartAmount()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    🚚 Shipping Fee
                  </span>
                  <span className="font-bold text-lg text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    📊 Tax(2%)
                  </span>
                  <span className="font-bold text-lg text-gray-800">
                    {currency}
                    {(getCartAmount() * 0.02).toFixed(2)}
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-md">
                  <span className="font-bold text-xl text-green-800 flex items-center gap-2">
                    Total Amount:
                  </span>
                  <span className="font-bold text-2xl text-green-600">
                    {currency}
                    {(getCartAmount() * 1.02).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-medium uppercase mb-3">
                Payment Method
              </p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-green-600"
                  />
                  <label className="text-sm text-gray-700">
                    Cash on Delivery
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-green-600"
                  />
                  <label className="text-sm text-gray-700">
                    Online Payment
                  </label>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-4 mt-8 font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isPlacingOrder
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
              } text-white`}
              onClick={placeOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  {paymentMethod === "cod" ? "Place Order" : "Proceed to Pay"}
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Cart;
