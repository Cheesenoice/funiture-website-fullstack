import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig";
import Cookies from "js-cookie";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [showModal, setShowModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  const getAuthToken = () => {
    const token = Cookies.get("token");
    return token ? `Bearer ${token}` : "";
  };

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") {
      return "N/A";
    }
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Ngày không hợp lệ";
    }
  };

  // Ánh xạ trạng thái đơn hàng sang tiếng Việt
  const translateStatus = (status) => {
    const statusMap = {
      "Receiving orders": "Đang nhận đơn",
      "Order processing": "Đang xử lý",
      "Being delivered": "Đang giao hàng",
      Delivered: "Đã giao",
      Canceled: "Đã hủy",
      "Canceled by user": "Hủy bởi người dùng",
    };
    return statusMap[status] || status; // Trả về trạng thái gốc nếu không có trong map
  };

  // Hàm hủy đơn hàng
  const cancelOrder = async (orderId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showToast("Vui lòng đăng nhập để hủy đơn hàng.", "error");
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/api/v1/order/my-order/cancel/${orderId}`,
        { status: "Canceled" },
        {
          headers: { Authorization: token },
        }
      );

      if (response.data?.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: [
                    ...order.orderStatus,
                    {
                      status: "Canceled by user",
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                }
              : order
          )
        );
        showToast("Hủy đơn hàng thành công.", "success");
      } else {
        showToast(response.data?.message || "Không thể hủy đơn hàng.", "error");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showToast(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
          "error"
        );
      } else {
        showToast("Lỗi khi hủy đơn hàng.", "error");
      }
      console.error("Cancel Order Error:", err);
    } finally {
      setShowModal(false);
      setOrderToCancel(null);
    }
  };

  // Mở modal xác nhận hủy đơn
  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setOrderToCancel(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          showToast("Vui lòng đăng nhập để xem đơn hàng.", "error");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          "http://localhost:3000/api/v1/order/my-order",
          {
            headers: { Authorization: token },
          }
        );

        if (response.data?.success) {
          const sortedOrders = response.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        } else {
          showToast(
            response.data?.message || "Không thể tải danh sách đơn hàng.",
            "error"
          );
        }
      } catch (err) {
        if (err.response?.status === 401) {
          showToast(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
            "error"
          );
        } else {
          showToast("Lỗi kết nối hoặc lỗi máy chủ khi tải đơn hàng.", "error");
        }
        console.error("Fetch Orders Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10 h-40">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-3">Đang tải lịch sử đơn hàng...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Toast */}
      {toast.visible && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            } shadow-lg`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy đơn */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xác nhận hủy đơn hàng</h3>
            <p className="py-4">
              Bạn có chắc chắn muốn hủy đơn hàng #{orderToCancel?.slice(-8)}{" "}
              không?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => cancelOrder(orderToCancel)}
              >
                Hủy đơn
              </button>
              <button className="btn btn-outline" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const totalProductCost = order.product.reduce((sum, item) => {
              const itemPrice =
                item.price * (1 - (item.discountPercentage || 0) / 100);
              return sum + item.quantity * itemPrice;
            }, 0);

            const finalTotal = totalProductCost + (order.shippingFee || 0);

            const currentOrderStatus =
              order.orderStatus && order.orderStatus.length > 0
                ? order.orderStatus[order.orderStatus.length - 1]
                : { status: "Không xác định", updatedAt: null };

            // Kiểm tra xem đơn hàng có bị hủy không để làm mờ nút hủy
            const isCanceled =
              currentOrderStatus.status === "Canceled by user" ||
              currentOrderStatus.status === "Canceled";

            return (
              <div
                key={order._id}
                className="card bg-base-100 shadow-lg border border-gray-200"
              >
                <div className="card-body p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <h3 className="card-title text-lg">
                        Đơn hàng #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ngày đặt: {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col sm:items-end space-y-1">
                      <span className="badge badge-lg badge-info">
                        {translateStatus(currentOrderStatus.status)}
                      </span>
                      <span
                        className={`badge badge-md ${
                          order.paymentStatus === "pending"
                            ? "badge-warning"
                            : order.paymentStatus === "completed"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        Thanh toán:{" "}
                        {order.paymentStatus === "pending"
                          ? "Đang chờ"
                          : order.paymentStatus === "completed"
                          ? "Hoàn thành"
                          : order.paymentStatus}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Cập nhật trạng thái:{" "}
                        {formatDateTime(currentOrderStatus.updatedAt)}
                      </p>
                      {/* Nút hủy đơn hàng */}
                      <button
                        onClick={() => openCancelModal(order._id)}
                        className={`btn btn-error btn-sm mt-2 ${
                          isCanceled ? "btn-disabled opacity-50" : ""
                        }`}
                        disabled={isCanceled}
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Thông tin người nhận</h4>
                    <p>
                      <span className="font-medium">Tên:</span>{" "}
                      {order.user_infor.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.user_infor.email}
                    </p>
                    <p>
                      <span className="font-medium">Địa chỉ:</span>{" "}
                      {order.user_infor.address}
                    </p>
                    <p>
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {order.user_infor.phone}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
                    <div className="space-y-2">
                      {order.product.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center text-sm border-b border-gray-100 pb-1"
                        >
                          <div>
                            <p className="font-medium">
                              SP #{item.product_id.slice(-6)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p>SL: {item.quantity}</p>
                            <p>
                              Đơn giá:{" "}
                              {formatCurrency(
                                item.price *
                                  (1 - (item.discountPercentage || 0) / 100)
                              )}
                            </p>
                            {item.discountPercentage > 0 && (
                              <p className="text-xs text-red-500">
                                (-{item.discountPercentage}%)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                      <span className="font-medium">
                        {formatCurrency(totalProductCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">
                        {formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Phương thức TT:</span>
                      <span className="font-medium">
                        {order.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng (COD)"
                          : order.paymentMethod === "momo"
                          ? "Ví Momo"
                          : order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrder;
