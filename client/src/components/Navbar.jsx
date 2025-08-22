import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
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
    { name: "Contact", path: "/contacts" },
    { name: "About", path: "/about" },
  ];

  const handleLogout = async () => {
    try {
      const {data} = await axios.post("/api/user/logout");
      if (data.success) {
        toast.success("Logout Successful");
        setUser(null);
        setShowProfileDropdown(false);
        navigate('/')
      }else {
        toast.error(data.message);

      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-xl font-bold text-green-600 hover:text-green-700"
        >
          Husk Store
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-600"
            />
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-gray-700 hover:text-green-600 transition"
            >
              {link.name}
            </a>
          ))}

          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 text-gray-700 hover:text-green-600 transition cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getCartCount() > 0 ? getCartCount() : 0}
            </span>
          </button>

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300 cursor-pointer"
            >
              Login
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:text-green-600 transition"
              >
                <User className="w-6 h-6" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <a
                      href="/my-orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Orders
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}

        <div className="flex items-center gap-6 sm:hidden">
          <div>
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 text-gray-700 hover:text-green-600 transition cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              <span
                onClick={() => navigate("/cart")}
                className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {getCartCount() > 0 ? getCartCount() : 0}
              </span>
            </button>
          </div>

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
        <div className="md:hidden bg-white px-4 py-4 border-t border-gray-200">
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                value={searchQuery}
                placeholder="Search Products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="block py-2 text-gray-700 hover:text-green-600"
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

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{`(${getCartCount() > 0 ? getCartCount() : 0})`}</span>
            </button>
            {!user ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowUserLogin(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition cursor-pointer"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
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
