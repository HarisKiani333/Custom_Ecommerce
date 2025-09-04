import { memo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const CartItem = memo(({ product, index }) => {
  const { currency, navigate, updateCartItem, removeCartItem } = useAppContext();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleProductClick = () => {
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
    scrollTo(0, 0);
  };

  const handleQuantityChange = (e) => {
    updateCartItem(product._id, Number(e.target.value));
  };

  const handleRemoveItem = () => {
    removeCartItem(product._id);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) return null;
    return product.image && product.image.length > 0 ? product.image[0] : product.image;
  };

  return (
    <div
      className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 items-center text-sm md:text-base font-medium py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 rounded-lg px-2 animate-in fade-in-50 slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center md:gap-6 gap-3 group">
        <div
          onClick={handleProductClick}
          className="cursor-pointer w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-300 relative bg-gray-50"
        >
          {/* Loading Spinner */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
            </div>
          )}
          
          {/* Image or Fallback */}
          {!imageError && getImageSrc() ? (
            <img
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              src={getImageSrc()}
              alt={product.name}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-2">
              <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-center leading-tight">{product.name?.slice(0, 15)}...</span>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300 mb-2 text-sm sm:text-base truncate">
            {product.name}
          </p>
          <p className="text-xs text-gray-500 mb-2 sm:hidden truncate">
            {product.category}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">📊 Qty:</span>
              <select
                value={product.quantity}
                onChange={handleQuantityChange}
                className="outline-none border border-gray-300 rounded-lg px-2 py-1 text-sm font-medium bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 min-w-[60px]"
              >
                {Array.from({
                  length: Math.max(9, product.quantity),
                }).map((_, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="font-bold text-sm sm:text-lg text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-green-200 inline-block">
          <span className="block sm:inline">{currency}</span>
          <span className="block sm:inline">{(product.offerPrice * product.quantity).toLocaleString()}</span>
        </div>
        {product.quantity > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {currency}{product.offerPrice.toLocaleString()} × {product.quantity}
          </p>
        )}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleRemoveItem}
          className="cursor-pointer p-2 rounded-full hover:bg-red-50 transition-all duration-300 group/btn border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
          title="Remove item"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="group-hover/btn:scale-110 transition-transform duration-300"
          >
            <path
              d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
              stroke="#FF532E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;