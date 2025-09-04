import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CartButton = ({ className = '', showCount = true, size = 'w-6 h-6' }) => {
  const { navigate, getCartCount } = useAppContext();
  const cartCount = getCartCount();

  return (
    <button
      onClick={() => navigate('/cart')}
      className={`relative p-2 text-gray-700 hover:text-green-600 transition-all duration-200 cursor-pointer hover:bg-green-50 rounded-full ${className}`}
    >
      <ShoppingCart className={size} />
      {showCount && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
          {cartCount > 0 ? cartCount : 0}
        </span>
      )}
    </button>
  );
};

export default CartButton;