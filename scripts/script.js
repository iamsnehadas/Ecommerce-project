import { products } from "./products.js";
import { addToCart, getCartTotal } from "./saveCart.js";
let productHTML = '';
const productsHolder = document.querySelector('.products-holder');
const cartCounter = document.querySelector('.cart-counter');

if(productsHolder) {
    products.forEach((product) => {
        productHTML +=
        `
            <div class="picture-card">
                <img src="assets/images/products/${product.imageAlt}.jpg" alt="${product.imageAlt}" class="picture">
                <div class="description">${product.name}</div>
                <div class="pricing">₹${(product.pricePaise / 100).toFixed(2)}</div>
                <button class="add-to-cart js-cart-button" data-product-id="${product.id}">Add To Cart</button>
            </div>
        ` 
        productsHolder.innerHTML = productHTML;
        localStorage.setItem('productString', productHTML);   
    });
}

cartCounter.innerText = getCartTotal();

productsHolder.addEventListener('click', function(event) {
    const productButton = event.target;
    if(productButton.classList.contains('js-cart-button')) {
        const productId = productButton.getAttribute('data-product-id');        
        addToCart(productId);
        cartCounter.innerText = getCartTotal();        
        console.log(cartArray);
    }
});