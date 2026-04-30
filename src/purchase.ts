import './style.css';
import { clearCart, getCartId } from './cart';
import { initSalesforceTracking, trackPurchaseEvent } from './salesforce-interactions';

function initPurchase() {
  initSalesforceTracking();
  const cartId = getCartId();
  if (cartId) {
    trackPurchaseEvent(cartId);
  }

  // Clear the cart when reaching the success page
  clearCart();
}

document.addEventListener('DOMContentLoaded', initPurchase);
