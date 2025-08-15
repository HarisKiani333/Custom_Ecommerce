import { PackagePlus, PackageSearch, PackageCheck } from "lucide-react";
import Logo from "../../assets/img/husk_logo.png";
import { useAppContext } from "../../context/AppContext";
import { Link, NavLink, Outlet } from "react-router-dom";
import * as Icons from "lucide-react";


const SellerDashboard = () => {
  
  
  const sidebarLinks = [
    { name: "Add Product", path: "/seller/add-product", icon: <PackagePlus /> },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: <PackageSearch />,
    },
    { name: "Order List", path: "/seller/order-list", icon: <PackageCheck /> },
  ];

  const { setIsSeller } = useAppContext();

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <Link to="/">
          <img className="h-14" src={Logo} alt="Home Logo" />
        </Link>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button
            onClick={() => {
              setIsSeller(false);
              navigate("/seller-login");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300
            cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) => `flex items-center py-3 px-4 gap-3 
                            ${
                              isActive
                                ? "border-r-4 md:border-r-[6px]  border-green-500 text-green-600"
                                : "hover:bg-gray-100/90 border-white"
                            }
                            }`}
            >
              {item.icon}
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>

        <Outlet />
      </div>
    </>
  );
};
export default SellerDashboard;
