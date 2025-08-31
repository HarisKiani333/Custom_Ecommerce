import React, { useState } from "react";

const RatingInput = ({ 
  initialRating = 0, 
  onRatingChange, 
  size = "medium", 
  disabled = false,
  showLabels = true 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (disabled) return;
    if (starValue >= 1 && starValue <= 5) {
      setRating(starValue);
      if (onRatingChange) {
        onRatingChange(starValue);
      }
    }
  };

  const handleStarHover = (starValue) => {
    if (disabled) return;
    if (starValue >= 1 && starValue <= 5) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  const getStarSize = () => {
    switch (size) {
      case "small":
        return "w-5 h-5";
      case "large":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getStarColor = (starValue) => {
    const currentRating = hoverRating || rating;
    if (starValue <= currentRating) {
      return disabled ? "#d1d5db" : "#fbbf24";
    }
    return "#e5e7eb";
  };

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        className="flex items-center space-x-1" 
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={`transition-all duration-200 ${
              disabled 
                ? "cursor-not-allowed" 
                : "cursor-pointer hover:scale-110"
            }`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={disabled}
          >
            <svg
              viewBox="0 0 20 20"
              fill={getStarColor(starValue)}
              className={`${getStarSize()} transition-colors duration-200`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.379 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.379 2.455c-.784.57-1.838-.197-1.539-1.118l1.285-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showLabels && (hoverRating || rating) > 0 && (
        <p className="text-sm text-gray-600 font-medium">
          {ratingLabels[hoverRating || rating]}
        </p>
      )}
    </div>
  );
};

export default RatingInput;