const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export class APIError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);

    // If response is no content or empty
    const text = await response.text();
    let data;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    }

    if (!response.ok) {
      // Normalize backend errors, which look like: { error: { message: "...", code: "..." } }
      const errorMessage = data?.error?.message || response.statusText || 'Unknown API Error';
      const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
      throw new APIError(errorMessage, response.status, errorCode);
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError || (error && (error as any).name === 'APIError')) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : String(error), 0, 'NETWORK_ERROR');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'POST', body: data }),
    
  put: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PUT', body: data }),
    
  patch: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body: data }),
    
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
