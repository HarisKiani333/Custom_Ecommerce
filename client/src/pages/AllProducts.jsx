import React from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();

  return (
    <div className="mt-20">
      <div className="flex flex-col items-end w-max mb-6 ml-4">
        <p className="text-2xl md:text-3xl font-medium">All Products</p>
        <div className="w-16 h-0.5 bg-green-600 rounded-full"></div>
      </div>

      <div className="ml-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products
          .filter((product) => product.inStock)
          .filter(
            (product) =>
              searchQuery === "" ||
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default AllProducts;