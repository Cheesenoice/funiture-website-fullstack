import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Layout/Header/Header"; // Adjust the import path as needed

const ThankYou = () => {
  const navigate = useNavigate();

  const handleViewOrder = () => {
    navigate("/account/order"); // Adjust the route as needed
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">Thank You!</h1>
            <p className="text-lg">
              Your order has been successfully placed. We'll send you a
              confirmation email soon.
            </p>
            <div>
              <button
                onClick={handleViewOrder}
                className="btn btn-primary w-full"
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
