import React from "react";
import Header from "../../components/Layout/Header/Header";
import ProductCarousel from "../../components/Sections/ProductCarousel";
import ProductList from "../../components/Sections/ProductList";
import Collection from "../../components/Sections/Collection";
import SearchAiModal from "../../components/Common/SearchAi";
import Blog from "../../components/Sections/Blog";

function Home() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Header />
      </div>
      <Blog />
      <Collection />
      <ProductCarousel />
      <ProductList limit={4} filter="all" />
      <div className="fixed bottom-6 right-6 z-50">
        <SearchAiModal />
      </div>
    </div>
  );
}

export default Home;
