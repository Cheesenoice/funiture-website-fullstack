import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Simulated articleService
const articleService = {
  getArticles: async (params = {}, token = null) => {
    const query = new URLSearchParams(params).toString();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(
      `http://localhost:3000/api/v1/articles?${query}`,
      {
        headers,
      }
    );
    const data = await response.json();
    console.log("API Response:", data); // Debug log
    return data;
  },
};

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 3;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params = { page, limit };
        const token = localStorage.getItem("authToken") || null;
        const response = await articleService.getArticles(params, token);

        // Handle array-wrapped response
        const responseData = Array.isArray(response) ? response[0] : response;

        // Check response structure
        if (
          (responseData.code === 200 || responseData.success) &&
          Array.isArray(responseData.data)
        ) {
          setArticles(responseData.data);
        } else {
          throw new Error(
            responseData.message ||
              `Unexpected response structure: ${JSON.stringify(responseData)}`
          );
        }
        setLoading(false);
      } catch (err) {
        setError("Không thể tải bài viết: " + err.message);
        setLoading(false);
        console.error("Error fetching articles:", err);
      }
    };

    fetchArticles();
  }, [page]);

  if (loading) {
    return (
      <div className="bg-base-100 py-10">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 py-10">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 py-10">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Tin Tức</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{article.title}</h3>
                  <p className="text-sm text-gray-500">
                    Tác giả: {article.author} |{" "}
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  <p className="line-clamp-3">{article.content}</p>
                  <div className="card-actions justify-end">
                    <Link
                      to={`/blog/${article.slug}`}
                      className="btn btn-primary btn-sm"
                    >
                      Đọc Thêm
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không có bài viết nào để hiển thị.</p>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <div className="join">
            <button
              className="join-item btn btn-square"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            {[1, 2, 3].map((p) => (
              <input
                key={p}
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label={p.toString()}
                checked={page === p}
                onChange={() => setPage(p)}
              />
            ))}
            <button
              className="join-item btn btn-square"
              onClick={() => setPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
