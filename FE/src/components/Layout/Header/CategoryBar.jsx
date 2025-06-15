import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { categoryService } from "../../../api";

const CACHE_KEY = "categories_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ (miliseconds)

const CategoryBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async (forceRefresh = false) => {
      try {
        // Kiểm tra cache trong sessionStorage
        if (!forceRefresh) {
          const cachedData = sessionStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            const isCacheValid = Date.now() - timestamp < CACHE_DURATION;
            if (isCacheValid) {
              if (isMounted) {
                setCategories(data);
                setIsLoading(false);
              }
              return;
            }
          }
        }

        // Fetch dữ liệu mới nếu không có cache hoặc cache hết hạn
        setIsLoading(true);
        const response = await categoryService.getCategories();
        if (isMounted && response.success) {
          const newData = response.data;
          setCategories(newData);
          // Lưu vào sessionStorage cùng với timestamp
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newData, timestamp: Date.now() })
          );
        } else {
          console.error("Failed to fetch categories:", response.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false; // Cleanup để tránh setState trên component unmounted
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setOpenDropdown(null);
  };

  const toggleDropdown = (categoryId) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  // Hàm để làm mới dữ liệu thủ công
  const refreshCategories = () => {
    setCategories([]); // Xóa danh mục hiện tại để kích hoạt skeleton
    fetchCategories(true); // Force fetch dữ liệu mới
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 py-2 px-6">
        <div className="animate-pulse flex space-x-4 justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 rounded w-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-2 px-6">
      {/* Nút làm mới dữ liệu (tùy chọn, chỉ hiển thị trên mobile) */}
      <button
        onClick={refreshCategories}
        className="md:hidden text-sm text-blue-600 hover:underline mb-2"
      >
        Làm mới danh mục
      </button>

      {/* Drawer (Mobile) */}
      <div className="drawer md:hidden">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="my-drawer"
            className="flex items-center space-x-2 cursor-pointer text-black"
            onClick={toggleSidebar}
          >
            <Menu className="w-6 h-6" />
            <p className="text-base font-medium">Danh mục</p>
          </label>
        </div>
        <div className="drawer-side z-50">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-64 p-4 space-y-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <li key={category.category_id}>
                  <details>
                    <summary className="hover:text-primary font-medium">
                      <Link
                        to={`/productscollection/category/${category.description}`}
                        state={{ categoryName: category.name }}
                      >
                        {category.name}
                      </Link>
                    </summary>
                    {category.subcategories.length > 0 && (
                      <ul className="ml-4 space-y-2 pt-3">
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory.category_id}>
                            <Link
                              to={`/productscollection/category/${subcategory.description}`}
                              state={{ categoryName: subcategory.name }}
                              className="block hover:text-primary font-medium"
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              ))
            ) : (
              <li>Không có danh mục</li>
            )}
          </ul>
        </div>
      </div>

      {/* Category List (Desktop) */}
      <ul className="hidden flex-wrap md:flex space-x-6 justify-center">
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.category_id} className="dropdown dropdown-hover">
              <Link
                to={`/productscollection/category/${category.description}`}
                state={{ categoryName: category.name }}
                className="hover:text-primary font-medium py-2 flex items-center cursor-pointer"
                onClick={() => toggleDropdown(category.category_id)}
              >
                {category.name}
                {category.subcategories.length > 0 && (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Link>
              {category.subcategories.length > 0 && (
                <ul className="dropdown-content menu bg-white shadow-lg rounded-md w-48 p-2">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.category_id}>
                      <Link
                        to={`/productscollection/category/${subcategory.description}`}
                        state={{ categoryName: subcategory.name }}
                        className="block px-4 py-2 hover:bg-gray-200"
                      >
                        {subcategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        ) : (
          <li>Không có danh mục</li>
        )}
      </ul>
    </div>
  );
};

export default CategoryBar;
