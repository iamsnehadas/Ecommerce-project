export let cartArray = JSON.parse(localStorage.getItem('cartArrayList')) || [];

export function saveCart() {
    localStorage.setItem('totalInCart', cartArray.length.toString());
    localStorage.setItem('cartArrayList', JSON.stringify(cartArray));
}

export function addToCart(productId) {
    cartArray.push(productId);
    saveCart();
}

export function getCartTotal() {
    return cartArray.length;
}

export function updateCart(newCart) {
    cartArray = newCart;
    saveCart();
}