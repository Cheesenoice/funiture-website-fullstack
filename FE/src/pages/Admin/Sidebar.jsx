import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Menu,
  X,
  Home,
  Users,
  Package,
  Folder,
  LogOut,
  ChevronDown,
  ChevronUp,
  Newspaper,
  Truck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    {
      icon: Package,
      label: "Sản phẩm",
      path: "/admin/products",
      children: [
        { label: "Featured Product", path: "/admin/products/featured" },
        { label: "Product List", path: "/admin/products" },
        { label: "Add Product", path: "/admin/products/add" },
      ],
    },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Folder, label: "Danh mục", path: "/admin/categories" },
    { icon: Package, label: "Đơn hàng", path: "/admin/orders" },
    { icon: Newspaper, label: "Blog", path: "/admin/blog" },
    { icon: Truck, label: "Phí vận chuyển", path: "/admin/shippingfee" },
  ];

  const handleLogout = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleProductsSubMenu = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-primary text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-base-100 to-base-200 shadow-xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out rounded-r-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-base-300">
            <h2 className="mt-10 lg:mt-0 text-3xl font-bold text-primary tracking-wide">
              Admin Panel
            </h2>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              if (item.children) {
                const isParentActive = location.pathname.startsWith(item.path);
                return (
                  <div key={index}>
                    <button
                      onClick={toggleProductsSubMenu}
                      className={`flex items-center justify-between w-full gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                        isParentActive
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-primary/10 text-base-content"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      {isProductsOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    {isProductsOpen && (
                      <div className="ml-6 mt-2 space-y-2">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.path}
                            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                              location.pathname === child.path
                                ? "bg-primary text-white shadow-md"
                                : "hover:bg-primary/10 text-base-content"
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-primary/10 text-base-content"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-base-300">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-error hover:text-white text-base-content transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
