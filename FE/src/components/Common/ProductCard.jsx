// src/components/Common/ProductCard.jsx
import { Heart } from "lucide-react";
import { useState } from "react";
import AddToCartButton from "./AddToCartButton";

function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    product.thumbnail || "/collection/collection-chair.jpg"
  );

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Added to cart:", product.title || product.name);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageSrc("/collection/collection-chair.jpg"); // Fallback image
  };

  // Price calculation with NaN protection
  const price =
    product.discountPercentage && product.priceNew !== undefined
      ? Number(product.priceNew)
      : Number(product.price || 0);
  const formattedPrice = !isNaN(price)
    ? `${price.toLocaleString("vi-VN")} ₫`
    : "Giá không khả dụng";

  const originalPrice =
    product.discountPercentage && product.price !== undefined
      ? Number(product.price)
      : null;
  const formattedOriginalPrice =
    originalPrice && !isNaN(originalPrice)
      ? `${originalPrice.toLocaleString("vi-VN")} ₫`
      : null;

  const discount = product.discountPercentage
    ? `${product.discountPercentage}%`
    : null;

  return (
    <div className="p-4 ">
      <div className="relative">
        <a href={`/productdetail/${product.slug}`} className="block">
          <img
            alt={product.title || product.name}
            src={imageSrc}
            onError={handleImageError} // Switch to fallback if image fails
            className="w-full aspect-[3/4] rounded-md object-cover"
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}
            </span>
          )}
        </a>
        <div className="absolute bottom-2 right-2">
          <button
            onClick={handleLikeClick}
            className={`btn btn-soft btn-primary btn-circle ${
              isLiked ? "btn-active" : ""
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-rows-2">
        <div className="flex items-center justify-center h-12">
          <h3 className="text-base text-gray-700 line-clamp-2 max-w-[200px] text-center w-full">
            <a href={`/productdetail/${product.slug}`}>
              {product.title || product.name}
            </a>
          </h3>
        </div>
        <div className="flex items-center justify-center gap-5">
          <p className="text-sm font-bold text-primary">{formattedPrice}</p>

          {formattedOriginalPrice && (
            <p className="text-xs text-gray-500 line-through">
              {formattedOriginalPrice}
            </p>
          )}
        </div>
      </div>
      <AddToCartButton productId={product._id} disabled={product.stock === 0} />
    </div>
  );
}

export default ProductCard;
