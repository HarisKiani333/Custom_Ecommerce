import React, { useState } from "react";
import { toast } from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully subscribed to newsletter! 🎉");
        setEmail(""); // Clear the input
      } else {
        // Handle specific error types from enhanced backend error handling
        if (data.error === 'EMAIL_CONFIG_MISSING') {
          toast.error("Newsletter service is currently unavailable. Please try again later.");
        } else if (data.error === 'EMAIL_CONFIG_INCOMPLETE') {
          toast.error("Newsletter service is currently being configured. Please try again later.");
        } else if (data.error === 'EMAIL_AUTH_FAILED') {
          toast.error("Email service authentication failed. Please try again later.");
        } else if (data.error === 'EMAIL_CONNECTION_FAILED') {
          toast.error("Unable to connect to email service. Please try again later.");
        } else {
          toast.error(data.message || "Failed to subscribe. Please try again.");
        }
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 md:mt-24">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="max-w-lg mx-auto font-semibold text-2xl sm:text-4xl text-gray-700">
          Never Miss a Deal
        </h1>

        <p className="max-w-lg mx-auto text-gray-500 font-medium text-sm sm:text-base mt-2">
          Subscribe to our newsletter & get the latest news
        </p>

        <div className="w-full px-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center mt-6 sm:mt-10 border border-gray-300 focus-within:outline focus-within:outline-green-600 text-xs sm:text-sm rounded-full h-11 sm:h-14 max-w-sm sm:max-w-xl w-full mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none rounded-full px-4 h-full flex-1 text-black"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 cursor-pointer"
                } transition-colors duration-200 text-white rounded-full h-9 sm:h-11 mr-1 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base flex items-center justify-center font-medium`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  "Subscribe now"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default NewsLetter;
