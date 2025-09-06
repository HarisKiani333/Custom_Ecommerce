import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSeller from "../components/BestSeller";
import NewsLetter from "../components/NewsLetter";

const Home = () => {
  return (
    <>
      <div className="mt-10 px-6 md:px-16 lg:px-24 xl:px-32 space-y-16">
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <MainBanner />
        </div>
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <Categories />
        </div>
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <BestSeller />
        </div>
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
          <NewsLetter />
        </div>
      </div>
    </>
  );
};

export default Home;
