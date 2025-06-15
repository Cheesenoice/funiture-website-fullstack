// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// Hàm tiện ích để đọc cookie theo tên
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

const AdminRoute = ({ children }) => {
  const token = getCookie("token");
  let user = null;

  // Lấy và parse user từ localStorage
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }

  // Kiểm tra token có giá trị là "1" và user có role là "admin"
  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // Hợp lệ → render component con
  return children;
};

export default AdminRoute;
