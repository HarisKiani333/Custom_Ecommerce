import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import BgImg from "../../assets/img/sellerBg.jpg";

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsSeller(true);
      navigate("/seller");
      setEmail("");
      setPassword("");
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${BgImg})`,
      }}
    >
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center justify-center text-sm text-gray-600"
      >
        <div className="flex flex-col gap-5 p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 bg-white/90">
          <p className="text-2xl font-medium text-center">
            <span className="text-green-300">Seller</span> Login
          </p>

          <div className="w-full">
            <p>Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className="border border-gray-200 rounded-full w-full p-2 mt-1 focus:ring-2 -focus:ring-green-300"
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="border border-gray-200 rounded-full w-full p-2 mt-1 focus:ring-2 -focus:ring-green-300"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-400 text-white w-full py-2 rounded-md cursor-pointer"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerLogin;
