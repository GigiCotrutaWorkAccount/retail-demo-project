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
  {
    id: 'men-storm-runner',
    name: 'Storm Runner',
    price: 145,
    category: 'Men / Shoes / Sport',
    image: '/product-storm-runner-brown-1.svg',
    badge: 'Best seller',
    href: '/product.html'
  },
  {
    id: 'men-drift-runner',
    name: 'Drift Runner',
    price: 135,
    category: 'Men / Shoes / Casual',
    image: '/product-storm-runner-brown-2.svg',
    badge: 'New color',
    href: '/product.html'
  },
  {
    id: 'men-summit-lounger',
    name: 'Summit Lounger',
    price: 118,
    category: 'Men / Shoes / Casual',
    image: '/product-storm-runner-brown-3.svg',
    badge: 'Softest feel',
    href: '/product.html'
  },
  {
    id: 'men-trail-dasher',
    name: 'Trail Dasher',
    price: 160,
    category: 'Men / Shoes / Sport',
    image: '/product-storm-runner-brown-4.svg',
    badge: 'Grip focus',
    href: '/product.html'
  },
  {
    id: 'men-coast-runner',
    name: 'Coast Runner',
    price: 128,
    category: 'Men / Shoes / Casual',
    image: '/product-storm-runner-brown-1.svg',
    badge: 'Travel pick',
    href: '/product.html'
  },
  {
    id: 'men-metro-knit',
    name: 'Metro Knit',
    price: 132,
    category: 'Men / Shoes / Casual',
    image: '/product-storm-runner-brown-2.svg',
    badge: 'City edit',
    href: '/product.html'
  },
  {
    id: 'men-pulse-runner',
    name: 'Pulse Runner',
    price: 152,
    category: 'Men / Shoes / Sport',
    image: '/product-storm-runner-brown-3.svg',
    badge: 'Responsive ride',
    href: '/product.html'
  },
  {
    id: 'men-weekend-knit',
    name: 'Weekend Knit',
    price: 124,
    category: 'Men / Shoes / Casual',
    image: '/product-storm-runner-brown-4.svg',
    badge: 'Everyday pick',
    href: '/product.html'
  },
  {
    id: 'men-pace-crew-sock',
    name: 'Pace Crew Sock',
    price: 22,
    category: 'Men / Socks / Sport',
    image: '/product-storm-runner-brown-1.svg',
    badge: 'Performance knit',
    href: '/product.html'
  },
  {
    id: 'men-rest-ankle-sock',
    name: 'Rest Ankle Sock',
    price: 18,
    category: 'Men / Socks / Casual',
    image: '/product-storm-runner-brown-2.svg',
    badge: 'Daily comfort',
    href: '/product.html'
  },
  {
    id: 'women-cloud-runner',
    name: 'Cloud Runner',
    price: 142,
    category: 'Women / Shoes / Sport',
    image: '/product-storm-runner-brown-3.svg',
    badge: 'Lightweight feel',
    href: '/product.html'
  },
  {
    id: 'women-harbor-runner',
    name: 'Harbor Runner',
    price: 138,
    category: 'Women / Shoes / Casual',
    image: '/product-storm-runner-brown-4.svg',
    badge: 'Coastal neutral',
    href: '/product.html'
  },
  {
    id: 'women-arc-lounger',
    name: 'Arc Lounger',
    price: 116,
    category: 'Women / Shoes / Casual',
    image: '/product-storm-runner-brown-1.svg',
    badge: 'Soft step',
    href: '/product.html'
  },
  {
    id: 'women-rally-dasher',
    name: 'Rally Dasher',
    price: 158,
    category: 'Women / Shoes / Sport',
    image: '/product-storm-runner-brown-2.svg',
    badge: 'Road ready',
    href: '/product.html'
  },
  {
    id: 'women-studio-knit',
    name: 'Studio Knit',
    price: 126,
    category: 'Women / Shoes / Casual',
    image: '/product-storm-runner-brown-3.svg',
    badge: 'Studio to street',
    href: '/product.html'
  },
  {
    id: 'women-peak-runner',
    name: 'Peak Runner',
    price: 149,
    category: 'Women / Shoes / Sport',
    image: '/product-storm-runner-brown-4.svg',
    badge: 'Most cushioned',
    href: '/product.html'
  },
  {
    id: 'women-slate-runner',
    name: 'Slate Runner',
    price: 134,
    category: 'Women / Shoes / Casual',
    image: '/product-storm-runner-brown-1.svg',
    badge: 'Minimal look',
    href: '/product.html'
  },
  {
    id: 'women-daily-drift',
    name: 'Daily Drift',
    price: 129,
    category: 'Women / Shoes / Casual',
    image: '/product-storm-runner-brown-2.svg',
    badge: 'Weekend favorite',
    href: '/product.html'
  },
  {
    id: 'women-motion-crew-sock',
    name: 'Motion Crew Sock',
    price: 21,
    category: 'Women / Socks / Sport',
    image: '/product-storm-runner-brown-3.svg',
    badge: 'Training staple',
    href: '/product.html'
  },
  {
    id: 'women-softstep-ankle-sock',
    name: 'Softstep Ankle Sock',
    price: 19,
    category: 'Women / Socks / Casual',
    image: '/product-storm-runner-brown-4.svg',
    badge: 'Soft rib',
    href: '/product.html'
  }
];

async function fetchProducts(): Promise<FeedProduct[]> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Product feed unavailable');
    }

    const data = await response.json() as ProductFeedResponse;
    return data.products.map((product, index) => ({
      ...product,
      badge: product.badge || ['Best seller', 'New color', 'Everyday pick', 'Editor pick'][index % 4],
      href: product.href || '/product.html'
    }));
  } catch (error) {
    console.warn('Using fallback home feed', error);
    return fallbackProducts;
  }
}

function renderProducts(products: FeedProduct[]) {
  const track = document.getElementById('products-track');
  if (!track) return;

  track.innerHTML = products.map((product) => `
    <article class="home-product-card">
      <a class="home-product-media" href="${product.href}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="home-product-info">
        <div class="home-product-meta">
          <span class="home-product-badge">${product.badge || 'Featured'}</span>
          <span class="home-product-category">${product.category}</span>
        </div>
        <div class="home-product-heading-row">
          <h3>${product.name}</h3>
          <span>$${product.price.toFixed(0)}</span>
        </div>
        <div class="home-product-actions">
          <a class="text-link" href="${product.href}">View product</a>
          <button class="mini-cart-button" type="button" data-product-id="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  track.querySelectorAll<HTMLButtonElement>('[data-product-id]').forEach((button) => {
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

function setupCarouselControls() {
  const track = document.getElementById('products-track');
  const previousButton = document.getElementById('products-prev');
  const nextButton = document.getElementById('products-next');
  if (!track || !previousButton || !nextButton) return;

  const scrollAmount = 360;
  previousButton.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextButton.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

async function init() {
  updateCartCount();
  renderProducts(await fetchProducts());
  setupCarouselControls();
}

document.addEventListener('DOMContentLoaded', init);
