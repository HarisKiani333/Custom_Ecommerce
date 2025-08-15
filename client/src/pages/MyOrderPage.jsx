import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { dummyOrders } from "../assets/assests";

export const calculateOrderAmount = (items) => {
  return items.reduce((total, item) => {
    const price = item.product.offerPrice || item.product.price || 0;
    return total + price * item.quantity;
  }, 0);
};

const MyOrderPage = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency } = useAppContext();

  const fetchMyOrders = async () => {
    setMyOrders(dummyOrders);
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  return (
    <div className="mt-20">
      <div className="flex flex-col items-start w-max mb-6 ml-6">
        <p className="text-2xl md:text-3xl font-medium">My Orders List</p>
        <div className="w-16 h-0.5 bg-green-600 rounded-full"></div>
      </div>

      <div className="md:p-10 p-4 space-y-2">
        <h2 className="text-lg font-medium text-gray-700">Orders List</h2>
        {myOrders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-5 max-w-4xl rounded-md border border-gray-200 text-gray-700"
          >
            <div className="flex gap-5">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <img
                    src={item.product.image[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-md opacity-80"
                  />
                  <p className="font-medium">
                    {item.product.name}{" "}
                    <span
                      className={`text-indigo-500 ${
                        item.quantity < 2 ? "hidden" : ""
                      }`}
                    >
                      x {item.quantity}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="text-sm">
              <p className="font-medium mb-1">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>
                {order.address.street}, {order.address.city},{" "}
                {order.address.state}, {order.address.zipcode},{" "}
                {order.address.country}
              </p>
            </div>

            <p className="font-medium text-base my-auto text-gray-600">
              {currency}
              {calculateOrderAmount(order.items).toFixed(2)}
            </p>

            <div className="flex flex-col text-sm">
              <p>Method: {order.paymentType}</p>
              <p>Date: {order.orderDate}</p>
              <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrderPage;
