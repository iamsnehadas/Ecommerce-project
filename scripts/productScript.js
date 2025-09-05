import { products } from "./products.js";
import { addToCart, getCartTotal} from "./saveCart.js";

const productDetailer = document.querySelector('.product-detail');
const cartCounter = document.querySelector('.cart-counter');

const urlString = window.location.search;
const urlParameter = new URLSearchParams(urlString);
const urlId = urlParameter.get('id');

const product = products.find(myProduct => myProduct.id === urlId);

productDetailer.innerHTML = 
`
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
                <div class="quantity">
                    <button class="decrease-quantity" data-decrease-id="${product.id}">-</button>
                    <div class="count-product">1</div>
                    <button class="increase-quantity" data-increase-id="${product.id}">+</button>
                </div>
                <button class="add-to-cart js-cart-button" data-product-id="${product.id}">Add To Cart</button>
            </div>            
        </div>
    </div>
`;

cartCounter.innerText = getCartTotal();
const quantityVal = document.querySelector('.count-product');
const increaseButton = document.querySelector('.increase-quantity');
const decreaseButton = document.querySelector('.decrease-quantity');

productDetailer.addEventListener('click', function(event) {
    const productButton = event.target;
    if(productButton.classList.contains('js-cart-button')) {
        const productId = productButton.getAttribute('data-product-id'); 
        let quantity = Number(quantityVal.innerHTML);       
        for(let i = 0; i < quantity; i++) {
            addToCart(productId);
        }
        cartCounter.innerText = getCartTotal();        
        console.log(JSON.parse(localStorage.getItem('cartArrayList')));
    }
});

const updateButton = (quantity) => {
    if(quantity <= 1) {
        decreaseButton.classList.add('inactive');
    }
    if(quantity >= 9) {
        increaseButton.classList.add('inactive');
    }
    if(quantity > 1) {
        decreaseButton.classList.remove('inactive');
    }
    if(quantity < 10) {
        increaseButton.classList.remove('inactive');
    }
};

decreaseButton.addEventListener('click', () => {  
    let quantity = Number(quantityVal.innerHTML);   
    if(quantity > 1) {
        quantity--;
        quantityVal.innerHTML = `${quantity}`; 
        updateButton(quantity);   
    }
});

increaseButton.addEventListener('click', () => {   
    let quantity = Number(quantityVal.innerHTML); 
    if(quantity <= 9) {
        quantity++; 
        quantityVal.innerHTML = `${quantity}`; 
        updateButton(quantity);      
    }    
});

window.addEventListener('storage', (event) => {
    if(event.key === 'cartArrayList') {
        const newString = event.newValue;
        const newCart = JSON.parse(newString) || [];
        if(cartCounter) {
            cartCounter.innerText = newCart.length;
        }
    }
});