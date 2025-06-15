import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BlogManagement = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    articleId: null,
  });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const accessToken = userData.accessToken;

  useEffect(() => {
    if (!accessToken) {
      setError("Không tìm thấy access token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    const fetchArticles = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/article", {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (data.code === 200) {
          setArticles(data.data);
        } else {
          throw new Error(data.message || "Không thể tải danh sách bài viết");
        }
      } catch (err) {
        setError(err.message || "Không thể tải danh sách bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [accessToken]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/article/delete/${deleteModal.articleId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (data.code === 200) {
        setArticles(
          articles.filter((article) => article._id !== deleteModal.articleId)
        );
        setSuccess("Xóa bài viết thành công!");
      } else {
        throw new Error(data.message || "Không thể xóa bài viết");
      }
    } catch (err) {
      setError(err.message || "Không thể xóa bài viết");
    } finally {
      setDeleteModal({ open: false, articleId: null });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">
            Quản Lý Bài Viết
          </h1>
          <p className="text-lg text-base-content">
            Quản lý các bài viết blog của hệ thống
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/admin/blog/add")}
        >
          Thêm Bài Viết
        </button>
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

      {/* Articles Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full"></div>
                ))}
              </div>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-primary text-lg">Tiêu đề</th>
                    <th className="text-primary text-lg">Tác giả</th>
                    <th className="text-primary text-lg">Danh mục</th>
                    <th className="text-primary text-lg">Trạng thái</th>
                    <th className="text-primary text-lg">Thẻ</th>
                    <th className="text-primary text-lg">Ngày tạo</th>
                    <th className="text-primary text-lg">Nổi bật</th>
                    <th className="text-primary text-lg">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="hover">
                      <td className="font-medium">{article.title}</td>
                      <td>{article.author}</td>
                      <td>{article.articleCategory}</td>
                      <td>
                        <span
                          className={`badge ${
                            article.status === "active" ||
                            article.status === "published"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.split(",").map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-primary badge-sm"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {new Date(article.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            article.featured === "yes" ||
                            article.featured === "1"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {article.featured === "yes" ||
                          article.featured === "1"
                            ? "Có"
                            : "Không"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              navigate(`/admin/blog/edit/${article._id}`)
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                articleId: article._id,
                              })
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xác nhận xóa</h3>
            <p className="py-4">Bạn có chắc muốn xóa bài viết này?</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete}>
                Xóa
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteModal({ open: false, articleId: null })}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
