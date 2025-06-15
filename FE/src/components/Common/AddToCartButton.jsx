import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

function AddToCartButton({ productId, disabled }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const cartId = Cookies.get("cartId");

  const handleAddToCart = async () => {
    if (!cartId) {
      alert("Bạn phải đăng nhập trước");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/cart/add/${productId}`,
        { quantity },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setSuccess(true);
        setQuantity(1);

        const res = await axios.get("http://localhost:3000/api/v1/cart/", {
          withCredentials: true,
        });
        const items = res.data?.data?.items || [];
        localStorage.setItem("cartCount", items.length);
        window.dispatchEvent(new Event("storage"));

        // Reset success state after a short delay
        setTimeout(() => {
          setSuccess(false);
        }, 50);
      } else {
        throw new Error(response.data.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      alert(
        "Lỗi khi thêm vào giỏ hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Dropdown Trigger */}
      <div className="dropdown dropdown-top w-full">
        <div
          tabIndex={0}
          role="button"
          className={`btn btn-outline btn-primary btn-sm w-full ${
            disabled ? "btn-disabled" : ""
          } ${success ? "btn-success" : ""}`}
          // Removed the isLoading from the disabled condition
          disabled={disabled}
        >
          {success ? "Thêm thành công!" : "Thêm vào giỏ"}
        </div>

        {/* Dropdown Content */}
        {!success && (
          <div
            tabIndex={0}
            className="dropdown-content z-30 bg-base-100 rounded-box w-full shadow p-4"
          >
            <h3 className="font-semibold text-sm mb-2 text-center">
              Chọn số lượng
            </h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isLoading}
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={isLoading}
              >
                +
              </button>
            </div>

            <button
              className={`btn btn-primary btn-sm w-full ${
                isLoading ? "loading" : ""
              }`}
              onClick={handleAddToCart}
              // Removed the isLoading from the disabled condition
              // disabled={isLoading}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddToCartButton;
