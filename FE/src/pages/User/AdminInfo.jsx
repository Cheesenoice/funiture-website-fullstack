import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig";
import Cookies from "js-cookie";
import Header from "../../components/Layout/Header/Header";

const AdminInfo = () => {
  const [admin, setAdmin] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info | password
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    position: "",
    status: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  const getAuthToken = () => {
    const token = Cookies.get("token");
    return token ? `Bearer ${token}` : "";
  };

  useEffect(() => {
    const token = getAuthToken();
    axios
      .get("/my-accountAdmin", {
        headers: { Authorization: token },
      })
      .then((res) => {
        if (res.data?.data) {
          const data = res.data.data;
          setAdmin(data);
          setFormData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            avatar: data.avatar,
            position: data.position,
            status: data.status,
          });
        }
      })
      .catch((err) => {
        showToast("Không thể tải thông tin admin.", "error");
        console.error(err);
      });
  }, []);

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveInfo = () => {
    const token = getAuthToken();
    const payload = {
      ...formData,
      passWord: "", // gửi rỗng nếu không đổi mật khẩu
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountAdmin/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Cập nhật thành công!", "success");
        setAdmin(res.data.data);
        setEditing(false);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleChangePassword = () => {
    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      return showToast("Vui lòng điền đầy đủ mật khẩu.", "error");
    }

    if (newPassword !== confirmPassword) {
      return showToast("Mật khẩu không khớp.", "error");
    }

    const token = getAuthToken();
    const payload = {
      ...formData,
      passWord: newPassword,
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountAdmin/edit", payload, {
        headers: { Authorization: token },
      })
      .then(() => {
        showToast("Đổi mật khẩu thành công!", "success");
        setPasswordData({ newPassword: "", confirmPassword: "" });
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  if (!admin)
    return <div className="flex justify-center mt-10">Đang tải...</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center p-4">
        {toast.visible && (
          <div className="toast toast-top toast-end">
            <div
              className={`alert ${
                toast.type === "success" ? "alert-success" : "alert-error"
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Avatar & Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={admin?.avatar || "https://i.pravatar.cc/150"}
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/150";
                    }}
                    alt="avatar"
                  />
                </div>
              </div>
              <h2 className="card-title">{admin.fullName}</h2>
              <h2>ADMIN</h2>
              <p className="text-sm text-gray-500">{admin.email}</p>
            </div>

            {/* Tabs */}
            <div className="mt-6 tabs tabs-boxed">
              <a
                className={`tab ${activeTab === "info" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                Tùy chỉnh thông tin
              </a>
              <a
                className={`tab ${
                  activeTab === "password" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("password")}
              >
                Đổi mật khẩu
              </a>
            </div>

            {/* Tab content */}
            {activeTab === "info" ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Họ tên", name: "fullName" },
                  { label: "Email", name: "email" },
                  { label: "Số điện thoại", name: "phoneNumber" },
                  { label: "Ảnh đại diện (URL)", name: "avatar" },
                ].map(({ label, name, type = "text" }) => (
                  <div className="form-control" key={name}>
                    <label className="label">{label}</label>
                    <input
                      name={name}
                      type={type}
                      className="input input-bordered"
                      value={formData[name]}
                      onChange={handleFormChange}
                      disabled={!editing}
                    />
                  </div>
                ))}

                <div className="col-span-2 flex justify-end space-x-4 mt-4">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSaveInfo}
                        className="btn btn-success"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="btn btn-outline"
                      >
                        Huỷ
                      </button>
                    </>
                  ) : (
                    <div className="flex justify-between w-full">
                      <a href="/admin/dashboard">
                        <button className="btn btn-info">Đến Dashboard</button>
                      </a>
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-primary"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label className="label block ">Mật khẩu mới</label>
                  <input
                    name="newPassword"
                    type="password"
                    className="input input-bordered"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label block ">Xác nhận mật khẩu</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="input input-bordered"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    className="btn btn-warning"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInfo;
