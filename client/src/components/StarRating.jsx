const StarRating = ({ rating, size = "small", showRatingText = false }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    // Determine star size based on size prop
    const starSize = size === "large" ? "w-4 h-4" : "w-3 h-3";
    const fillColor = size === "large" ? "#615fff" : "#facc15";
    const emptyColor = size === "large" ? "#615fff" : "#e5e7eb";
    const emptyOpacity = size === "large" ? "0.35" : "1";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          viewBox="0 0 20 20"
          fill={fillColor}
          className={starSize}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.379 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.379 2.455c-.784.57-1.838-.197-1.539-1.118l1.285-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
        </svg>
      );
    }

    // Half star
    if (hasHalf) {
      stars.push(
        <svg
          key="half"
          viewBox="0 0 20 20"
          className={starSize}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 15.273l-4.043 2.938 1.286-3.97a1 1 0 00-.364-1.118L3.5 10.668l4.174-.001a1 1 0 00.95-.69L10 6.007v9.266z"
            fill={fillColor}
          />
          <path
            d="M10 13.347l3.379 2.455c.784.57 1.838-.197 1.539-1.118l-1.286-3.97a1 1 0 01.364-1.118l3.379-2.455c.783-.57.38-1.81-.588-1.81h-4.174a1 1 0 01-.95-.69L10.95 2.927c-.3-.921-1.603-.921-1.902 0L10 6.007v7.34z"
            fill="#e5e7eb"
          />
        </svg>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          viewBox="0 0 20 20"
          fill={emptyColor}
          fillOpacity={emptyOpacity}
          className={starSize}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.379 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.379 2.455c-.784.57-1.838-.197-1.539-1.118l1.285-3.97a1 1 0 00-.364-1.118L2.623 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div
      className={`flex items-center ${
        size === "large" ? "gap-0.5" : "gap-[2px]"
      }`}
    >
      {renderStars(rating)}
      {showRatingText && (
        <p
          className={`ml-2 ${
            size === "large" ? "text-base" : "text-[11px] text-gray-400"
          }`}
        >
          ({rating})
        </p>
      )}
    </div>
  );
};

export default StarRating;
