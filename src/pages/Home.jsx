import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSeller from "../components/BestSeller";
import NewsLetter from "../components/NewsLetter";

const Home = () => {
  return (
    <>
      <div className="mt-10 px-6 md:px-16 lg:px-24 xl:px-32">
        <MainBanner />
        <Categories />
        <BestSeller />
        <NewsLetter />
      </div>
    </>
  );
};

export default Home;
