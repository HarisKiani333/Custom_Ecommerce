import Navbar from "./components/Navbar";
import { Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
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
import Loader from "./pages/Loader";
import UniversalLoader from "./components/UniversalLoader";

function App() {
  const { showUserLogin, user, isSeller } = useAppContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (
    <UniversalLoader>
      <div className="App flex flex-col min-h-screen">
        {/* Show login modal */}
        {showUserLogin && <Login />}
        
        {/* Show navbar only if not on seller or admin routes */}
        {!location.pathname.startsWith("/seller") && !location.pathname.startsWith("/admin") && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contacts" element={<div>Contact Page</div>} />
          <Route path="/about" element={<div>About Page</div>} />
          
          {/* Protected User Routes */}
          <Route
            path="/my-orders"
            element={user ? <MyOrderPage /> : <Navigate to="/my-orders" />}
          />
          <Route
            path="/add-address"
            element={!user ? <AddAddress /> : <Navigate to="/add-address" />}
          />
          
          {/* Loader route - maintain existing functionality for payment flows */}
          <Route
            path="/loader"
            element={
              <Loader
                type={searchParams.get("type") || "navigation"}
                message={searchParams.get("message")}
                delay={parseInt(searchParams.get("delay")) || 2000}
              />
            }
          />
          
          {/* Seller Routes */}
          <Route path="/seller-login" element={<SellerLogin />} />
          <Route
            path="/seller"
            element={isSeller ? <SellerDashboard /> : <Navigate to="/seller-login" />}
          >
            <Route path="add-product" element={<AddProducts />} />
            <Route path="product-list" element={<ProductsList />} />
            <Route path="order-list" element={<OrdersList />} />
          </Route>
          
          </Routes>
        </main>
        
        {/* Show footer only if not on seller or admin routes */}
        {!location.pathname.startsWith("/seller") && <Footer />}
        
        <BackToTop />
        <Toaster />
      </div>
    </UniversalLoader>
  );
}

export default App;
