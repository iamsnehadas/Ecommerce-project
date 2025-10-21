import { products } from './products.js';

const API_URL = 'https://ecommerce-project-52ni.onrender.com/api';

const script = document.createElement('script');
script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
document.head.appendChild(script);

let cashfree;
let cashfreeInitialized = false;

script.onload = () => {
    cashfree = Cashfree({ mode: 'sandbox' });
    cashfreeInitialized = true;
};

let cart = JSON.parse(localStorage.getItem('cartArrayList')) || [];

function getCartProducts() {
    let inCart = {};
    cart.forEach((productId) => {
        if(inCart[productId]) {
            inCart[productId].quantity++;
        }
        else {
            inCart[productId] = {quantity: 1};
        }
    });
    
    const cartProducts = [];
    for(const productId in inCart) {
        const product = products.find(p => p.id === productId);
        if(product) {
            cartProducts.push({
                id: product.id,
                name: product.name,
                company: product.company,
                price: product.pricePaise,
                quantity: inCart[productId].quantity,
                image: product.imageAlt
            });
        }
    }
    return cartProducts;
}

function calculateTotals() {
    const cartProducts = getCartProducts();
    
    const subtotalPaise = cartProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const subtotal = subtotalPaise / 100;
    
    let couponDiscount = 0;
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if(appliedCoupon) {
        couponDiscount = parseFloat(localStorage.getItem('couponDiscount')) || 0;
    }
    
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    
    let tax = 0;
    if(subtotal < 900) {
        tax = parseFloat((subtotal * 0.10).toFixed(2));
    } else {
        tax = parseFloat((subtotal * 0.05).toFixed(2));
    }
    
    const total = parseFloat((subtotal - couponDiscount + deliveryCharge + tax).toFixed(2));
    
    return { 
        subtotal: subtotal.toFixed(2), 
        couponDiscount: couponDiscount.toFixed(2), 
        deliveryCharge, 
        tax: tax.toFixed(2), 
        total: total.toFixed(2),
        couponCode: appliedCoupon || ''
    };
}

