// src/pages/Profile.jsx
import React from "react";
import UserInfo from "./UserInfo";
import AdminInfo from "./AdminInfo";

const Profile = () => {
  const userStorage = localStorage.getItem("user");
  let role = "user";

  try {
    role = JSON.parse(userStorage)?.role || "user";
  } catch (error) {
    console.error("Không thể đọc role từ localStorage:", error);
  }

  return role === "admin" ? <AdminInfo /> : <UserInfo />;
};

export default Profile;
