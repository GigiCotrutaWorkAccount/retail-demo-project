import './style.css';
import { addToCart, updateCartCount } from './cart';
import {
  fetchCatalogProducts,
  getCatalogCategories,
  getCategoryQueryValue,
  type CatalogProduct
} from './data-cloud';
import { initSalesforceTracking } from './salesforce-interactions';

function createCategoryFilters(categories: string[], activeCategory: string | null) {
  const container = document.getElementById('category-filters');
  if (!container) return;

  container.innerHTML = categories.map((category) => {
    const isActive = activeCategory === category;
    return `<a class="filter-pill${isActive ? ' is-active' : ''}" href="/product-list.html?category=${getCategoryQueryValue(category)}">${category}</a>`;
  }).join('');
}

function filterProducts(products: CatalogProduct[]) {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');

  const filtered = category
    ? products.filter((product) => product.category === category)
    : products;

  return { filtered, category };
}

function renderCollection(products: CatalogProduct[], title: string) {
  const grid = document.getElementById('collection-grid');
  const count = document.getElementById('collection-count');
  const resultsTitle = document.getElementById('collection-results-title');
  const collectionTitle = document.getElementById('collection-title');
  const collectionDescription = document.getElementById('collection-description');
  if (!grid || !count || !resultsTitle || !collectionTitle || !collectionDescription) return;

  count.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;
  resultsTitle.textContent = title;
  collectionTitle.textContent = title;
  collectionDescription.textContent = `Live catalog from Salesforce Data Cloud for ${title.toLowerCase()}.`;

  if (!products.length) {
    grid.innerHTML = '<p class="collection-empty">No products match this category right now.</p>';
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="collection-product-card">
      <a class="collection-product-media" href="/product.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="collection-product-info">
        <div class="home-product-meta">
          <span class="home-product-badge">${product.sku}</span>
          <span class="home-product-category">${product.category}</span>
        </div>
        <div class="home-product-heading-row">
          <h3>${product.name}</h3>
          <span>$${product.price.toFixed(2)}</span>
        </div>
        <p class="collection-product-description">${product.description}</p>
        <div class="home-product-actions">
          <a class="text-link" href="/product.html?id=${encodeURIComponent(product.id)}">View product</a>
          <button class="mini-cart-button" type="button" data-product-id="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll<HTMLButtonElement>('[data-product-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedProduct = products.find((product) => product.id === button.dataset.productId);
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

async function init() {
  initSalesforceTracking();
  updateCartCount();

  const products = await fetchCatalogProducts();
  const categories = getCatalogCategories(products);
  const { filtered, category } = filterProducts(products);
  const title = category || 'All Categories';

  createCategoryFilters(categories, category);
  renderCollection(filtered, title);
}

document.addEventListener('DOMContentLoaded', init);
