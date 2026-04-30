import './style.css';
import { addToCart, updateCartCount } from './cart';
import type { Product } from './cart';

type FeedProduct = Product & {
  badge?: string;
  href?: string;
  taxonomy?: {
    gender?: string;
    type?: string;
    style?: string;
  };
};

type ProductFeedResponse = {
  products: FeedProduct[];
};

const fallbackProducts: FeedProduct[] = [
  { id: 'men-storm-runner', name: 'Storm Runner', price: 145, category: 'Men / Shoes / Sport', image: '/product-storm-runner-brown-1.svg', badge: 'Best seller', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'sport' } },
  { id: 'men-drift-runner', name: 'Drift Runner', price: 135, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-2.svg', badge: 'New color', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
  { id: 'men-summit-lounger', name: 'Summit Lounger', price: 118, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-3.svg', badge: 'Softest feel', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
  { id: 'men-trail-dasher', name: 'Trail Dasher', price: 160, category: 'Men / Shoes / Sport', image: '/product-storm-runner-brown-4.svg', badge: 'Grip focus', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'sport' } },
  { id: 'men-pace-crew-sock', name: 'Pace Crew Sock', price: 22, category: 'Men / Socks / Sport', image: '/product-storm-runner-brown-1.svg', badge: 'Performance knit', href: '/product.html', taxonomy: { gender: 'men', type: 'socks', style: 'sport' } },
  { id: 'women-cloud-runner', name: 'Cloud Runner', price: 142, category: 'Women / Shoes / Sport', image: '/product-storm-runner-brown-3.svg', badge: 'Lightweight feel', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'sport' } },
  { id: 'women-harbor-runner', name: 'Harbor Runner', price: 138, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-4.svg', badge: 'Coastal neutral', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
  { id: 'women-softstep-ankle-sock', name: 'Softstep Ankle Sock', price: 19, category: 'Women / Socks / Casual', image: '/product-storm-runner-brown-4.svg', badge: 'Soft rib', href: '/product.html', taxonomy: { gender: 'women', type: 'socks', style: 'casual' } }
];

const genders = ['men', 'women'];
const styles = ['sport', 'casual'];
const types = ['shoes', 'socks'];

async function fetchProducts(): Promise<FeedProduct[]> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Product feed unavailable');
    const data = await response.json() as ProductFeedResponse;
    return data.products;
  } catch (error) {
    console.warn('Using fallback collection feed', error);
    return fallbackProducts;
  }
}

function createFilterLinks(containerId: string, paramName: string, values: string[], activeValue: string | null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentParams = new URLSearchParams(window.location.search);
  container.innerHTML = values.map((value) => {
    const params = new URLSearchParams(currentParams);
    params.set(paramName, value);
    const isActive = activeValue === value;
    return `<a class="filter-pill${isActive ? ' is-active' : ''}" href="/product-list.html?${params.toString()}">${value}</a>`;
  }).join('');
}

function filterProducts(products: FeedProduct[]) {
  const params = new URLSearchParams(window.location.search);
  const gender = params.get('gender');
  const style = params.get('style');
  const type = params.get('type');

  const filtered = products.filter((product) => {
    const taxonomy = product.taxonomy || {};
    if (gender && taxonomy.gender !== gender) return false;
    if (style && taxonomy.style !== style) return false;
    if (type && taxonomy.type !== type) return false;
    return true;
  });

  return { filtered, gender, style, type };
}

function formatTitle(gender: string | null, style: string | null, type: string | null) {
  const parts = [gender, type, style].filter(Boolean).map((value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  });
  return parts.length ? parts.join(' ') : 'Shop All';
}

function renderCollection(products: FeedProduct[], title: string) {
  const grid = document.getElementById('collection-grid');
  const count = document.getElementById('collection-count');
  const resultsTitle = document.getElementById('collection-results-title');
  const collectionTitle = document.getElementById('collection-title');
  const collectionDescription = document.getElementById('collection-description');
  if (!grid || !count || !resultsTitle || !collectionTitle || !collectionDescription) return;

  count.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;
  resultsTitle.textContent = title;
  collectionTitle.textContent = title;
  collectionDescription.textContent = `Browse ${title.toLowerCase()} built around comfort-first silhouettes, soft materials, and simple filtering by audience and style.`;

  if (!products.length) {
    grid.innerHTML = '<p class="collection-empty">No products match this filter yet. Try another category.</p>';
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="collection-product-card">
      <a class="collection-product-media" href="${product.href || '/product.html'}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="collection-product-info">
        <div class="home-product-meta">
          <span class="home-product-badge">${product.badge || 'Featured'}</span>
          <span class="home-product-category">${product.category}</span>
        </div>
        <div class="home-product-heading-row">
          <h3>${product.name}</h3>
          <span>$${product.price.toFixed(0)}</span>
        </div>
        <div class="home-product-actions">
          <a class="text-link" href="${product.href || '/product.html'}">View product</a>
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
  updateCartCount();
  const products = await fetchProducts();
  const { filtered, gender, style, type } = filterProducts(products);
  const title = formatTitle(gender, style, type);

  createFilterLinks('gender-filters', 'gender', genders, gender);
  createFilterLinks('style-filters', 'style', styles, style);
  createFilterLinks('type-filters', 'type', types, type);
  renderCollection(filtered, title);
}

document.addEventListener('DOMContentLoaded', init);