import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Layout/Footer/Footer";
import Home from "./pages/Home/Home";
import Login from "./pages/Home/Login/Login";
import ResetPassword from "./pages/Home/Login/ResetPassword";
import AdminLogin from "./pages/Home/Login/AdminLogin";
import ProductCollection from "./pages/Home/ProductCollection";
import ProductDetail from "./pages/Home/ProductDetail";
import Cart from "./pages/Home/Cart";
import Profile from "./pages/User/Profile";
import Header from "./components/Layout/Header/Header";
import SearchAi from "./components/Common/SearchAi";
import Checkout from "./pages/Home/Checkout";
import ThankYou from "./pages/Home/ThankYou";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/User/UserManagement";
import UserOrder from "./pages/Admin/User/UserOrder";
import ProductManagement from "./pages/Admin/Product/ProductManagement";
import FeaturedProduct from "./pages/Admin/Product/FeaturedProduct";
import AddEditProduct from "./pages/Admin/Product/AddEditProduct";
import CategoryManagement from "./pages/Admin/Category/CategoryManagement";
import OrderManagement from "./pages/Admin/Order/OrderManagement";
import OrderDetail from "./pages/Admin/Order/OrderDetail";
import BlogManagement from "./pages/Admin/Blog/BlogManagement";
import AddEditBlog from "./pages/Admin/Blog/AddEditBlog";
import BlogDetail from "./pages/Home/BlogDetail";
import ShippingFeeManagement from "./pages/Admin/ShippingFee/ShippingFeeManagement";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/account/password" element={<Profile />} />
          <Route path="/account/order" element={<Profile />} />
          <Route path="/account/address" element={<Profile />} />
          <Route path="/search" element={<SearchAi />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/productscollection"
            element={<ProductCollection filter="all" />}
          />
          <Route
            path="/productscollection/new"
            element={<ProductCollection filter="new" />}
          />
          <Route
            path="/productscollection/featured"
            element={<ProductCollection filter="featured" />}
          />
          <Route path="/" element={<ProductCollection filter="category" />} />
          <Route path="/productdetail/:slug" element={<ProductDetail />} />
          <Route
            path="/productscollection/category/:categoryDescription"
            element={<ProductCollection filter="category" />}
          />
          <Route
            path="/productscollection/search/:keyword"
            element={<ProductCollection filter="search" />}
          />
          <Route path="/blog/:slug" element={<BlogDetail />} />

          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:userId" element={<UserOrder />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/featured" element={<FeaturedProduct />} />
            <Route path="products/add" element={<AddEditProduct />} />
            <Route
              path="products/edit/:productId"
              element={<AddEditProduct />}
            />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/add" element={<AddEditBlog />} />
            <Route path="blog/edit/:blogId" element={<AddEditBlog />} />
            <Route path="shippingfee" element={<ShippingFeeManagement />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
