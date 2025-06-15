// src/pages/Auth/Login/UserLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogin = ({ setSuccess, setError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/login",
        {
          email: email,
          passWord: password,
        },
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        const { message, token } = response.data;
        const userData = {
          accessToken: token,
          role: "user",
        };
        localStorage.setItem("user", JSON.stringify(userData));

        alert(message);
        navigate("/");
      } else if (response.data.code === 404) {
        alert(response.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Sai mật khẩu."); // Lỗi kết nối hoặc lỗi từ server
    }
  };

  return (
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary w-full">
          Login
        </button>
      </div>
    </form>
  );
};

export default UserLogin;
