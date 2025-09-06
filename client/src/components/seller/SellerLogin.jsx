import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import BgImg from "../../assets/img/sellerBg.jpg";
import toast from "react-hot-toast";
import axios from "axios";

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post("/api/seller/login", {
        email,
        password,
      });
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
        toast.success("Login Successful");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative animate-in fade-in-50 duration-1000"
      style={{
        backgroundImage: `url(${BgImg})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60"></div>
      <div className="relative bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-500">
            <span className="text-2xl text-white">👤</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
            Seller Login
          </h2>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div className="animate-in slide-in-from-left-4 duration-500 delay-700">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🖂 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-green-300 shadow-sm"
              required
            />
          </div>

          <div className="animate-in slide-in-from-right-4 duration-500 delay-800">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🗝️ Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-green-300 shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 duration-500 delay-900"
          >
            Login ▶
          </button>
        </form>

        <div className="mt-8 text-center animate-in fade-in-50 duration-500 delay-1000">
          <p className="text-gray-600 text-sm">
            Need help?{" "}
            <span className="text-green-600 hover:text-green-700 cursor-pointer font-medium">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
