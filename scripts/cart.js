import { products } from "./products.js";
import { cartArray, updateCart } from "./saveCart.js";

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
            <p class="couponApplied">45454</p>
        </div>
        <div class="temp-total">
            <p class="subtotal">Delivery Charge</p>
            <p class="delivery">6565656</p>
        </div>
        <div class="temp-total">
            <p class="subtotal">Tax Applicable</p>
            <p class="tax">565654</p>
        </div>
    </div>
    <div class="divider"></div>
    <div class="temp-total count-total">
        <p class="total">Estimated Total</p>
        <p class="total-val">45453213</p>
    </div>
    <div class="divider"></div>
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
    const subTotalSHow = document.querySelector('.subtotal-number');
    if(subTotalSHow) {
        subTotalSHow.textContent = `₹${calcSubTotal()}`;
    }
}



window.addEventListener('storage', (event) => {
    if(event.key === 'cartArrayList') {  //cartArrayList is the localstorage key (in savecart)
        location.reload();
    }
});