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
const CLIENT_ID = readEnv('SFDC_CLIENT_ID', 'SALESFORCE_CLIENT_ID', 'CLIENT_ID', 'clientId')
  || '3MVG9kb26yEQGZW2V.gyqJMnP5BCMoOhskaytYERz4MlxkFTaxITAADW0Ap1I4Nt_WvNCRKDSGDjFQw9eUAFd';
const CLIENT_SECRET = readEnv('SFDC_CLIENT_SECRET', 'SALESFORCE_CLIENT_SECRET', 'CLIENT_SECRET', 'clientSecret')
  || 'A51D8336307E74DB94C39350BE67077E558F840FED3A1E79B07A13DD45E80EBC';

const PRODUCT_SQL = `SELECT
  ssot__Id__c,
  ssot__Name__c,
  ssot__ProductSKU__c,
  ssot__Description__c,
  ssot__MSRPAmount__c,
  ssot__PrimaryProductCategory__c,
  ssot__PrimaryProductImageURL__c
FROM
  ssot__Product__dlm
WHERE
  ssot__PrimaryProductImageURL__c IS NOT NULL`;

type DataCloudRow = {
  ssot__Id__c?: string;
  ssot__Name__c?: string;
  ssot__ProductSKU__c?: string;
  ssot__Description__c?: string;
  ssot__MSRPAmount__c?: number | string;
  ssot__PrimaryProductCategory__c?: string;
  ssot__PrimaryProductImageURL__c?: string;
};

type QueryBatchResponse = {
  data?: DataCloudRow[];
  done?: boolean | string;
  batchId?: string;
  nextBatchId?: string;
  queryId?: string;
  metadata?: unknown;
};

function isDone(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
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

async function fetchFirstBatch(token: string): Promise<QueryBatchResponse> {
  const response = await fetch(QUERY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql: PRODUCT_SQL })
  });

  if (!response.ok) {
    throw new Error(`Initial Data Cloud query failed with status ${response.status}`);
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
    throw new Error(`Data Cloud batch ${nextBatchId} failed with status ${response.status}`);
  }

  return response.json() as Promise<QueryBatchResponse>;
}

async function fetchAllRows(token: string): Promise<{ rows: DataCloudRow[]; metadata: unknown }> {
  const allRows: DataCloudRow[] = [];

  let batch = await fetchFirstBatch(token);
  allRows.push(...(batch.data || []));

  while (!isDone(batch.done)) {
    const nextBatchId = batch.nextBatchId || batch.batchId;
    if (!nextBatchId) {
      break;
    }

    batch = await fetchNextBatch(token, nextBatchId);
    allRows.push(...(batch.data || []));
  }

  return {
    rows: allRows,
    metadata: batch.metadata || null
  };
}

function normalizeCategory(category: string | undefined): string {
  const raw = (category || '').trim();
  const lower = raw.toLowerCase();

  if (!raw) return 'Men Clothing';
  if (lower.includes('boys')) return 'Boys Clothing';
  if (lower.includes('girls')) return 'Girls Clothing';
  if (lower.includes('women')) return 'Women Clothing';
  if (lower.includes('men')) return 'Men Clothing';

  return raw;
}

function normalizePrice(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

function mapProducts(rows: DataCloudRow[]) {
  return rows.map((row, index) => {
    const id = row.ssot__Id__c || `dc-product-${index + 1}`;
    return {
      id,
      name: row.ssot__Name__c || `Data Cloud Product ${index + 1}`,
      sku: row.ssot__ProductSKU__c || id,
      description: row.ssot__Description__c || 'No description provided.',
      price: normalizePrice(row.ssot__MSRPAmount__c),
      category: normalizeCategory(row.ssot__PrimaryProductCategory__c),
      image: row.ssot__PrimaryProductImageURL__c || '/favicon.svg'
    };
  });
}

export default async function handler(_req: any, res: any) {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Missing Salesforce Data Cloud credentials. Configure SFDC_CLIENT_ID/SFDC_CLIENT_SECRET (or SALESFORCE_CLIENT_ID/SALESFORCE_CLIENT_SECRET).'
      });
    }

    const token = await fetchAccessToken();
    const { rows, metadata } = await fetchAllRows(token);
    const products = mapProducts(rows);

    const categories = Array.from(new Set(products.map((product) => product.category)));

    return res.status(200).json({
      products,
      categories,
      rowCount: rows.length,
      metadata
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Data Cloud error';
    return res.status(500).json({ error: message });
  }
}
