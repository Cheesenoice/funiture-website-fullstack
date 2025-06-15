import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AddEditBlog = () => {
  const { blogId } = useParams(); // Updated to match your route parameter
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    articleCategory: "",
    content: "",
    author: "",
    tags: "",
    status: "published",
    featured: "yes",
    position: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const accessToken = userData.accessToken;

  useEffect(() => {
    if (!accessToken) {
      setError("Không tìm thấy access token. Vui lòng đăng nhập.");
      return;
    }

    if (blogId) {
      // Fetch article data for editing
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:3000/api/v1/article", {
            credentials: "include",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await response.json();
          if (data.code === 200) {
            const article = data.data.find((a) => a._id === blogId);
            if (article) {
              setFormData({
                title: article.title,
                articleCategory: article.articleCategory,
                content: article.content,
                author: article.author,
                tags: article.tags,
                status: article.status,
                featured:
                  article.featured === "yes" || article.featured === "1"
                    ? "yes"
                    : "no",
                position: article.position,
              });
            } else {
              throw new Error("Không tìm thấy bài viết");
            }
          } else {
            throw new Error(data.message || "Không thể tải bài viết");
          }
        } catch (err) {
          setError(err.message || "Không thể tải bài viết");
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [blogId, accessToken]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim() || formData.title.length < 5) {
      errors.title = "Tiêu đề phải có ít nhất 5 ký tự";
    }
    if (!formData.articleCategory.trim()) {
      errors.articleCategory = "Danh mục là bắt buộc";
    }
    if (!formData.content.trim() || formData.content.length < 20) {
      errors.content = "Nội dung phải có ít nhất 20 ký tự";
    }
    if (!formData.author.trim()) {
      errors.author = "Tác giả là bắt buộc";
    }
    if (formData.position < 1) {
      errors.position = "Vị trí phải lớn hơn hoặc bằng 1";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!accessToken) {
      setError("Không tìm thấy access token. Vui lòng đăng nhập.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = blogId
        ? `http://localhost:3000/api/v1/article/edit/${blogId}`
        : "http://localhost:3000/api/v1/article/create";

      const method = blogId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags,
          position: parseInt(formData.position),
          featured: formData.featured === "yes" ? "yes" : "no",
        }),
      });

      const data = await response.json();
      if (data.code === 200) {
        setSuccess(
          blogId ? "Cập nhật bài viết thành công!" : "Tạo bài viết thành công!"
        );
        setTimeout(() => navigate("/blog"), 2000); // Redirect to /blog (BlogManagement)
      } else {
        throw new Error(data.message || "Không thể lưu bài viết");
      }
    } catch (err) {
      setError(err.message || "Không thể lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  if (error && !accessToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          {blogId ? "Sửa Bài Viết" : "Thêm Bài Viết"}
        </h1>
        <p className="text-lg text-base-content">
          {blogId
            ? "Chỉnh sửa nội dung bài viết"
            : "Tạo bài viết mới cho hệ thống"}
        </p>
      </div>

      {/* Notifications */}
      {(success || error) && (
        <div className="toast toast-top toast-end">
          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Tiêu đề</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${
                      formErrors.title ? "input-error" : ""
                    }`}
                    placeholder="Nhập tiêu đề bài viết"
                  />
                  {formErrors.title && (
                    <span className="text-error text-sm mt-1">
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Danh mục</span>
                  </label>
                  <input
                    type="text"
                    name="articleCategory"
                    value={formData.articleCategory}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${
                      formErrors.articleCategory ? "input-error" : ""
                    }`}
                    placeholder="Nhập danh mục (ví dụ: Guide)"
                  />
                  {formErrors.articleCategory && (
                    <span className="text-error text-sm mt-1">
                      {formErrors.articleCategory}
                    </span>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Nội dung</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className={`textarea textarea-bordered w-full h-96 ${
                      formErrors.content ? "textarea-error" : ""
                    }`}
                    placeholder="Nhập nội dung bài viết"
                  ></textarea>
                  {formErrors.content && (
                    <span className="text-error text-sm mt-1">
                      {formErrors.content}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Tác giả</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${
                      formErrors.author ? "input-error" : ""
                    }`}
                    placeholder="Nhập tên tác giả"
                  />
                  {formErrors.author && (
                    <span className="text-error text-sm mt-1">
                      {formErrors.author}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Thẻ (phân cách bằng dấu phẩy)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="furniture,online,sell"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Trạng thái</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="published">Published</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nổi bật</span>
                  </label>
                  <select
                    name="featured"
                    value={formData.featured}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Vị trí</span>
                  </label>
                  <input
                    type="number"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${
                      formErrors.position ? "input-error" : ""
                    }`}
                    min="1"
                  />
                  {formErrors.position && (
                    <span className="text-error text-sm mt-1">
                      {formErrors.position}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : blogId ? (
                    "Cập nhật"
                  ) : (
                    "Tạo"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => navigate("/admin/blog")}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditBlog;
