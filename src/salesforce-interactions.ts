import type { Product } from './cart';

const CONSENT_STORAGE_KEY = 'retail_cookie_consent';
const INDIVIDUAL_ID_STORAGE_KEY = 'retail_individual_id';
const DEFAULT_INDIVIDUAL_ID = '003Kj00002fnqH8IAI';
const CONSENT_COOKIE_NAME = 'retail_cookie_consent';
const SALESFORCE_BEACON_SRC = 'https://cdn.c360a.salesforce.com/beacon/c360a/957897e1-2078-47d6-8e12-d70a4e4e02c2/scripts/c360a.min.js';

type ConsentState = 'accepted' | 'rejected' | null;

type InteractionPayload = {
  name: string;
  individualId: string;
  engagementEventType?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productQuantity?: number;
  productSKU?: string;
  productURL?: string;
  shoppingCartId?: string;
  website?: string;
  productCategoryName?: string;
  productEngagementId?: string;
  eventType?: string;
};

declare global {
  interface Window {
    SalesforceInteractions?: {
      ConsentPurpose: { Tracking: string };
      ConsentStatus: { OptIn: string };
      init: (payload: unknown) => void;
      setLoggingLevel: (level: number) => void;
      sendEvent: (payload: { interaction: InteractionPayload }) => void;
    };
  }
}

const queuedEvents: InteractionPayload[] = [];
let scriptLoadStarted = false;
let isSdkReady = false;

function getConsentState(): ConsentState {
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'rejected') return stored;
  return null;
}

function setConsentCookie(state: Exclude<ConsentState, null>) {
  const oneYearInSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=${state}; max-age=${oneYearInSeconds}; path=/; SameSite=Lax`;
}

function persistConsentState(state: Exclude<ConsentState, null>) {
  localStorage.setItem(CONSENT_STORAGE_KEY, state);
  setConsentCookie(state);
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;
}

function flushQueuedEvents() {
  if (!isSdkReady || !window.SalesforceInteractions?.sendEvent) return;

  while (queuedEvents.length > 0) {
    const interaction = queuedEvents.shift();
    if (!interaction) break;
    window.SalesforceInteractions.sendEvent({ interaction });
  }
}

function ensureSalesforceSdkLoaded() {
  if (scriptLoadStarted || window.SalesforceInteractions) {
    if (window.SalesforceInteractions) {
      initializeSalesforceSdk();
    }
    return;
  }

  scriptLoadStarted = true;
  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${SALESFORCE_BEACON_SRC}"]`);

  if (existingScript) {
    existingScript.addEventListener('load', initializeSalesforceSdk, { once: true });
    if (window.SalesforceInteractions) {
      initializeSalesforceSdk();
    }
    return;
  }

  const script = document.createElement('script');
  script.src = SALESFORCE_BEACON_SRC;
  script.async = true;
  script.addEventListener('load', initializeSalesforceSdk, { once: true });
  document.head.appendChild(script);
}

function initializeSalesforceSdk() {
  const sdk = window.SalesforceInteractions;
  if (!sdk || isSdkReady) return;

  sdk.init({
    consents: [
      {
        purpose: sdk.ConsentPurpose.Tracking,
        provider: 'OneTrust',
        status: sdk.ConsentStatus.OptIn
      }
    ]
  });

  sdk.setLoggingLevel(4);
  isSdkReady = true;
  flushQueuedEvents();
}

function removeConsentBanner() {
  const existing = document.getElementById('cookie-banner');
  if (existing) {
    existing.remove();
  }
}

