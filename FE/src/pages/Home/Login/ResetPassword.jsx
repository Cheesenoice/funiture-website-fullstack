import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/password/reset",
        { token, passWord: password }
      );
      setMessage(response.data.message); // "Thay đổi mật khẩu thành công"
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2s
    } catch (err) {
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center">Đặt Lại Mật Khẩu</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Mật Khẩu Mới</span>
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Xác Nhận Mật Khẩu</span>
            </label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className="alert alert-success">
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || !token}
            >
              {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
