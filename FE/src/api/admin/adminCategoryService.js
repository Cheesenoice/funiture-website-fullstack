import apiClient from "../../config/axiosConfig";

const adminCategoryService = {
  getCategories: async () => {
    const response = await apiClient.get("/admin/categories");
    return response.data;
  },
  createCategory: async (data) => {
    const response = await apiClient.post("/admin/categories", data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await apiClient.patch(`/admin/categories/${id}`, data);
    return response.data;
  },
};

export default adminCategoryService;
