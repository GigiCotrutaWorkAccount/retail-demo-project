import { trackAddToCartEvent, trackRemoveFromCartEvent } from './salesforce-interactions';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  category: string;
  image: string;
}

const CART_STORAGE_KEY = 'retail_cart';
const LEGACY_CART_STORAGE_KEY = 'aura_cart';
const CART_ID_STORAGE_KEY = 'retail_cart_id';

function generateCartId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function setCart(cart: Product[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  if (cart.length === 0) {
    localStorage.removeItem(CART_ID_STORAGE_KEY);
  }
}

export function getCartId(): string | null {
  return localStorage.getItem(CART_ID_STORAGE_KEY);
}

export function getCart(): Product[] {
  const cart = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product: Product) {
  const cart = getCart();
  let cartId = getCartId();

  if (cart.length === 0 && !cartId) {
    cartId = generateCartId();
    localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
  }

  cart.push(product);
  setCart(cart);
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);

  if (cartId) {
    trackAddToCartEvent(product, cartId, 1);
  }

  updateCartCount();
}

export function removeFromCart(index: number) {
  const cart = getCart();
  const cartId = getCartId();
  const [removedProduct] = cart.splice(index, 1);

  if (removedProduct && cartId) {
    trackRemoveFromCartEvent(removedProduct, cartId, 1);
  }

  setCart(cart);
  updateCartCount();
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  localStorage.removeItem(CART_ID_STORAGE_KEY);
  updateCartCount();
}

export function updateCartCount() {
  const countSpan = document.getElementById('cart-count');
  if (countSpan) {
    const cart = getCart();
    countSpan.textContent = cart.length.toString();
  }
}
