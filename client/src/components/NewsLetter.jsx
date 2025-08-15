import React from "react";

const NewsLetter = () => {
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
          <div className="flex items-center justify-center mt-10 border border-gray-300 focus-within:outline focus-within:outline-green-600 text-sm rounded-full h-14 max-w-xl w-full mx-auto">
            <input
              type="email"
              className="bg-transparent outline-none rounded-full px-4 h-full flex-1 text-black"
              placeholder="Enter your email address"
            />
            <button
              className="bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white rounded-full h-11 mr-1 px-8 text-sm sm:text-base flex items-center justify-center
            cursor-pointer"
            >
              Subscribe now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewsLetter;
