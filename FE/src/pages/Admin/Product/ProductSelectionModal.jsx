import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSearch } from "react-icons/fa"; // Assuming you have Font Awesome icons

// --- Currency Formatter (can be imported or passed as prop) ---
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

const ProductSelectionModal = ({
  isOpen,
  onClose,
  onSelectProducts,
  initialSelectedProductIds = [],
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false, fetch on open
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductsInModal, setSelectedProductsInModal] = useState(
    initialSelectedProductIds
  );

  // Pagination for the modal (optional, depends on how many products you expect)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Or a different limit for the modal
  const [totalPages, setTotalPages] = useState(1);

  // --- Fetch Products for the modal ---
  // Modified to not include category slug in base URL by default,
  // and to not have a fixed limit of 10 if you want to show more products.
  // We'll also remove the selectedCategorySlug from the dependency array,
  // as this modal will likely fetch all products or a broad set.
  const fetchProductsForModal = useCallback(async () => {
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
      queryParams.append("limit", itemsPerPage); // Use itemsPerPage for modal

      // For a modal showing ALL products (or a broader range), remove category slug
      // If you need to filter by category in the modal, you'd add a prop for it
      const url = `http://localhost:3000/api/v1/products/?${queryParams.toString()}`;

      console.log("Fetching products for modal from URL:", url);

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
      console.log(
        "Raw API modal product response:",
        JSON.stringify(result, null, 2)
      );

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        result[0]?.code === 200 &&
        Array.isArray(result[0]?.data)
      ) {
        const { data, page, limit, totalPages } = result[0]; // Destructure totalPages
        setProducts(data);
        setCurrentPage(parseInt(page) || 1);
        setTotalPages(parseInt(totalPages) || 1);
      } else {
        console.warn("Unexpected API response format for modal:", result);
        throw new Error("Định dạng dữ liệu sản phẩm không hợp lệ.");
      }
    } catch (err) {
      console.error("Error fetching products for modal:", err);
      setError(err.message || "Lỗi tải sản phẩm.");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]); // Removed selectedCategorySlug from dependencies

  useEffect(() => {
    if (isOpen) {
      // Only fetch when the modal is opened
      fetchProductsForModal();
      setSelectedProductsInModal(initialSelectedProductIds); // Reset selection when opened
    }
  }, [isOpen, fetchProductsForModal, initialSelectedProductIds]);

  // --- Filtering with Search Term ---
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchTerm]);

  // --- Handlers for Modal Selection ---
  const handleToggleProduct = (id) => {
    setSelectedProductsInModal((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    onSelectProducts(selectedProductsInModal);
    onClose();
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && !loading) {
      setCurrentPage(page);
    }
  };

  const isLastPage = currentPage >= totalPages;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-11/12 max-w-5xl h-[90vh] flex flex-col">
        <h3 className="font-bold text-2xl text-primary mb-4">
          Chọn sản phẩm nổi bật
        </h3>

        {/* Search Bar */}
        <div className="form-control mb-4">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <FaSearch className="text-gray-400" />
          </label>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10 flex-grow">
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
              <strong>Lỗi!</strong> {error}
            </span>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-auto flex-grow mb-4">
              <table className="table w-full table-pin-rows">
                <thead className="bg-base-200 text-base-content sticky top-0 z-10">
                  <tr>
                    <th>Chọn</th>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá mới</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  )}
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover">
                      <th>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedProductsInModal.includes(
                            product._id
                          )}
                          onChange={() => handleToggleProduct(product._id)}
                          disabled={loading}
                        />
                      </th>
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12 overflow-hidden relative">
                            <img
                              src={product.thumbnail || "/placeholder.png"}
                              alt={`Ảnh sản phẩm ${
                                product.title || "đang tải"
                              }`}
                              onError={(e) => {
                                if (e.target.src.endsWith("/placeholder.png")) {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  const parent = e.target.parentElement;
                                  if (
                                    parent &&
                                    parent.classList.contains("mask")
                                  ) {
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
                      </td>
                      <td className="font-semibold text-accent">
                        {formatCurrency(product.priceNew)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Modal */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-auto py-2">
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label="Trang trước"
                  >
                    « Trang trước
                  </button>
                  <button
                    className="join-item btn pointer-events-none"
                    disabled
                  >
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
          </>
        )}

        <div className="modal-action mt-auto">
          <button
            className="btn btn-primary"
            onClick={handleConfirmSelection}
            disabled={loading}
          >
            Xác nhận chọn ({selectedProductsInModal.length})
          </button>
          <button className="btn" onClick={onClose} disabled={loading}>
            Hủy
          </button>
        </div>
      </div>
      <label className="modal-backdrop" onClick={onClose}></label>
    </div>
  );
};

export default ProductSelectionModal;
