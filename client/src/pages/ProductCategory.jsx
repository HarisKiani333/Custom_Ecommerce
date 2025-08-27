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
        <div className="flex flex-col items-end w-max mb-6">
          {searchCategory && (
            <>
              <p className="text-2xl md:text-3xl font-medium">
                {searchCategory.text}
              </p>
              <div className="w-16 h-0.5 bg-green-600 rounded-full"></div>
            </>
          )}
          {filteredProducts.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;
