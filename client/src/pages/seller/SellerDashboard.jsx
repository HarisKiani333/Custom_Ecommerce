import { PackagePlus, PackageSearch, PackageCheck } from "lucide-react";
import Logo from "../../assets/img/husk_logo.png";
import { useAppContext } from "../../context/AppContext";
import { Link, NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";

const SellerDashboard = () => {
  const sidebarLinks = [
    { name: "Add Product", path: "/seller/add-product", icon: <PackagePlus /> },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: <PackageSearch />,
    },
    { name: "Order List", path: "/seller/order-list", icon: <PackageCheck />},
  ];

  const { navigate, axios, setIsSeller } = useAppContext();

const handleLogout = async () => {
  try {
    const { data } = await axios.get("/api/seller/logout");
      console.log(data);

    if (data.success || data.message === "Logout Successful") {
      toast.success(data.message || "Logout Successful");
      setIsSeller(false);
      navigate("/seller-login");
    } else {
      console.log(data);

      toast.error(data.message || "Logout failed");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Network error, please try again");
  }
};

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-4 bg-gradient-to-r from-white to-gray-50 shadow-sm transition-all duration-300 animate-in fade-in-50 duration-700">
        <Link to="/" className="transform hover:scale-105 transition-transform duration-300">
          <img className="h-14 drop-shadow-sm" src={Logo} alt="Home Logo" />
        </Link>
        <div className="flex items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-500 delay-200">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">👨‍💼</span>
            </div>
            <p className="font-medium text-gray-700">Admin</p>
          </div>
          <button
            onClick={() => {
              handleLogout();
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer font-medium shadow-lg hover:shadow-xl transform hover:scale-105 animate-in slide-in-from-right-4 duration-500 delay-300"
          >
            Logout ⏻
          </button>
        </div>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        <div className="md:w-64 w-16 border-r border-gray-200 bg-white shadow-lg text-base pt-6 flex flex-col transition-all duration-300 animate-in slide-in-from-left-4 duration-700 delay-100">
          <div className="px-4 mb-6 animate-in fade-in-50 duration-500 delay-400">
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent md:block hidden">
               Seller Panel
            </h3>
          </div>
          
          {sidebarLinks.map((item, index) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) => `flex items-center py-4 px-4 gap-3 mx-2 rounded-xl mb-2 transition-all duration-300 group animate-in slide-in-from-left-4 duration-500
                            ${
                              isActive
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                                : "hover:bg-gray-100 text-gray-600 hover:text-green-600 hover:shadow-md hover:transform hover:scale-102"
                            }
                            `}
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${
                ({ isActive }) => isActive ? "text-white" : "text-gray-500"
              }`}>
                {item.icon}
              </div>
              <div className="md:block hidden">
                <p className="font-medium">{item.name}</p>
                <span className="text-xs opacity-75">{item.emoji}</span>
              </div>
            </NavLink>
          ))}
          
          <div className="mt-auto p-4 border-t border-gray-200 animate-in fade-in-50 duration-500 delay-800">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl md:block hidden">
              <p className="text-xs text-green-700 font-medium">💡 Quick Tip</p>
              <p className="text-xs text-green-600 mt-1">Use keyboard shortcuts for faster navigation!</p>
            </div>
          </div>
        </div>

        <div className="flex-1 animate-in fade-in-50 duration-700 delay-200">
          <Outlet />
        </div>
      </div>
    </>
  );
};
export default SellerDashboard;
