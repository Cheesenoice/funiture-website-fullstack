import React from "react";

const Collection = () => {
  return (
    <div className="bg-white py-5">
      <div className="container mx-auto py-10 px-4">
        {/* Grid Layout for Images */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Top Row: 3 Images */}
          <div className="relative">
            <a href="/productscollection/category/sofa" className="block">
              {/* Image 1 (Sofa) */}
              <img
                src="/collection/collection-sofa.jpg" // Đường dẫn từ thư mục public
                alt="Sofa"
                className="w-full h-64 object-cover rounded-lg"
              />
              {/* Label */}
              <div className="absolute text-white text-2xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                SOFA
              </div>
            </a>
          </div>

          <div className="relative">
            <a href="/table" className="block">
              {/* Image 2 (Table) */}
              <img
                src="/collection/collection-diningtable.jpg"
                alt="Table"
                className="w-full h-64 object-cover rounded-lg"
              />
              {/* Label */}
              <div className="absolute text-white text-2xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                BÀN ĂN
              </div>
            </a>
          </div>

          <div className="relative col-span-2 md:col-span-1 ">
            <a href="/bed" className="block">
              {/* Image 3 (Bed) */}
              <img
                src="/collection/collection-bed.jpg"
                alt="Bed"
                className="w-full h-64 object-cover rounded-lg"
              />
              {/* Label */}
              <div className="absolute text-white text-2xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                GIƯỜNG
              </div>
            </a>
          </div>

          {/* Bottom Row: 2 Images */}
          <div className="relative md:col-span-2">
            <a href="/cabinet" className="block">
              {/* Image 4 (cabinet) */}
              <img
                src="/collection/collection-cabinet.jpg"
                alt="Cabinet"
                className="w-full h-64 object-cover rounded-lg"
              />
              {/* Label */}
              <div className="absolute text-white text-2xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                CABINET
              </div>
            </a>
          </div>

          <div className="relative">
            <a href="/chair" className="block">
              {/* Image 5 (Chair) */}
              <img
                src="/collection/collection-chair.jpg"
                alt="Chair"
                className="w-full h-64 object-cover rounded-lg"
              />
              {/* Label */}
              <div className="absolute text-white text-2xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                GHẾ
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
