import { useEffect, useState } from "react";

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return show ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg z-50 transition-all duration-300"
      aria-label="Back to top"
    >
      ↑
    </button>
  ) : null;
};

export default BackToTop;
