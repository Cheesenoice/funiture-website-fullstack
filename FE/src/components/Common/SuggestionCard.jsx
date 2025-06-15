import React, { useState } from "react";
import { MapPin, Tag, FileText } from "lucide-react";
import { Link } from "react-router-dom";

function SuggestionCard({ suggestion }) {
  // State for image error handling
  const [imageSrc, setImageSrc] = useState(
    suggestion.thumbnail || "/collection/collection-chair.jpg" // Use 'thumbnail' instead of 'thumbNail'
  );

  // Handle image load error
  const handleImageError = () => {
    setImageSrc("/collection/collection-chair.jpg"); // Fallback image path
  };

  // Format price
  const price = Number(suggestion.price || 0);
  const formattedPrice = !isNaN(price)
    ? `${price.toLocaleString("vi-VN")} ₫`
    : "Giá không khả dụng";

  // Determine link path
  const productDetailPath = `/productdetail/${suggestion.slug}`;

  return (
    <Link to={productDetailPath} className="block w-full">
      <div className="flex flex-row items-center bg-base-100 shadow-md rounded-lg border border-gray-200 overflow-hidden transition-transform transform hover:scale-[1.01]">
        <figure className="w-24 sm:w-30 md:w-35 flex-shrink-0 aspect-square overflow-hidden">
          <img
            src={imageSrc}
            alt={suggestion.title || "Sản phẩm đề xuất"}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </figure>
        <div className="flex-grow p-3 flex flex-col justify-center min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {suggestion.title || "Sản phẩm không tên"}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
            <Tag size={12} className="text-primary flex-shrink-0" />
            <span className="font-bold text-primary text-sm flex-shrink-0">
              {formattedPrice}
            </span>
            {suggestion.color && (
              <>
                <span className="mx-0.5 text-gray-400 flex-shrink-0">|</span>
                <span className="flex-grow truncate">
                  Màu {suggestion.color}
                </span>
              </>
            )}
          </div>
          {suggestion.position && (
            <div className="flex items-start gap-1 text-xs text-gray-600 mt-1">
              <MapPin
                size={12}
                className="text-blue-600 flex-shrink-0 mt-0.5"
              />
              <span className="line-clamp-1 truncate">
                <span className="font-semibold">Vị trí:</span>{" "}
                {suggestion.position}
              </span>
            </div>
          )}
          {suggestion.notes && (
            <div className="flex items-start gap-1 text-xs text-gray-600 mt-1">
              <FileText
                size={12}
                className="text-green-600 flex-shrink-0 mt-0.5"
              />
              <p className="line-clamp-3 flex-grow">
                <span className="font-semibold">Ghi chú:</span>{" "}
                {suggestion.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default SuggestionCard;
