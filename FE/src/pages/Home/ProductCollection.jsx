import { useParams } from "react-router-dom";
import ProductList from "../../components/Sections/ProductList";
import Header from "../../components/Layout/Header/Header";
import SearchAiModal from "../../components/Common/SearchAi";

export default function ProductCollection({ filter = "all" }) {
  const { categoryDescription, keyword } = useParams();

  let heading, productListProps;
  switch (filter) {
    case "featured":
      heading = "Featured Products";
      productListProps = { filter, limit: 12 };
      break;
    case "new":
      heading = "New Products";
      productListProps = { filter, limit: 12 };
      break;
    case "category":
      productListProps = { filter, categoryDescription, limit: 12 };
      break;
    case "search":
      heading = keyword
        ? `Search Results for "${decodeURIComponent(keyword)}"`
        : "Search Results";
      productListProps = { filter, keyword, limit: 12 };
      break;
    default:
      heading = "All Products";
      productListProps = { filter: "all", limit: 12 };
  }

  return (
    <div className="bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {heading && (
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {heading}
          </h2>
        )}
        <ProductList {...productListProps} />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <SearchAiModal />
      </div>
    </div>
  );
}
