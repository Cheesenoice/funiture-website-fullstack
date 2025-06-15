import React, { useState } from "react";
import AddAddressForm from "../../components/Common/AddAddressForm";

const MyAddress = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  showToast,
}) => {
  const [editingAddress, setEditingAddress] = useState(null);

  const handleEditAddress = (address) => {
    setEditingAddress(address);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  const handleSubmitAddress = (addressData) => {
    if (!addressData.fullAddress) {
      showToast("Vui lòng điền đầy đủ thông tin địa chỉ.", "error");
      return;
    }

    if (editingAddress) {
      onUpdateAddress({ ...addressData, _id: editingAddress._id });
      setEditingAddress(null);
    } else {
      onAddAddress(addressData);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Địa chỉ của tôi</h2>
      {/* Form thêm/sửa địa chỉ */}
      <AddAddressForm
        onAddAddress={handleSubmitAddress}
        showToast={showToast}
        initialData={editingAddress}
        isEditing={!!editingAddress}
        onCancel={handleCancelEdit}
      />
      {/* Danh sách địa chỉ */}
      <div className="mt-6">
        {addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr._id} className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <div className="flex flex-col justify-between items-center">
                    <div className="self-start mb-2">
                      <p>
                        <strong>Địa chỉ:</strong> {addr.fullAddress}
                      </p>
                      {addr.isDefault && (
                        <span className="badge badge-success">Mặc định</span>
                      )}
                    </div>
                    <div className="flex self-end space-x-2">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDeleteAddress(addr._id)}
                        className="btn btn-sm btn-outline btn-error"
                      >
                        Xóa
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => onSetDefaultAddress(addr._id)}
                          className="btn btn-sm btn-outline btn-success"
                        >
                          Đặt mặc định
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có địa chỉ nào được thêm.</p>
        )}
      </div>
    </div>
  );
};

export default MyAddress;
