import React from "react";
import mainBanner from "../assets/img/main_banner.jpg";
import blackArrow from "../assets/img/black_arrow-icon.png";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Banner Images */}
      <div className="relative">
        <img
          src={mainBanner}
          alt="Main Banner"
          className="w-full hidden md:block transition-transform duration-700 hover:scale-105"
        />
        <img
          src={mainBanner}
          alt="Mb:Main Banner"
          className="w-full md:hidden transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      </div>

      {/* Overlay Content - Centered */}
      <div className="absolute inset-0 flex justify-center items-center px-4 mt-10">
        <div className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          {/* Buttons Side-by-Side (Oval Style) */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {/* Shop Now Button */}
            <Link
              to="/products"
              className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 sm:px-6 md:px-8 sm:py-3 rounded-full transition-all duration-300 font-medium sm:font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="hidden xs:inline">🛒</span> Shop Now!
              <img
                className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-2"
                src={blackArrow}
                alt="arrow"
              />
            </Link>

            {/* Explore Deals Button — Responsive and hidden on very small screens */}
            <Link
              to="/products"
              className="group hidden xs:flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 sm:px-6 md:px-8 sm:py-3 rounded-full transition-all duration-300 font-medium sm:font-semibold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="hidden sm:inline">✨</span> 
              <span className="hidden sm:inline">Explore Exclusive </span>Deals
              <img
                className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-2"
                src={blackArrow}
                alt="arrow"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
