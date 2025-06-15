import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ShippingFeeManagement = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFee, setCurrentFee] = useState({
    _id: "",
    range_from_km: 0,
    range_to_km: 0,
    base_fee: 0,
    extra_fee_per_km: 0,
    status: "active",
  });

  // Fetch all shipping fees
  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/shipping-fee",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();

      if (result.success) {
        setFees(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch shipping fees");
      }
    } catch (err) {
      console.error("Error fetching shipping fees:", err);
      setError(err.message);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
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

  // Open modal for adding new fee
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentFee({
      _id: "",
      range_from_km: 0,
      range_to_km: 0,
      base_fee: 0,
      extra_fee_per_km: 0,
      status: "active",
    });
    setShowModal(true);
  };

  // Open modal for editing fee
  const openEditModal = (fee) => {
    setIsEditMode(true);
    setCurrentFee(fee);
    setShowModal(true);
  };

  // Handle input change in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFee((prev) => ({
      ...prev,
      [name]: name === "status" ? value : Number(value) || 0,
    }));
  };

  // Save or update fee
  const saveFee = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const url = isEditMode
        ? `http://localhost:3000/api/v1/shipping-fee/${currentFee._id}`
        : "http://localhost:3000/api/v1/shipping-fee";

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          range_from_km: currentFee.range_from_km,
          range_to_km: currentFee.range_to_km,
          base_fee: currentFee.base_fee,
          extra_fee_per_km: currentFee.extra_fee_per_km,
          status: currentFee.status,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        setSuccess(
          isEditMode
            ? "Cập nhật phí vận chuyển thành công!"
            : "Thêm phí vận chuyển thành công!"
        );
        fetchFees();
        setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
      } else {
        throw new Error(result.message || "Failed to save shipping fee");
      }
    } catch (err) {
      console.error("Error saving shipping fee:", err);
      setError(err.message);
    }
  };

  // Delete fee
  const deleteFee = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phí vận chuyển này?")) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/shipping-fee/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess("Xóa phí vận chuyển thành công!");
        fetchFees();
        setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
      } else {
        throw new Error(result.message || "Failed to delete shipping fee");
      }
    } catch (err) {
      console.error("Error deleting shipping fee:", err);
      setError(err.message);
    }
  };

  // Fetch fees on mount
  useEffect(() => {
    fetchFees();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Quản lý phí vận chuyển
      </h1>

      {/* Success Message */}
      {success && (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Thành công!</strong> {success}
          </span>
        </div>
      )}

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

      {/* Fees Table */}
      {!loading && (
        <div>
          <div className="mb-6">
            <button className="btn btn-primary" onClick={openAddModal}>
              Thêm phí vận chuyển
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khoảng cách (km)</th>
                  <th>Phí cơ bản</th>
                  <th>Phí thêm mỗi km</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => (
                  <tr key={fee._id}>
                    <td>{index + 1}</td>
                    <td>
                      {fee.range_from_km} - {fee.range_to_km} km
                    </td>
                    <td>{formatCurrency(fee.base_fee)}</td>
                    <td>{formatCurrency(fee.extra_fee_per_km)}</td>
                    <td>
                      <span
                        className={`badge ${
                          fee.status === "active"
                            ? "badge-success"
                            : "badge-error"
                        } badge-md`}
                      >
                        {fee.status === "active"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm mr-2"
                        onClick={() => openEditModal(fee)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteFee(fee._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Fees Message */}
          {fees.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Không có phí vận chuyển nào để hiển thị.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit Fee */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {isEditMode ? "Sửa phí vận chuyển" : "Thêm phí vận chuyển"}
            </h3>
            <div className="py-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Khoảng cách từ (km)</span>
                </label>
                <input
                  type="number"
                  name="range_from_km"
                  value={currentFee.range_from_km}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="0"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Khoảng cách đến (km)</span>
                </label>
                <input
                  type="number"
                  name="range_to_km"
                  value={currentFee.range_to_km}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="0"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phí cơ bản (VND)</span>
                </label>
                <input
                  type="number"
                  name="base_fee"
                  value={currentFee.base_fee}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="0"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phí thêm mỗi km (VND)</span>
                </label>
                <input
                  type="number"
                  name="extra_fee_per_km"
                  value={currentFee.extra_fee_per_km}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="0"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Trạng thái</span>
                </label>
                <select
                  name="status"
                  value={currentFee.status}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={saveFee}>
                Lưu
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingFeeManagement;
