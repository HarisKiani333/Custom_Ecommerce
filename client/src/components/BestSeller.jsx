import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const BestSeller = () => {
  const { products, loadingUser } = useAppContext();

  // Show loading state while products are being fetched
  if (loadingUser || products.length === 0) {
    return (
      <div className="mt-16">
        <p className="text-2xl md:text-3xl font-medium mb-4">Best Sellers</p>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">🔥 Best Sellers</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm md:text-base">Discover our most popular products loved by customers</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {products
          .filter((product) => product.inStock)
          .slice(0, 6)
          .map((product, index) => (
            <div key={index} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{animationDelay: `${index * 100}ms`}}>
              <ProductCard product={product} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default BestSeller;
