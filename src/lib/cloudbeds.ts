const DEFAULT_BASE = 'https://hotels.cloudbeds.com/api/v1.3';

export class CloudbedsError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const getAuthToken = () => {
  const apiKey = process.env.CLOUDBEDS_API_KEY;
  const accessToken = process.env.CLOUDBEDS_ACCESS_TOKEN;
  const token = apiKey ?? accessToken;
  if (!token) {
    throw new CloudbedsError(
      401,
      'Missing Cloudbeds credentials. Set CLOUDBEDS_API_KEY (or CLOUDBEDS_ACCESS_TOKEN).'
    );
  }
  return token;
};

export async function cloudbedsFetch(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {}
) {
  const base = process.env.CLOUDBEDS_API_BASE ?? DEFAULT_BASE;
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const token = getAuthToken();

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message = isJson ? JSON.stringify(body) : res.statusText || 'Cloudbeds request failed';
    throw new CloudbedsError(res.status, message, body);
  }

  return body;
}

