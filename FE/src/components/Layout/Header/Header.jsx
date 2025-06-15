import TopBar from "./TopBar";
import HeaderMain from "./HeaderMain";
import CategoryBar from "./CategoryBar";

const Header = () => {
  return (
    <div className="w-full">
      <TopBar />
      <HeaderMain />
      <CategoryBar />
    </div>
  );
};

export default Header;
