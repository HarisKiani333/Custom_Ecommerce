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
        className={`${product.bgColor} rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm group cursor-pointer w-full max-w-[180px]`}
      >
        <img
          src={product.image[0]}
          alt={product.name}
          className="w-14 sm:w-16 transition-transform duration-200 group-hover:scale-105"
        />
        <p className="text-[10px] text-gray-500 mt-1">{product.category}</p>
        <p className="text-xs font-medium truncate max-w-full">
          {product.name}
        </p>
        <div className="flex flex-col items-center justify-center mt-[2px]">
          <StarRating
            rating={product.rating}
            size="small"
            showRatingText={true}
          />
        </div>
        <p className="text-xs font-semibold text-green-600 mt-1">
          {currency}
          {product.offerPrice}{" "}
          <span className="line-through text-gray-400 text-[10px]">
            {currency}
            {product.price}
          </span>
        </p>

        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          {!cartItems[product._id] ? (
            <button
              className={`bg-green-100 text-green-700 text-[11px] px-3 py-[3px] rounded font-medium border 
    border-green-200 flex items-center gap-1 
    ${getcartCount === 0 ? "cursor-pointer" : ""}`}
              onClick={() => addCartItem(product._id)}
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-green-100 px-1 py-[2px] rounded text-[11px] border border-green-200">
              <button
                onClick={() => removeCartItem(product._id)}
                className="text-green-700 font-bold px-1 hover:bg-green-200 rounded cursor-pointer"
              >
                -
              </button>
              <span className="px-2 font-medium">{cartItems[product._id]}</span>
              <button
                onClick={() => addCartItem(product._id)}
                className="text-green-700 font-bold px-1 hover:bg-green-200 rounded cursor-pointer"
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
