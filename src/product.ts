import './style.css';
import { addToCart, updateCartCount } from './cart';
import type { Product } from './cart';

type GalleryImage = {
  src: string;
  alt: string;
  label: string;
};

type Colorway = {
  id: string;
  name: string;
  swatch: string;
  accent: string;
  stockMessage: string;
};

const galleryImages: GalleryImage[] = [
  {
    src: '/product-storm-runner-brown-1.svg',
    alt: 'Storm Runner studio illustration',
    label: 'Studio view'
  },
  {
    src: '/product-storm-runner-brown-2.svg',
    alt: 'Storm Runner side profile illustration',
    label: 'Side profile'
  },
  {
    src: '/product-storm-runner-brown-3.svg',
    alt: 'Storm Runner top-down material illustration',
    label: 'Top view'
  },
  {
    src: '/product-storm-runner-brown-4.svg',
    alt: 'Storm Runner outsole illustration',
    label: 'Outsole detail'
  }
];

const colorways: Colorway[] = [
  {
    id: 'weathered-brown',
    name: 'Weathered Brown',
    swatch: 'linear-gradient(135deg, #6d4b37 0%, #a57a5d 100%)',
    accent: '#8f6446',
    stockMessage: 'In stock. Ships in 24 hours.'
  },
  {
    id: 'mist-grey',
    name: 'Mist Grey',
    swatch: 'linear-gradient(135deg, #72777f 0%, #b4b7bc 100%)',
    accent: '#6b7078',
    stockMessage: 'Low stock in core sizes.'
  },
  {
    id: 'pine-night',
    name: 'Pine Night',
    swatch: 'linear-gradient(135deg, #2f4a41 0%, #4a6d61 100%)',
    accent: '#35564d',
    stockMessage: 'Back in stock this week.'
  }
];

const sizes = ['8', '9', '10', '11', '12', '13'];
const defaultSize = '10';

let selectedImageIndex = 0;
let selectedColorId = colorways[0].id;
let selectedSize = defaultSize;

function renderGallery() {
  const thumbnailRow = document.getElementById('thumbnail-row');
  const mainImage = document.getElementById('main-product-image') as HTMLImageElement | null;
  const galleryChip = document.getElementById('gallery-chip');
  if (!thumbnailRow || !mainImage || !galleryChip) return;

  const activeImage = galleryImages[selectedImageIndex];
  mainImage.src = activeImage.src;
  mainImage.alt = activeImage.alt;
  galleryChip.textContent = activeImage.label;

  thumbnailRow.innerHTML = galleryImages.map((image, index) => `
    <button
      class="thumbnail-button${index === selectedImageIndex ? ' is-active' : ''}"
      type="button"
      data-image-index="${index}"
      aria-label="Show ${image.label.toLowerCase()}"
      aria-pressed="${index === selectedImageIndex}"
    >
      <img src="${image.src}" alt="${image.alt}" />
    </button>
  `).join('');

  thumbnailRow.querySelectorAll<HTMLButtonElement>('[data-image-index]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedImageIndex = Number(button.dataset.imageIndex);
      renderGallery();
    });
  });
}

function renderColorways() {
  const swatchRow = document.getElementById('swatch-row');
  const selectedColorLabel = document.getElementById('selected-color-label');
  const inventoryNote = document.getElementById('inventory-note');
  if (!swatchRow || !selectedColorLabel || !inventoryNote) return;

  const activeColor = colorways.find((color) => color.id === selectedColorId) || colorways[0];
  selectedColorLabel.textContent = activeColor.name;
  inventoryNote.textContent = activeColor.stockMessage;
  document.documentElement.style.setProperty('--product-accent', activeColor.accent);

  swatchRow.innerHTML = colorways.map((color) => `
    <button
      class="swatch${color.id === selectedColorId ? ' is-active' : ''}"
      type="button"
      data-color-id="${color.id}"
      aria-label="Choose ${color.name}"
      aria-pressed="${color.id === selectedColorId}"
      style="background: ${color.swatch};"
    ></button>
  `).join('');

  swatchRow.querySelectorAll<HTMLButtonElement>('[data-color-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedColorId = button.dataset.colorId || colorways[0].id;
      renderColorways();
    });
  });
}

function renderSizes() {
  const sizeGrid = document.getElementById('size-grid');
  if (!sizeGrid) return;

  sizeGrid.innerHTML = sizes.map((size) => `
    <button
      class="size-button${size === selectedSize ? ' is-active' : ''}"
      type="button"
      data-size="${size}"
      aria-pressed="${size === selectedSize}"
    >
      ${size}
    </button>
  `).join('');

  sizeGrid.querySelectorAll<HTMLButtonElement>('[data-size]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSize = button.dataset.size || defaultSize;
      renderSizes();
    });
  });
}

function buildSelectedProduct(): Product {
  const activeColor = colorways.find((color) => color.id === selectedColorId) || colorways[0];

  return {
    id: `storm-runner-${activeColor.id}-${selectedSize}`,
    name: `Storm Runner - ${activeColor.name} / ${selectedSize}`,
    price: 145,
    category: 'men-everyday',
    image: galleryImages[0].src
  };
}

function setupPurchaseActions() {
  const addToCartButton = document.getElementById('add-to-cart-btn') as HTMLButtonElement | null;
  const saveButton = document.getElementById('save-btn') as HTMLButtonElement | null;
  if (!addToCartButton || !saveButton) return;

  addToCartButton.addEventListener('click', () => {
    addToCart(buildSelectedProduct());
    const originalText = addToCartButton.textContent;
    addToCartButton.textContent = 'Added';
    window.setTimeout(() => {
      addToCartButton.textContent = originalText;
    }, 1400);
  });

  saveButton.addEventListener('click', () => {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saved';
    window.setTimeout(() => {
      saveButton.textContent = originalText;
    }, 1400);
  });
}

function init() {
  updateCartCount();
  renderGallery();
  renderColorways();
  renderSizes();
  setupPurchaseActions();
}

document.addEventListener('DOMContentLoaded', init);