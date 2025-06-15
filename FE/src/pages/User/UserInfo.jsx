import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig";
import Cookies from "js-cookie";
import Header from "../../components/Layout/Header/Header";
import MyOrder from "./MyOrder";
import MyAddress from "./MyAddress";
import { User, Lock, ShoppingBag, MapPin, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUrlMode, setIsUrlMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on URL
  const getActiveTab = () => {
    if (location.pathname.includes("/account/order")) return "orders";
    if (location.pathname.includes("/account/password")) return "password";
    if (location.pathname.includes("/account/address")) return "address";
    return "info";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

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
      .get("/my-accountClient", {
        headers: { Authorization: token },
      })
      .then((res) => {
        if (res.data?.data) {
          const data = res.data.data;
          setUser(data);
          setFormData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            avatar: data.avatar,
            position: data.position,
            status: data.status,
          });
          setPreviewUrl(data.avatar || null);
          setIsUrlMode(!!data.avatar); // Set URL mode if avatar exists
        }
      })
      .catch((err) => {
        showToast("Không thể tải thông tin người dùng.", "error");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Handle File Selection
  const handleFileChange = (e) => {
    if (!editing) return;
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(formData.avatar || null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file hình ảnh!", "error");
      setSelectedFile(null);
      setPreviewUrl(formData.avatar || null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File quá lớn, vui lòng chọn file dưới 10MB!", "error");
      setSelectedFile(null);
      setPreviewUrl(formData.avatar || null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, avatar: "" })); // Clear avatar URL
  };

  // Handle URL Input Change
  const handleUrlChange = (e) => {
    if (!editing) return;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, avatar: value }));
    setPreviewUrl(value || null);
    setSelectedFile(null); // Clear selected file
  };

  // Handle Remove Image
  const handleRemoveImage = () => {
    if (!editing) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  // Toggle Input Mode
  const toggleInputMode = () => {
    if (!editing) return;
    setIsUrlMode(!isUrlMode);
    setSelectedFile(null);
    setPreviewUrl(formData.avatar || null);
  };

  const handleFormChange = (e) => {
    if (!editing) return;
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

  const handleSaveInfo = async () => {
    const token = getAuthToken();
    let avatarUrl = formData.avatar;

    // Upload file to Cloudinary if a new file is selected
    if (selectedFile) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedFile);
      formDataUpload.append("upload_preset", "cmzggqqw");
      formDataUpload.append("folder", "user_avatars");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dgxjlc8zt/image/upload",
          {
            method: "POST",
            body: formDataUpload,
          }
        );

        if (!res.ok) {
          throw new Error(`Upload thất bại: ${res.status}`);
        }

        const data = await res.json();
        avatarUrl = data.secure_url;
      } catch (error) {
        showToast(`Upload ảnh thất bại: ${error.message}`, "error");
        setEditing(false);
        return;
      }
    }

    const payload = {
      ...formData,
      avatar: avatarUrl,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Cập nhật thành công!", "success");
        setUser(res.data.data);
        setEditing(false);
        setPreviewUrl(avatarUrl || null);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleAddAddress = (newAddress) => {
    const token = getAuthToken();
    const updatedAddresses = user.address
      ? [...user.address, newAddress]
      : [newAddress];

    const payload = {
      ...formData,
      address: updatedAddresses,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Thêm địa chỉ thành công!", "success");
        setUser(res.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Thêm địa chỉ thất bại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleUpdateAddress = (updatedAddress) => {
    const token = getAuthToken();
    const updatedAddresses = user.address.map((addr) =>
      addr._id === updatedAddress._id ? updatedAddress : addr
    );

    const payload = {
      ...formData,
      address: updatedAddresses,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Cập nhật địa chỉ thành công!", "success");
        setUser(res.data.data);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message || "Cập nhật địa chỉ thất bại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleDeleteAddress = (addressId) => {
    const token = getAuthToken();
    const updatedAddresses = user.address.filter(
      (addr) => addr._id !== addressId
    );

    const payload = {
      ...formData,
      address: updatedAddresses,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Xóa địa chỉ thành công!", "success");
        setUser(res.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Xóa địa chỉ thất bại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleSetDefaultAddress = (addressId) => {
    const token = getAuthToken();
    const updatedAddresses = user.address.map((addr) => ({
      ...addr,
      isDefault: addr._id === addressId,
    }));

    const payload = {
      ...formData,
      address: updatedAddresses,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Đặt địa chỉ mặc định thành công!", "success");
        setUser(res.data.data);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message || "Đặt địa chỉ mặc định thất bại.";
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
      .patch("/my-accountClient/edit", payload, {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "info") navigate("/account");
    else if (tab === "password") navigate("/account/password");
    else if (tab === "orders") navigate("/account/order");
    else if (tab === "address") navigate("/account/address");
  };

  if (!user)
    return <div className="flex justify-center mt-10">Đang tải...</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-start justify-center p-4 h-8/10">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Left Sidebar Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col items-center space-y-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        previewUrl ||
                        user?.avatar ||
                        "https://i.pravatar.cc/150"
                      }
                      onError={(e) => {
                        e.target.src = "https://i.pravatar.cc/150";
                      }}
                      alt="avatar"
                    />
                  </div>
                </div>
                <h2 className="card-title">{user.fullName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="divider"></div>
              <ul className="menu menu-vertical space-y-2">
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "info" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("info")}
                  >
                    <User size={20} />
                    Tùy chỉnh thông tin
                  </a>
                </li>
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "password" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("password")}
                  >
                    <Lock size={20} />
                    Đổi mật khẩu
                  </a>
                </li>
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "orders" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("orders")}
                  >
                    <ShoppingBag size={20} />
                    Đơn hàng của tôi
                  </a>
                </li>
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "address" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("address")}
                  >
                    <MapPin size={20} />
                    Địa chỉ của tôi
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Content Area (spanning 2 columns) */}
          <div className="card bg-base-100 h-fit shadow-xl md:col-span-2">
            <div className="card-body">
              {activeTab === "info" ? (
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Họ tên", name: "fullName", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    {
                      label: "Số điện thoại",
                      name: "phoneNumber",
                      type: "text",
                    },
                  ].map(({ label, name, type }) => (
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
                  <div className="form-control">
                    <label className="label">Ảnh đại diện</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={isUrlMode ? "url" : "file"}
                        accept={isUrlMode ? undefined : "image/*"}
                        name="avatar"
                        value={isUrlMode ? formData.avatar : undefined}
                        onChange={
                          isUrlMode ? handleUrlChange : handleFileChange
                        }
                        placeholder={
                          isUrlMode
                            ? "Nhập link ảnh (https://example.com/image.jpg)"
                            : undefined
                        }
                        className={
                          isUrlMode
                            ? "input input-bordered w-full"
                            : "file-input file-input-bordered w-full"
                        }
                        disabled={!editing}
                      />
                      <button
                        type="button"
                        onClick={toggleInputMode}
                        className="btn btn-sm btn-outline"
                        disabled={!editing}
                      >
                        {isUrlMode ? "Chọn File" : "Nhập URL"}
                      </button>
                    </div>
                    {previewUrl && (
                      <div className="relative mt-2 w-24 h-24">
                        <img
                          src={previewUrl}
                          alt="Avatar Preview"
                          className="w-24 h-24 object-cover rounded border"
                          onError={(e) => (e.target.style.display = "none")}
                          onLoad={(e) => (e.target.style.display = "block")}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 btn btn-xs btn-circle btn-error"
                          disabled={!editing}
                        >
                          <X />
                        </button>
                      </div>
                    )}
                  </div>

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
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              fullName: user.fullName,
                              email: user.email,
                              phoneNumber: user.phoneNumber,
                              avatar: user.avatar,
                              position: user.position,
                              status: user.status,
                            });
                            setPreviewUrl(user.avatar || null);
                            setSelectedFile(null);
                            setIsUrlMode(!!user.avatar);
                          }}
                          className="btn btn-outline"
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-primary"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              ) : activeTab === "password" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-control">
                    <label className="label block">Mật khẩu mới</label>
                    <input
                      name="newPassword"
                      type="password"
                      className="input input-bordered"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label block">Xác nhận mật khẩu</label>
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
              ) : activeTab === "address" ? (
                <MyAddress
                  addresses={user.address}
                  onAddAddress={handleAddAddress}
                  onUpdateAddress={handleUpdateAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                  showToast={showToast}
                />
              ) : (
                <MyOrder />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
