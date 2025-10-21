import { products } from "./products.js";
import { updateCart } from "./saveCart.js";
import { couponList } from "./coupon.js";

const cartArray = JSON.parse(localStorage.getItem('cartArrayList')) || [];
console.log(cartArray);

const cartList = document.querySelector('.cartProducts');
const checkOut = document.querySelector('.checkOut');
const defaultCart = document.querySelector('.default-cart');
let cartHtml = '';
let inCart = {};
cartArray.forEach((productId) => {
    if(inCart[productId]) {
        inCart[productId].quantity++;
    }
    else {
        inCart[productId] = {quantity: 1};
    }
});

for(const productId in inCart) {
    const productFound = products.find(product => product.id === productId);
    if(productFound) {
        cartHtml +=
            `
                <div class="product-details-container">
                    <img src="assets/images/products/${productFound.imageAlt}.jpg" alt="${productFound.imageAlt}" class="picture-cart">
                    <div class='details'>
                        <div class="company-cart">${productFound.company}</div>
                        <div class="description-cart">${productFound.name}</div>
                        <div class="pricing-cart">₹${(productFound.pricePaise / 100).toFixed(2)}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="decrease" data-decrease-id="${productFound.id}">-</button>
                        <div class="count-cart">${inCart[productId].quantity}</div>
                        <button class="increase" data-increase-id="${productFound.id}">+</button>  
                    </div>                                             
                </div>  
                <div class="divider"></div>               
            `
    }
}

if(cartList) {
    cartList.innerHTML += cartHtml;
}

cartList.addEventListener('click', (event) => {
    const buttonClicked = event.target;
    let changed = false;
    if(buttonClicked.classList.contains('increase')) {
        const quantityProductId = buttonClicked.getAttribute('data-increase-id');
        inCart[quantityProductId].quantity++;
        const countParentDiv = buttonClicked.parentElement;
        const countCart = countParentDiv.querySelector('.count-cart');
        countCart.innerHTML = `${inCart[quantityProductId].quantity}`;
        changed = true;        
    }
    else if(buttonClicked.classList.contains('decrease')) {
        const quantityProductId = buttonClicked.getAttribute('data-decrease-id');
        inCart[quantityProductId].quantity--;
        if(inCart[quantityProductId].quantity <= 0) {
            delete inCart[quantityProductId];
            const removeCard = buttonClicked.closest('.product-details-container');
            const divideRemove = removeCard.nextElementSibling;
            if(removeCard) {
                removeCard.remove();
                if(divideRemove && divideRemove.classList.contains('divider')) {
                    divideRemove.remove();
                }
            }
            if(Object.keys(inCart).length === 0) {
                if(checkOut) {
                    checkOut.style.display = 'none';
                }
                if(cartList) {
                    cartList.style.display = 'none';
                }
                defaultCart.style.display = 'flex';
            }
        }
        else {
            const countParentDiv = buttonClicked.parentElement;
            const countCart = countParentDiv.querySelector('.count-cart');
            countCart.innerHTML = `${inCart[quantityProductId].quantity}`;
        }
        changed = true;
    }
    if(changed) {
        const newArraySave = changeCartType();
        updateCart(newArraySave);
        showSubTotal();
        showDelivery();
        showTax();
        showTotal();
    }
});

function changeCartType() {
    const newCartArray = [];
    for(const productId in inCart) {
        const quantity = inCart[productId].quantity;
        for(let i = 0; i < quantity; i++) {
            newCartArray.push(productId);
        }
    }
    return newCartArray;
}

if(cartArray.length === 0) {
    if(checkOut) {
        checkOut.style.display = 'none';
    }
    if(cartList) {
        cartList.style.display = 'none';
    }
    defaultCart.style.display = 'flex';
}


let checkoutHtml = '';

