import './style.css';
import { addToCart, updateCartCount } from './cart';
import { fallbackProducts } from './main';

declare var SalesforceInteractions: any;

async function init() {
  updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const product = fallbackProducts.find((p: any) => p.id === productId);
  const container = document.getElementById('pdp-container');

  if (!container) return;

  if (!product) {
    container.innerHTML = `<h2>Product not found.</h2><br><br><a href="/" class="cta-button">Return to Home</a>`;
    return;
  }

  // The sale=true param allows us to show a discounted price
  const isSale = params.get('sale') === 'true';
  const originalPrice = isSale ? (product.price * 1.2).toFixed(2) : product.price.toFixed(2);
  const currentPrice = product.price.toFixed(2);

  container.innerHTML = `
    <div class="pdp-layout">
      <!-- Left Column: Images -->
      <div class="pdp-images">
        <div class="pdp-main-image-container">
          <img src="${product.image}" alt="${product.name}" class="pdp-main-image" />
        </div>
        <!-- Mock thumbnail images -->
        <div class="pdp-thumbnails">
          <img src="${product.image}" class="pdp-thumb active" />
          <div class="pdp-thumb placeholder"></div>
          <div class="pdp-thumb placeholder"></div>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="pdp-details">
        <div class="pdp-breadcrumbs">
          <a href="/">Home</a> / <a href="/?category=${product.category.split(' / ')[0].toLowerCase()}">${product.category.split(' / ')[0]}</a> / ${product.name}
        </div>
        
        <h1 class="pdp-title">${product.name}</h1>
        
        <div class="pdp-price">
          ${isSale ? `<span class="price-original">$${originalPrice}</span>` : ''}
          <span class="price-current ${isSale ? 'sale-active' : ''}">$${currentPrice}</span>
        </div>

        <div class="pdp-color-selector">
          <h3>CLASSIC COLORS</h3>
          <div class="color-options">
            <button class="color-swatch active" style="background-color: #f7f7f7;" title="Natural White"></button>
            <button class="color-swatch" style="background-color: #212121;" title="True Black"></button>
            <button class="color-swatch" style="background-color: #4a5568;" title="Storm"></button>
          </div>
        </div>

        <div class="pdp-size-selector">
          <div class="size-header">
            <h3>SELECT SIZE</h3>
            <a href="#" class="size-guide">Size Guide</a>
          </div>
          <div class="size-grid">
            <button class="size-btn">8</button>
            <button class="size-btn">9</button>
            <button class="size-btn active">10</button>
            <button class="size-btn">11</button>
            <button class="size-btn">12</button>
            <button class="size-btn">13</button>
          </div>
        </div>

        <button class="pdp-add-to-cart" id="pdp-add-btn">Add to Cart</button>
        <p class="pdp-shipping-note">Free shipping on orders over $50. Free returns.</p>

        <div class="pdp-accordions">
          <details class="accordion" open>
            <summary>Materials & Care</summary>
            <p>Made with renewable materials like ZQ Merino wool, sugarcane, and tree fiber.</p>
          </details>
          <details class="accordion">
            <summary>Shipping & Returns</summary>
            <p>We offer free shipping on all orders over $50. You have 30 days to return or exchange your items.</p>
          </details>
        </div>
      </div>
    </div>
  `;

  // Attach event listener
  const addBtn = document.getElementById('pdp-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(product);
      const originalText = addBtn.textContent;
      addBtn.textContent = 'Added!';
      setTimeout(() => addBtn.textContent = originalText, 1500);

      // Trigger Salesforce Event for Add To Cart
      if (typeof SalesforceInteractions !== 'undefined' && typeof SalesforceInteractions.sendEvent === 'function') {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: "AddToCart",
            processType: "item"
          }
        });
      }
    });
  }

  // Trigger Salesforce View Item event
  if (typeof SalesforceInteractions !== 'undefined' && typeof SalesforceInteractions.sendEvent === 'function') {
    SalesforceInteractions.sendEvent({
      interaction: {
        name: "ViewItem",
        processType: "item"
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);