import './style.css';
import { clearCart } from './cart';

function initPurchase() {
  // Clear the cart when reaching the success page
  clearCart();
}

document.addEventListener('DOMContentLoaded', initPurchase);
