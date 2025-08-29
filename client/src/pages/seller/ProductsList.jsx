import { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const ProductLists = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const [loading, setLoading] = useState(false);

  const toggleStock = async (id, inStock) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`/api/product/stock`, {
        id,
        inStock,
      });
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 animate-in fade-in-50 duration-700">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
            📋 Products Inventory
          </h1>
          <p className="text-gray-600">Manage your product stock and availability</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-gray-600">Total Products: </span>
              <span className="font-bold text-green-600">{products.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-gray-600">In Stock: </span>
              <span className="font-bold text-green-600">{products.filter(p => p.inStock).length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-200">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              Product Management
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">🏷️</span>
                      Product
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">📂</span>
                      Category
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left hidden md:table-cell">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">💰</span>
                      Price
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
                      <span className="text-lg">📦</span>
                      Stock Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center animate-in fade-in-50 duration-500">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
                        <p className="text-gray-500">Start by adding your first product to the inventory</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-all duration-300 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${100 + index * 50}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative group">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                              <img
                                src={product.image[0]}
                                alt="Product"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">ID: {product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900">
                            {currency}{product.offerPrice}
                          </span>
                          {product.price !== product.offerPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {currency}{product.price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <label className="relative inline-flex items-center cursor-pointer group">
                            <input
                              onChange={() => toggleStock(product._id, !product.inStock)}
                              checked={product.inStock}
                              type="checkbox"
                              className="sr-only peer"
                              disabled={loading}
                            />
                            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all duration-300 shadow-inner group-hover:shadow-lg">
                              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-6 flex items-center justify-center">
                                <span className="text-xs">
                                  {product.inStock ? '✓' : '✕'}
                                </span>
                              </div>
                            </div>
                          </label>
                          <div className="ml-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 font-medium">Updating stock status...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductLists;