function renderConsentBanner() {
  if (document.getElementById('cookie-banner')) return;

  const banner = document.createElement('aside');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p>
      We use cookies to enable Salesforce tracking for shopping events. Accept cookies to allow event tracking.
    </p>
    <div class="cookie-banner-actions">
      <button id="cookie-reject" class="secondary-button" type="button">Reject</button>
      <button id="cookie-accept" class="cta-button" type="button">Accept</button>
    </div>
  `;

  document.body.appendChild(banner);

  const acceptButton = banner.querySelector<HTMLButtonElement>('#cookie-accept');
  const rejectButton = banner.querySelector<HTMLButtonElement>('#cookie-reject');

  acceptButton?.addEventListener('click', () => {
    persistConsentState('accepted');
    removeConsentBanner();
    ensureSalesforceSdkLoaded();
  });

  rejectButton?.addEventListener('click', () => {
    persistConsentState('rejected');
    removeConsentBanner();
  });
}

function readIndividualIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('individualId');
  return value && value.trim() ? value.trim() : null;
}

export function getIndividualId(): string {
  const fromStorage = localStorage.getItem(INDIVIDUAL_ID_STORAGE_KEY);
  if (fromStorage && fromStorage.trim()) return fromStorage;

  return DEFAULT_INDIVIDUAL_ID;
}

function persistIndividualIdFromUrl() {
  const fromUrl = readIndividualIdFromUrl();

  if (fromUrl) {
    localStorage.setItem(INDIVIDUAL_ID_STORAGE_KEY, fromUrl);
    return;
  }

  if (!localStorage.getItem(INDIVIDUAL_ID_STORAGE_KEY)) {
    localStorage.setItem(INDIVIDUAL_ID_STORAGE_KEY, DEFAULT_INDIVIDUAL_ID);
  }
}

export function initSalesforceTracking() {
  persistIndividualIdFromUrl();

  const consent = getConsentState();
  if (consent === 'accepted') {
    ensureSalesforceSdkLoaded();
    return;
  }

  if (consent === 'rejected') {
    removeConsentBanner();
    return;
  }

  renderConsentBanner();
}

function queueOrSend(interaction: InteractionPayload) {
  const consent = getConsentState();
  if (consent !== 'accepted') return;

  if (isSdkReady && window.SalesforceInteractions?.sendEvent) {
    window.SalesforceInteractions.sendEvent({ interaction });
    return;
  }

  queuedEvents.push(interaction);
  ensureSalesforceSdkLoaded();
}

function buildBaseInteraction(): Pick<InteractionPayload, 'individualId' | 'website' | 'productEngagementId'> {
  return {
    individualId: getIndividualId(),
    website: window.location.origin,
    productEngagementId: generateUuid()
  };
}

export function trackAddToCartEvent(product: Product, shoppingCartId: string, quantity = 1) {
  const interaction: InteractionPayload = {
    name: 'ShoppingCartEngagement',
    eventType: 'ShoppingCartEngagement',
    ...buildBaseInteraction(),
    engagementEventType: 'ADD',
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    productQuantity: quantity,
    productSKU: product.sku || product.id,
    productURL: `${window.location.origin}/product.html?id=${encodeURIComponent(product.id)}`,
    shoppingCartId: shoppingCartId,
    productCategoryName: product.category
  };

  queueOrSend(interaction);
}

export function trackRemoveFromCartEvent(product: Product, shoppingCartId: string, quantity = 1) {
  const interaction: InteractionPayload = {
    name: 'ShoppingCartEngagement',
    eventType: 'ShoppingCartEngagement',
    ...buildBaseInteraction(),
    engagementEventType: 'REMOVE',
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    productQuantity: quantity,
    productSKU: product.sku || product.id,
    productURL: `${window.location.origin}/product.html?id=${encodeURIComponent(product.id)}`,
    shoppingCartId: shoppingCartId,
    productCategoryName: product.category
  };

  queueOrSend(interaction);
}

export function trackPurchaseEvent(shoppingCartId: string) {
  const interaction: InteractionPayload = {
    name: 'ProductOrderEngagement',
    eventType: 'ProductOrderEngagement',
    individualId: getIndividualId(),
    engagementEventType: 'PURCHASE',
    shoppingCartId: shoppingCartId
  };

  queueOrSend(interaction);
}
