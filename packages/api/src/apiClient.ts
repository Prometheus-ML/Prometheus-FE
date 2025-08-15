type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiClientOptions = {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
};

export type AuthCallbacks = {
  onUnauthorized?: (responseText: string) => Promise<void> | void; // 401·419 처리
  onRefreshFailed?: () => Promise<void> | void; // refresh 도 실패
  getAccessToken?: () => string | null | undefined; // 액세스 토큰 가져오기
  getRefreshToken?: () => string | null | undefined; // 리프레시 토큰 가져오기
};

export type RequestOptions = {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: any;
  credentials?: RequestCredentials;
  mode?: RequestMode;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly authCallbacks: AuthCallbacks;

  constructor(options: ApiClientOptions, authCallbacks: AuthCallbacks = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') || '';
    this.defaultHeaders = options.defaultHeaders || {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    this.authCallbacks = authCallbacks;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const method = options.method || 'GET';

    const headers: Record<string, string> = {
      ...(this.defaultHeaders as Record<string, string>),
      ...(options.headers as Record<string, string>),
    };

    // FormData를 사용할 때는 Content-Type 헤더를 제거 (브라우저가 자동 설정)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Authorization 헤더 자동 추가 (콜백에서 토큰 가져오기)
    if (!headers.Authorization) {
      const accessToken = this.authCallbacks.getAccessToken?.();
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      mode: options.mode || 'cors',
    };

    if (method !== 'GET' && options.body !== undefined) {
      config.body = typeof options.body === 'string' || options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      if (retryCount > 3) throw new Error('Too many retries');

      if (response.status === 401) {
        const responseText = await response.text();
        await this.authCallbacks.onUnauthorized?.(responseText);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) data = await response.json();
      else if (contentType.includes('text/')) data = await response.text();
      else data = await response.blob();

      if (!response.ok) {
        const message = (data && (data.detail || data.message)) || `Request failed with status ${response.status}`;
        throw { status: response.status, data, message } as any;
      }
      return data as T;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw { status: 0, data: null, message: 'Network error: Unable to connect to server' } as any;
      }
      throw error;
    }
  }

  get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  patch<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

export type { RequestMethod };


