import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

/**
 * Enhanced Modular Loader Component
 *
 * Features:
 * - Configurable loading states and messages
 * - Multiple spinner types and sizes
 * - Progress indication
 * - Customizable delays and transitions
 * - Maintains existing Stripe payment functionality
 * - Performance optimized with minimal re-renders
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Loader type: 'payment', 'navigation', 'data', 'custom'
 * @param {string} props.message - Custom loading message
 * @param {number} props.delay - Redirect delay in milliseconds (default: 2000)
 * @param {string} props.size - Spinner size: 'small', 'medium', 'large'
 * @param {string} props.variant - Spinner variant: 'spin', 'pulse', 'bounce', 'dots'
 * @param {boolean} props.showProgress - Show progress indicator
 * @param {Function} props.onComplete - Callback when loading completes
 * @param {string} props.redirectTo - Custom redirect path
 */
const Loader = ({
  type = "navigation",
  message = null,
  delay = 2000,
  size = "medium",
  variant = "spin",
  showProgress = false,
  onComplete = null,
  redirectTo = null,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCartItems } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  // Get URL parameters for backward compatibility
  const nextPage = searchParams.get("next");
  const isPaymentFlow = nextPage === "my-orders" || type === "payment";

  // Determine final redirect path
  const finalRedirectPath =
    redirectTo ||
    (nextPage === "my-orders"
      ? "/my-orders"
      : nextPage === "cart"
      ? "/cart"
      : nextPage
      ? `/${nextPage}`
      : "/");

  // Loading messages based on type
  const getLoadingMessage = () => {
    if (message) return message;

    switch (type) {
      case "payment":
        return isPaymentFlow
          ? "Processing your payment..."
          : "Processing transaction...";
      case "navigation":
        return "Loading page...";
      case "data":
        return "Loading data...";
      case "custom":
        return "Please wait...";
      default:
        return nextPage === "my-orders"
          ? "Processing your payment..."
          : "Redirecting...";
    }
  };

  // Spinner size classes
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-8 w-8";
      case "large":
        return "h-16 w-16";
      default:
        return "h-12 w-12";
    }
  };

  // Spinner variants
  const renderSpinner = () => {
    const sizeClasses = getSizeClasses();

    switch (variant) {
      case "pulse":
        return (
          <div
            className={`${sizeClasses} bg-green-600 rounded-full animate-pulse mx-auto`}
          ></div>
        );

      case "bounce":
        return (
          <div className="flex space-x-2 justify-center items-center mx-auto">
            <div className="h-3 w-3 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-green-600 rounded-full animate-bounce"></div>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1 justify-center items-center mx-auto">
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        );

      default: // 'spin'
        return (
          <div
            className={`animate-spin rounded-full ${sizeClasses} border-b-2 border-green-600 mx-auto`}
          ></div>
        );
    }
  };

  useEffect(() => {
    // Set initial message
    setCurrentMessage(getLoadingMessage());

    // Handle payment flow logic (maintain existing functionality)
    if (isPaymentFlow) {
      setCartItems({});
      toast.success("Payment successful! Order placed.");
    }

    // Progress animation
    if (showProgress && delay > 0) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = 100 / (delay / 50);
          return Math.min(prev + increment, 100);
        });
      }, 50);

      return () => clearInterval(progressInterval);
    }
  }, []);

  useEffect(() => {
    // Handle redirect with configurable delay
    if (delay > 0) {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate(finalRedirectPath);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, navigate, finalRedirectPath, onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Spinner */}
        <div className="mb-6">{renderSpinner()}</div>

        {/* Loading Message */}
        <p className="text-gray-600 text-base font-medium mb-4">
          {currentMessage}
        </p>

        {/* Progress Bar */}
        {showProgress && delay > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Additional Info for Payment Flow */}
        {isPaymentFlow && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-700 font-medium">
                Payment Successful
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
