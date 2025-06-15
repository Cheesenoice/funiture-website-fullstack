import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  // Fetch all orders
  const fetchOrders = async () => {
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

      if (result.success) {
        setOrders(result.data);
        setFilteredOrders(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      setOrders([]);
      setFilteredOrders([]);
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

  // Get the latest status of an order
  const getLatestStatus = (order) => {
    return (
      order?.orderStatus[order.orderStatus.length - 1]?.status ||
      "Receiving orders"
    );
  };

  // Filter orders by status and search term
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => getLatestStatus(order) === statusFilter
      );
    }

    // Filter by search term (customer name)
    if (searchTerm.trim()) {
      filtered = filtered.filter((order) =>
        order.user_infor.name
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [statusFilter, searchTerm, orders]);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Quản lý đơn hàng</h1>

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
            <strong>Lỗi!</strong> {error}
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-3">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div>
          {/* Search by Customer Name */}
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">
                Tìm kiếm theo tên khách hàng
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="Nhập tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter by Status */}
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">
                Lọc theo trạng thái
              </span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="Receiving orders">Đã đặt hàng</option>
              <option value="Order processing">Đã đóng gói</option>
              <option value="Being delivered">Đang giao</option>
              <option value="Delivered">Đã giao</option>
              <option value="Canceled">Đã hủy</option>
              <option value="Canceled by user">Hủy bởi người dùng</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID Đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Thời gian đặt đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td>{order._id}</td>
                    <td>{order.user_infor.name}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{formatCurrency(calculateTotalPrice(order))}</td>
                    <td>
                      <span
                        className={`badge ${
                          getLatestStatus(order) === "Receiving orders"
                            ? "badge-info"
                            : getLatestStatus(order) === "Order processing"
                            ? "badge-warning"
                            : getLatestStatus(order) === "Being delivered"
                            ? "badge-primary"
                            : getLatestStatus(order) === "Delivered"
                            ? "badge-success"
                            : getLatestStatus(order) === "Canceled"
                            ? "badge-error"
                            : "badge-error"
                        } badge-md`}
                      >
                        {getLatestStatus(order) === "Receiving orders"
                          ? "Đã đặt hàng"
                          : getLatestStatus(order) === "Order processing"
                          ? "Đã đóng gói"
                          : getLatestStatus(order) === "Being delivered"
                          ? "Đang giao"
                          : getLatestStatus(order) === "Delivered"
                          ? "Đã giao"
                          : getLatestStatus(order) === "Canceled"
                          ? "Đã hủy"
                          : "Hủy bởi người dùng"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Orders Message */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Không có đơn hàng nào để hiển thị.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
