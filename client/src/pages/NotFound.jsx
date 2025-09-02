import React from "react";
import { Link } from "react-router-dom";
import { Home, ShoppingBag, Mail, ArrowRight } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off. Don't worry, it happens to the best of us!
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 w-full justify-center"
          >
            <Home className="w-5 h-5" />
            Back to Home
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          
          <div className="flex gap-3">
            <Link
              to="/products"
              className="group flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-green-600 px-6 py-3 rounded-full transition-all duration-300 font-medium shadow-md hover:shadow-lg border border-gray-200 hover:border-green-300"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
            
            <Link
              to="/contact"
              className="group flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-green-600 px-6 py-3 rounded-full transition-all duration-300 font-medium shadow-md hover:shadow-lg border border-gray-200 hover:border-green-300"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-60">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
