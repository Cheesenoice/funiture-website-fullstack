import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Layout/Header/Header";

// Simulated articleService
const articleService = {
  getArticleBySlug: async (slug, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(
      `http://localhost:3000/api/v1/articles/detail/${slug}`,
      {
        headers,
      }
    );
    const data = await response.json();
    console.log("API Response (BlogDetail):", data); // Debug log
    return data;
  },
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem("authToken") || null;
        const response = await articleService.getArticleBySlug(slug, token);

        // Handle potential array-wrapped response
        const responseData = Array.isArray(response) ? response[0] : response;

        if (
          responseData.success &&
          responseData.data &&
          responseData.data.article
        ) {
          setArticle(responseData.data.article);
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
        console.error("Error fetching article:", err);
      }
    };
    fetchArticle();
  }, [slug]);

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

  if (!article) {
    return (
      <div className="bg-base-100 py-10">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>Bài viết không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            Tác giả: {article.author} |{" "}
            {new Date(article.createdAt).toLocaleDateString()}
          </p>
          <div className="prose max-w-none">{article.content}</div>
          {article.tags && (
            <div className="mt-6">
              <p className="text-sm font-semibold">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.split(",").map((tag) => (
                  <span
                    key={tag.trim()}
                    className="badge badge-outline badge-primary"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
