import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Package, Truck, Home, X } from "lucide-react";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Fetch order details
  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/order/all-orders",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();

      console.log("API Response:", result);

      if (result.success) {
        const selectedOrder = result.data.find((o) => o._id === orderId);
        if (selectedOrder) {
          setOrder(selectedOrder);
        } else {
          setError(
            "Order not found. It may have been deleted or does not exist."
          );
          setOrder(null);
        }
      } else {
        throw new Error(result.message || "Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedStatus) {
      setUpdateError("Vui lòng chọn trạng thái trước khi cập nhật.");
      return;
    }

    setLoading(true);
    setUpdateMessage(null);
    setUpdateError(null);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/order/update-status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setUpdateMessage(result.message);
        setOrder(result.data);
        setSelectedStatus(null); // Reset selected status after successful update
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setUpdateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format currency with NaN handling
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (
      isNaN(numericAmount) ||
      numericAmount === null ||
      numericAmount === undefined
    ) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericAmount);
  };

  // Calculate total price with validation
  const calculateTotalPrice = (order) => {
    if (!order || !order.product) return 0;
    const productTotal = order.product.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const discountPercentage = Number(item.discountPercentage) || 0;
      return sum + price * quantity * (1 - discountPercentage / 100);
    }, 0);
    const shippingFee = Number(order.shippingFee) || 0;
    return productTotal + shippingFee;
  };

  // Fetch order on mount
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Redirect to orders list if error persists
  useEffect(() => {
    if (error && !loading) {
      const timer = setTimeout(() => {
        navigate("/admin/orders", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, loading, navigate]);

  // Get the latest status and check for cancellation
  const getLatestStatus = () => {
    return (
      order?.orderStatus[order.orderStatus.length - 1]?.status ||
      "Receiving orders"
    );
  };

  const isCanceled = () =>
    ["Canceled", "Canceled by user"].includes(getLatestStatus());

  // Determine if a status is completed
  const isStatusCompleted = (status) => {
    if (isCanceled()) {
      return (
        order?.orderStatus.some((s) => s.status === status) &&
        status !== "Canceled"
      );
    }
    const statuses = order?.orderStatus.map((s) => s.status) || [];
    const statusOrder = {
      "Receiving orders": 1,
      "Order processing": 2,
      "Being delivered": 3,
      Delivered: 4,
      Canceled: 5,
    };
    const latestStatusIndex = statusOrder[getLatestStatus()] || 0;
    const currentStatusIndex = statusOrder[status] || 0;
    return currentStatusIndex <= latestStatusIndex && status !== "Canceled";
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setUpdateError(null); // Clear any previous update errors
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Chi tiết đơn hàng</h1>
        <button
          className="btn btn-outline btn-primary"
          onClick={() => navigate("/admin/orders")}
        >
          ← Quay lại
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="alert alert-error shadow-lg mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Lỗi!</strong> {error} Redirecting to orders list...
          </span>
        </div>
      )}

      {/* Update Status Feedback */}
      {updateMessage && (
        <div role="alert" className="alert alert-success shadow-lg mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{updateMessage}</span>
        </div>
      )}
      {updateError && (
        <div role="alert" className="alert alert-error shadow-lg mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{updateError}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-3">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Order Details */}
      {!loading && order && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Họ tên</span>
                    </label>
                    <p className="font-medium">{order.user_infor.name}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <p className="font-medium">{order.user_infor.email}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Số điện thoại
                      </span>
                    </label>
                    <p className="font-medium">{order.user_infor.phone}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Địa chỉ</span>
                    </label>
                    <p className="font-medium">{order.user_infor.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Phương thức thanh toán
                      </span>
                    </label>
                    <p className="font-medium">
                      {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Trạng thái thanh toán
                      </span>
                    </label>
                    <p className="font-medium">
                      <span
                        className={`badge ${
                          order.paymentStatus === "pending"
                            ? "badge-warning"
                            : "badge-success"
                        } badge-md`}
                      >
                        {order.paymentStatus === "pending"
                          ? "Đang chờ"
                          : "Đã thanh toán"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Phí vận chuyển
                      </span>
                    </label>
                    <p className="font-medium">
                      {formatCurrency(order.shippingFee)}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Tổng tiền
                      </span>
                    </label>
                    <p className="font-medium text-lg text-success">
                      {formatCurrency(calculateTotalPrice(order))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Sản phẩm
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID Sản phẩm</th>
                      <th>Giá</th>
                      <th>Giảm giá</th>
                      <th>Số lượng</th>
                      <th>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.product.map((item, index) => {
                      const price = Number(item.price) || 0;
                      const quantity = Number(item.quantity) || 0;
                      const discountPercentage =
                        Number(item.discountPercentage) || 0;
                      const itemTotal =
                        price * quantity * (1 - discountPercentage / 100);
                      return (
                        <tr key={item._id}>
                          <td>{index + 1}</td>
                          <td>{item.product_id}</td>
                          <td>{formatCurrency(price)}</td>
                          <td>{discountPercentage}%</td>
                          <td>{quantity}</td>
                          <td>{formatCurrency(itemTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Lịch sử trạng thái
              </h2>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-1 bg-gray-200 absolute top-6 left-10 right-10"></div>
                  {[
                    {
                      status: "Receiving orders",
                      label: "Đã đặt hàng",
                      icon: ShoppingBag,
                    },
                    {
                      status: "Order processing",
                      label: "Đã đóng gói",
                      icon: Package,
                    },
                    {
                      status: "Being delivered",
                      label: "Đang giao",
                      icon: Truck,
                    },
                    { status: "Delivered", label: "Đã giao", icon: Home },
                  ].map((step, index, steps) => {
                    const isCompleted = isStatusCompleted(step.status);
                    const isSelected = selectedStatus === step.status;
                    const isLast = index === steps.length - 1;

                    // Find the status entry to get the timestamp
                    const statusEntry = order?.orderStatus.find(
                      (s) => s.status === step.status
                    );
                    const timestamp = statusEntry
                      ? new Date(statusEntry.updatedAt).toLocaleString()
                      : "";

                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center relative z-10"
                      >
                        <button
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? "bg-primary text-white"
                              : isCompleted && !isCanceled()
                              ? "bg-success text-white"
                              : isCanceled()
                              ? "bg-base-100 text-gray-500"
                              : "bg-gray-200 text-gray-500 hover:bg-primary hover:text-white"
                          }`}
                          onClick={() => handleStatusSelect(step.status)}
                        >
                          <step.icon size={24} />
                        </button>
                        <span
                          className={`mt-2 text-sm font-medium text-center ${
                            isSelected
                              ? "text-primary"
                              : isCompleted && !isCanceled()
                              ? "text-success"
                              : isCanceled()
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span
                          className={`mt-1 text-xs text-center ${
                            isSelected
                              ? "text-primary"
                              : isCompleted && !isCanceled()
                              ? "text-success"
                              : isCanceled()
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {timestamp}
                        </span>
                        {!isLast && (
                          <div
                            className={`absolute top-6 h-1 ${
                              isCompleted && !isCanceled()
                                ? "bg-success"
                                : "bg-gray-200"
                            }`}
                            style={{
                              left: "50%",
                              width: `calc(${
                                100 / (steps.length - 1)
                              }% - 3rem)`,
                              transform: "translateX(-50%)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canceled Status */}
              <div className="mt-6 flex justify-center">
                <div className="flex flex-col items-center">
                  <button
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedStatus === "Canceled"
                        ? "bg-primary text-white"
                        : isCanceled()
                        ? "bg-error text-white"
                        : "bg-gray-200 text-gray-500 hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => handleStatusSelect("Canceled")}
                  >
                    <X size={24} />
                  </button>
                  <span
                    className={`mt-2 text-sm font-medium text-center ${
                      selectedStatus === "Canceled"
                        ? "text-primary"
                        : isCanceled()
                        ? "text-error"
                        : "text-gray-500"
                    }`}
                  >
                    Đã hủy
                  </span>
                  <span
                    className={`mt-1 text-xs text-center ${
                      selectedStatus === "Canceled"
                        ? "text-primary"
                        : isCanceled()
                        ? "text-error"
                        : "text-gray-500"
                    }`}
                  >
                    {order?.orderStatus.find((s) => s.status === "Canceled")
                      ? new Date(
                          order.orderStatus.find(
                            (s) => s.status === "Canceled"
                          ).updatedAt
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>

              {/* Update Button */}
              <div className="mt-4 flex justify-end">
                <button
                  className="btn btn-primary"
                  onClick={updateOrderStatus}
                  disabled={loading || !selectedStatus}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Cập nhật trạng thái"
                  )}
                </button>
              </div>
            </div>

            {/* Order Metadata */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Ngày tạo</span>
                </label>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Ngày cập nhật
                  </span>
                </label>
                <p className="font-medium">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
