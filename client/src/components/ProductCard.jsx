import React from "react";
import { useAppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  const {
    currency,
    navigate,
    addCartItem,
    updateCartItem,
    removeCartItem,
    cartItems,
    getcartCount,
  } = useAppContext();

  return (
    product && (
      <div
        onClick={() => {
          navigate(
            `/products/${product.category.toLowerCase()}/${product._id}`
          );
          scrollTo(0, 0);
        }}
        className={`${product.bgColor} rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl group cursor-pointer w-full max-w-[180px] transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-green-200`}
      >
        <div className="relative overflow-hidden rounded-lg mb-2">
          <img
            src={product.image[0]}
            alt={product.name}
            className="w-14 sm:w-16 transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{product.category}</p>
        <p className="text-xs font-semibold truncate max-w-full mt-1 text-gray-800">
          {product.name}
        </p>
        <div className="flex flex-col items-center justify-center mt-[2px]">
          <StarRating
            rating={product.rating}
            size="small"
            showRatingText={true}
          />
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-sm font-bold text-green-600">
            {currency}{product.offerPrice}
          </p>
          <p className="text-[10px] text-gray-400 line-through">
            {currency}{product.price}
          </p>
        </div>

        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          {!cartItems[product._id] ? (
            <button
              className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-[11px] px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 transform hover:scale-105 
    ${getcartCount === 0 ? "cursor-pointer" : ""}`}
              onClick={() => addCartItem(product._id)}
            >
              <ShoppingCart className="w-3 h-3" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-green-50 border-2 border-green-200 px-2 py-1 rounded-full text-[11px] shadow-sm">
              <button
                onClick={() => removeCartItem(product._id)}
                className="text-green-700 font-bold w-6 h-6 hover:bg-green-200 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center"
              >
                -
              </button>
              <span className="px-2 font-semibold text-green-800 min-w-[20px] text-center">{cartItems[product._id]}</span>
              <button
                onClick={() => addCartItem(product._id)}
                className="text-green-700 font-bold w-6 h-6 hover:bg-green-200 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default ProductCard;
