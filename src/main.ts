import './style.css';
import { addToCart, updateCartCount, Product } from './cart';

// Fallback Mock Data
const fallbackCategories = [
  { id: 'men', name: 'Men', subcategories: [{ id: 'men-shirts', name: 'Shirts' }, { id: 'men-pants', name: 'Pants' }] },
  { id: 'women', name: 'Women', subcategories: [{ id: 'women-handbags', name: 'Handbags' }, { id: 'women-dresses', name: 'Dresses' }] },
  { id: 'kids', name: 'Kids', subcategories: [{ id: 'kids-toys', name: 'Toys' }, { id: 'kids-clothes', name: 'Clothes' }] }
];

const fallbackProducts: Product[] = [
  { id: 'p1', name: 'Classic White Shirt', price: 49.99, category: 'men-shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=800&q=80' },
  { id: 'p2', name: 'Slim Fit Jeans', price: 59.99, category: 'men-pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
  { id: 'p3', name: 'Leather Handbag', price: 129.99, category: 'women-handbags', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80' },
  { id: 'p4', name: 'Summer Dress', price: 79.99, category: 'women-dresses', image: 'https://images.unsplash.com/photo-1572804013309-82a89b4f9403?auto=format&fit=crop&w=800&q=80' }
];

async function fetchData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('API unavailable');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback data:', err);
    return { categories: fallbackCategories, products: fallbackProducts };
  }
}

function renderCategories(categories: any[]) {
  const track = document.getElementById('categories-track');
  if (!track) return;
  track.innerHTML = categories.map(cat => `
    <div class="category-card">
      <h3>${cat.name}</h3>
      <ul class="subcategory-list">
        ${cat.subcategories.map((sub: any) => `<li class="subcategory-item">${sub.name}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderProducts(products: Product[]) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = products.map(prod => `
    <div class="product-card">
      <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy"/>
      <div class="product-info">
        <h4 class="product-name">${prod.name}</h4>
        <div class="product-price">$${prod.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" data-id="${prod.id}">Add to Cart</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const product = products.find(p => p.id === id);
      if (product) {
        addToCart(product);
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        setTimeout(() => btn.textContent = originalText, 1500);
      }
    });
  });
}

function setupCarousel() {
  const track = document.getElementById('categories-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track || !prevBtn || !nextBtn) return;

  const scrollAmount = 300;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

async function init() {
  updateCartCount();
  const data = await fetchData();
  renderCategories(data.categories);
  renderProducts(data.products);
  setupCarousel();
}

document.addEventListener('DOMContentLoaded', init);
