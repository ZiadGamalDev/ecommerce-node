# E-Commerce Backend (Node.js)

A lightweight e-commerce backend built with **Node.js**, **Express**, and **MongoDB**. Designed primarily to simulate customer behavior and integrate seamlessly with our **Customer Support System** in the ITI Graduation Project.

## 🌐 Live Demo

- **Production API:** https://ecommerce-node.dinamo-app.com/
- **Direct Server:** http://144.91.81.192:3002/

## 🔥 Features

- ✅ **User Authentication** (JWT)
- 🛒 **Product APIs**
- 💥 **Smart Reactions System** — e.g., auto-discounts based on user actions
- 📊 **User Activity Logging** — track views, searches, and more
- ⚙️ Clean architecture using services, validation, and modular routing

> ⚠️ This is not a production-level e-commerce platform — it's designed for integration and testing with real-time support features.

## 🛠️ Tech Stack

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Auth
- Joi Validation
- PM2 Process Manager

## 🚀 Quick Start

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ZiadGamalDev/ecommerce-node.git
cd ecommerce-node

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update your environment variables
# PORT=3001
# CONNECTION_URL_HOST=mongodb://localhost:27017/iti-ecommerce

# Run development server
npm run dev

# Seed the database (optional)
npm run seed
```

### Production Setup

The application is deployed on **Contabo** using **MongoDB Atlas** database.

```bash
# For production deployment instructions, see:
# .notes/server/deployment.md
```

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Products
- `GET /product` - Get all products
- `GET /product/:id` - Get product by ID
- `POST /product` - Create product (admin)

### Categories
- `GET /category` - Get all categories
- `GET /category/:id` - Get category by ID

### Cart
- `GET /cart` - Get user cart
- `POST /cart` - Add to cart
- `PUT /cart/:id` - Update cart item

### Orders
- `GET /order` - Get user orders
- `POST /order` - Create order

## 🔧 Environment Variables

```bash
# Server
PORT=3001

# Database
CONNECTION_URL_HOST=mongodb://localhost:27017/iti-ecommerce

# JWT Secrets
JWT_SECRET_VERFICATION=your_verification_secret
JWT_SECRET_LOGIN=your_login_secret
JWT_SECRET_FORGET_PASS=your_forget_password_secret

# Cloudinary (for image uploads)
cloud_name=your_cloudinary_name
api_key=your_cloudinary_key
api_secret=your_cloudinary_secret
```

## 🔗 Part of ITI Graduation Project

This project is one of multiple connected apps that together form the **Customer Support System**.

### Related Repositories:
- **Customer Support Backend:** [customer-support-node](https://github.com/ZiadGamalDev/customer-support-node)
- **E-commerce Frontend:** [ecommerce-react](https://github.com/ZiadGamalDev/ecommerce-react)
- **E-commerce Chat Widget:** [ecommerce-chat-angular](https://github.com/ZiadGamalDev/ecommerce-chat-angular)
- **E-commerce Admin Panel:** [ecommerce-admin-react](https://github.com/ZiadGamalDev/ecommerce-admin-react)

👉 [View Root Repository](https://github.com/ZiadGamalDev/customer-support-system)