checkoutHtml +=
`
    <div class="coupon">
        <h3>Do you have a coupon code?</h3>
        <div class="coupon-apply">
            <input type="text" name="coupon" id="coupon">
            <button class="apply">Apply</button>
        </div>
    </div>
    <div class="divider"></div>
    <div class="pay-cal">
        <div class="temp-total">
            <p class="subtotal-main">Subtotal</p>
            <p class="subtotal-number">₹${calcSubTotal()}</p>
        </div>
        <div class="temp-total">
            <p class="subtotal">Coupon Applied</p>
            <p class="couponApplied">₹${0}</p>
        </div>
        <div class="temp-total">
            <p class="subtotal">Delivery Charge</p>
            <p class="delivery">₹${calcDelivery()}</p>
        </div>
        <div class="temp-total">
            <p class="subtotal">Tax Applicable</p>
            <p class="tax">₹${calcTax()}</p>
        </div>
    </div>
    <div class="divider"></div>
    <div class="temp-total count-total">
        <p class="total">Estimated Total</p>
        <p class="total-val">₹${calcTotal()}</p>
    </div>
    <div class="divider"></div>
    <a href='payment.html'><button class="pay">Proceed To Pay</button></a>
`
checkOut.innerHTML += checkoutHtml;


function calcSubTotal() {
    let newSubTotal = 0;
    for(const productId in inCart) {
        const productFound = products.find(product => product.id === productId);
        if(productFound) {
            newSubTotal += (productFound.pricePaise * inCart[productId].quantity);
        }
    }
    return ((newSubTotal / 100).toFixed(2));
}

function showSubTotal() {
    const subTotalShow = document.querySelector('.subtotal-number');
    if(subTotalShow) {
        subTotalShow.textContent = `₹${calcSubTotal()}`;
    }
}


const couponApplyButton = document.querySelector('.apply');
couponApplyButton.addEventListener('click', () => {
    showCoupon();
    showTotal();
});

function calcCoupon() {
    const couponString = document.getElementById('coupon');
    let couponValue = '';
    if(couponString) {
        couponValue = couponString.value;
    }
    let calcValue = 0;
    const couponFound = couponList.find(coupon => coupon.code === couponValue);
    if(couponFound) {
        if(couponFound.type === 'percentage') {
            calcValue = calcSubTotal() * couponFound.value / 100;
        }
        if(couponFound.type === 'fixed') {
            calcValue = couponFound.value;
        }
        return calcValue;
    }
}

function showCoupon() {
    const couponShow = document.querySelector('.couponApplied');
    if(couponShow) {
        couponShow.textContent = `₹${calcCoupon()}`;
    }
}

function calcDelivery() {    
    let deliveryCharge = 0;
    if(calcSubTotal() >= 500) {
        deliveryCharge = 0;
    }
    else {
        deliveryCharge = 50;
    }
    return deliveryCharge;
}

function showDelivery() {
    const delivery = document.querySelector('.delivery');
    if(delivery) {
        delivery.textContent = `₹${calcDelivery()}`;
    }
}

function calcTax() {
    if(calcSubTotal < 900) {
        return (calcSubTotal() * 0.10).toFixed(2);
    }
    else {
        return (calcSubTotal() * 0.05).toFixed(2);
    }
}

function showTax() {
    const tax = document.querySelector('.tax');
    if(tax) {
        tax.textContent = `₹${calcTax()}`;
    }
}

function calcTotal() {
    let subtotalInCart = parseFloat(calcSubTotal());
    let couponInCart = calcCoupon() || 0;
    couponInCart = parseFloat(couponInCart);
    let deliveryInCart = calcDelivery();
    let taxInCart = parseFloat(calcTax());
    return subtotalInCart - couponInCart + deliveryInCart + taxInCart;
}

function showTotal() {
    const totalToShow = document.querySelector('.total-val');
    if(totalToShow) {
        totalToShow.textContent = `₹${calcTotal()}`;
    }
}


window.addEventListener('storage', (event) => {
    if(event.key === 'cartArrayList') {  //cartArrayList is the localstorage key (in savecart)
        location.reload();
    }
});