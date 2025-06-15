import React, { useState, useEffect, useCallback } from "react";
import ProductSelectionModal from "./ProductSelectionModal"; // Đảm bảo đường dẫn này đúng

// --- Currency Formatter ---
const formatCurrency = (amount) => {
  // Chuyển đổi sang số nếu là string, đảm bảo xử lý NaN
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (
    isNaN(numberAmount) ||
    numberAmount === null ||
    numberAmount === undefined
  ) {
    return "N/A";
  }
  return numberAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};
// -------------------------

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredProductIds, setFeaturedProductIds] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductIdsForRemoval, setSelectedProductIdsForRemoval] =
    useState([]);
  const [confirmRemoval, setConfirmRemoval] = useState(false);

  // Fetches products that are marked as featured from the API
  const fetchFeaturedProducts = useCallback(async () => {
    setLoadingFeatured(true);
    setErrorFeatured(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("Không tìm thấy mã truy cập. Vui lòng đăng nhập.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/product/featured",
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Không được phép. Vui lòng đăng nhập lại.");
        }
        const errorData = await response.json();
        throw new Error(
          `Lỗi HTTP! Trạng thái: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const responseData = await response.json();

      if (
        responseData &&
        responseData.code === 200 &&
        Array.isArray(responseData.data)
      ) {
        // Calculate priceNew for each product before setting state
        const fetchedProducts = responseData.data.map((product) => {
          const price =
            typeof product.price === "string"
              ? parseFloat(product.price)
              : product.price;
          const discountPercentage =
            typeof product.discountPercentage === "string"
              ? parseFloat(product.discountPercentage)
              : product.discountPercentage;
          const priceNew = price * (1 - (discountPercentage || 0) / 100);
          return {
            ...product,
            priceNew: priceNew, // Add priceNew to product object
            price: price, // Ensure price is also a number for original display
            discountPercentage: discountPercentage, // Ensure discount is a number
          };
        });
        setFeaturedProducts(fetchedProducts);
        setFeaturedProductIds(fetchedProducts.map((p) => p._id));
      } else {
        console.error("Cấu trúc phản hồi API không mong muốn:", responseData);
        throw new Error("Định dạng dữ liệu sản phẩm nổi bật không hợp lệ.");
      }
    } catch (e) {
      console.error("Lỗi tải sản phẩm nổi bật:", e);
      setErrorFeatured(`Lỗi khi tải sản phẩm nổi bật: ${e.message}`);
      setFeaturedProducts([]);
      setFeaturedProductIds([]);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  // Updates the 'featured' status of products using the new PATCH API
  const updateFeaturedStatusBatch = async (productIds, featuredStatus) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("Không tìm thấy mã truy cập. Vui lòng đăng nhập.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/product/featured`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify({
            productid: productIds,
            featured: featuredStatus ? "1" : "0", // "1" or "0"
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi cập nhật trạng thái nổi bật: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      return true; // Indicate success
    } catch (e) {
      console.error(`Lỗi khi cập nhật sản phẩm:`, e);
      throw e;
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const openProductSelectionModal = () => {
    setIsModalOpen(true);
  };

  const closeProductSelectionModal = () => {
    setIsModalOpen(false);
    setSelectedProductIdsForRemoval([]);
  };

  const handleProductsSelectedFromModal = async (selectedIdsFromModal) => {
    setLoadingFeatured(true);
    setErrorFeatured(null);

    const idsToAdd = selectedIdsFromModal.filter(
      (id) => !featuredProductIds.includes(id)
    );
    const idsToRemove = featuredProductIds.filter(
      (id) => !selectedIdsFromModal.includes(id)
    );

    let successAdd = false;
    let successRemove = false;
    let errorMessage = "";

    try {
      if (idsToAdd.length > 0) {
        await updateFeaturedStatusBatch(idsToAdd, true);
        successAdd = true;
      }
      if (idsToRemove.length > 0) {
        await updateFeaturedStatusBatch(idsToRemove, false);
        successRemove = true;
      }

      if (successAdd && successRemove) {
        alert("Đã thêm và xóa sản phẩm nổi bật thành công!");
      } else if (successAdd) {
        alert("Đã thêm sản phẩm vào danh sách nổi bật thành công!");
      } else if (successRemove) {
        alert("Đã xóa sản phẩm khỏi danh sách nổi bật thành công!");
      } else {
        alert("Không có thay đổi nào được thực hiện.");
      }
    } catch (e) {
      errorMessage = `Lỗi cập nhật sản phẩm nổi bật: ${e.message}`;
      setErrorFeatured(errorMessage);
    } finally {
      await fetchFeaturedProducts();
      closeProductSelectionModal();
      setLoadingFeatured(false);
    }
  };

  const handleSelectProductForRemoval = (id) => {
    setSelectedProductIdsForRemoval((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const openConfirmRemovalModal = () => {
    if (selectedProductIdsForRemoval.length === 0) {
      setErrorFeatured("Vui lòng chọn ít nhất một sản phẩm để xóa.");
      setTimeout(() => setErrorFeatured(null), 3000);
      return;
    }
    setConfirmRemoval(true);
    document.getElementById("confirm-action-modal").checked = true;
  };

  const handleBulkRemovalConfirmed = async () => {
    if (!confirmRemoval || selectedProductIdsForRemoval.length === 0) return;

    setLoadingFeatured(true);
    setErrorFeatured(null);

    try {
      await updateFeaturedStatusBatch(selectedProductIdsForRemoval, false);
      alert(
        `Đã xóa ${selectedProductIdsForRemoval.length} sản phẩm khỏi danh sách nổi bật thành công!`
      );
    } catch (e) {
      setErrorFeatured(`Lỗi khi xóa sản phẩm khỏi nổi bật: ${e.message}`);
    } finally {
      await fetchFeaturedProducts();
      setSelectedProductIdsForRemoval([]);
      setConfirmRemoval(false);
      setLoadingFeatured(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">
        🌟 Quản lý sản phẩm nổi bật
      </h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <button
          className="btn btn-primary"
          onClick={openProductSelectionModal}
          disabled={loadingFeatured}
        >
          Chọn/Chỉnh sửa sản phẩm nổi bật
        </button>
      </div>

      {selectedProductIdsForRemoval.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm opacity-70">
            {selectedProductIdsForRemoval.length} sản phẩm đã chọn
          </span>
          <button
            className="btn btn-sm btn-outline btn-warning"
            onClick={openConfirmRemovalModal}
            disabled={loadingFeatured}
          >
            Xóa khỏi nổi bật
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setSelectedProductIdsForRemoval([])}
            disabled={loadingFeatured}
          >
            Hủy chọn
          </button>
        </div>
      )}

      {loadingFeatured && (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-3">Đang tải sản phẩm nổi bật...</p>
        </div>
      )}
      {!loadingFeatured && errorFeatured && (
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
            <strong>Lỗi!</strong> {errorFeatured}
          </span>
        </div>
      )}

      {!loadingFeatured && !errorFeatured && featuredProducts.length === 0 && (
        <div className="text-center py-10">
          Không có sản phẩm nổi bật nào.
          <br />
          Hãy nhấn "Chọn/Chỉnh sửa sản phẩm nổi bật" để thêm.
        </div>
      )}
      {!loadingFeatured && !errorFeatured && featuredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product._id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col"
            >
              <figure className="relative h-48 w-full">
                <img
                  src={product.thumbnail || "/placeholder.png"}
                  alt={`Ảnh sản phẩm ${product.title || "đang tải"}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.target.src.endsWith("/placeholder.png")) {
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
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    Không ảnh
                  </div>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-2 right-2 badge badge-accent">
                    -{product.discountPercentage}%
                  </span>
                )}
                <input
                  type="checkbox"
                  className="checkbox absolute top-2 left-2"
                  checked={selectedProductIdsForRemoval.includes(product._id)}
                  onChange={() => handleSelectProductForRemoval(product._id)}
                  disabled={loadingFeatured}
                />
              </figure>
              <div className="card-body p-4 flex-grow">
                <h2 className="card-title text-lg font-bold">
                  {product.title}
                </h2>
                <p className="text-sm opacity-70 line-clamp-2">
                  {product.description || "Không có mô tả"}
                </p>
                <div className="mt-2">
                  <p className="text-accent font-semibold">
                    {formatCurrency(product.priceNew)}
                  </p>
                  {product.discountPercentage > 0 && (
                    <p className="text-sm line-through opacity-70">
                      {formatCurrency(product.price)}
                    </p>
                  )}
                </div>
                <p className="text-sm">Tồn kho: {product.stock ?? "N/A"}</p>
                <p className="text-sm">
                  Trạng thái:{" "}
                  <span
                    className={`badge ${
                      product.status === "active"
                        ? "badge-success"
                        : "badge-ghost"
                    }`}
                  >
                    {product.status === "active" ? "Hoạt động" : product.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={closeProductSelectionModal}
        onSelectProducts={handleProductsSelectedFromModal}
        initialSelectedProductIds={featuredProductIds}
      />

      <input
        type="checkbox"
        id="confirm-action-modal"
        className="modal-toggle"
        checked={confirmRemoval}
        onChange={() => setConfirmRemoval(false)}
      />
      {confirmRemoval && (
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Xác nhận xóa khỏi sản phẩm nổi bật
            </h3>
            <p className="py-4">
              Bạn có chắc chắn muốn xóa {selectedProductIdsForRemoval.length}{" "}
              sản phẩm khỏi danh sách nổi bật?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleBulkRemovalConfirmed}
                disabled={loadingFeatured}
              >
                Xác nhận
              </button>
              <button
                className="btn"
                onClick={() => setConfirmRemoval(false)}
                disabled={loadingFeatured}
              >
                Hủy
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            htmlFor="confirm-action-modal"
          ></label>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
