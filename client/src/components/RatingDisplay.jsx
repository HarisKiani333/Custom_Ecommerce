import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import axios from "axios";

const RatingDisplay = ({ productId, showReviews = true, maxReviews = 5 }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (productId) {
      fetchRatings();
    }
  }, [productId, currentPage]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/rating/product/${productId}?page=${currentPage}&limit=${maxReviews}`
      );

      if (response.data.success) {
        setRatings(response.data.ratings);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to load ratings");
      console.error("Error fetching ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating) => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  const renderRatingBar = (starCount, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-1 w-8">
          <span className="font-medium text-gray-700">{starCount}</span>
          <svg
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.379 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.379 2.455c-.784.57-1.838-.197-1.539-1.118l1.285-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
          </svg>
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-10 text-right text-gray-600 font-medium">
          {count}
        </span>
        <span className="w-12 text-right text-xs text-gray-500">
          ({percentage.toFixed(0)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        {showReviews && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (stats.totalRatings === 0) {
    return (
      <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
        <p>No ratings yet. Be the first to rate this product!</p>
      </div>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={stats.averageRating} size="large" />
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Based on {stats.totalRatings}{" "}
              {stats.totalRatings === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-2 w-full md:w-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Rating Distribution
            </h4>
            {[5, 4, 3, 2, 1].map((star) =>
              renderRatingBar(star, distribution[star], stats.totalRatings)
            )}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      {showReviews && ratings.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-900">
              Customer Reviews
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {ratings.length} of {stats.totalRatings} reviews
            </span>
          </div>

          <div className="grid gap-6">
            {ratings.map((rating) => (
              <div
                key={rating._id}
                className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                      {rating.userId?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {rating.userId?.name || "Anonymous User"}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <StarRating rating={rating.rating} size="small" />
                        <span className="text-sm text-gray-500">
                          {formatDate(rating.createdAt)}
                        </span>
                        {rating.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {rating.review && (
                  <div className="mt-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {rating.review}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                  Page {currentPage} of {pagination.totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
