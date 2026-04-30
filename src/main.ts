import './style.css';
import { addToCart, getCartId, updateCartCount } from './cart';
import {
  fetchCatalogProducts,
  fetchProductsByShoppingCartId,
  getCatalogCategories,
  getCategoryQueryValue,
  type CatalogProduct
} from './data-cloud';
import { initSalesforceTracking } from './salesforce-interactions';

function dedupeById(products: CatalogProduct[]): CatalogProduct[] {
  const seen = new Set<string>();
  const deduped: CatalogProduct[] = [];

  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    deduped.push(product);
  }

  return deduped;
}

function pickRandomProducts(products: CatalogProduct[], count: number): CatalogProduct[] {
  const shuffled = [...products];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const current = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled.slice(0, count);
}

function enrichCartProducts(cartProducts: CatalogProduct[], catalogProducts: CatalogProduct[]): CatalogProduct[] {
  return cartProducts.map((cartProduct) => {
    const catalogMatch = catalogProducts.find((product) => product.id === cartProduct.id);
    if (!catalogMatch) return cartProduct;

    const hasPlaceholderImage = !cartProduct.image || cartProduct.image === '/favicon.svg';
    const hasZeroPrice = !Number.isFinite(cartProduct.price) || cartProduct.price === 0;
    const hasDefaultCategory = cartProduct.category === 'Men Clothing';

    return {
      ...cartProduct,
      image: hasPlaceholderImage ? catalogMatch.image : cartProduct.image,
      price: hasZeroPrice ? catalogMatch.price : cartProduct.price,
      category: hasDefaultCategory ? catalogMatch.category : cartProduct.category,
      name: cartProduct.name || catalogMatch.name,
      description: cartProduct.description || catalogMatch.description,
      sku: cartProduct.sku || catalogMatch.sku
    };
  });
}

function renderCategoryCards(products: CatalogProduct[]) {
  const container = document.getElementById('category-row');
  if (!container) return;

  const categories = getCatalogCategories(products);
  const cards = categories.slice(0, 4).map((category) => {
    const categoryProducts = products.filter((product) => product.category === category);
    const firstImage = categoryProducts[0]?.image;
    const itemCount = categoryProducts.length;

    return `
      <a class="category-row-card ${firstImage ? '' : 'no-image'}" href="/product-list.html?category=${getCategoryQueryValue(category)}">
        ${firstImage ? `<img src="${firstImage}" alt="${category}" loading="lazy" />` : ''}
        <div class="category-row-overlay"></div>
        <div class="category-row-content">
          <h2>${category}</h2>
          <span>${itemCount} product${itemCount === 1 ? '' : 's'}</span>
        </div>
      </a>
    `;
  });

  container.innerHTML = cards.join('');
}

function renderProducts(products: CatalogProduct[]) {
  const track = document.getElementById('products-track');
  if (!track) return;

  const featured = products.slice(0, 16);

  if (featured.length === 0) {
    track.innerHTML = '<p class="collection-empty">No products available right now.</p>';
    return;
  }

  track.innerHTML = featured.map((product) => `
    <article class="home-product-card">
      <a class="home-product-media" href="/product.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="home-product-info">
        <div class="home-product-meta">
          <span class="home-product-badge">Data Cloud</span>
          <span class="home-product-category">${product.category}</span>
        </div>
        <div class="home-product-heading-row">
          <h3>${product.name}</h3>
          <span>$${product.price.toFixed(2)}</span>
        </div>
        <div class="home-product-actions">
          <a class="text-link" href="/product.html?id=${encodeURIComponent(product.id)}">View product</a>
          <button class="mini-cart-button" type="button" data-product-id="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  track.querySelectorAll<HTMLButtonElement>('[data-product-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedProduct = featured.find((product) => product.id === button.dataset.productId);
      if (!selectedProduct) return;

      addToCart(selectedProduct);
      const originalText = button.textContent;
      button.textContent = 'Added';
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1200);
    });
  });
}

function renderReminderProducts(products: CatalogProduct[]) {
  const track = document.getElementById('reminder-track');
  const section = document.getElementById('cart-reminder-section');
  if (!track || !section) return;

  if (products.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  track.innerHTML = products.map((product) => `
    <article class="home-product-card">
      <a class="home-product-media" href="/product.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="home-product-info">
        <div class="home-product-meta">
          <span class="home-product-badge">Saved</span>
          <span class="home-product-category">${product.category}</span>
        </div>
        <div class="home-product-heading-row">
          <h3>${product.name}</h3>
          <span>$${product.price.toFixed(2)}</span>
        </div>
        <div class="home-product-actions">
          <a class="text-link" href="/product.html?id=${encodeURIComponent(product.id)}">View product</a>
          <button class="mini-cart-button" type="button" data-reminder-product-id="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  track.querySelectorAll<HTMLButtonElement>('[data-reminder-product-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedProduct = products.find((product) => product.id === button.dataset.reminderProductId);
      if (!selectedProduct) return;

      addToCart(selectedProduct);
      const originalText = button.textContent;
      button.textContent = 'Added';
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1200);
    });
  });
}

function setupTrackControls(trackId: string, previousButtonId: string, nextButtonId: string) {
  const track = document.getElementById(trackId);
  const previousButton = document.getElementById(previousButtonId);
  const nextButton = document.getElementById(nextButtonId);
  if (!track || !previousButton || !nextButton) return;

  const scrollAmount = 360;
  previousButton.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextButton.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

function buildReminderList(cartProducts: CatalogProduct[], catalogProducts: CatalogProduct[]): CatalogProduct[] {
  const enrichedCartProducts = enrichCartProducts(cartProducts, catalogProducts);
  const initial = dedupeById(enrichedCartProducts);

  if (initial.length === 0) {
    return pickRandomProducts(catalogProducts, 8);
  }

  if (initial.length >= 8) return initial.slice(0, 8);

  const missing = 8 - initial.length;
  const fallbackCandidates = catalogProducts.filter((product) => !initial.some((cartProduct) => cartProduct.id === product.id));
  const fallback = pickRandomProducts(fallbackCandidates, missing);
  return [...initial, ...fallback];
}

async function init() {
  initSalesforceTracking();
  updateCartCount();

  const products = await fetchCatalogProducts();
  const cartId = getCartId();
  const cartProducts = cartId ? await fetchProductsByShoppingCartId(cartId) : [];
  const reminderProducts = buildReminderList(cartProducts, products);

  renderReminderProducts(reminderProducts);
  renderCategoryCards(products);
  renderProducts(products);
  setupTrackControls('reminder-track', 'reminder-prev', 'reminder-next');
  setupTrackControls('products-track', 'products-prev', 'products-next');
}

document.addEventListener('DOMContentLoaded', init);
