import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const OrderRatingModal = ({ isOpen, onClose, order, onRatingSubmitted }) => {
  const { axios } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    overallRating: 0,
    deliveryRating: 0,
    packagingRating: 0,
    customerServiceRating: 0,
    review: "",
    wouldRecommend: null,
    tags: []
  });

  const ratingCategories = [
    { key: "overallRating", label: "Overall Experience", icon: "⭐", required: true },
    { key: "deliveryRating", label: "Delivery Service", icon: "🚚", required: false },
    { key: "packagingRating", label: "Packaging Quality", icon: "📦", required: false },
    { key: "customerServiceRating", label: "Customer Service", icon: "🎧", required: false }
  ];

  const predefinedTags = [
    "Fast Delivery", "Great Packaging", "Excellent Quality", "Good Value",
    "Friendly Service", "Easy Process", "Would Buy Again", "Highly Recommend"
  ];

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data } = await axios.post("/api/order-rating/create", {
        orderId: order._id,
        ...formData
      });

      if (data.success) {
        toast.success("Thank you for your feedback!");
        onRatingSubmitted(data.orderRating);
        onClose();
        // Reset form
        setFormData({
          overallRating: 0,
          deliveryRating: 0,
          packagingRating: 0,
          customerServiceRating: 0,
          review: "",
          wouldRecommend: null,
          tags: []
        });
      } else {
        toast.error(data.message || "Failed to submit rating");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (category, currentRating, required = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            className={`text-2xl transition-all duration-200 hover:scale-110 ${
              star <= currentRating
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          >
            ⭐
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : required ? "Required" : "Optional"}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                ⭐ Rate Your Order Experience
              </h2>
              <p className="text-blue-100 mt-1">
                Order #{order?._id?.slice(-8) || "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Rate Different Aspects
            </h3>
            
            {ratingCategories.map((category) => (
              <div key={category.key} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-medium text-gray-700">
                    <span className="text-xl">{category.icon}</span>
                    {category.label}
                    {category.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
                {renderStarRating(category.key, formData[category.key], category.required)}
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block font-medium text-gray-700 mb-3">
              💝 Would you recommend us to others?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.wouldRecommend === true
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-green-50"
                }`}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.wouldRecommend === false
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50"
                }`}
              >
                👎 No
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-gray-700 mb-3">
              🏷️ Quick Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    formData.tags.includes(tag)
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              📝 Written Review (Optional)
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              placeholder="Share your detailed experience with this order..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.review.length}/500 characters
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.overallRating === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  ⭐ Submit Rating
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderRatingModal;