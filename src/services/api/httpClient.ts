export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'text';
}

function toObject(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function readStatus(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractErrorPayload(data: unknown): Record<string, unknown> {
  const direct = toObject(data);

  if (Object.keys(direct).length > 0) {
    return direct;
  }

  if (typeof data === 'string') {
    try {
      return toObject(JSON.parse(data));
    } catch {
      return {};
    }
  }

  return {};
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly data: unknown;
  public readonly title: string;
  public readonly detail: string;
  public readonly errorCode: string;

  constructor(status: number, data: unknown) {
    const payload = extractErrorPayload(data);
    const detail = readString(payload, 'detail');
    const message =
      detail ||
      readString(payload, 'message') ||
      readString(payload, 'title') ||
      `Request failed with status ${status}`;

    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
    this.name = 'HttpError';
    this.status = status;
    this.title = readString(payload, 'title');
    this.detail = detail;
    this.errorCode = readString(payload, 'errorCode');
    this.data = Object.keys(payload).length > 0 ? payload : data;
  }
}

const DEFAULT_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

let inMemoryAccessToken: string | null = null;
let tokenGetter: (() => string | null) | null = () => inMemoryAccessToken;
let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let unauthorizedHandled = false;

export function setApiAccessToken(token: string | null): void {
  inMemoryAccessToken = token;

  if (token) {
    unauthorizedHandled = false;
  }
}

export function clearApiAccessToken(): void {
  inMemoryAccessToken = null;
}

export function setApiTokenGetter(getter: (() => string | null) | null): void {
  tokenGetter = getter;
}

export function setApiUnauthorizedHandler(handler: (() => void | Promise<void>) | null): void {
  unauthorizedHandler = handler;
}

function buildQueryString(query?: QueryParams): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function parseResponseBody(response: Response, responseType: RequestOptions['responseType'] = 'json'): Promise<unknown> {
  if (responseType === 'blob') {
    return response.blob();
  }

  if (responseType === 'text') {
    return response.text();
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = /(^|\s|;)application\/(?:problem\+)?json\b/i.test(contentType) || /\+json\b/i.test(contentType);

  if (isJson) {
    return response.json();
  }

  const text = await response.text();

  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text || null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, headers, signal, responseType = 'json' } = options;
  const queryString = buildQueryString(query);
  const url = `${DEFAULT_API_BASE_URL}${path}${queryString}`;

  const token = tokenGetter ? tokenGetter() : null;

  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', responseType === 'blob' ? '*/*' : 'application/json');
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    signal
  });

  const responseData = await parseResponseBody(response, responseType);
  const responseObject = toObject(responseData);
  const payloadStatus = readStatus(responseObject, 'status');

  if (response.status === 401 && !unauthorizedHandled) {
    unauthorizedHandled = true;
    void unauthorizedHandler?.();
  }

  if (!response.ok) {
    throw new HttpError(response.status, responseData);
  }

  // Some backends return 200 with an error payload that still contains a failing status.
  if (payloadStatus !== null && payloadStatus >= 400) {
    if (payloadStatus === 401 && !unauthorizedHandled) {
      unauthorizedHandled = true;
      void unauthorizedHandler?.();
    }

    throw new HttpError(payloadStatus, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },
  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },
  delete<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'DELETE' });
  }
};
