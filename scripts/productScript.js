import { products } from "./products.js";
import { addToCart, getCartTotal } from "./saveCart.js";

const productDetailer = document.querySelector('.product-detail');
const cartCounter = document.querySelector('.cart-counter');

const urlString = window.location.search;
const urlParameter = new URLSearchParams(urlString);
const urlId = urlParameter.get('id');

const product = products.find(myProduct => myProduct.id === urlId);

productDetailer.innerHTML = 
`
    <div class="picture-card">
        <div class="picture-card">
        <div class="product-image">
            <img src="assets/images/products/${product.imageAlt}.jpg" alt="${product.imageAlt}" class="picture">
        </div>
        <div class="product-information">  
            <div class="product-company">${product.company}</div>          
            <div class="product-title">${product.name}</div>
            <div class="product-details">${product.detail}</div>
            <div class="product-pricing">₹${(product.pricePaise / 100).toFixed(2)}</div>
            <div class="benefit">
                <ul>
                ${product.whyBuy.map((cause) => `<li>${cause}</li>`).join('')}
                </ul>
            </div>                
            <div class="add-product">
                <select name="quantity" id="quantity">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <button class="add-to-cart js-cart-button" data-product-id="${product.id}">Add To Cart</button>
            </div>            
        </div>
    </div> 
    </div>
`;

cartCounter.innerText = getCartTotal();
const quantityVal = document.getElementById('quantity');

productDetailer.addEventListener('click', function(event) {
    const productButton = event.target;
    if(productButton.classList.contains('js-cart-button')) {
        const productId = productButton.getAttribute('data-product-id'); 
        let quantity = Number(quantityVal.value);       
        for(let i = 0; i < quantity; i++) {
            addToCart(productId);
        }
        cartCounter.innerText = getCartTotal();        
        console.log(cartArray);
    }
});

