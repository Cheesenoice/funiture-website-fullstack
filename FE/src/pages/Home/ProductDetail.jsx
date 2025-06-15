import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/Common/ProductCard";
import { productService } from "../../api/services/productService";
import Header from "../../components/Layout/Header/Header";
import AddToCartButton from "../../components/Common/AddToCartButton";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null); // Add state for main image

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductBySlug(slug);
        if (response.success) {
          setProduct(response.data.product);
          setImageSrc(
            response.data.product.thumbnail ||
              "/collection/collection-chair.jpg"
          ); // Initial image
          setRelatedProducts(response.data.relatedProducts);
        } else {
          throw new Error(response.error || "Failed to fetch product");
        }
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>{error || "Sản phẩm không tồn tại"}</p>
        </div>
      </div>
    );
  }

  const price =
    product.discountPercentage && product.priceNew !== undefined
      ? Number(product.priceNew)
      : Number(product.price || 0);
  const formattedPrice = !isNaN(price)
    ? `${price.toLocaleString("vi-VN")} VNĐ`
    : "Giá không khả dụng";

  const originalPrice =
    product.discountPercentage && product.price !== undefined
      ? Number(product.price)
      : null;
  const formattedOriginalPrice =
    originalPrice && !isNaN(originalPrice)
      ? `${originalPrice.toLocaleString("vi-VN")} VNĐ`
      : null;

  const discount = product.discountPercentage
    ? `${product.discountPercentage}%`
    : null;

  // Handle image load error for main product
  const handleImageError = () => {
    setImageSrc("/collection/collection-chair.jpg");
  };

  return (
    <div className="bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {/* Product Details */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Image */}
          <div className="relative">
            <img
              src={imageSrc}
              alt={product.title}
              onError={handleImageError} // Switch to fallback if image fails
              className="w-[70%] aspect-[3/4] rounded-md object-cover"
            />
            {discount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discount}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="mt-10 lg:mt-0">
            <h1 className="text-3xl font-bold text-gray-900">
              {product.title}
            </h1>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
            <div className="mt-4 flex items-center">
              <p className="text-2xl font-bold text-primary">
                {formattedPrice}
              </p>
              {formattedOriginalPrice && (
                <p className="ml-4 text-lg text-gray-500 line-through">
                  {formattedOriginalPrice}
                </p>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Màu sắc: <span className="font-medium">{product.color}</span>
              </p>
              <p className="text-sm text-gray-600">
                Tình trạng:{" "}
                <span className="font-medium">
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </p>
            </div>
            <div className="mt-6">
              <AddToCartButton
                productId={product._id}
                disabled={product.stock === 0}
              />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">
              Sản phẩm liên quan
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  to={`/productdetail/${relatedProduct.slug}`}
                  key={relatedProduct._id}
                >
                  <ProductCard product={relatedProduct} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
