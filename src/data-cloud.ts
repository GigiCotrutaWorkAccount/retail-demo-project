import type { Product } from './cart';

const PRODUCTS_CACHE_KEY = 'retail_data_cloud_products_v1';
const PRODUCTS_CACHE_FETCHED_AT_KEY = 'retail_data_cloud_products_fetched_at';
const PRODUCTS_LOADED_IN_SESSION_KEY = 'retail_data_cloud_loaded_in_session';

export const DEFAULT_CATEGORIES = [
	'Boys Clothing',
	'Men Clothing',
	'Girls Clothing',
	'Women Clothing'
];

export type CatalogProduct = Product & {
	sku: string;
	description: string;
	source: 'data-cloud';
	href: string;
};

type CartProductsApiResponse = {
	products?: ApiProductRow[];
};

type CatalogApiResponse = {
	products?: ApiProductRow[];
};

type ApiProductRow = {
	id: string;
	name: string;
	sku?: string;
	description?: string;
	price: number;
	category?: string;
	image?: string;
};

function normalizeCategory(value: string | undefined): string {
	const raw = (value || '').trim();
	const lower = raw.toLowerCase();

	if (!raw) return 'Men Clothing';
	if (DEFAULT_CATEGORIES.includes(raw)) return raw;
	if (lower.includes('boys')) return 'Boys Clothing';
	if (lower.includes('girls')) return 'Girls Clothing';
	if (lower.includes('women')) return 'Women Clothing';
	if (lower.includes('men')) return 'Men Clothing';
	return 'Men Clothing';
}

function normalizeProduct(raw: ApiProductRow, index: number): CatalogProduct {
	const safeId = raw.id || `dc-product-${index + 1}`;
	const image = raw.image && raw.image.trim() ? raw.image : '/favicon.svg';

	return {
		id: safeId,
		name: raw.name || `Product ${index + 1}`,
		sku: raw.sku || safeId,
		description: raw.description || 'No description available yet.',
		price: Number.isFinite(raw.price) ? raw.price : 0,
		category: normalizeCategory(raw.category),
		image,
		source: 'data-cloud',
		href: `/product.html?id=${encodeURIComponent(safeId)}`
	};
}

function readCachedProducts(): CatalogProduct[] {
	const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as CatalogProduct[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeCachedProducts(products: CatalogProduct[]) {
	localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
	localStorage.setItem(PRODUCTS_CACHE_FETCHED_AT_KEY, new Date().toISOString());
	sessionStorage.setItem(PRODUCTS_LOADED_IN_SESSION_KEY, '1');
}

export function getCachedProductsFetchedAt(): string | null {
	return localStorage.getItem(PRODUCTS_CACHE_FETCHED_AT_KEY);
}

export function getCategoryQueryValue(category: string): string {
	return encodeURIComponent(category);
}

export function getCatalogCategories(products: CatalogProduct[]): string[] {
	const discovered = Array.from(new Set(products.map((product) => normalizeCategory(product.category))));
	const ordered = DEFAULT_CATEGORIES.filter((category) => discovered.includes(category));
	const extras = discovered.filter((category) => !ordered.includes(category));
	return [...ordered, ...extras];
}

export async function fetchCatalogProducts(options?: { forceRefresh?: boolean }): Promise<CatalogProduct[]> {
	const forceRefresh = Boolean(options?.forceRefresh);
	const cached = readCachedProducts();
	const loadedThisSession = sessionStorage.getItem(PRODUCTS_LOADED_IN_SESSION_KEY) === '1';

	if (!forceRefresh && cached.length > 0 && loadedThisSession) {
		return cached;
	}

	if (!forceRefresh && cached.length > 0 && !loadedThisSession) {
		sessionStorage.setItem(PRODUCTS_LOADED_IN_SESSION_KEY, '1');
		return cached;
	}

	try {
		const response = await fetch('/api/data', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Data Cloud request failed with status ${response.status}`);
		}

		const payload = await response.json() as CatalogApiResponse;
		const products = Array.isArray(payload.products)
			? payload.products.map((product, index) => normalizeProduct(product, index))
			: [];

		if (products.length > 0) {
			writeCachedProducts(products);
			return products;
		}

		return cached;
	} catch (error) {
		console.warn('Using cached Data Cloud products after request error.', error);
		return cached;
	}
}

export function getProductById(products: CatalogProduct[], productId: string | null): CatalogProduct | null {
	if (!productId) return null;
	return products.find((product) => product.id === productId) || null;
}

export async function fetchProductsByShoppingCartId(shoppingCartId: string): Promise<CatalogProduct[]> {
	if (!shoppingCartId.trim()) return [];

	try {
		const response = await fetch(`/api/cart-products?shoppingcart=${encodeURIComponent(shoppingCartId)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Cart products request failed with status ${response.status}`);
		}

		const payload = await response.json() as CartProductsApiResponse;
		return Array.isArray(payload.products)
			? payload.products.map((product, index) => normalizeProduct(product, index))
			: [];
	} catch (error) {
		console.warn('Unable to fetch shopping cart products.', error);
		return [];
	}
}
