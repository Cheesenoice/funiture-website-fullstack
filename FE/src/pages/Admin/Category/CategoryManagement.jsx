import React, { useState, useEffect, useCallback } from "react";
import AddEditCategory from "./AddEditCategory";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openCategoryIds, setOpenCategoryIds] = useState([]);
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // State for updating status loading

  // State for the Add/Edit Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); // null for add, category object for edit

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/product-category/"
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (
        Array.isArray(responseData) &&
        responseData.length > 0 &&
        responseData[0] &&
        Array.isArray(responseData[0].data)
      ) {
        setCategories(responseData[0].data);
      } else {
        console.error("Unexpected API response structure:", responseData);
        setCategories([]);
        throw new Error("Định dạng dữ liệu API không hợp lệ.");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh mục.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle checkbox selection
  const handleCheckboxChange = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  // Toggle collapse for nested categories
  const toggleCollapse = (categoryId) => {
    setOpenCategoryIds((prevIds) =>
      prevIds.includes(categoryId)
        ? prevIds.filter((id) => id !== categoryId)
        : [...prevIds, categoryId]
    );
  };

  // Open confirmation modal for single status change
  const openConfirmStatusModal = (id, currentStatus) => {
    setConfirmStatusChange({
      id,
      newStatus: currentStatus === "active" ? "inactive" : "active",
    });
  };

  // Function to call API for single category status change
  const updateSingleCategoryStatus = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    setError(null); // Clear main error state
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/product-category/change-status/${id}`,
        {
          method: "PATCH",

          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        }
      );

      const result = await response.json();
      if (result.code === 200) {
        setCategories((prev) => updateCategoryStatus(prev, id, newStatus));
      } else {
        // Set error for this specific action, not the main fetch error
        setError(
          `Cập nhật trạng thái thất bại: ${
            result.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (err) {
      console.error("Error updating category status:", err);
      // Set error for this specific action
      setError(
        `Cập nhật trạng thái thất bại: ${err.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsUpdatingStatus(false);
      setConfirmStatusChange(null); // Close the modal
    }
  };

  // Handle toggling single category status after confirmation
  const toggleCategoryStatus = () => {
    if (!confirmStatusChange) return;
    const { id, newStatus } = confirmStatusChange;
    updateSingleCategoryStatus(id, newStatus);
  };

  // Function to call API for bulk category status change
  const updateMultipleCategoriesStatus = async (ids, newStatus) => {
    setIsUpdatingStatus(true); // Use status update loading state
    setError(null); // Clear main error state
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        "http://localhost:3000/api/v1/product-category/change-multi",
        {
          method: "PATCH",

          body: JSON.stringify({ ids: ids, key: "status", value: newStatus }),
          credentials: "include", // Or 'include'
        }
      );

      const result = await response.json();
      if (result.code === 200) {
        setCategories((prev) => updateCategoryStatus(prev, ids, newStatus));
        setSelectedCategories([]); // Clear selected categories after successful update
      } else {
        // Set error for this specific action
        throw new Error(
          result.message || "Failed to update multiple categories status"
        );
      }
    } catch (err) {
      console.error("Error updating multiple categories status:", err);
      // Set error for this specific action
      setError(
        `Cập nhật trạng thái hàng loạt thất bại: ${
          err.message || "Lỗi không xác định"
        }`
      );
    } finally {
      setIsUpdatingStatus(false); // Reset status update loading state
    }
  };

  // Open confirmation modal for delete
  const openConfirmDeleteModal = (id) => {
    setConfirmDelete({ id });
  };

  // Delete category
  const deleteCategory = async () => {
    if (!confirmDelete) return;
    setLoading(true); // Use main loading state for delete
    setError(null); // Clear main error state
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const { id } = confirmDelete;
      const response = await fetch(
        `http://localhost:3000/api/v1/product-category/delete/${id}`,
        {
          method: "PATCH", // Assuming delete is a PATCH according to the original code

          credentials: "include", // Or 'include'
        }
      );

      const result = await response.json();
      if (result.code === 200) {
        setCategories((prev) => removeCategory(prev, id));
        setConfirmDelete(null);
        // Deselect the deleted category if it was selected
        setSelectedCategories((prev) => prev.filter((catId) => catId !== id));
      } else {
        // Set error for this specific action
        throw new Error(result.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      // Set error for this specific action
      setError(`Xóa danh mục thất bại: ${err.message || "Lỗi không xác định"}`);
    } finally {
      setLoading(false); // Reset main loading state
    }
  };

  // --- Modal Handlers ---
  const handleAddCategoryClick = () => {
    setCategoryToEdit(null); // Set to null for add mode
    setIsAddEditModalOpen(true);
  };

  const handleEditCategoryClick = (category, event) => {
    event.stopPropagation(); // Prevent row click/collapse
    setCategoryToEdit(category); // Set category object for edit mode
    setIsAddEditModalOpen(true);
  };

  const handleAddEditModalClose = () => {
    setIsAddEditModalOpen(false);
    setCategoryToEdit(null); // Clear categoryToEdit when closing
  };

  const handleAddEditSuccess = () => {
    // Refetch categories after successful add/edit
    fetchCategories();
    // Modal will be closed by handleAddEditModalClose, which is called after success
  };
  // --- End Modal Handlers ---

  // Helper function to update category status recursively (Frontend logic only)
  const updateCategoryStatus = (categoryList, targetIds, newStatus) => {
    const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
    return categoryList.map((category) => {
      let updatedCategory = category;
      if (ids.includes(category.id)) {
        updatedCategory = { ...category, status: newStatus };
      }
      if (category.children && category.children.length > 0) {
        updatedCategory = {
          ...updatedCategory,
          children: updateCategoryStatus(
            category.children,
            targetIds,
            newStatus
          ),
        };
      }
      return updatedCategory;
    });
  };

  // Helper function to remove a category recursively
  const removeCategory = (categoryList, targetId) => {
    return categoryList.filter((category) => {
      if (category.id === targetId) {
        return false;
      }
      if (category.children && category.children.length > 0) {
        category.children = removeCategory(category.children, targetId);
      }
      return true;
    });
  };

  // Render categories recursively
  const renderCategories = (categoryList, level = 0) => {
    return categoryList.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isCollapsed = !openCategoryIds.includes(category.id);
      const indentStyle = { paddingLeft: `${level * 1.5}rem` };

      const categoryItem = (
        <div
          className={`flex items-center justify-between border border-base-300 bg-base-100 rounded-md mb-1 px-4 py-3 ${
            level > 0 ? "" : ""
          } ${hasChildren ? "cursor-pointer" : ""}`}
          // Only collapse on clicking the main div if it has children
          onClick={() => hasChildren && toggleCollapse(category.id)}
        >
          <div
            className="flex items-center space-x-3 flex-grow min-w-0"
            style={indentStyle}
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-circle mr-2"
              checked={selectedCategories.includes(category.id)}
              onChange={(e) => {
                e.stopPropagation(); // Prevent click from triggering collapse/row click
                handleCheckboxChange(category.id);
              }}
              disabled={loading || isUpdatingStatus}
            />
            <div className="min-w-0">
              <div className="font-bold truncate">
                {category.name}
                {/* Status Badge */}
                <span
                  className={`badge ml-2 text-xs ${
                    category.status === "active"
                      ? "badge-success"
                      : "badge-warning"
                  }`}
                >
                  {category.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-xs opacity-60">ID: {category.id}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0 ml-4 relative">
            <div className="flex items-center space-x-4">
              <span
                className="w-28 truncate text-xs hidden md:inline"
                title={category.slug}
              >
                {category.slug}
              </span>
              <span
                className="w-28 truncate text-xs hidden lg:inline"
                title={category.accountFullName}
              >
                {category.accountFullName || "N/A"}
              </span>
              <span className="w-40 text-xs hidden xl:inline">
                {category.lastUpdater?.name !== "Not updated yet"
                  ? category.lastUpdater?.name
                  : "Chưa cập nhật"}
                <br />
                <span className="badge badge-ghost badge-xs">
                  {category.lastUpdater?.time
                    ? new Date(category.lastUpdater.time).toLocaleString(
                        "vi-VN"
                      )
                    : "N/A"}
                </span>
              </span>
              <span className="w-10 text-center text-xs hidden md:inline">
                {category.index}
              </span>
              <div className="flex space-x-1">
                <button
                  className="btn btn-ghost btn-xs text-info"
                  title="Sửa"
                  onClick={(e) => handleEditCategoryClick(category, e)} // Use new handler
                  disabled={loading || isUpdatingStatus}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from triggering collapse
                    openConfirmDeleteModal(category.id);
                  }}
                  disabled={loading || isUpdatingStatus}
                  title="Xóa"
                >
                  Xóa
                </button>
                <button
                  className="btn btn-ghost btn-xs text-primary"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from triggering collapse
                    openConfirmStatusModal(category.id, category.status);
                  }}
                  disabled={loading || isUpdatingStatus}
                  title={category.status === "active" ? "Ngừng" : "Kích"}
                >
                  {category.status === "active" ? "Ngừng" : "Kích"}
                </button>
              </div>
              <div>
                {hasChildren && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-200 ${
                        !isCollapsed ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );

      return (
        <div key={category.id}>
          {categoryItem}
          {hasChildren && (
            <div
              className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
                isCollapsed ? "max-h-0" : "max-h-screen" // Use max-h-screen or large value for smoother transition
              }`}
            >
              <div className="pt-2 bg-base-100/50">
                {renderCategories(category.children, level + 1)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Quản lý danh mục
        </h1>
        <div className="flex gap-2">
          {selectedCategories.length > 0 && (
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline btn-warning"
                onClick={() =>
                  updateMultipleCategoriesStatus(selectedCategories, "inactive")
                }
                disabled={loading || isUpdatingStatus}
              >
                Ngừng hoạt động ({selectedCategories.length})
              </button>
              <button
                className="btn btn-sm btn-outline btn-success"
                onClick={() =>
                  updateMultipleCategoriesStatus(selectedCategories, "active")
                }
                disabled={loading || isUpdatingStatus}
              >
                Kích hoạt ({selectedCategories.length})
              </button>
            </div>
          )}
          <button
            className="btn btn-primary btn-sm md:btn-md"
            onClick={handleAddCategoryClick} // Use new handler
            disabled={loading || isUpdatingStatus}
          >
            Thêm Danh Mục Mới
          </button>
        </div>
      </div>

      {/* Display main loading for fetch or delete */}
      {loading && !isUpdatingStatus && (
        <div className="flex justify-center items-center p-10">
          <span className="loading loading-lg loading-spinner text-primary"></span>
          <p className="ml-4 text-lg">Đang tải danh mục...</p>
        </div>
      )}

      {/* Display status update loading */}
      {isUpdatingStatus && (
        <div className="flex justify-center items-center p-10 fixed inset-0 bg-black bg-opacity-50 z-50 flex-col">
          {" "}
          {/* Use fixed overlay */}
          <span className="loading loading-lg loading-spinner text-success"></span>
          <p className="ml-4 text-lg text-white">Đang cập nhật trạng thái...</p>
        </div>
      )}

      {/* Display general error */}
      {error && (
        <div role="alert" className="alert alert-error mb-4">
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
          {/* Optional: Add a close button for the error alert */}
          {/* <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button> */}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/70 px-4 py-4 bg-base-200">
            <div className="flex-grow flex items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-sm mr-2"
                onChange={(e) => {
                  const allCategoryIds = [];
                  const extractIds = (cats) => {
                    cats.forEach((cat) => {
                      allCategoryIds.push(cat.id);
                      if (cat.children) extractIds(cat.children);
                    });
                  };
                  extractIds(categories); // Get all IDs, including children
                  setSelectedCategories(e.target.checked ? allCategoryIds : []);
                }}
                // Check if all *displayed* categories are selected (simple check for top level)
                // A more robust check would ensure all children of selected parents are also selected/deselected
                checked={
                  selectedCategories.length > 0 &&
                  // Check if all top-level categories' IDs are in selectedCategories
                  categories.every((cat) =>
                    selectedCategories.includes(cat.id)
                  ) &&
                  // And if the number of selected items matches the total count (including nested)
                  // This requires calculating total count recursively, or simplifying the logic
                  selectedCategories.length ===
                    (() => {
                      let count = 0;
                      const countRecursive = (cats) => {
                        cats.forEach((cat) => {
                          count++;
                          if (cat.children) countRecursive(cat.children);
                        });
                      };
                      countRecursive(categories);
                      return count;
                    })()
                }
                ref={(input) => {
                  if (input) {
                    const totalCategoryCount = (() => {
                      let count = 0;
                      const countRecursive = (cats) => {
                        cats.forEach((cat) => {
                          count++;
                          if (cat.children) countRecursive(cat.children);
                        });
                      };
                      countRecursive(categories);
                      return count;
                    })();
                    input.indeterminate =
                      selectedCategories.length > 0 &&
                      selectedCategories.length < totalCategoryCount;
                  }
                }}
                disabled={
                  categories.length === 0 || loading || isUpdatingStatus
                }
              />
              <span>Tên Danh Mục</span>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
              <span className="w-28 hidden md:inline">Slug</span>
              <span className="w-28 hidden lg:inline">Người Tạo</span>
              <span className="w-40 hidden xl:inline">Cập nhật cuối</span>
              <span className="w-10 text-center hidden md:inline">
                Thứ tự
              </span>{" "}
              {/* Hide index header on smaller screens */}
              <span className="w-[calc(theme(spacing.px)*2+theme(fontSize.xs[1].lineHeight)*3+theme(spacing[1])*3)]">
                Hành động
              </span>
            </div>
          </div>

          {categories.length > 0 ? (
            renderCategories(categories)
          ) : (
            <div className="text-center p-6 bg-base-100 rounded-md border border-base-300">
              Không có danh mục nào.
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Single Status Change */}
      {/* Keep existing confirmation modals as they are separate actions */}
      <input
        type="checkbox"
        id="confirm-status-modal"
        className="modal-toggle"
        checked={!!confirmStatusChange}
        onChange={() => setConfirmStatusChange(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận thay đổi trạng thái</h3>
          <p className="py-4">
            Bạn có chắc chắn muốn{" "}
            {confirmStatusChange?.newStatus === "active"
              ? "kích hoạt"
              : "ngừng hoạt động"}{" "}
            danh mục này không?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={toggleCategoryStatus}
              disabled={loading || isUpdatingStatus}
            >
              Xác nhận
            </button>
            <button
              className="btn"
              onClick={() => setConfirmStatusChange(null)}
              disabled={loading || isUpdatingStatus}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <input
        type="checkbox"
        id="confirm-delete-modal"
        className="modal-toggle"
        checked={!!confirmDelete}
        onChange={() => setConfirmDelete(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận xóa danh mục</h3>
          <p className="py-4">
            Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không
            thể hoàn tác.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={deleteCategory}
              disabled={loading || isUpdatingStatus}
            >
              Xóa
            </button>
            <button
              className="btn"
              onClick={() => setConfirmDelete(null)}
              disabled={loading || isUpdatingStatus}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AddEditCategory
        isOpen={isAddEditModalOpen}
        onClose={handleAddEditModalClose}
        onSuccess={handleAddEditSuccess}
        categoryToEdit={categoryToEdit}
        parentCategories={categories} // Pass the full list, ideally filter this for edit mode
      />
    </div>
  );
};

export default CategoryManagement;
