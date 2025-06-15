import { useEffect, useState } from "react";
import ProductCard from "../Common/ProductCard";
import { productService } from "../../api/services/productService";
import { categoryService } from "../../api";

export default function ProductList({
  categoryDescription,
  limit = 4,
  filter = "all",
  keyword,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryTitle, setCategoryTitle] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (data.success) {
          setCategories(data.data);
        }
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = { page, limit };
        if (filter === "category" && categoryDescription) {
          params.slug = categoryDescription;
        }
        if (filter === "featured") {
          params.isfeatured = true;
        }
        if (filter === "new") {
          params.isnew = true;
        }
        if (filter === "search" && keyword) {
          params.keyword = keyword; // Gửi keyword trực tiếp, không giải mã
        }

        const response = await productService.getProducts(params);
        if (response.success) {
          let filteredProducts = response.data.products;
          setTotalPages(response.data.totalPages);

          if (
            filter === "category" &&
            categoryDescription &&
            categories.length > 0
          ) {
            const category = categories.find(
              (cat) =>
                cat.description.toLowerCase() ===
                categoryDescription.toLowerCase()
            );
            if (category) {
              const validCategoryIds = [
                category.category_id,
                ...category.subcategories.map((sub) => sub.category_id),
              ];
              filteredProducts = filteredProducts.filter((product) =>
                validCategoryIds.includes(product.product_category_id)
              );
            }
          }

          setProducts(filteredProducts);

          if (filter === "category" && response.data.category?.title) {
            setCategoryTitle(response.data.category.title);
          }
        } else {
          throw new Error(response.error || "Failed to fetch products");
        }
        setLoading(false);
      } catch {
        setError("Không thể tải sản phẩm");
        setLoading(false);
      }
    };

    if (
      categories.length > 0 ||
      filter !== "category" ||
      !categoryDescription
    ) {
      fetchProducts();
    }
  }, [categoryDescription, page, categories, limit, filter, keyword]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            {filter === "category" && categoryTitle && (
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {categoryTitle}
              </h2>
            )}
            <div className="mt-6 grid grid-cols-2 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <p>Không có sản phẩm nào để hiển thị.</p>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <input
                      key={p}
                      className="join-item btn btn-square"
                      type="radio"
                      name="options"
                      aria-label={p.toString()}
                      checked={page === p}
                      onChange={() => setPage(p)}
                    />
                  )
                )}
                <button
                  className="join-item btn btn-square"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
