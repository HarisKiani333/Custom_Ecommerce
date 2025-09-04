import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Search, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import CartButton from "./CartButton";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    getCartCount,
    axios,
  } = useAppContext();
  const dropdownRef = useRef(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Contact", path: "/contact" },
    { name: "About", path: "/about" },
  ];

  const handleLogout = useCallback(async () => {
    try {
      // Clear user state immediately for better UX
      setUser(null);
      setShowProfileDropdown(false);

      const { data } = await axios.post("/api/user/logout");
      if (data.success) {
        toast.success("Logout Successful");
        navigate("/");
      } else {
        // Even if server logout fails, user is already logged out locally
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      // Even if logout request fails, user is already logged out locally
      console.error("Logout error:", error);
      toast.success("Logged out successfully");
      navigate("/");
    }
  }, [axios, setUser, navigate, setShowProfileDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery, navigate]);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-xl font-bold text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-105"
        >
          🌿 Husk Store
        </a>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search Products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-gray-700 hover:text-green-600 transition-all duration-200 font-medium relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}

          <CartButton />

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-full transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Login
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:text-green-600 transition-all duration-200 hover:bg-green-50 rounded-full"
              >
                <User className="w-6 h-6" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <a
                      href="/my-orders"
                      className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Orders 📦
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer font-medium"
                    >
                      Logout ⏻
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}

        <div className="flex items-center gap-6 sm:hidden">
          <CartButton />

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md px-4 py-4 border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-300">
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                value={searchQuery}
                placeholder="Search Products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="block py-3 px-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}

          {user && (
            <a
              href="/my-orders"
              className="block py-2 text-gray-700 hover:text-green-600"
              onClick={() => setIsMenuOpen(false)}
            >
              My Orders
            </a>
          )}

          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
              <CartButton
                className="flex items-center p-0 hover:bg-transparent hover:text-green-600 cursor-pointer"
                showCount={false}
                size="w-4 h-4 sm:w-5 sm:h-5"
              />
              <span className="text-sm sm:text-base">{`(${getCartCount() > 0 ? getCartCount() : 0})`}</span>
            </div>
            {!user ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowUserLogin(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-full transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm sm:text-base"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-red-700 transition text-sm sm:text-base"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