function displayOrderSummary() {
    const cartProducts = getCartProducts();
    const totals = calculateTotals();
    
    const summaryHTML = cartProducts.map(p => `
        <a href="product-detail.html?id=${p.id}" class="product"> 
            <img src="assets/images/products/${p.image}.jpg" alt="${p.name}" class="picture-cart">
            <div class='details'> 
                <div class="description-cart">${p.name}</div>
                <div class="count-cart">Qty: ${p.quantity}</div>
                <div class="pricing-cart">₹${((p.price * p.quantity) / 100).toFixed(2)}</div>
            </div>
        </a>
    `).join('');
    
    document.querySelector('.order-summary').innerHTML = summaryHTML;
    
    document.querySelector('.subtotal-number').textContent = `₹${totals.subtotal}`;
    document.querySelector('.couponApplied').textContent = totals.couponDiscount > 0 ? `-₹${totals.couponDiscount}` : '₹0';
    document.querySelector('.delivery').textContent = `₹${totals.deliveryCharge}`;
    document.querySelector('.tax').textContent = `₹${totals.tax}`;
    document.querySelector('.total-val').textContent = `₹${totals.total}`;
    
    document.querySelector('.pay').textContent = `Pay ₹${totals.total}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    displayOrderSummary();    
    const submitButton = document.querySelector('.submit');
    const payButton = document.querySelector('.pay');
    
    submitButton.addEventListener('click', () => {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const pin = document.getElementById('pin').value.trim();
        const state = document.getElementById('state').value.trim();
        const country = document.getElementById('country').value.trim();
        const landmark = document.getElementById('landmark').value.trim();
        
        if (!firstName || !lastName || !email || !phone || !address || !pin || !state || !country) {
            alert('Please fill all required fields');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        //(Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        
        const pinRegex = /^\d{6}$/;
        if (!pinRegex.test(pin)) {
            alert('Please enter a valid 6-digit PIN code');
            return;
        }
        
        const shippingInfo = {
            firstName,
            lastName,
            email,
            phone,
            address,
            pin,
            state,
            country,
            landmark
        };
        
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        
        alert('Shipping information saved! Now select payment method and click Pay.');
        
        document.querySelector('.payment').scrollIntoView({ behavior: 'smooth' });
    });
    
    payButton.addEventListener('click', async () => {
        if (!cashfreeInitialized) {
            alert('Payment system is loading. Please wait a moment and try again.');
            return;
        }
        
        const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));
        if (!shippingInfo) {
            alert('Please fill and submit shipping information first');
            document.querySelector('.shipping').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedRadio) {
            alert('Please select a payment method');
            return;
        }
        
        const payOption = selectedRadio.value;
        console.log('Processing payment via:', payOption);
        
        payButton.innerText = 'Processing Payment...';
        payButton.disabled = true;
        
        try {
            const cartProducts = getCartProducts();
            const totals = calculateTotals();
            
            const orderData = {
                firstName: shippingInfo.firstName,
                lastName: shippingInfo.lastName,
                email: shippingInfo.email,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                pincode: shippingInfo.pin,
                state: shippingInfo.state,
                country: shippingInfo.country,
                landmark: shippingInfo.landmark,
                products: cartProducts,
                subtotal: parseFloat(totals.subtotal),
                couponCode: totals.couponCode,
                couponDiscount: parseFloat(totals.couponDiscount),
                deliveryCharge: totals.deliveryCharge,
                tax: parseFloat(totals.tax),
                totalAmount: parseFloat(totals.total)
            };
            
            const orderResponse = await fetch(`${API_URL}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: parseFloat(totals.total),
                    customerDetails: {
                        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                        email: shippingInfo.email,
                        phone: shippingInfo.phone
                    }
                })
            });
            
            const orderResult = await orderResponse.json();
            
            if (!orderResult.success) {
                throw new Error('Failed to create order');
            }
            
            const cashfreeOrderId = orderResult.orderId;
            
            // Open Cashfree checkout
            const checkoutOptions = {
                paymentSessionId: orderResult.sessionId,
                redirectTarget: '_modal'
            };
            
            cashfree.checkout(checkoutOptions).then(async (result) => {
                if (result.error) {
                    console.error('Payment error:', result.error);
                    alert('Payment failed or was cancelled');
                    payButton.innerText = `Pay ₹${totals.total}`;
                    payButton.disabled = false;
                    return;
                }
                
                if (result.paymentDetails) {
                    payButton.innerText = 'Verifying...';
                    
                    try {
                        const verifyResponse = await fetch(`${API_URL}/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: cashfreeOrderId,
                                orderData: orderData
                            })
                        });
                        
                        const verifyResult = await verifyResponse.json();
                        
                        if (verifyResult.success) {
                            payButton.innerText = 'Paid!';
                            
                            localStorage.removeItem('cartArrayList');
                            localStorage.removeItem('appliedCoupon');
                            localStorage.removeItem('couponDiscount');
                            localStorage.removeItem('shippingInfo');
                            
                            localStorage.setItem('lastOrderId', verifyResult.orderId);
                            
                            // Redirect to confirmation
                            setTimeout(() => {
                                window.location.href = 'confirmation.html';
                            }, 500);
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert('Payment verification failed. Please contact support.');
                        payButton.innerText = `Pay ₹${totals.total}`;
                        payButton.disabled = false;
                    }
                }
            }).catch((error) => {
                console.error('Checkout error:', error);
                alert('Payment failed. Please try again.');
                payButton.innerText = `Pay ₹${totals.total}`;
                payButton.disabled = false;
            });
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to process payment. Please try again.');
            payButton.innerText = `Pay ₹${totals.total}`;
            payButton.disabled = false;
        }
    });
});
