import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { fetchCategories } from "./fetchCategories";

const SearchFilter = ({
  searchQuery,
  setSearchQuery,
  selectedCategorySlug,
  setSelectedCategorySlug,
  statusFilter,
  setStatusFilter,
  loading,
  onAddProduct,
}) => {
  const [allCategories, setAllCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(null);

  // --- Fetch Categories ---
  const fetchCategoriesData = useCallback(async () => {
    setCategoryError(null);
    try {
      const categories = await fetchCategories();
      setAllCategories(categories);
    } catch (e) {
      setCategoryError(`Lỗi khi tải danh mục: ${e.message}`);
      setAllCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full">
      {/* Search Filter */}
      <div className="form-control w-full md:w-auto md:min-w-[250px]">
        <label className="label pt-0">
          <span className="label-text">Tìm kiếm sản phẩm</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập tên sản phẩm..."
            className="input input-bordered w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="form-control w-full md:w-auto md:min-w-[250px]">
        <label className="label pt-0">
          <span className="label-text">Lọc theo danh mục</span>
        </label>
        <select
          className={`select select-bordered w-full ${
            categoryError || loading || allCategories.length === 0
              ? "select-disabled opacity-70"
              : ""
          }`}
          value={selectedCategorySlug}
          onChange={(e) => setSelectedCategorySlug(e.target.value)}
          disabled={loading || !!categoryError || allCategories.length === 0}
        >
          <option value="">-- Tất cả danh mục --</option>
          {allCategories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        {categoryError && (
          <span className="text-error text-xs mt-1">{categoryError}</span>
        )}
        {!categoryError && allCategories.length === 0 && !loading && (
          <span className="text-warning text-xs mt-1">
            Không có danh mục để lọc.
          </span>
        )}
      </div>

      {/* Status Filter */}
      <div className="form-control w-full md:w-auto md:min-w-[180px]">
        <label className="label pt-0">
          <span className="label-text">Lọc theo trạng thái</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading}
        >
          <option value="all">-- Tất cả trạng thái --</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      {/* Add Product Button */}
      <div className="form-control w-full md:w-auto self-end">
        <label className="label pt-0 hidden md:block">
          <span className="label-text"> </span>
        </label>
        <button
          className="btn btn-primary w-full md:w-auto"
          onClick={onAddProduct}
          disabled={loading}
        >
          <FaPlus className="mr-2" /> Thêm sản phẩm
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
