import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ShoppingCart, Heart } from "lucide-react";

const HeaderMain = () => {
  const [cartCount, setCartCount] = useState(
    parseInt(localStorage.getItem("cartCount") || "0", 10)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setCartCount(parseInt(localStorage.getItem("cartCount") || "0", 10));
    };

    window.addEventListener("storage", handleStorageChange);
    fetchCartCount();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/cart/", {
        withCredentials: true,
      });
      const items = res.data?.data?.items || [];
      const count = items.length;
      setCartCount(count);
      localStorage.setItem("cartCount", count);
    } catch (err) {
      setCartCount(0);
      localStorage.setItem("cartCount", 0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productscollection/search/${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="z-50 bg-primary text-gray-100 py-4 px-4 flex flex-row justify-between items-center shadow-md">
      <div className="flex items-center space-x-6">
        <Link to="/" className="group">
          <h1 className="text-2xl font-bold transition-transform duration-200 group-hover:scale-105 active:scale-95">
            MUJI
          </h1>
        </Link>
        <nav className="hidden md:flex space-x-4 font-semibold">
          <Link to="/productscollection/new" className="underline-hover">
            Hàng Mới
          </Link>
          <Link to="/productscollection/featured" className="underline-hover">
            Nổi Bật
          </Link>
          <Link to="/productscollection/" className="underline-hover">
            Tất cả sản phẩm
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4 flex-grow justify-end">
        <form
          onSubmit={handleSearch}
          className="relative flex-grow max-w-[200px]"
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input input-bordered bg-gray-100 w-full text-black text-sm py-1 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-gray-500" />
          </button>
        </form>

        <div className="relative flex-shrink-0">
          <button className="cursor-pointer">
            <Heart className="text-gray-100 w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full px-1.5">
              0
            </span>
          </button>
        </div>

        <div className="relative flex-shrink-0">
          <Link to="/cart" className="cursor-pointer relative block">
            <ShoppingCart className="text-gray-100 w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full px-1.5">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderMain;
