import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductCategory = () => {
  const { category } = useParams();
  const { products } = useAppContext();

  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === category
  );

  const filteredProducts = products.filter((product) => {
    if (!searchCategory) return false;

    if (product.category.toLowerCase() === searchCategory.text.toLowerCase()) {
      return true;
    }

    const productCategoryNormalized = product.category.toLowerCase();
    const pathNormalized = searchCategory.path.toLowerCase();

    return (
      productCategoryNormalized === pathNormalized ||
      productCategoryNormalized.includes(pathNormalized) ||
      pathNormalized.includes(productCategoryNormalized)
    );
  });

  console.log("URL category:", category);
  console.log("Matched category object from list:", searchCategory);
  console.log("Filtered products:", filteredProducts);
  console.log(
    "All product categories:",
    products.map((p) => p.category)
  );

  return (
    <div>
      <div className="mt-16">
        <div className="text-center mb-10">
          {searchCategory && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {searchCategory.text}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm md:text-base">Explore our fresh selection of {searchCategory.text.toLowerCase()}</p>
            </>
          )}
          {filteredProducts.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredProducts.map((product, index) => (
                  <div key={product._id} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{animationDelay: `${index * 50}ms`}}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">We couldn't find any products in this category. Please try another category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;
