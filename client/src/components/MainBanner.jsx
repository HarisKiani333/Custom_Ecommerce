import React from "react";
import mainBanner from "../assets/img/main_banner.jpg";
import blackArrow from "../assets/img/black_arrow-icon.png";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative w-full">
      {/* Banner Images */}
      <img
        src={mainBanner}
        alt="Main Banner"
        className="w-full hidden md:block"
      />
      <img src={mainBanner} alt="Mb:Main Banner" className="w-full md:hidden" />

      {/* Overlay Content - Centered */}
      <div className="absolute inset-0 flex justify-center items-center px-4 mt-10">
        <div className="text-center">
          {/* Buttons Side-by-Side (Oval Style) */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {/* Shop Now Button */}
            <Link
              to="/products"
              className="group flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full transition font-medium hover:bg-green-700 hover:shadow-lg"
            >
              Shop Now!
              <img
                className="w-4 h-4 transition group-hover:translate-x-1"
                src={blackArrow}
                alt="arrow"
              />
            </Link>

            {/* Explore Deals Button — Oval and hidden on small screens */}
            <Link
              to="/products"
              className="group hidden md:flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full transition font-medium hover:bg-green-700 hover:shadow-lg"
            >
              Explore Exclusive Deals
              <img
                className="w-4 h-4 transition group-hover:translate-x-1"
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
