import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, Plus } from "lucide-react";
import Header from "../../components/Layout/Header/Header";
import AddAddressForm from "../../components/Common/AddAddressForm";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [prefetchedCarts, setPrefetchedCarts] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    addressId: "",
    paymentMethod: "cod",
  });

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const localUserData = JSON.parse(localStorage.getItem("user"));
        const token = localUserData?.accessToken;

        if (!token) {
          throw new Error("Không tìm thấy token");
        }

        // Fetch user
        const userResponse = await axios.get(
          "http://localhost:3000/api/v1/my-accountClient",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const responseUserData = userResponse.data.data;
        setUser(responseUserData);
        const defaultAddress =
          responseUserData.address?.find((addr) => addr.isDefault) ||
          responseUserData.address?.[0];

        // Fetch cart with default address
        const cartResponse = await axios.get(
          `http://localhost:3000/api/v1/checkout/${defaultAddress?._id || ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setCart(
          cartResponse.data.status === "success"
            ? cartResponse.data.data
            : { items: [], subtotal: 0, shippingFee: 0, totalPrice: 0 }
        );

        setFormData({
          name: responseUserData.fullName || "",
          email: responseUserData.email || "",
          phone: responseUserData.phoneNumber || "",
          addressId: defaultAddress?._id || "",
          paymentMethod: "cod",
        });

        // Prefetch cart data for all addresses
        const prefetchPromises = responseUserData.address
          .filter((addr) => addr._id !== defaultAddress?._id)
          .map((addr) =>
            axios
              .get(`http://localhost:3000/api/v1/checkout/${addr._id}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
              .then((res) => ({ addressId: addr._id, data: res.data.data }))
          );

        const prefetchedResults = await Promise.allSettled(prefetchPromises);
        const newPrefetchedCarts = {};
        prefetchedResults.forEach((result) => {
          if (result.status === "fulfilled") {
            newPrefetchedCarts[result.value.addressId] = result.value.data;
          }
        });
        setPrefetchedCarts(newPrefetchedCarts);
      } catch (err) {
        showToast(err.message || "Lỗi khi tải dữ liệu", "error");
        setCart({ items: [], subtotal: 0, shippingFee: 0, totalPrice: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAddress = async (address) => {
    try {
      const localUserData = JSON.parse(localStorage.getItem("user"));
      const token = localUserData?.accessToken;

      // Check if cart data is prefetched
      if (prefetchedCarts[address._id]) {
        setCart(prefetchedCarts[address._id]);
        setFormData((prev) => ({ ...prev, addressId: address._id }));
        showToast("Cập nhật địa chỉ thành công!", "success");
        return;
      }

      // Fetch cart with selected address if not prefetched
      const cartResponse = await axios.get(
        `http://localhost:3000/api/v1/checkout/${address._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setCart(cartResponse.data.data);
      setPrefetchedCarts((prev) => ({
        ...prev,
        [address._id]: cartResponse.data.data,
      }));
      setFormData((prev) => ({ ...prev, addressId: address._id }));
      showToast("Cập nhật địa chỉ thành công!", "success");
    } catch (err) {
      showToast(err.message || "Lỗi khi cập nhật địa chỉ", "error");
    }
  };

  const handleAddAddress = async (newAddress) => {
    try {
      const localUserData = JSON.parse(localStorage.getItem("user"));
      const token = localUserData?.accessToken;

      const updatedAddresses = [...(user?.address || []), newAddress];
      const payload = {
        ...user,
        address: updatedAddresses,
      };

      const response = await axios.patch(
        "http://localhost:3000/api/v1/my-accountClient/edit",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setUser(response.data.data);
      setFormData((prev) => ({ ...prev, addressId: newAddress._id }));
      setShowAddAddress(false);
      showToast("Thêm địa chỉ thành công!", "success");

      // Fetch cart with new address
      const cartResponse = await axios.get(
        `http://localhost:3000/api/v1/checkout/${newAddress._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setCart(cartResponse.data.data);
      setPrefetchedCarts((prev) => ({
        ...prev,
        [newAddress._id]: cartResponse.data.data,
      }));
    } catch (err) {
      showToast(err.message || "Lỗi khi thêm địa chỉ", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const localUserData = JSON.parse(localStorage.getItem("user"));
      const token = localUserData?.accessToken;

      const response = await axios.post(
        "http://localhost:3000/api/v1/checkout/order",
        {
          name: formData.name,
          email: formData.email,
          addressId: formData.addressId,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        if (formData.paymentMethod === "momo") {
          window.location.href = response.data.payUrl;
        } else {
          showToast("Đặt hàng COD thành công!", "success");
          window.location.href = "/thank-you";
        }
      } else {
        throw new Error("Không thể xử lý đơn hàng");
      }
    } catch (err) {
      showToast(err.message || "Lỗi khi xử lý đơn hàng", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getValidImage = (image) =>
    image && image !== "null" && image !== "undefined"
      ? image
      : "/collection/collection-chair.jpg";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center text-gray-500 p-4">
          <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-xl font-semibold">Giỏ hàng của bạn đang trống</p>
          <a href="/" className="btn btn-primary mt-4">
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
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
        <h2 className="text-2xl font-bold mb-6">Thanh toán</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin giao hàng
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Họ và tên</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Số điện thoại</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Chọn địa chỉ giao hàng</span>
                  </label>
                  {user?.address?.length > 0 ? (
                    <div className="space-y-2">
                      {user.address.map((addr) => (
                        <label
                          key={addr._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            className="radio radio-primary"
                            onChange={() => handleSelectAddress(addr)}
                            checked={formData.addressId === addr._id}
                          />
                          <span>
                            {addr.fullAddress}
                            {addr.isDefault && (
                              <span className="badge badge-success ml-2">
                                Mặc định
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Chưa có địa chỉ nào được thêm.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="btn btn-outline btn-primary mt-2"
                  >
                    <Plus size={20} className="mr-2" />
                    {showAddAddress
                      ? "Ẩn form thêm địa chỉ"
                      : "Thêm địa chỉ mới"}
                  </button>
                  {showAddAddress && (
                    <AddAddressForm
                      onAddAddress={handleAddAddress}
                      showToast={showToast}
                    />
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phương thức thanh toán</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="label cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </label>
                    <label className="label cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === "momo"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">MoMo</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={submitting || !formData.addressId}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner"></span>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Xác nhận đơn hàng"
                  )}
                </button>
              </form>
            </div>
          </div>
          <div>
            <div className="card bg-base-100 shadow-md p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={getValidImage(item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/collection/collection-chair.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p>
                        {parseFloat(item.priceNew).toLocaleString("vi-VN")}₫ x
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {item.totalPrice.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{cart.subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{cart.shippingFee.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
