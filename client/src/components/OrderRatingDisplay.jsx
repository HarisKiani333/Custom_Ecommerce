import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const OrderRatingDisplay = ({ orderId, compact = false }) => {
  const { axios } = useAppContext();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderRating();
    }
  }, [orderId]);

  const fetchOrderRating = async () => {
    try {
      const { data } = await axios.get(`/api/order-rating/order/${orderId}`);
      if (data.success) {
        setRating(data.orderRating);
      }
    } catch (error) {
      // Rating doesn't exist or error occurred - this is normal
      setRating(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = "text-sm") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${size} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating}/5</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!rating) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800 flex items-center gap-1">
            ✅ Rated
          </span>
          {renderStars(rating.overallRating)}
        </div>
        {rating.review && (
          <p className="text-xs text-gray-600 line-clamp-2">
            "{rating.review}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          ⭐ Your Order Rating
        </h3>
        <span className="text-xs text-gray-500">
          {formatDate(rating.createdAt)}
        </span>
      </div>

      {/* Overall Rating */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Experience</span>
          {renderStars(rating.overallRating, "text-base")}
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {rating.deliveryRating > 0 && (
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">🚚 Delivery</div>
            {renderStars(rating.deliveryRating, "text-xs")}
          </div>
        )}
        {rating.packagingRating > 0 && (
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">📦 Packaging</div>
            {renderStars(rating.packagingRating, "text-xs")}
          </div>
        )}
        {rating.customerServiceRating > 0 && (
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">🎧 Service</div>
            {renderStars(rating.customerServiceRating, "text-xs")}
          </div>
        )}
      </div>

      {/* Recommendation */}
      {rating.wouldRecommend !== null && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">Recommendation: </span>
          <span className={`text-sm font-medium ${
            rating.wouldRecommend ? "text-green-600" : "text-red-600"
          }`}>
            {rating.wouldRecommend ? "👍 Would recommend" : "👎 Would not recommend"}
          </span>
        </div>
      )}

      {/* Tags */}
      {rating.tags && rating.tags.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">Tags:</div>
          <div className="flex flex-wrap gap-1">
            {rating.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Written Review */}
      {rating.review && (
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 mb-2">📝 Your Review:</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            "{rating.review}"
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderRatingDisplay;