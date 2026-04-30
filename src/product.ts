import './style.css';
import { addToCart, updateCartCount } from './cart';
import { fetchCatalogProducts, getProductById } from './data-cloud';
import { initSalesforceTracking } from './salesforce-interactions';

async function init() {
  initSalesforceTracking();
  updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const products = await fetchCatalogProducts();
  const product = getProductById(products, productId);
  const container = document.getElementById('pdp-container');

  if (!container) return;

  if (!product) {
    container.innerHTML = '<h2>Product not found.</h2><br><br><a href="/" class="cta-button">Return to Home</a>';
    return;
  }

  container.innerHTML = `
    <div class="pdp-layout">
      <div class="pdp-images">
        <div class="pdp-main-image-container">
          <img src="${product.image}" alt="${product.name}" class="pdp-main-image" />
        </div>
      </div>

      <div class="pdp-details">
        <div class="pdp-breadcrumbs">
          <a href="/">Home</a> / <a href="/product-list.html?category=${encodeURIComponent(product.category)}">${product.category}</a> / ${product.name}
        </div>

        <h1 class="pdp-title">${product.name}</h1>

        <div class="pdp-price">
          <span class="price-current">$${product.price.toFixed(2)}</span>
        </div>

        <p class="lead-copy">${product.description}</p>

        <ul class="feature-list">
          <li>SKU: ${product.sku}</li>
          <li>Category: ${product.category}</li>
          <li>Product ID: ${product.id}</li>
        </ul>

        <button class="pdp-add-to-cart" id="pdp-add-btn">Add to Cart</button>
        <p class="pdp-shipping-note">Product data loaded from Salesforce Data Cloud and cached locally for this browsing session.</p>

        <div class="pdp-accordions">
          <details class="accordion" open>
            <summary>Description</summary>
            <p>${product.description}</p>
          </details>
          <details class="accordion">
            <summary>Product Metadata</summary>
            <p>SKU ${product.sku} in ${product.category}.</p>
          </details>
        </div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById('pdp-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(product);
      const originalText = addBtn.textContent;
      addBtn.textContent = 'Added!';
      setTimeout(() => {
        addBtn.textContent = originalText;
      }, 1500);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
