import { useEffect, useState } from "react";
import axios from "axios";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Header from "../../components/Layout/Header/Header";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/v1/cart/", {
          withCredentials: true,
        });
        if (response.data.status === "success") {
          setCart(response.data.data);
        } else {
          setError("Không thể lấy giỏ hàng");
        }
      } catch (err) {
        setError("Lỗi khi lấy giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleDeleteItem = async (productId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/cart/delete/${productId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        const newCount = cart.items.length - 1;
        localStorage.setItem("cartCount", newCount);
        window.dispatchEvent(new Event("storage"));
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.filter((item) => item.product_id !== productId),
        }));
      } else {
        alert("Không thể xóa sản phẩm");
      }
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/v1/cart/update/${productId}`,
        { quantity },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        const updatedItems = cart.items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity, totalPrice: item.priceNew * quantity }
            : item
        );

        const newTotal = updatedItems.reduce(
          (acc, item) => acc + item.totalPrice,
          0
        );

        setCart({ ...cart, items: updatedItems, totalPrice: newTotal });
      } else {
        alert("Không thể cập nhật số lượng");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật số lượng");
    }
  };

  // Hàm xử lý hình ảnh lỗi
  const getValidImage = (image) => {
    return image && image !== "null" && image !== "undefined"
      ? image
      : "/collection/collection-chair.jpg";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center text-gray-500 p-4">
          <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-xl font-semibold">Giỏ hàng của bạn đang trống</p>
          <a href="/" className="btn btn-primary mt-4">
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div
                key={item.product_id}
                className="card bg-base-100 shadow-md flex flex-row sm:flex-row gap-4 p-4"
              >
                <img
                  src={getValidImage(item.image)}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/collection/collection-chair.jpg";
                  }}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    Giá:{" "}
                    <span className="text-primary font-semibold">
                      {parseFloat(item.priceNew).toLocaleString("vi-VN")} ₫
                    </span>
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="join">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            Math.max(item.quantity - 1, 1)
                          )
                        }
                        className="btn btn-sm join-item"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="btn btn-sm join-item bg-base-200 border-base-300 w-12">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                        className="btn btn-sm join-item"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.product_id)}
                      className="btn btn-sm btn-error btn-outline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-base sm:text-lg mt-2 sm:mt-0">
                  {item.totalPrice.toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>

          <div>
            {" "}
            {/* Tóm tắt đơn hàng */}
            <div className="card bg-base-100 shadow-md p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-success">Chưa Tính Toán</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
              <a href="/checkout">
                <button className="btn btn-primary w-full mt-6 text-base">
                  Thanh toán
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
