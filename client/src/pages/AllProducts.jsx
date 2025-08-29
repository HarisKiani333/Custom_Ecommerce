import React from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";

const AllProducts = () => {
  const { products, searchQuery, loadingUser } = useAppContext();

  // Show loading state while products are being fetched
  if (loadingUser || products.length === 0) {
    return (
      <div className="mt-20 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products
    .filter((product) => product.inStock)
    .filter(
      (product) =>
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="mt-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">🛍️ All Products</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm md:text-base">Discover our complete collection of fresh products</p>
      </div>

      {searchQuery && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <span className="text-sm font-medium">🔍 Search results for: "{searchQuery}"</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div key={index} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{animationDelay: `${index * 30}ms`}}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? "Try searching with different keywords" : "Please check back later for new products"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;