const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

if (!process.env.MONGODB_URI || !process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  console.error('Missing required environment variables!');
  console.error('Required: MONGODB_URI, CASHFREE_APP_ID, CASHFREE_SECRET_KEY');
  process.exit(1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: {
    address: String,
    pincode: String,
    state: String,
    country: String,
    landmark: String
  },
  products: [{
    id: String,
    name: String,
    company: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  couponCode: String,
  couponDiscount: Number,
  deliveryCharge: Number,
  tax: Number,
  totalAmount: Number,
  paymentId: String,
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'processing' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

app.post('/api/validate-coupon', (req, res) => {
  const { code, subtotal } = req.body;
  
  const coupons = {
    'SAVE10': { type: 'percentage', value: 10, minOrder: 0 },
    'SAVE100': { type: 'fixed', value: 100, minOrder: 500 },
    'FIRST50': { type: 'fixed', value: 50, minOrder: 0 },
    'WELCOME20': { type: 'percentage', value: 20, minOrder: 1000 }
  };
  
  const coupon = coupons[code.toUpperCase()];
  
  if (!coupon) {
    return res.json({ success: false, message: 'Invalid coupon code' });
  }
  
  if (subtotal < coupon.minOrder) {
    return res.json({ 
      success: false, 
      message: `Minimum order of ₹${coupon.minOrder} required` 
    });
  }
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }
  
  res.json({ 
    success: true, 
    discount: Math.round(discount),
    message: `Coupon applied! You saved ₹${Math.round(discount)}`
  });
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, customerDetails } = req.body;
    
    const orderId = `order_${Date.now()}`;
    
    const orderRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment.html?order_id=${orderId}`
      }
    };
    
    const response = await axios.post(
      `${CASHFREE_API_URL}/orders`,
      orderRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY
        }
      }
    );
    
    res.json({ 
      success: true, 
      sessionId: response.data.payment_session_id,
      orderId: orderId
    });
    
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { orderId, orderData } = req.body;
    
    const response = await axios.get(
      `${CASHFREE_API_URL}/orders/${orderId}/payments`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      const payment = response.data[0];
      
      if (payment.payment_status === 'SUCCESS') {
        const newOrderId = `ORD${Date.now()}`;
        
        const newOrder = new Order({
          orderId: newOrderId,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          customerEmail: orderData.email,
          customerPhone: orderData.phone,
          shippingAddress: {
            address: orderData.address,
            pincode: orderData.pincode,
            state: orderData.state,
            country: orderData.country,
            landmark: orderData.landmark || ''
          },
          products: orderData.products,
          subtotal: orderData.subtotal,
          couponCode: orderData.couponCode || '',
          couponDiscount: orderData.couponDiscount || 0,
          deliveryCharge: orderData.deliveryCharge || 0,
          tax: orderData.tax || 0,
          totalAmount: orderData.totalAmount,
          paymentId: payment.cf_payment_id,
          paymentStatus: 'completed',
          orderStatus: 'processing'
        });
        
        await newOrder.save();
        
        const productsHTML = orderData.products.map(p => 
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${p.name} (${p.company})</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${p.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${p.price * p.quantity}</td>
          </tr>`
        ).join('');
        
        await transporter.sendMail({
          from: `"Artifex" <${process.env.EMAIL_USER}>`,
          to: orderData.email,
          subject: `Order Confirmation - ${newOrderId}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .total-row { font-weight: bold; background: #f5f5f5; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Confirmed! 🎉</h1>
                </div>
                <div class="content">
                  <p>Hi ${orderData.firstName},</p>
                  <p>Thank you for your order! We've received your payment and your order is being processed.</p>
                  
                  <div class="order-info">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${newOrderId}</p>
                    <p><strong>Payment ID:</strong> ${payment.cf_payment_id}</p>
                    <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                  
                  <h3>Items Ordered:</h3>
                  <table>
                    <thead>
                      <tr style="background: #f5f5f5;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: center;">Quantity</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${productsHTML}
                    </tbody>
                  </table>
                  
                  <div class="order-info">
                    <table>
                      <tr>
                        <td>Subtotal:</td>
                        <td style="text-align: right;">₹${orderData.subtotal}</td>
                      </tr>
                      ${orderData.couponDiscount > 0 ? `
                      <tr style="color: green;">
                        <td>Coupon Discount (${orderData.couponCode}):</td>
                        <td style="text-align: right;">-₹${orderData.couponDiscount}</td>
                      </tr>` : ''}
                      <tr>
                        <td>Delivery Charge:</td>
                        <td style="text-align: right;">₹${orderData.deliveryCharge}</td>
                      </tr>
                      <tr>
                        <td>Tax:</td>
                        <td style="text-align: right;">₹${orderData.tax}</td>
                      </tr>
                      <tr class="total-row">
                        <td>Total Amount:</td>
                        <td style="text-align: right;">₹${orderData.totalAmount}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <h3>Shipping Address:</h3>
                  <div class="order-info">
                    <p>${orderData.address}<br>
                    ${orderData.landmark ? orderData.landmark + '<br>' : ''}
                    ${orderData.state}, ${orderData.country} - ${orderData.pincode}</p>
                  </div>
                  
                  <p style="margin-top: 30px;">Your order will be delivered within 5-7 business days.</p>
                  <p>Thank you for shopping with us! 🛍️</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        
        res.json({ 
          success: true, 
          orderId: newOrderId,
          message: 'Order placed successfully'
        });
      } else {
        res.status(400).json({ success: false, message: 'Payment not successful' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Payment not found' });
    }
    
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));