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
    try {
      const { data } = await axios.post("/api/address/get");
      if (data.success) {
        setAddress(data.address);
        if (data.address.length > 0) {
          setSelectedAddress(data.address[0]);
        }
      } else {
        toast.error(data.message || "No addresses found");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch addresses");
    }
  };

  // Save guest address locally
  const saveGuestAddress = (addr) => {
    setGuestAddress(addr);
    localStorage.setItem("guestAddress", JSON.stringify(addr));
  };

const placeOrder = async () => {
  try {
    if (!cartArray.length) return toast.error("Cart is empty");

    let payload = {
      items: cartArray.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      amount: getCartAmount() * 1.02, // optional: include tax
      paymentType: paymentOptions,
    };

    if (user) {
      // Logged-in user
      if (!selectedAddress?._id) return toast.error("Please select or add an address");

      payload.userId = user._id;
      payload.address = selectedAddress._id; // ObjectId for logged-in users
    } else {
      // Guest user
      if (!guestAddress) return toast.error("Please add shipping details");

      payload.guestAddress = {
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
  } catch (error) {
    toast.error(error.message);
  }
};


  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) getCartAmount();
  }, [products, cartItems]);

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-20 px-6 md:px-25">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-indigo-500">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={product.image}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      value={product.quantity}
                      onChange={(e) => updateCartItem(product._id, Number(e.target.value))}
                      className="outline-none"
                    >
                      {Array.from({ length: Math.max(9, product.quantity) }).map((_, idx) => (
                        <option key={idx} value={idx + 1}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>
            <button onClick={() => removeCartItem(product._id)} className="cursor-pointer mx-auto">
              {/* delete icon */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
        ))}

        <button
          onClick={() => navigate("/products")}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:underline transition"
        >
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
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
                user
                  ? setShowAddress(!showAddress)
                  : navigate("/add-address")
              }
              className="text-indigo-500 hover:underline cursor-pointer"
            >
              {user ? "Change" : "Add Address"}
            </button>
          </div>

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
          <div className="text-gray-500 mt-4 space-y-2">
            <p className="flex justify-between">
              <span>Price</span>
              <span>
                {currency}
                {getCartAmount()}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-green-600">Free</span>
            </p>
            <p className="flex justify-between">
              <span>Tax(2%)</span>
              <span>
                {currency}
                {(getCartAmount() * 0.02).toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between t-ext-lg font-medium mt-3">
              <span>Total Amount:</span>
              <span>{currency}{(getCartAmount() * 1.02).toFixed(2)}</span>
            </p>
          </div>
        )}

        <button
          className="w-full py-3 mt-6 cursor-pointer bg-green-500 text-white font-medium hover:bg-green-600 transition"
          onClick={placeOrder}
        >
          {paymentOptions === "Cash on Delivery" ? "Place Order" : "Proceed to Pay"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
