/*export let cartArray = JSON.parse(localStorage.getItem('cartArrayList')) || []; 

export function saveCart() {
    localStorage.setItem('totalInCart', cartArray.length.toString());
    localStorage.setItem('cartArrayList', JSON.stringify(cartArray));
}
*/
export function addToCart(productId) {
    const currentCart = JSON.parse(localStorage.getItem('cartArrayList')) || [];
    currentCart.push(productId);
    localStorage.setItem('cartArrayList', JSON.stringify(currentCart));
}

export function getCartTotal() {
    const currentCart = JSON.parse(localStorage.getItem('cartArrayList')) || [];
    return currentCart.length;
}

export function updateCart(newCart) {
    localStorage.setItem('cartArrayList', JSON.stringify(newCart));
}