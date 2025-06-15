import React, { useState } from "react";
import axios from "axios";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      // Gửi request POST đến API login với axios và với tùy chọn withCredentials: true
      const response = await axios.post(
        "http://localhost:3000/api/v1/authAdmin/login",
        {
          email: email,
          passWord: passWord,
        },
        { withCredentials: true }
      );

      // Kiểm tra mã phản hồi từ server
      if (response.data.code === 200) {
        const { message, token } = response.data;

        const userData = {
          accessToken: token,
          role: "admin",
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // Hiển thị thông báo thành công
        alert(message); // "Đăng nhập thành công"

        // Chuyển hướng đến trang khác (ví dụ: Dashboard hoặc Trang chủ)
        window.location.href = "/admin/dashboard"; // Hoặc sử dụng navigate() nếu bạn dùng React Router
      } else if (response.data.code === 404) {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Sai mật khẩu."); // Lỗi kết nối hoặc lỗi từ server
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-100">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-500">{error}</div>
          )}

          <div>
            <button type="submit" className="btn btn-primary w-full">
              Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
