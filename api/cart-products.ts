function readEnv(...keys: string[]) {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {};

  for (const key of keys) {
    const value = env[key];
    if (value && value.trim()) return value.trim();
  }
  return '';
}

const AUTH_URL = readEnv('SFDC_AUTH_URL', 'SALESFORCE_AUTH_URL') || 'https://ca1768230333461.my.salesforce.com/services/oauth2/token';
const QUERY_URL = readEnv('SFDC_QUERY_URL', 'SALESFORCE_QUERY_URL') || 'https://ca1768230333461.my.salesforce.com/services/data/v61.0/ssot/query';
const CLIENT_ID = readEnv('SFDC_CLIENT_ID', 'SALESFORCE_CLIENT_ID', 'CLIENT_ID', 'clientId');
const CLIENT_SECRET = readEnv('SFDC_CLIENT_SECRET', 'SALESFORCE_CLIENT_SECRET', 'CLIENT_SECRET', 'clientSecret');

const CART_SQL_TEMPLATE = `SELECT
  product_price__c,
  shopping_cart_id__c,
  unified_individual_id__c,
  total_amount__c,
  product_name__c,
  product_sku_number__c,
  product_id__c,
  product_image_url__c,
  product_quantity__c
FROM
  Shopping_Cart_Use_Case__cio
WHERE shopping_cart_id__c = '$shoppingcart'`;

type CartRow = {
  product_price__c?: number | string;
  shopping_cart_id__c?: string;
  unified_individual_id__c?: string;
  total_amount__c?: number | string;
  product_name__c?: string;
  product_sku_number__c?: string;
  product_id__c?: string;
  product_image_url__c?: string;
  product_quantity__c?: number | string;
};

type QueryBatchResponse = {
  data?: CartRow[];
  done?: boolean | string;
  batchId?: string;
  nextBatchId?: string;
};

function isDone(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

function sanitizeForSql(value: string): string {
  return value.replace(/'/g, "''");
}

function normalizePrice(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

function normalizeQuantity(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = Number.parseInt(value, 10);
    return Number.isFinite(numeric) ? numeric : 1;
  }
  return 1;
}

async function fetchAccessToken(): Promise<string> {
  const payload = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  if (!response.ok) {
    throw new Error(`OAuth token request failed with status ${response.status}`);
  }

  const body = await response.json() as { access_token?: string };
  if (!body.access_token) {
    throw new Error('OAuth token response did not include access_token');
  }

  return body.access_token;
}

async function fetchFirstBatch(token: string, shoppingCartId: string): Promise<QueryBatchResponse> {
  const sql = CART_SQL_TEMPLATE.replace('$shoppingcart', sanitizeForSql(shoppingCartId));
  const response = await fetch(QUERY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    throw new Error(`Shopping cart query failed with status ${response.status}`);
  }

  return response.json() as Promise<QueryBatchResponse>;
}

async function fetchNextBatch(token: string, nextBatchId: string): Promise<QueryBatchResponse> {
  const response = await fetch(`${QUERY_URL}/${encodeURIComponent(nextBatchId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Shopping cart batch ${nextBatchId} failed with status ${response.status}`);
  }

  return response.json() as Promise<QueryBatchResponse>;
}

async function fetchAllRows(token: string, shoppingCartId: string): Promise<CartRow[]> {
  const rows: CartRow[] = [];

  let batch = await fetchFirstBatch(token, shoppingCartId);
  rows.push(...(batch.data || []));

  while (!isDone(batch.done)) {
    const nextBatchId = batch.nextBatchId || batch.batchId;
    if (!nextBatchId) break;

    batch = await fetchNextBatch(token, nextBatchId);
    rows.push(...(batch.data || []));
  }

  return rows;
}

function mapRowsToProducts(rows: CartRow[]) {
  return rows.map((row, index) => {
    const id = row.product_id__c || `cart-product-${index + 1}`;
    return {
      id,
      name: row.product_name__c || `Cart Product ${index + 1}`,
      sku: row.product_sku_number__c || id,
      description: `Recovered from shopping cart ${row.shopping_cart_id__c || ''}`.trim(),
      price: normalizePrice(row.product_price__c),
      category: 'Recovered Cart',
      image: row.product_image_url__c || '/favicon.svg',
      quantity: normalizeQuantity(row.product_quantity__c),
      shoppingCartId: row.shopping_cart_id__c || null,
      unifiedIndividualId: row.unified_individual_id__c || null,
      totalAmount: normalizePrice(row.total_amount__c)
    };
  });
}

export default async function handler(req: any, res: any) {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Missing Salesforce Data Cloud credentials. Configure SFDC_CLIENT_ID/SFDC_CLIENT_SECRET (or SALESFORCE_CLIENT_ID/SALESFORCE_CLIENT_SECRET).'
      });
    }

    const shoppingCartId = String(req.query?.shoppingcart || '').trim();
    if (!shoppingCartId) {
      return res.status(400).json({ error: 'Missing shoppingcart query parameter.' });
    }

    const token = await fetchAccessToken();
    const rows = await fetchAllRows(token, shoppingCartId);
    const products = mapRowsToProducts(rows);

    return res.status(200).json({
      shoppingCartId,
      rowCount: rows.length,
      products
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Data Cloud shopping cart error';
    return res.status(500).json({ error: message });
  }
}
