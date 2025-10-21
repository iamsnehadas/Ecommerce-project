const API_URL = 'https://ecommerce-project-52ni.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
    const orderId = localStorage.getItem('lastOrderId');
    
    if (!orderId) {
        alert('No order found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Order not found');
        }
        
        const order = data.order;
        
        document.getElementById('order-id').textContent = order.orderId;
        document.getElementById('payment-id').textContent = order.paymentId;
        document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('order-status').textContent = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);        
        
        document.getElementById('customer-name').textContent = order.customerName;
        document.getElementById('customer-email').textContent = order.customerEmail;
        document.getElementById('customer-phone').textContent = order.customerPhone;
        document.getElementById('email-sent').textContent = order.customerEmail;
        
        const addr = order.shippingAddress;
        document.getElementById('shipping-address').innerHTML = `
            ${addr.address}<br>
            ${addr.landmark ? addr.landmark + '<br>' : ''}
            ${addr.state}, ${addr.country}<br>
            PIN: ${addr.pincode}
        `;
        
        const productsHTML = order.products.map(product => `
            <div class="order-item">
                <img src="assets/images/products/${product.image}.jpg" alt="${product.name}">
                <div class="order-item-details">
                    <div class="order-item-name">${product.name}</div>
                    <div class="order-item-company">${product.company}</div>
                    <div class="order-item-quantity">Quantity: ${product.quantity}</div>
                </div>
                <div class="order-item-price">₹${product.price * product.quantity / 100}</div>
            </div>
        `).join('');
        
        document.getElementById('order-products').innerHTML = productsHTML;
        
        document.getElementById('subtotal').textContent = `₹${order.subtotal}`;
        document.getElementById('delivery-charge').textContent = `₹${order.deliveryCharge}`;
        document.getElementById('tax').textContent = `₹${order.tax}`;
        document.getElementById('total-amount').textContent = `₹${order.totalAmount}`;
        
        if (order.couponCode && order.couponDiscount > 0) {
            document.getElementById('coupon-row').style.display = 'flex';
            document.getElementById('coupon-code').textContent = order.couponCode;
            document.getElementById('coupon-discount').textContent = `-₹${order.couponDiscount}`;
        }
        
    } catch (error) {
        console.error('Error loading order:', error);
        alert('Failed to load order details. Please contact support.');
        window.location.href = 'index.html';
    }
});
