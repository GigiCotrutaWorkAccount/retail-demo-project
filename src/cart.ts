export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export function getCart(): Product[] {
  const cart = localStorage.getItem('aura_cart');
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product: Product) {
  const cart = getCart();
  cart.push(product);
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  updateCartCount();
}

export function removeFromCart(index: number) {
  const cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  updateCartCount();
}

export function clearCart() {
  localStorage.removeItem('aura_cart');
  updateCartCount();
}

export function updateCartCount() {
  const countSpan = document.getElementById('cart-count');
  if (countSpan) {
    const cart = getCart();
    countSpan.textContent = cart.length.toString();
  }
}
