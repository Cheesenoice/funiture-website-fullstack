import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/Layout/Header/Header";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import UserLogin from "./UserLogin";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google login callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(location.search);
      if (params.get("google_callback")) {
        try {
          const response = await axios.get(
            "http://localhost:3000/api/v1/google/profile",
            { withCredentials: true }
          );

          if (response.data.code === 200) {
            const { message } = response.data;
            alert(message);
            setSuccess(message);
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          }
        } catch (err) {
          const errorMessage =
            err.response?.data?.message ||
            "Đăng nhập Google thất bại. Vui lòng thử lại.";
          if (err.response?.data?.code === 404) {
            alert(errorMessage);
          }
          setError(errorMessage);
        }
      }
    };

    handleGoogleCallback();
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/v1/login/google";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-center flex-1">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-base-100">
          <div className="w-full max-w-md space-y-8">
            {/* Tab Navigation */}
            <div className="tabs tabs-boxed justify-center mb-6">
              <a
                className={`tab ${activeTab === "login" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </a>
              <a
                className={`tab ${
                  activeTab === "register" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </a>
              <a
                className={`tab ${activeTab === "forgot" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("forgot")}
              >
                Forgot Password
              </a>
            </div>

            {/* User Login */}
            {activeTab === "login" && (
              <>
                {success && (
                  <div className="alert alert-success">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                {error && (
                  <div className="alert alert-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <UserLogin setError={setError} setSuccess={setSuccess} />
              </>
            )}

            {/* Register */}
            {activeTab === "register" && <Register />}

            {/* Forgot Password */}
            {activeTab === "forgot" && <ForgotPassword />}

            {/* Social Login */}
            <p className="text-center text-sm">Or continue with</p>
            <div className="flex flex-col gap-4">
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="btn bg-white text-black border-[#e5e5e5] hover:bg-gray-100"
              >
                <svg
                  aria-label="Google logo"
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path d="m0 0H512V512H0" fill="#fff"></path>
                    <path
                      fill="#34a853"
                      d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                    ></path>
                    <path
                      fill="#4285f4"
                      d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                    ></path>
                    <path
                      fill="#fbbc02"
                      d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                    ></path>
                    <path
                      fill="#ea4335"
                      d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                    ></path>
                  </g>
                </svg>
                Login with Google
              </button>

              {/* Facebook */}
              <button className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#1566d8]">
                <svg
                  aria-label="Facebook logo"
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                >
                  <path
                    fill="white"
                    d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"
                  ></path>
                </svg>
                Login with Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center rounded-2xl mb-3"
          style={{
            backgroundImage: 'url("/collection/funiture-log.jpg")',
          }}
        ></div>
      </div>
    </div>
  );
};

export default Login;
