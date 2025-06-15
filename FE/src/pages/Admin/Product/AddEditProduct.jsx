import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaTimes } from "react-icons/fa";
import { fetchCategories } from "./fetchCategories"; // Import the utility

const AddEditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product_category_id: "",
    color: "",
    price: 0,
    stock: 0,
    discountPercentage: 0,
    thumbnail: "",
    status: "active",
    position: 0,
    featured: "0",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUrlMode, setIsUrlMode] = useState(false);

  // Load Categories using fetchCategories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      setCategoryError(null);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (e) {
        console.error("Lỗi tải danh mục:", e);
        setCategoryError(`Lỗi khi tải danh mục: ${e.message}`);
        setCategories([]);
      }
    };
    fetchCategoriesData();
  }, []);

  // Load Product Data if in Edit Mode
  const fetchProductData = useCallback(async () => {
    if (!isEditing) return;

    setLoading(true);
    setError(null);
    console.log(`Fetching data for product ID: ${productId}`);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/product/detail/${productId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        }
        throw new Error(`Lỗi fetch chi tiết sản phẩm: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 200 && result.data) {
        const productData = result.data;
        console.log("Fetched product data:", productData);
        setFormData({
          title: productData.title || "",
          description: productData.description || "",
          product_category_id: productData.product_category_id || "",
          color: productData.color || "",
          price: Number(productData.price) || 0,
          stock: Number(productData.stock) || 0,
          discountPercentage: Number(productData.discountPercentage) || 0,
          thumbnail: productData.thumbnail || "",
          status: productData.status || "inactive",
          position: Number(productData.position) || 0,
          featured: String(productData.featured) || "0",
        });
        setPreviewUrl(productData.thumbnail || null);
        setIsUrlMode(!!productData.thumbnail); // Set URL mode if thumbnail exists
      } else {
        throw new Error(
          "Định dạng dữ liệu trả về không hợp lệ từ API chi tiết."
        );
      }
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu sản phẩm:", err);
      setError(`Không thể tải dữ liệu sản phẩm: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [productId, isEditing]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(formData.thumbnail || null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh!");
      setSelectedFile(null);
      setPreviewUrl(formData.thumbnail || null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn, vui lòng chọn file dưới 10MB!");
      setSelectedFile(null);
      setPreviewUrl(formData.thumbnail || null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, thumbnail: "" })); // Clear thumbnail URL
    setError(null);
  };

  // Handle URL Input Change
  const handleUrlChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, thumbnail: value }));
    setPreviewUrl(value || null);
    setSelectedFile(null); // Clear selected file
    setError(null);
  };

  // Handle Remove Image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, thumbnail: "" }));
  };

  // Toggle Input Mode
  const toggleInputMode = () => {
    setIsUrlMode(!isUrlMode);
    setSelectedFile(null);
    setPreviewUrl(formData.thumbnail || null);
    setError(null);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "1"
            : "0"
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    let thumbnailUrl = formData.thumbnail;

    // Upload file to Cloudinary if a new file is selected
    if (selectedFile) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedFile);
      formDataUpload.append("upload_preset", "cmzggqqw");
      formDataUpload.append("folder", "furniture_products");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dgxjlc8zt/image/upload",
          {
            method: "POST",
            body: formDataUpload,
          }
        );

        if (!res.ok) {
          throw new Error(`Upload thất bại: ${res.status}`);
        }

        const data = await res.json();
        thumbnailUrl = data.secure_url;
      } catch (error) {
        console.error("Upload lỗi:", error);
        setError(`Upload ảnh thất bại: ${error.message}`);
        setSubmitLoading(false);
        return;
      }
    }

    const payload = {
      ...formData,
      thumbnail: thumbnailUrl,
      price: formData.price === "" ? 0 : Number(formData.price),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      discountPercentage:
        formData.discountPercentage === ""
          ? 0
          : Number(formData.discountPercentage),
      position: formData.position === "" ? 0 : Number(formData.position),
    };

    const url = isEditing
      ? `http://localhost:3000/api/v1/product/edit/${productId}`
      : "http://localhost:3000/api/v1/product/create";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `Lỗi ${response.status}`;
        throw new Error(errorMessage);
      }

      alert(`Sản phẩm đã được ${isEditing ? "cập nhật" : "thêm"} thành công!`);
      navigate("/admin/products");
    } catch (err) {
      console.error("Lỗi khi submit form:", err);
      setError(`Lưu sản phẩm thất bại: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-3">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">
        {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      </h1>

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
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-base-100 p-6 rounded-lg shadow-lg"
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Tên sản phẩm <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Mô tả</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả chi tiết"
            className="textarea textarea-bordered w-full h-24"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Danh mục <span className="text-error">*</span>
            </span>
          </label>
          <select
            name="product_category_id"
            value={formData.product_category_id}
            onChange={handleChange}
            className={`select select-bordered w-full ${
              categoryError ? "select-disabled" : ""
            }`}
            required
            disabled={!!categoryError || categories.length === 0}
          >
            <option value="" disabled>
              -- Chọn danh mục --
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryError && (
            <span className="text-error text-xs mt-1">{categoryError}</span>
          )}
          {!categoryError && categories.length === 0 && (
            <span className="text-warning text-xs mt-1">
              Đang tải hoặc không có danh mục...
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Màu sắc</span>
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="VD: Đen, Trắng, Xanh Navy"
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Giá (VND) <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              required
              min="0"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Tồn kho <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              required
              min="0"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Giảm giá (%)</span>
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Ảnh đại diện</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type={isUrlMode ? "url" : "file"}
              accept={isUrlMode ? undefined : "image/*"}
              name="thumbnail"
              value={isUrlMode ? formData.thumbnail : undefined}
              onChange={isUrlMode ? handleUrlChange : handleFileChange}
              placeholder={
                isUrlMode
                  ? "Nhập link ảnh (https://example.com/image.jpg)"
                  : undefined
              }
              className={
                isUrlMode
                  ? "input input-bordered w-full"
                  : "file-input file-input-bordered w-full"
              }
            />
            <button
              type="button"
              onClick={toggleInputMode}
              className="btn btn-sm btn-outline"
            >
              {isUrlMode ? "Chọn File" : "Nhập URL"}
            </button>
          </div>
          {previewUrl && (
            <div className="relative mt-2 w-24 h-24">
              <img
                src={previewUrl}
                alt="Thumbnail Preview"
                className="w-24 h-24 object-cover rounded border"
                onError={(e) => (e.target.style.display = "none")}
                onLoad={(e) => (e.target.style.display = "block")}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 btn btn-xs btn-circle btn-error"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Trạng thái</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-primary"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={handleChange}
                />
                <span className="label-text ml-2">Hoạt động</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  className="radio"
                  value="inactive"
                  checked={formData.status === "inactive"}
                  onChange={handleChange}
                />
                <span className="label-text ml-2">Không hoạt động</span>
              </label>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Vị trí</span>
            </label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured === "1"}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
              <span className="label-text font-semibold">Nổi bật?</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/admin/products")}
            disabled={submitLoading}
          >
            <FaTimes className="mr-2" /> Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              submitLoading ||
              loading ||
              !!categoryError ||
              categories.length === 0
            }
          >
            {submitLoading ? (
              <span className="loading loading-spinner loading-xs mr-2"></span>
            ) : (
              <FaSave className="mr-2" />
            )}
            {submitLoading
              ? "Đang lưu..."
              : isEditing
              ? "Cập nhật"
              : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
