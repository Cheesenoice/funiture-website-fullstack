// src/pages/Home/Register.jsx
import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passWord: "",
    phoneNumber: "",
    token: "",
  });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage("");
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/register",
        formData
      );
      const responseData = response.data;

      // Kiểm tra code trong response body
      if (responseData.code === 500) {
        if (responseData.message.toLowerCase().includes("email")) {
          setMessage("Email đã được sử dụng. Vui lòng chọn email khác.");
        } else {
          setMessage(responseData.message || "Đăng ký không thành công");
        }
        setErrors([]);
        return;
      }

      // Nếu không có lỗi (code không phải 500)
      setMessage("Đăng ký thành công!");
      setErrors([]);
    } catch (error) {
      const errorResponse = error.response?.data;
      if (errorResponse?.code === 500) {
        if (errorResponse.message.toLowerCase().includes("email")) {
          setMessage("Email đã được sử dụng. Vui lòng chọn email khác.");
        } else {
          setMessage(errorResponse.message || "Đăng ký không thành công");
        }
        setErrors([]);
      } else if (errorResponse?.errors) {
        setErrors(errorResponse.errors);
        setMessage(errorResponse.message || "Đăng ký không thành công");
      } else {
        setMessage("Đã có lỗi xảy ra. Vui lòng thử lại!");
        setErrors([]);
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {message && (
        <div
          className={`alert ${
            errors.length ||
            message.includes("lỗi") ||
            message.includes("không thành công")
              ? "alert-error"
              : "alert-success"
          }`}
        >
          {message}
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">Họ và tên</span>
        </label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          className="input input-bordered w-full"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Số điện thoại</span>
        </label>
        <input
          type="text"
          name="phoneNumber"
          placeholder="Enter your phone number"
          className="input input-bordered w-full"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Mật khẩu</span>
        </label>
        <input
          type="password"
          name="passWord"
          placeholder="Enter your password"
          className="input input-bordered w-full"
          value={formData.passWord}
          onChange={handleChange}
          required
        />
        {errors.map((err, index) => (
          <p key={index} className="text-error text-sm mt-1">
            {err.msg}
          </p>
        ))}
      </div>

      <div>
        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>
      </div>
    </form>
  );
};

export default Register;
