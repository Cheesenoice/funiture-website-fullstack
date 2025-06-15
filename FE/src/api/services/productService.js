import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/products/";

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const { slug, ...queryParams } = params;
      const url = slug ? `${API_URL}${slug}` : API_URL;
      const response = await axios.get(url, { params: queryParams });

      let products = [];
      let totalPages = 1;
      let category = null;

      if (Array.isArray(response.data) && response.data[0]?.code === 200) {
        products = response.data[0].data;
        totalPages = parseInt(response.data[0].totalPages) || 1;
        category = response.data[0].category || null;
      } else if (response.data.success && response.data.data?.products) {
        products = response.data.data.products;
        totalPages = parseInt(response.data.data.totalPages) || 1;
        category = response.data.data.category || null;
      } else {
        throw new Error("Invalid API response format");
      }

      return { success: true, data: { products, totalPages, category } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}detail/${slug}`);
      if (response.data.success && response.data.data?.product) {
        return {
          success: true,
          data: {
            product: response.data.data.product,
            relatedProducts: response.data.data.relatedProducts,
          },
        };
      }
      throw new Error("Invalid product detail response");
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
