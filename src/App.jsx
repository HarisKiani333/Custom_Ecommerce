import Navbar from "./components/Navbar";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BackToTop from "./components/BackToTop";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import { useAppContext } from "./context/AppContext";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import MyOrderPage from "./pages/MyOrderPage";
import AddAddress from "./pages/AddAddress";
import SellerLogin from "./components/seller/SellerLogin";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AddProducts from "./pages/seller/AddProducts";
import ProductsList from "./pages/seller/ProductsList";
import OrdersList from "./pages/seller/OrdersList";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller } = useAppContext();

  return (
    <div className="item-default min-h-screen text-grey-700 bg-white">
      {!isSellerPath && <Navbar />}
      {showUserLogin && <Login />}
      <Toaster position="top-right" />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/products/:category/:id" element={<ProductDetails />} />
        <Route path="/products/:category" element={<ProductCategory />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/my-orders" element={<MyOrderPage />} />

        {/* Seller Routes */}
        <Route
          path="/seller"
          element={
            isSeller ? <SellerDashboard /> : <Navigate to="/seller-login" />
          }
        >
          <Route  path= "add-product" element={<AddProducts />} />
          <Route path="product-list" element={<ProductsList />} />
          <Route path="order-list" element={<OrdersList />} />
        </Route>

        {/* Seller Login Route */}
        <Route
          path="/seller-login"
          element={!isSeller ? <SellerLogin /> : <Navigate to="/seller" />}
        />
      </Routes>

      <BackToTop />
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;
