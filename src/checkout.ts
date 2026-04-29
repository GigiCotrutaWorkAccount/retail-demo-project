import './style.css';
import { getCart, removeFromCart, updateCartCount, Product } from './cart';

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  
  if (!cartItemsContainer || !subtotalEl || !totalEl) return;

  const cart = getCart();
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty. <a href="/">Continue shopping</a></p>';
    subtotalEl.textContent = '$0.00';
    totalEl.textContent = '$0.00';
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item: Product, index: number) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `).join('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;

  // Attach remove listeners
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0', 10);
      removeFromCart(index);
      renderCart(); // Re-render
    });
  });
}

function initCheckout() {
  updateCartCount();
  renderCart();

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length > 0) {
        window.location.href = '/purchase.html';
      } else {
        alert('Your cart is empty!');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initCheckout);
