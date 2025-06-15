import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../Common/ProductCard";
import { productService } from "../../api/services/productService";

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Khởi tạo Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });

  // Hàm điều hướng
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts();
        if (response.success) {
          setProducts(response.data.products);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Responsive breakpoints
  useEffect(() => {
    if (!emblaApi) return;

    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      let slidesPerView = 1; // Desktop
      if (width < 768) slidesPerView = 1; // Mobile
      else if (width < 1024) slidesPerView = 1; // Tablet

      emblaApi.reInit({
        slidesToScroll: slidesPerView,
      });
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, [emblaApi]);

  if (loading) {
    return <p>Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-8 md:px-15 lg:px-20">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Customers also purchased
        </h2>

        <div className="relative">
          {/* Embla container */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -mx-2">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] px-2"
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm nào để hiển thị.</p>
              )}
            </div>
          </div>

          {/* Nút điều hướng custom */}
          <button
            onClick={scrollPrev}
            className="absolute cursor-pointer -left-6 md:-left-10 top-1/2 -translate-y-1/2 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-10 h-10 text-gray-900" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute cursor-pointer -right-6 md:-right-10 top-1/2 -translate-y-1/2 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-10 h-10 text-gray-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
