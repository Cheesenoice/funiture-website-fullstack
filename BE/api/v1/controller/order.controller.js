const Order = require("../../../model/oder.model");
const Account = require("../../../model/user.model");

module.exports.myOrder = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }
    const user = await Account.findOne({ token: token, deleted: false });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const userId = user._id;

    // Find all orders for this user
    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error("MyOrder API Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy đơn hàng" });
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Lấy tất cả đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error("GetAllOrders API Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy tất cả đơn hàng" });
  }
};

module.exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }
    const orders = await Order.find({ userId: userid }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng của user thành công",
      data: orders,
    });
  } catch (error) {
    console.error("GetOrdersByUserId API Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy đơn hàng của user",
    });
  }
};

module.exports.updateStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu orderId hoặc trạng thái mới" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    order.orderStatus = order.orderStatus || [];
    const validStatuses = [
      "Receiving orders",
      "Order processing",
      "Being delivered",
      "Delivered",
      "Canceled",
    ];
    const currentStatus =
      order.orderStatus[order.orderStatus.length - 1]?.status;

    if (status === "Canceled") {
      if (currentStatus !== "Canceled") {
        order.orderStatus.push({ status, time: new Date() });
      }
    } else {
      const currentIndex = validStatuses.indexOf(currentStatus);
      const newIndex = validStatuses.indexOf(status);

      if (newIndex === -1) {
        return res
          .status(400)
          .json({ success: false, message: "Trạng thái không hợp lệ" });
      }

      if (currentStatus === "Canceled" && newIndex > currentIndex) {
        order.orderStatus = order.orderStatus.filter(
          (s) => s.status !== "Canceled"
        );
      }

      if (newIndex <= currentIndex) {
        order.orderStatus = order.orderStatus.filter(
          (s) => validStatuses.indexOf(s.status) <= newIndex
        );
      } else if (newIndex === currentIndex) {
        order.orderStatus[order.orderStatus.length - 1].time = new Date();
      } else if (newIndex === currentIndex + 1) {
        order.orderStatus.push({ status, time: new Date() });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Không được nhảy bước" });
      }
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (error) {
    console.error("UpdateStatus API Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật trạng thái" });
  }
};

module.exports.cancelMyOrder = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }
    const user = await Account.findOne({ token: token, deleted: false });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const userId = user._id;
    const { id: orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Thiếu orderId" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    if (String(order.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền hủy đơn này" });
    }
    order.orderStatus = order.orderStatus || [];
    const currentStatus =
      order.orderStatus[order.orderStatus.length - 1]?.status;
    if (
      currentStatus === "Order processing" ||
      currentStatus === "Being delivered" ||
      currentStatus === "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được xử lý, không thể hủy",
      });
    }
    if (currentStatus === "Canceled by user") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được hủy bởi bạn trước đó",
      });
    }
    if (currentStatus === "Canceled") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã bị hủy bởi admin" });
    }
    order.orderStatus.push({ status: "Canceled by user", time: new Date() });
    await order.save();
    res
      .status(200)
      .json({ success: true, message: "Hủy đơn hàng thành công", data: order });
  } catch (error) {
    console.error("CancelMyOrder API Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi hủy đơn hàng" });
  }
};
