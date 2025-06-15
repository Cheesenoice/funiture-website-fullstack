import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalInventoryValue: 0,
    topProducts: [],
    orderStatusStats: {},
    lowStockProducts: [],
    neverSoldProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const [
          totalProductsRes,
          totalUsersRes,
          totalRevenueRes,
          totalInventoryValueRes,
          topProductsRes,
          orderStatusRes,
          lowStockProductsRes,
          neverSoldProductsRes,
        ] = await Promise.all([
          fetch("http://localhost:3000/api/v1/dashboard/total-products"),
          fetch("http://localhost:3000/api/v1/dashboard/total-users"),
          fetch("http://localhost:3000/api/v1/dashboard/total-revenue"),
          fetch("http://localhost:3000/api/v1/dashboard/total-inventory-value"),
          fetch("http://localhost:3000/api/v1/dashboard/top-products"),
          fetch("http://localhost:3000/api/v1/dashboard/order-status-stats"),
          fetch("http://localhost:3000/api/v1/dashboard/low-stock-products"),
          fetch("http://localhost:3000/api/v1/dashboard/never-sold-products"),
        ]);

        const [
          totalProductsData,
          totalUsersData,
          totalRevenueData,
          totalInventoryValueData,
          topProductsData,
          orderStatusData,
          lowStockProductsData,
          neverSoldProductsData,
        ] = await Promise.all([
          totalProductsRes.json(),
          totalUsersRes.json(),
          totalRevenueRes.json(),
          totalInventoryValueRes.json(),
          topProductsRes.json(),
          orderStatusRes.json(),
          lowStockProductsRes.json(),
          neverSoldProductsRes.json(),
        ]);

        setDashboardData({
          totalProducts: totalProductsData.totalProducts,
          totalUsers: totalUsersData.totalUsers,
          totalRevenue: totalRevenueData.totalRevenue,
          totalInventoryValue: totalInventoryValueData.totalInventoryValue,
          topProducts: topProductsData.topProducts,
          orderStatusStats: orderStatusData.orderStatusStats,
          lowStockProducts: lowStockProductsData.lowStockProducts,
          neverSoldProducts: neverSoldProductsData.neverSoldProducts,
        });
        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🎉 Chào mừng, {user?.name || "Admin"}!
        </h1>
        <p className="text-lg text-base-content">
          Đây là giao diện Dashboard dành chủ cửa hàng
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Tổng Sản Phẩm</h2>
            <p className="text-3xl font-bold">{dashboardData.totalProducts}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Tổng Người Dùng</h2>
            <p className="text-3xl font-bold">{dashboardData.totalUsers}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Tổng Doanh Thu</h2>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(dashboardData.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Tổng Giá Trị Kho</h2>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(dashboardData.totalInventoryValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Products, Order Status, Low Stock, and Never Sold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">Sản Phẩm Bán Chạy</h2>
            <div className="space-y-4">
              {dashboardData.topProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center space-x-4 p-2 hover:bg-base-200 rounded"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-base-content/70">
                      Đã bán: {product.sold}
                    </p>
                    <p className="text-sm text-base-content/70">
                      Giá:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Stats */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">
              Thống Kê Trạng Thái Đơn Hàng
            </h2>
            <div className="space-y-3">
              {Object.entries(dashboardData.orderStatusStats).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center p-2 bg-base-200 rounded"
                  >
                    <span className="text-base-content/70">{status}</span>
                    <span className="badge badge-primary">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">
              Sản Phẩm Sắp Hết Hàng (Dưới 5)
            </h2>
            {dashboardData.lowStockProducts.length === 0 ? (
              <p className="text-base-content/70">
                Không có sản phẩm nào sắp hết hàng.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboardData.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-4 p-2 hover:bg-base-200 rounded"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-base-content/70">
                        Tồn kho: {product.stock}
                      </p>
                      <p className="text-sm text-base-content/70">
                        Giá:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Never Sold Products */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">Sản Phẩm Chưa Bán</h2>
            {dashboardData.neverSoldProducts.length === 0 ? (
              <p className="text-base-content/70">
                Không có sản phẩm nào chưa bán.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboardData.neverSoldProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-4 p-2 hover:bg-base-200 rounded"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-base-content/70">
                        Tồn kho: {product.stock}
                      </p>
                      <p className="text-sm text-base-content/70">
                        Giá:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
