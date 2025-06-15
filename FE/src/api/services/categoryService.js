// src/api/categoryService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/product-category/";

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await axios.get(API_URL);
      // Extract the actual categories from response.data[0].data
      const categories = response.data[0].data.map((category) => ({
        category_id: category.id,
        name: category.name,
        description: category.slug, // Use slug for URL generation
        subcategories: category.children.map((child) => ({
          category_id: child.id,
          name: child.name,
          description: child.slug,
        })),
      }));
      return { success: true, data: categories };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error };
    }
  },
};
