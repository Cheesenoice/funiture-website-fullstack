import { useState, useEffect } from "react";
import axios from "axios";

const AddAddressForm = ({
  onAddAddress,
  showToast,
  initialData,
  isEditing,
  onCancel,
}) => {
  const [addressForm, setAddressForm] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: initialData?.isDefault || false,
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Hàm parse fullAddress thành các trường riêng lẻ
  const parseFullAddress = (fullAddress) => {
    if (!fullAddress) return { street: "", ward: "", district: "", city: "" };
    // Giả định định dạng: "street, ward, district, city"
    const parts = fullAddress.split(", ").map((part) => part.trim());
    return {
      street: parts[0] || "",
      ward: parts[1] || "",
      district: parts[2] || "",
      city: parts[3] || "",
    };
  };

  // Khởi tạo addressForm từ initialData
  useEffect(() => {
    if (initialData?.fullAddress) {
      const parsed = parseFullAddress(initialData.fullAddress);
      setAddressForm({
        street: parsed.street,
        ward: parsed.ward,
        district: parsed.district,
        city: parsed.city,
        isDefault: initialData.isDefault || false,
      });
    }
  }, [initialData]);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        setProvinces(response.data);
        if (initialData?.fullAddress) {
          const parsed = parseFullAddress(initialData.fullAddress);
          const province = response.data.find((p) => p.name === parsed.city);
          if (province) setSelectedProvince(province.code.toString());
        }
      } catch (err) {
        showToast("Lỗi khi tải danh sách tỉnh/thành phố", "error");
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [initialData, showToast]);

  // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
          );
          setDistricts(response.data.districts);
          setWards([]);
          setSelectedDistrict("");
          if (initialData?.fullAddress) {
            const parsed = parseFullAddress(initialData.fullAddress);
            const district = response.data.districts.find(
              (d) => d.name === parsed.district
            );
            if (district) setSelectedDistrict(district.code.toString());
          }
        } catch (err) {
          showToast("Lỗi khi tải danh sách quận/huyện", "error");
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince, initialData, showToast]);

  // Lấy danh sách phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setLoadingWards(true);
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
          );
          setWards(response.data.wards);
          if (initialData?.fullAddress) {
            const parsed = parseFullAddress(initialData.fullAddress);
            setAddressForm((prev) => ({
              ...prev,
              ward: parsed.ward || "",
            }));
          }
        } catch (err) {
          showToast("Lỗi khi tải danh sách phường/xã", "error");
        } finally {
          setLoadingWards(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, initialData, showToast]);

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (
      !addressForm.street ||
      !addressForm.ward ||
      !addressForm.district ||
      !addressForm.city
    ) {
      showToast("Vui lòng điền đầy đủ thông tin địa chỉ.", "error");
      return;
    }
    // Ghép các trường thành fullAddress
    const fullAddress = `${addressForm.street}, ${addressForm.ward}, ${addressForm.district}, ${addressForm.city}`;
    const addressData = {
      fullAddress,
      isDefault: addressForm.isDefault,
    };
    onAddAddress(addressData);
    setAddressForm({
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    });
    setSelectedProvince("");
    setSelectedDistrict("");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Đường</span>
          </label>
          <input
            name="street"
            type="text"
            className="input input-bordered"
            value={addressForm.street}
            onChange={handleAddressFormChange}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tỉnh/Thành phố</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              const selectedCity = provinces.find(
                (p) => p.code.toString() === e.target.value
              )?.name;
              setAddressForm((prev) => ({ ...prev, city: selectedCity || "" }));
            }}
            disabled={loadingProvinces}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          {loadingProvinces && (
            <span className="loading loading-spinner loading-sm mt-2"></span>
          )}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Quận/Huyện</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              const selectedDist = districts.find(
                (d) => d.code.toString() === e.target.value
              )?.name;
              setAddressForm((prev) => ({
                ...prev,
                district: selectedDist || "",
              }));
            }}
            disabled={loadingDistricts || !selectedProvince}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          {loadingDistricts && (
            <span className="loading loading-spinner loading-sm mt-2"></span>
          )}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Phường/Xã</span>
          </label>
          <select
            className="select select-bordered w-full"
            name="ward"
            value={addressForm.ward}
            onChange={handleAddressFormChange}
            disabled={loadingWards || !selectedDistrict}
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.name}>
                {ward.name}
              </option>
            ))}
          </select>
          {loadingWards && (
            <span className="loading loading-spinner loading-sm mt-2"></span>
          )}
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Đặt làm địa chỉ mặc định</span>
            <input
              name="isDefault"
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={addressForm.isDefault}
              onChange={handleAddressFormChange}
            />
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-success"
        >
          {isEditing ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Hủy
          </button>
        )}
      </div>
    </div>
  );
};

export default AddAddressForm;
