import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams, Link } from "react-router-dom";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import RatingDisplay from "../components/RatingDisplay";

const ProductDetails = () => {
  const { products, navigate, currency, addCartItem, loadingUser } =
    useAppContext();
  const { category, id } = useParams();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  ``;
  const product = products.find((p) => p._id === id);

  // Show loading state while products are being fetched or product not found
  if (loadingUser || (products.length > 0 && !product)) {
    return (
      <div className="mt-16 px-4 pb-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingUser ? "Loading product details..." : "Product not found"}
          </p>
        </div>
      </div>
    );
  }

  // If products are loaded but product is not found, show not found message
  if (products.length > 0 && !product) {
    return (
      <div className="mt-16 px-4 pb-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (products.length > 0) {
      let productCopy = products.slice();
      productCopy = productCopy.filter((p) => product.category === p.category);
      setRelatedProducts(productCopy.slice(0, 4));
    }
  }, [products]);

  useEffect(() => {
    if (product) {
      setThumbnail(product?.image[0] ? product.image[0] : null);
    }
  }, [product]);

  return (
    product && (
      <div className="mt-16 px-4 pb-28 min-h-screen">
        <p className="text-sm text-gray-500 font-medium space-x-1">
          <Link
            to="/"
            className="hover:text-blue-700 hover:underline transition"
          >
            Home
          </Link>
          <span>{">"}</span>
          <Link
            to="/products"
            className="hover:text-blue-700 hover:underline transition"
          >
            Products
          </Link>
          <span>{">"}</span>
          <Link
            to={`/products/${product.category.toLowerCase()}`}
            className="hover:text-blue-700 hover:underline transition"
            title={product.category}
          >
            {product.category}
          </Link>
          <span>{">"}</span>
          <span className="text-green-600">{product.name}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-16 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-3">
              {product.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>

            <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
              <img
                src={thumbnail}
                alt="Selected product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-sm w-full md:w-1/2">
            <h1 className="text-3xl font-medium">{product.name}</h1>

            <StarRating
              rating={product.rating}
              size="large"
              showRatingText={true}
            />

            <div className="mt-6">
              <p className="text-gray-500/70 line-through">
                {currency}
                {product.price}
              </p>
              <p className="text-2xl font-medium">
                {currency}
                {product.offerPrice} 
              </p>
              <span className="text-gray-500/70">(inclusive of all taxes)</span>
            </div>

            <p className="text-base font-medium mt-6">About Product</p>
            <ul className="list-disc ml-4 text-gray-500/70">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            <div className="flex items-center mt-10 gap-4 text-base">
              <button
                onClick={() => addCartItem(product._id)}
                className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addCartItem(product._id);
                  navigate("/cart");
                }}
                className="w-full py-3.5 cursor-pointer font-medium bg-green-500 text-white hover:bg-green-700 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* Product Ratings & Reviews Section */}
        <div className="mt-16">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-medium text-gray-800">
              Ratings & Reviews
            </h2>
            <div className="w-20 h-0.5 bg-green-400 rounded-full mt-2"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <RatingDisplay
              productId={product._id}
              showReviews={true}
              maxReviews={10}
            />
          </div>
        </div>

        {/* Related Products */}
        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max">
            <p className="text-3xl font-medium">Related Products</p>
            <div className="w-20 h-0.5 bg-green-400 rounded-full mt-2"></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 mt-6 w-full">
              {relatedProducts
                .filter((p) => p.inStock)
                .map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
            </div>
          </div>

          {/* See More Button */}
          <div className="mt-10">
            <button
              onClick={() => {
                navigate("/products");
                scrollTo(0, 0);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition"
            >
              See More Products
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductDetails;
