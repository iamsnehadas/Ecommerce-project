import { products } from "./products.js";
import { cartArray, updateCart } from "./saveCart.js";

const cartList = document.querySelector('.cartProducts');
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
                <div class="product-list-container">
                    <div class="image-title">Product</div>
                    <div class="product-title">Name</div>
                    <div class="price-title">Price</div>
                    <div class="update-title">Update</div>
                    
                    <img src="assets/images/products/${productFound.imageAlt}.jpg" alt="${productFound.imageAlt}" class="picture-cart">
                    <div class="description-cart">${productFound.name}</div>
                    <div class="pricing-cart">₹${(productFound.pricePaise / 100).toFixed(2)}</div>
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
    cartList.innerHTML = cartHtml;
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
            const removeCard = buttonClicked.closest('.picture-list-cart');
            if(removeCard) {
                removeCard.remove();
            }
            if(Object.keys(inCart).length === 0) {
                    cartList.innerHTML = `<p class='default-cart'>Keep shopping and add products to your cart!</p>`
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
    cartList.innerHTML = `<p class='default-cart'>Keep shopping and add products to your cart!</p>`
}