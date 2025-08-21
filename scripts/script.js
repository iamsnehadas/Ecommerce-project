import { products } from "./products.js";
let productHTML = '';
const productsHolder = document.querySelector('.products-holder');

products.forEach((product) => {
    productHTML +=
    `
        <div class="picture-card">
            <img src="assets/images/products/${product.imageAlt}.jpg" alt="${product.imageAlt}" class="picture">
            <div class="description">${product.name}</div>
            <div class="pricing">₹${product.pricePaise / 100}</div>
            <button class="add-to-cart">Add To Cart</button>
        </div>
    `
});

productsHolder.innerHTML = productHTML;