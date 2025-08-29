import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Cart = () => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [guestAddress, setGuestAddress] = useState(
    JSON.parse(localStorage.getItem("guestAddress")) || null
  );
  const [paymentOptions, setPaymentOptions] = useState("Cash on Delivery");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });

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

  const cartArray = Object.keys(cartItems)
    .map((itemId) => {
      const product = products.find((p) => p._id === itemId);
      return product ? { ...product, quantity: cartItems[itemId] } : null;
    })
    .filter(Boolean);

  // Fetch addresses for logged-in user
  const getUserAddress = async () => {
    setIsLoadingAddress(true);
    try {
      const { data } = await axios.post("/api/address/get");
      if (data.success) {
        setAddress(data.address);
        if (data.address.length > 0 && !selectedAddress) {
          setSelectedAddress(data.address[0]);
        }
      } else {
        toast.error(data.message || "No addresses found");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch addresses");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Add new address
  const addNewAddress = async () => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zip', 'country', 'phone'];
      const missingFields = requiredFields.filter(field => !newAddress[field].trim());
      
      if (missingFields.length > 0) {
        return toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const { data } = await axios.post("/api/address/add", newAddress);
      if (data.success) {
        toast.success("Address added successfully");
        setNewAddress({
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: ''
        });
        setShowAddressForm(false);
        await getUserAddress(); // Refresh addresses
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add address");
    }
  };

  // Handle address selection
  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setShowAddress(false);
    toast.success("Address selected successfully");
  };

  // Handle input change for new address form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save guest address locally
  const saveGuestAddress = (addr) => {
    setGuestAddress(addr);
    localStorage.setItem("guestAddress", JSON.stringify(addr));
  };

  const placeOrder = async () => {
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
        if (!selectedAddress?._id)
          return toast.error("Please select or add an address");
        payload.userId = user._id;
        payload.address = selectedAddress._id; // objectId for DB
      } else {
        if (!guestAddress) return toast.error("Please add shipping details");
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

      if (paymentOptions === "Cash on Delivery") {
        // COD order
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
        // Online payment via Stripe
        const { data } = await axios.post("/api/order/online", payload);
        if (data.success && data.url) {
          // Redirect to Stripe checkout
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
  };

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) getCartAmount();
  }, [products, cartItems]);

  return products.length > 0 && cartItems ? (
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
          <p className="text-gray-600 mt-2 text-sm">Review and manage your selected items</p>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-600 text-base font-semibold pb-4 border-b-2 border-gray-200 mb-4">
          <p className="text-left flex items-center gap-2">📦 Product Details</p>
          <p className="text-center flex items-center justify-center gap-2">💰 Subtotal</p>
          <p className="text-center flex items-center justify-center gap-2">⚡ Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 items-center text-sm md:text-base font-medium py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 rounded-lg px-2 animate-in fade-in-50 slide-in-from-bottom-4"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <div className="flex items-center md:gap-6 gap-3 group">
              <div
                onClick={() => {
                  navigate(
                    `/products/${product.category.toLowerCase()}/${product._id}`
                  );
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-300 relative"
              >
                <img
                  className="max-w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  src={product.image}
                  alt={product.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1">
                <p className="hidden md:block font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300 mb-2">{product.name}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">⚖️</span>
                    <span className="font-medium text-gray-600">Weight: {product.weight || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">📊 Qty:</span>
                    <select
                      value={product.quantity}
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      className="outline-none border border-gray-300 rounded-lg px-2 py-1 text-sm font-medium bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    >
                      {Array.from({
                        length: Math.max(9, product.quantity),
                      }).map((_, idx) => (
                        <option key={idx} value={idx + 1}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                {currency}
                {product.offerPrice * product.quantity}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => removeCartItem(product._id)}
                className="cursor-pointer p-2 rounded-full hover:bg-red-50 transition-all duration-300 group/btn border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                title="Remove item"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover/btn:scale-110 transition-transform duration-300">
                  <path
                    d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                    stroke="#FF532E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">📋 Order Summary</h2>
        </div>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            {user ? (
              selectedAddress ? (
                <div className="text-gray-700">
                  <p>
                    {selectedAddress.firstName} {selectedAddress.lastName}
                  </p>
                  <p>
                    {selectedAddress.address}, {selectedAddress.city}
                  </p>
                  <p>{selectedAddress.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500">No address selected</p>
              )
            ) : guestAddress ? (
              <div className="text-gray-700">
                <p>{guestAddress.fullName}</p>
                <p>
                  {guestAddress.address}, {guestAddress.city}
                </p>
                <p>{guestAddress.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">No address added</p>
            )}

            <button
              onClick={() =>
                user ? setShowAddress(!showAddress) : navigate("/add-address")
              }
              className="text-indigo-500 hover:underline cursor-pointer"
            >
              {user ? "Change" : "Add Address"}
            </button>
          </div>

          {/* Enhanced Address Management Modal */}
          {user && showAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Select Address</h3>
                  <button
                    onClick={() => setShowAddress(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Existing Addresses */}
                {address.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Addresses</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {address.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`p-3 border rounded cursor-pointer hover:border-indigo-500 transition-colors ${
                            selectedAddress?._id === addr._id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-300"
                          }`}
                        >
                          <p className="font-medium">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addr.address}, {addr.city}, {addr.state} {addr.zip}
                          </p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Address Button */}
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mb-4"
                >
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>

                {/* New Address Form */}
                {showAddressForm && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Add New Address</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={newAddress.firstName}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={newAddress.lastName}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street Address"
                      value={newAddress.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="zip"
                        placeholder="ZIP Code"
                        value={newAddress.zip}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={newAddress.country}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={addNewAddress}
                      className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select
            value={paymentOptions}
            onChange={(e) => setPaymentOptions(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="Cash on Delivery">Cash On Delivery</option>
            <option value="Online Payment">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        {cartArray.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700 flex items-center gap-2">💰 Price</span>
              <span className="font-bold text-lg text-gray-800">
                {currency}
                {getCartAmount()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700 flex items-center gap-2">🚚 Shipping Fee</span>
              <span className="font-bold text-lg text-green-600">Free</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700 flex items-center gap-2">📊 Tax(2%)</span>
              <span className="font-bold text-lg text-gray-800">
                {currency}
                {(getCartAmount() * 0.02).toFixed(2)}
              </span>
            </div>
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-md">
              <span className="font-bold text-xl text-green-800 flex items-center gap-2">🎯 Total Amount:</span>
              <span className="font-bold text-2xl text-green-600">
                {currency}
                {(getCartAmount() * 1.02).toFixed(2)}
              </span>
            </div>
          </div>
        )}

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
              🚀 {paymentOptions === "Cash on Delivery" ? "Place Order" : "Proceed to Pay"}
            </>
          )}
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-200">
            <svg
              className="h-16 w-16 text-gray-400 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2-2v4m16 0H4"
              />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-red-500 text-xl">😔</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          🛒 Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-400">
          Looks like you haven't added any items to your cart yet. Start exploring our amazing products!
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-500"
        >
          🛍️ Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Cart;
