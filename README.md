# Artifex E-Commerce Platform

A full-stack e-commerce application for purchasing physical and digital stationery products, featuring secure online payments, dynamic cart management, and automated order processing.

**Live Demo:** [https://artifex-store.netlify.app](https://artifex-store.netlify.app)

---

## Features

- **Product Catalog:** Dynamic product pages with detailed information and pricing
- **Shopping Cart:** Real-time cart with localStorage persistence and multi-tab synchronization
- **Checkout System:** Form validation, coupon codes, dynamic tax and delivery charge calculation
- **Payment Integration:** Cashfree sandbox payment gateway for secure transactions
- **Order Management:** Automated email confirmations via Nodemailer, order tracking in MongoDB
- **Responsive Design:** Mobile-friendly UI built with vanilla HTML, CSS, and JavaScript

---

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Deployed on Netlify

**Backend:**
- Node.js, Express.js
- MongoDB with Mongoose ODM
- Nodemailer for email notifications
- Deployed on Render

**Payment:**
- Cashfree Payment Gateway (Sandbox mode)
  
---

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Cashfree sandbox account
- Gmail account with app password

### Backend Setup

1. Clone the repository
2. Install dependencies
3. Create .env file
   (MONGODB_URI=your_mongodb_connection_string
    CASHFREE_APP_ID=your_cashfree_app_id
    CASHFREE_SECRET_KEY=your_cashfree_secret_key
    EMAIL_USER=your_gmail@gmail.com
    EMAIL_APP_PASSWORD=your_gmail_app_password
    FRONTEND_URL=http://localhost:8080
    PORT=5000)
4. Start the server

### Frontend Setup

1. Navigate to frontend directory
2. Update API URL in `scripts/payment.js` and `scripts/confirmation.js` to [const API_URL = 'http://localhost:5000/api';]
3. Serve with any static server
