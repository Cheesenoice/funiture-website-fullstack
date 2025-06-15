# 🪑 FurnitureStore - E-Commerce Platform

**FurnitureStore** is a modern e-commerce platform that allows users to browse, search, and purchase furniture items online conveniently and efficiently. The system is designed for both end-users (customers) and administrators, with full functionality for managing shopping carts, orders, and business reports.

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Frontend](#frontend)
4. [Backend](#backend)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

---

## 🧾 Introduction

**FurnitureStore** is a Software Engineering project developed by PTIT students. It aims to build a complete online furniture shopping platform, capable of:

- Managing products, orders, shipping, and customer information.
- Supporting both online payment and cash on delivery (COD).
- Integrating AI chatbot for customer support.

---

## 🚀 Features

- 💳 **Flexible Payment:** Supports MoMo and COD.
- 🛒 **Smart Cart:** Add, update, delete products and save wishlist items.
- 🔎 **Advanced Search:** Filter by price, color, material, and category.
- 📦 **Order Management:** Track order status, cancel orders, receive notifications.
- 🛠️ **Admin Dashboard:** Manage products, accounts, orders, and reports.
- 🗺️ **Map-Based Shipping Fee**: Automatically calculate delivery fee using Map API based on distance.
- 🤖 **AI Support (Gemini):** Chatbot for assistance and product suggestions.

---

## 🎨 Frontend

### 🛠 Technologies Used

- **React.js** – UI development.
- **Tailwind CSS** – Responsive design.
- **React Router** – Page routing.

### ▶️ Frontend Setup

```bash
# Navigate to frontend directory
cd fe

# Install dependencies
npm install

# Run development server
npm start
```

---

## 🧩 Backend

### ⚙️ Technologies Used

- **Node.js + Express** – Build RESTful API.
- **MongoDB** – NoSQL database.
- **JWT** – Secure authentication.
- **Mongoose** – ORM for MongoDB.
- **Map API** – Calculate shipping fees by distance.
- **MoMo SDK** – Payment integration.

### ▶️ Backend Setup

```bash
# Navigate to backend directory
cd be

# Create a .env file with the following content:
# DB_URI=mongodb://localhost:27017/furniturestore
# JWT_SECRET=your_jwt_secret
# MOMO_PARTNER_CODE=xxx
# MOMO_ACCESS_KEY=xxx
# MOMO_SECRET_KEY=xxx
# BASE_URL=http://localhost:3000

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🧪 Usage

1. Visit the customer interface at `http://localhost:3000`
2. Register an account, browse products, add to cart
3. Proceed to checkout and track your orders
4. Access the admin interface at `http://localhost:3000/admin` for management (admin login required)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open a Pull Request or create an issue to discuss new features or improvements.

---

## 📄 License

This project is owned by students of class E22CQCN02-N, Posts and Telecommunications Institute of Technology (PTIT), and is for academic purposes only.
