import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="alert alert-error shadow-lg mb-4">
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
            <strong>Lỗi!</strong> Đã xảy ra lỗi khi hiển thị danh sách đơn hàng:{" "}
            {this.state.error?.message}
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

const UserOrder = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken)
        throw new Error("No access token found. Please log in.");

      const response = await fetch(
        `http://localhost:3000/api/v1/order/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">
            📦 Danh sách đơn hàng
          </h1>
          <Link to="/users" className="btn btn-outline btn-primary">
            Quay lại
          </Link>
        </div>
        {error && (
          <div role="alert" className="alert alert-error shadow-lg mb-4">
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
        {loading && (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="ml-3">Đang tải dữ liệu...</p>
          </div>
        )}
        {!loading && orders.length === 0 && (
          <p className="text-center py-4">Không có đơn hàng nào.</p>
        )}
        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200 text-base-content">
                <tr>
                  <th>#</th>
                  <th>Mã đơn hàng</th>
                  <th>Thông tin người nhận</th>
                  <th>Phương thức thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Phí vận chuyển</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id} className="hover">
                    <td>{index + 1}</td>
                    <td>{order._id}</td>
                    <td>
                      <p>{order.user_infor.name}</p>
                      <p className="text-sm">{order.user_infor.email}</p>
                      <p className="text-sm">{order.user_infor.phone}</p>
                      <p className="text-sm">{order.user_infor.address}</p>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          order.paymentMethod === "cod"
                            ? "badge-info"
                            : "badge-warning"
                        } badge-md`}
                      >
                        {order.paymentMethod === "cod" ? "COD" : "MoMo"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${
                          order.orderStatus[order.orderStatus.length - 1]
                            .status === "Receiving orders"
                            ? "text-primary"
                            : order.orderStatus[order.orderStatus.length - 1]
                                .status === "Order processing"
                            ? "text-secondary"
                            : "text-success"
                        } font-medium`}
                      >
                        {order.orderStatus[order.orderStatus.length - 1].status}
                      </span>
                    </td>
                    <td>
                      {order.shippingFee != null
                        ? order.shippingFee.toLocaleString() + " VNĐ"
                        : "N/A"}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
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
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UserOrder;
