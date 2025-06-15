import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchFilter from "./SearchFilter";

// --- Currency Formatter ---
const formatCurrency = (amount) => {
  if (typeof amount !== "number" && typeof amount !== "string") return "N/A";
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numberAmount)) return "N/A";
  return numberAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};
// ---------------------------------

const ProductManagement = () => {
  // --- State Variables ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Selection State
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Modal/Confirmation State
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);
  const [confirmBulkStatus, setConfirmBulkStatus] = useState(null);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  // Filter States (passed from SearchFilter)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // --- Fetch Products ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("limit", itemsPerPage);

      const baseUrl = selectedCategorySlug
        ? `http://localhost:3000/api/v1/product/${selectedCategorySlug}`
        : "http://localhost:3000/api/v1/product/";
      const url = `${baseUrl}?${queryParams.toString()}`;

      console.log("Fetching products from URL:", url);

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi HTTP: ${response.status} - ${
            errorData[0]?.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("Raw API product response:", JSON.stringify(result, null, 2));

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        result[0]?.code === 200 &&
        Array.isArray(result[0]?.data)
      ) {
        const { data, page, limit, totalPages, category } = result[0];
        setProducts(data);
        setCurrentCategory(category);
        setCurrentPage(parseInt(page) || 1);
        setTotalPages(parseInt(totalPages) || 1);
        console.log(
          "Fetched products count:",
          data.length,
          "Current Page:",
          page,
          "Total Pages:",
          totalPages
        );
      } else {
        console.warn("Unexpected API response format:", result);
        throw new Error("Định dạng dữ liệu sản phẩm không hợp lệ.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Lỗi tải sản phẩm.");
      setProducts([]);
      setTotalPages(1);
      setCurrentCategory(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedCategorySlug]);

  // --- Frontend Filtering for Status and Search ---
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.status === "active");
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => p.status === "inactive");
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }
    return filtered;
  }, [products, statusFilter, searchQuery]);

  // --- Effects ---
  useEffect(() => {
    fetchProducts();
    setSelectedProductIds([]);
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorySlug, statusFilter, searchQuery]);

  // --- Pagination Handlers ---
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && !loading) {
      setCurrentPage(page);
    }
  };

  // --- Action Handlers ---
  const handleEdit = useCallback(
    (productId) => {
      console.log("Navigating to edit product:", productId);
      navigate(`/admin/products/edit/${productId}`);
    },
    [navigate]
  );

  const handleAdd = useCallback(() => {
    console.log("Navigating to add product");
    navigate("/admin/products/add");
  }, [navigate]);

  const openConfirmDeleteModal = (productId) => {
    setProductToDeleteId(productId);
  };

  const confirmDeleteProduct = useCallback(async () => {
    if (!productToDeleteId) return;

    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/product/delete/${productToDeleteId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi xóa sản phẩm: ${response.status} - ${
            errorData[0]?.message || response.statusText
          }`
        );
      }
      console.log(
        `Sản phẩm ID ${productToDeleteId} đã được xóa (soft delete).`
      );
      fetchProducts();
      setProductToDeleteId(null);
      setSelectedProductIds([]);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      setError(err.message || "Đã xảy ra lỗi khi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [productToDeleteId, fetchProducts]);

  const handleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const openConfirmStatusModal = (id, currentStatus) => {
    setConfirmStatusChange({
      id,
      newStatus: currentStatus === "active" ? "inactive" : "active",
    });
  };

  const toggleProductStatus = useCallback(async () => {
    if (!confirmStatusChange) return;
    setLoading(true);
    setError(null);
    const { id, newStatus } = confirmStatusChange;
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/product/change-status/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi thay đổi trạng thái: ${response.status} - ${
            errorData[0]?.message || response.statusText
          }`
        );
      }
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, status: newStatus } : product
        )
      );
      setConfirmStatusChange(null);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái sản phẩm:", err);
      setError(err.message || "Đã xảy ra lỗi khi thay đổi trạng thái.");
    } finally {
      setLoading(false);
    }
  }, [confirmStatusChange]);

  const openConfirmBulkModal = (status) => {
    if (selectedProductIds.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
    setConfirmBulkStatus(status);
  };

  const bulkChangeStatus = useCallback(async () => {
    if (!confirmBulkStatus || selectedProductIds.length === 0) return;
    setLoading(true);
    setError(null);
    const statusToSet = confirmBulkStatus;
    const idsToChange = [...selectedProductIds];

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/product/change-multi",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: idsToChange,
            key: "status",
            value: statusToSet,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi thay đổi trạng thái hàng loạt: ${response.status} - ${
            errorData[0]?.message || response.statusText
          }`
        );
      }
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          idsToChange.includes(product._id)
            ? { ...product, status: statusToSet }
            : product
        )
      );
      setSelectedProductIds([]);
      setConfirmBulkStatus(null);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái hàng loạt:", err);
      setError(
        err.message || "Đã xảy ra lỗi khi thay đổi trạng thái hàng loạt."
      );
    } finally {
      setLoading(false);
    }
  }, [confirmBulkStatus, selectedProductIds]);

  // --- Rendered Output ---
  console.log("Pagination Check:", {
    currentPage,
    totalPages,
    loading,
    error,
    productsCount: filteredProducts.length,
    itemsPerPage,
  });

  const isLastPage = currentPage >= totalPages;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-primary">📦 Quản lý sản phẩm</h1>
      {currentCategory && (
        <h2 className="text-xl mt-2 text-secondary">
          Danh mục: {currentCategory.title}
        </h2>
      )}
      <div className="mb-6 mt-6">
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategorySlug={selectedCategorySlug}
          setSelectedCategorySlug={setSelectedCategorySlug}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loading={loading}
          onAddProduct={handleAdd}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedProductIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm opacity-70">
            {selectedProductIds.length} sản phẩm đã chọn
          </span>
          <button
            className="btn btn-sm btn-outline btn-warning"
            onClick={() => openConfirmBulkModal("inactive")}
            disabled={loading}
          >
            Ngừng hoạt động
          </button>
          <button
            className="btn btn-sm btn-outline btn-success"
            onClick={() => openConfirmBulkModal("active")}
            disabled={loading}
          >
            Hoạt động
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setSelectedProductIds([])}
            disabled={loading}
          >
            Hủy chọn
          </button>
        </div>
      )}

      {/* Loading and Error Messages */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-3">Đang tải dữ liệu...</p>
        </div>
      )}
      {!loading && error && (
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
            <strong>Lỗi tải sản phẩm!</strong> {error}
          </span>
        </div>
      )}

      {/* Product Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={(e) =>
                      setSelectedProductIds(
                        e.target.checked
                          ? filteredProducts.map((p) => p._id)
                          : []
                      )
                    }
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    disabled={filteredProducts.length === 0 || loading}
                  />
                </th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá gốc</th>
                <th>Giá mới</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {selectedCategorySlug ||
                    statusFilter !== "all" ||
                    searchQuery
                      ? "Không tìm thấy sản phẩm phù hợp với bộ lọc hoặc từ khóa tìm kiếm."
                      : "Không có sản phẩm nào."}
                  </td>
                </tr>
              )}
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover">
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedProductIds.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      disabled={loading}
                    />
                  </th>
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12 overflow-hidden relative">
                        <img
                          src={product.thumbnail || "/placeholder.png"}
                          alt={`Ảnh sản phẩm ${product.title || "đang tải"}`}
                          onError={(e) => {
                            if (e.target.src.endsWith("/placeholder.png")) {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              const parent = e.target.parentElement;
                              if (parent && parent.classList.contains("mask")) {
                                parent.classList.add(
                                  "bg-gray-200",
                                  "flex",
                                  "items-center",
                                  "justify-center",
                                  "text-xs",
                                  "text-gray-500",
                                  "break-words",
                                  "p-1",
                                  "text-center"
                                );
                                parent.innerText = "Không ảnh";
                                parent.style.overflow = "visible";
                              }
                            } else {
                              e.target.src = "/placeholder.png";
                            }
                          }}
                        />
                        {!product.thumbnail && (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-xs text-gray-500 break-words p-1 text-center">
                            Không ảnh
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold">{product.title}</div>
                    <div className="text-sm opacity-70 truncate max-w-[150px]">
                      ID: {product._id}
                    </div>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                  <td className="font-semibold text-accent">
                    {formatCurrency(product.priceNew)}
                    {product.discountPercentage > 0 && (
                      <span className="badge badge-ghost badge-sm ml-2">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </td>
                  <td>{product.stock ?? "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        product.status === "active"
                          ? "badge-success"
                          : "badge-ghost"
                      } badge-md`}
                    >
                      {product.status === "active"
                        ? "Hoạt động"
                        : product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2 items-center">
                      <button
                        className="btn btn-sm btn-info btn-outline"
                        onClick={() => handleEdit(product._id)}
                        aria-label={`Chỉnh sửa ${product.title}`}
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      {!product.deleted && (
                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => openConfirmDeleteModal(product._id)}
                          aria-label={`Xóa ${product.title}`}
                          disabled={loading}
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          openConfirmStatusModal(product._id, product.status)
                        }
                        disabled={loading}
                      >
                        {product.status === "active" ? "Ngừng" : "Kích"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              aria-label="Trang trước"
            >
              « Trang trước
            </button>
            <button className="join-item btn pointer-events-none" disabled>
              Trang {currentPage} / {totalPages}
            </button>
            <button
              className="join-item btn"
              disabled={loading || isLastPage}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Trang sau"
            >
              Trang sau »
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <input
        type="checkbox"
        id="confirm-status-modal"
        className="modal-toggle"
        checked={!!confirmStatusChange}
        onChange={() => setConfirmStatusChange(null)}
      />
      {!!confirmStatusChange && (
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xác nhận thay đổi trạng thái</h3>
            <p className="py-4">
              Bạn có chắc chắn muốn{" "}
              {confirmStatusChange?.newStatus === "active"
                ? "kích hoạt"
                : "ngừng hoạt động"}{" "}
              sản phẩm này?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={toggleProductStatus}
                disabled={loading}
              >
                Xác nhận
              </button>
              <button
                className="btn"
                onClick={() => setConfirmStatusChange(null)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            htmlFor="confirm-status-modal"
          ></label>
        </div>
      )}

      <input
        type="checkbox"
        id="confirm-bulk-modal"
        className="modal-toggle"
        checked={!!confirmBulkStatus}
        onChange={() => setConfirmBulkStatus(null)}
      />
      {!!confirmBulkStatus && (
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Xác nhận thay đổi trạng thái hàng loạt
            </h3>
            <p className="py-4">
              Bạn có chắc chắn muốn đặt trạng thái của{" "}
              {selectedProductIds.length} sản phẩm thành "
              {confirmBulkStatus === "active" ? "Hoạt động" : "Ngừng hoạt động"}
              "?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={bulkChangeStatus}
                disabled={loading}
              >
                Xác nhận
              </button>
              <button
                className="btn"
                onClick={() => setConfirmBulkStatus(null)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            htmlFor="confirm-bulk-modal"
          ></label>
        </div>
      )}

      <input
        type="checkbox"
        id="confirm-delete-modal"
        className="modal-toggle"
        checked={!!productToDeleteId}
        onChange={() => setProductToDeleteId(null)}
      />
      {!!productToDeleteId && (
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">
              Xác nhận xóa sản phẩm
            </h3>
            <p className="py-4">
              Bạn có chắc chắn muốn xóa sản phẩm có ID:{" "}
              <span className="font-semibold">{productToDeleteId}</span> không?
              <br />
              Lưu ý: Hành động này thường là "soft delete" (chỉ ẩn sản phẩm khỏi
              trang hiển thị) thay vì xóa vĩnh viễn khỏi cơ sở dữ liệu.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={confirmDeleteProduct}
                disabled={loading}
                aria-label="Xác nhận xóa sản phẩm đã chọn"
              >
                Xóa
              </button>
              <button
                className="btn"
                onClick={() => setProductToDeleteId(null)}
                disabled={loading}
                aria-label="Hủy xóa sản phẩm"
              >
                Hủy
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            htmlFor="confirm-delete-modal"
          ></label>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
