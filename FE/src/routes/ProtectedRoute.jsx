// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// Hàm tiện ích để đọc cookie theo tên
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = getCookie("token");

  // Chưa đăng nhập → về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Hợp lệ → render component con
  return children;
};

export default ProtectedRoute;
