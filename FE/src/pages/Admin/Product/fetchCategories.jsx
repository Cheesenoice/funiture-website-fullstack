export const flattenCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  const flatList = [];
  const processCategory = (category, parentName = null) => {
    const displayName = parentName
      ? `${parentName} > ${category.name}`
      : category.name;
    flatList.push({ id: category.id, name: displayName, slug: category.slug });
    if (category.children && category.children.length > 0) {
      category.children.forEach((sub) => processCategory(sub, category.name));
    }
  };
  categories.forEach((cat) => processCategory(cat));
  return flatList;
};

export const fetchCategories = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData || !userData.accessToken) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await fetch(
      "http://localhost:3000/api/v1/product-category/",
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (
      Array.isArray(responseData) &&
      responseData.length > 0 &&
      responseData[0] &&
      Array.isArray(responseData[0].data)
    ) {
      const categoriesArray = responseData[0].data;
      return flattenCategories(categoriesArray);
    } else {
      console.error("Unexpected API response structure:", responseData);
      throw new Error("Định dạng dữ liệu danh mục không hợp lệ.");
    }
  } catch (e) {
    console.error("Lỗi tải danh mục:", e);
    throw e;
  }
};
