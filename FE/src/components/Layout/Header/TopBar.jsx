import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const TopBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!Cookies.get("token");

  const handleLogout = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
    localStorage.removeItem("cartCount");
    navigate("/");
  };

  return (
    <div className="bg-gray-100 text-black text-sm py-2 px-4 flex sm:flex-row justify-between items-center transition-all duration-300">
      <span className="text-center sm:text-left">
        Miễn phí vận chuyển cho mọi đơn hàng từ 999.000 VNĐ - Hotline
        1900-2555-79
      </span>
      <div className="flex space-x-2 mt-2 sm:mt-0">
        {isLoggedIn && (
          <Link
            to="/account"
            className="hover:text-primary cursor-pointer underline-hover"
          >
            Tài khoản của tôi
          </Link>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="hover:text-primary cursor-pointer underline-hover"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            to="/login"
            className="hover:text-primary cursor-pointer underline-hover"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopBar;
